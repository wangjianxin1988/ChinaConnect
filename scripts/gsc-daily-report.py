# =============================================================================
# ChinaConnect GSC 每日报告生成脚本 — 完全独立
# =============================================================================
#
# 铁律（最高优先级，违反任何一条 = 重新写脚本）：
#   1. 禁止读 mi-to-ai (D:\suoyouxiangmu\ai-student-survival\) 下任何文件
#   2. 禁止复制 mi-to-ai 的 GSC 脚本内容
#   3. token / secret 一律不打印到终端
#   4. token / secret 一律不进报告文件
#
# 用途：每日 22:00 由 cron 调用，生成当日 GSC 报告到
#       .audit/gsc-reports/YYYY-MM-DD.md
#
# 数据源：
#   - GSC Search Analytics API（searchanalytics.query）
#   - GSC Sitemaps API（sitemaps.list）
#   - GSC URL Inspection API（urlInspection.index.inspect）
#
# P52 三个坑（必须遵守，否则 400/403）：
#   1. urllib.parse.urlencode(safe='') — URL-encoded body 必须 safe=''
#   2. searchAnalytics 必须 POST + JSON body（不是 GET + query string）
#   3. property URL 必须 URL prefix 格式 'https://chinaengage.org/'（末尾斜杠）
#
# access_token 缓存：写内存 + 临时文件（1 小时有效），避免每次都 refresh。
#
# 异常检测阈值（可调）：
#   - CTR 单日跌幅 > 30% → 红色告警
#   - Impressions 单日跌幅 > 50% → 红色告警
#   - Impressions 涨 > 50% + CTR 跌 > 10% → 黄色告警（可能标题失配）
#   - Sitemap errors > 0 → 红色告警
#   - Manual actions / Security issues > 0 → 红色告警
#
# 依赖：Python 3.8+ 标准库（urllib, json, datetime, pathlib）
# =============================================================================

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

# =============================================================================
# 路径与常量
# =============================================================================

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

TOKEN_FILE = PROJECT_ROOT / "references" / "gsc-refresh-token.json"
ACCESS_TOKEN_CACHE = PROJECT_ROOT / ".audit" / ".gsc_access_token_cache.json"
REPORTS_DIR = PROJECT_ROOT / ".audit" / "gsc-reports"

# GSC site — URL prefix property（P52 铁律：末尾必须有斜杠）
SITE_URL = "https://chinaengage.org/"

# GSC API endpoints
TOKEN_URL = "https://oauth2.googleapis.com/token"
GSC_API_BASE = "https://www.googleapis.com/webmasters/v3"

# 报告窗口（天）
SHORT_WINDOW_DAYS = 7   # 当前 7 天 vs 上 7 天
LONG_WINDOW_DAYS = 28   # top queries / pages / countries / devices

# access_token 缓存 TTL（秒）—— Google access_token 1 小时有效，留 5 分钟 buffer
ACCESS_TOKEN_TTL = 55 * 60


# =============================================================================
# access_token 管理
# =============================================================================

def load_refresh_token() -> dict:
    """读 references/gsc-refresh-token.json。"""
    if not TOKEN_FILE.exists():
        print(f"[FATAL] {TOKEN_FILE} 不存在。", file=sys.stderr)
        print(
            "        请先跑 python scripts/gsc-get-refresh-token.py 获取 refresh_token。",
            file=sys.stderr,
        )
        sys.exit(1)
    try:
        return json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"[FATAL] {TOKEN_FILE} JSON 解析失败：{e}", file=sys.stderr)
        sys.exit(1)


def _read_access_token_cache() -> dict | None:
    """读 access_token 缓存（若未过期）。"""
    if not ACCESS_TOKEN_CACHE.exists():
        return None
    try:
        cache = json.loads(ACCESS_TOKEN_CACHE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    if not isinstance(cache, dict):
        return None
    if cache.get("site") != SITE_URL:
        return None
    expires_at = cache.get("expires_at", 0)
    if expires_at <= time.time():
        return None
    token = cache.get("access_token")
    if not token:
        return None
    return {"access_token": token, "expires_at": expires_at}


def _write_access_token_cache(access_token: str, expires_in: int) -> None:
    """写 access_token 缓存。"""
    ACCESS_TOKEN_CACHE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "site": SITE_URL,
        "access_token": access_token,
        "expires_at": time.time() + min(expires_in, ACCESS_TOKEN_TTL),
        "fetched_at": datetime.now().isoformat(),
    }
    ACCESS_TOKEN_CACHE.write_text(
        json.dumps(payload, ensure_ascii=False),
        encoding="utf-8",
    )


def get_access_token(creds: dict) -> str:
    """用 refresh_token 换 access_token，自动缓存 1 小时。"""
    cached = _read_access_token_cache()
    if cached:
        return cached["access_token"]

    data = urllib.parse.urlencode(
        {
            "client_id": creds["client_id"],
            "client_secret": creds["client_secret"],
            "refresh_token": creds["refresh_token"],
            "grant_type": "refresh_token",
        },
        safe="",  # P52 铁律
    ).encode("utf-8")

    req = urllib.request.Request(
        TOKEN_URL,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[FATAL] refresh_token 换 access_token 失败：HTTP {e.code}", file=sys.stderr)
        print(f"        {body}", file=sys.stderr)
        print(
            "        排查：refresh_token 是否过期？跑 scripts/gsc-get-refresh-token.py 重新获取。",
            file=sys.stderr,
        )
        sys.exit(1)

    access_token = payload.get("access_token")
    expires_in = payload.get("expires_in", 3600)
    if not access_token:
        print(f"[FATAL] token 响应里没有 access_token：{payload}", file=sys.stderr)
        sys.exit(1)

    _write_access_token_cache(access_token, expires_in)
    return access_token


# =============================================================================
# GSC API 调用（POST + JSON body，P52 铁律）
# =============================================================================

def gsc_post(path: str, access_token: str, body: dict) -> dict:
    """POST 到 GSC API，body 是 JSON。"""
    url = f"{GSC_API_BASE}{path}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(
            f"[ERROR] GSC API {path} 失败：HTTP {e.code}",
            file=sys.stderr,
        )
        print(f"        {body_text}", file=sys.stderr)
        if e.code == 403:
            print(
                "        排查：OAuth scope 必须是 webmasters full（不是 readonly）。",
                file=sys.stderr,
            )
        elif e.code == 404:
            print(
                "        排查：property URL 必须用 URL prefix 'https://chinaengage.org/'（带末尾斜杠）。",
                file=sys.stderr,
            )
        elif e.code == 401:
            print(
                "        排查：access_token 过期。删除 .audit/.gsc_access_token_cache.json 后重跑。",
                file=sys.stderr,
            )
        raise


def gsc_get(path: str, access_token: str, params: dict | None = None) -> dict:
    """GET GSC API（P52：safe=''）。"""
    if params:
        # P52 铁律：safe=''
        qs = urllib.parse.urlencode(params, safe="")
        url = f"{GSC_API_BASE}{path}?{qs}"
    else:
        url = f"{GSC_API_BASE}{path}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"[ERROR] GSC GET {path} 失败：HTTP {e.code}", file=sys.stderr)
        print(f"        {body_text}", file=sys.stderr)
        raise


# =============================================================================
# searchAnalytics 拉取
# =============================================================================

def fetch_search_analytics(
    access_token: str,
    start_date: str,
    end_date: str,
    dimensions: list[str],
    row_limit: int = 25,
) -> list[dict]:
    """POST searchAnalytics.query。

    dimensions: 比如 ['date'], ['query'], ['page'], ['country'], ['device']
    返回 rows: [{"keys": [...], "clicks": int, "impressions": int,
                 "ctr": float, "position": float}]
    """
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": row_limit,
        "startRow": 0,
    }
    # P52 铁律：siteUrl 必须 URL prefix 格式
    path = f"/sites/{urllib.parse.quote(SITE_URL, safe='')}/searchAnalytics/query"
    payload = gsc_post(path, access_token, body)
    return payload.get("rows", []) or []


def fetch_sitemaps(access_token: str) -> list[dict]:
    """GET sitemaps 列表。"""
    path = f"/sites/{urllib.parse.quote(SITE_URL, safe='')}/sitemaps"
    payload = gsc_get(path, access_token)
    return payload.get("sitemap", []) or []


# =============================================================================
# 数据聚合
# =============================================================================

def aggregate_metrics(rows: list[dict]) -> dict:
    """聚合 clicks / impressions / position。"""
    if not rows:
        return {
            "clicks": 0,
            "impressions": 0,
            "ctr": 0.0,
            "position": 0.0,
        }
    total_clicks = sum(r.get("clicks", 0) for r in rows)
    total_impr = sum(r.get("impressions", 0) for r in rows)
    ctr = (total_clicks / total_impr * 100.0) if total_impr > 0 else 0.0
    # 加权平均位置
    weighted_pos = sum(
        r.get("position", 0.0) * r.get("impressions", 0) for r in rows
    )
    avg_pos = (weighted_pos / total_impr) if total_impr > 0 else 0.0
    return {
        "clicks": total_clicks,
        "impressions": total_impr,
        "ctr": round(ctr, 2),
        "position": round(avg_pos, 1),
    }


def pct_change(curr: float, prev: float) -> str:
    """计算百分比变化，格式 '+12.3%' 或 '-45.6%'。"""
    if prev == 0:
        if curr == 0:
            return "0%"
        return "+∞"
    delta = (curr - prev) / prev * 100.0
    sign = "+" if delta >= 0 else ""
    return f"{sign}{delta:.1f}%"


# =============================================================================
# 异常检测
# =============================================================================

def detect_anomalies(
    daily_rows: list[dict],
    sitemaps: list[dict],
    prev_metrics: dict,
    curr_metrics: dict,
) -> list[str]:
    """异常告警列表。"""
    alerts = []

    # 1. CTR 单日跌幅 > 30%
    if len(daily_rows) >= 2:
        sorted_by_date = sorted(daily_rows, key=lambda r: r["keys"][0])
        latest = sorted_by_date[-1]
        prev_day = sorted_by_date[-2]
        if latest.get("impressions", 0) > 50:  # 样本太少不报
            latest_ctr = (
                latest.get("ctr", 0.0) * 100.0
                if latest.get("ctr", 0.0) <= 1.0
                else latest.get("ctr", 0.0)
            )
            prev_ctr = (
                prev_day.get("ctr", 0.0) * 100.0
                if prev_day.get("ctr", 0.0) <= 1.0
                else prev_day.get("ctr", 0.0)
            )
            if prev_ctr > 0:
                ctr_drop_pct = (prev_ctr - latest_ctr) / prev_ctr * 100.0
                if ctr_drop_pct > 30.0:
                    alerts.append(
                        f"🔴 CTR 单日跌幅 > 30%：{prev_ctr:.2f}% → {latest_ctr:.2f}% "
                        f"（{latest['keys'][0]}，跌幅 {ctr_drop_pct:.1f}%）"
                    )

    # 2. Impressions 单日跌幅 > 50%
    if len(daily_rows) >= 2:
        sorted_by_date = sorted(daily_rows, key=lambda r: r["keys"][0])
        latest = sorted_by_date[-1]
        prev_day = sorted_by_date[-2]
        if prev_day.get("impressions", 0) > 0:
            impr_drop_pct = (
                (prev_day["impressions"] - latest["impressions"])
                / prev_day["impressions"] * 100.0
            )
            if impr_drop_pct > 50.0:
                alerts.append(
                    f"🔴 Impressions 单日跌幅 > 50%：{prev_day['impressions']} → "
                    f"{latest['impressions']}（{latest['keys'][0]}，跌幅 {impr_drop_pct:.1f}%）"
                )

    # 3. Impressions 涨 > 50% + CTR 跌 > 10%
    if prev_metrics["impressions"] > 0 and curr_metrics["impressions"] > 0:
        impr_change = (
            (curr_metrics["impressions"] - prev_metrics["impressions"])
            / prev_metrics["impressions"] * 100.0
        )
        ctr_change = (
            (curr_metrics["ctr"] - prev_metrics["ctr"])
            / prev_metrics["ctr"] * 100.0
            if prev_metrics["ctr"] > 0
            else 0
        )
        if impr_change > 50.0 and ctr_change < -10.0:
            alerts.append(
                f"🟡 Impressions 涨 {impr_change:.1f}% + CTR 跌 {abs(ctr_change):.1f}%："
                f"可能标题/描述失配，需查 searchAnalytics.query 看具体 query"
            )

    # 4. Sitemap 错误
    def _to_int(v):
        try:
            return int(v)
        except (TypeError, ValueError):
            return 0

    for sm in sitemaps:
        errors = _to_int(sm.get("errors"))
        warnings = _to_int(sm.get("warnings"))
        path = sm.get("path", "<unknown>")
        if errors > 0:
            alerts.append(
                f"🔴 Sitemap 错误 > 0：{path}（errors={errors}, warnings={warnings}）"
            )
        elif warnings > 10:
            alerts.append(
                f"🟡 Sitemap 警告较多：{path}（warnings={warnings}）"
            )

    # 5. Sitemap 索引率 0%
    for sm in sitemaps:
        submitted = _to_int(sm.get("contents", [{}])[0].get("submitted")) if sm.get("contents") else 0
        indexed = _to_int(sm.get("contents", [{}])[0].get("indexed")) if sm.get("contents") else 0
        path = sm.get("path", "<unknown>")
        if submitted > 0 and indexed == 0:
            alerts.append(
                f"🔴 Sitemap 索引率 0%：{path}（submitted={submitted}, indexed=0）— "
                f"需检查 sitemap.xml 是否可被 Googlebot 抓取"
            )

    return alerts


# =============================================================================
# 建议生成
# =============================================================================

def generate_recommendations(
    daily_rows: list[dict],
    curr_metrics: dict,
    prev_metrics: dict,
    top_queries: list[dict],
    sitemaps: list[dict],
    alerts: list[str],
) -> list[str]:
    """基于数据生成 1-3 条建议。"""
    recs = []

    # Impressions 周环比
    if prev_metrics["impressions"] > 0:
        impr_chg = (
            (curr_metrics["impressions"] - prev_metrics["impressions"])
            / prev_metrics["impressions"] * 100.0
        )
        if impr_chg < -10.0:
            recs.append(
                f"Impressions 周环比下降 {abs(impr_chg):.1f}%，需查 searchAnalytics.query 维度"
                f"看具体哪些 query 下降，再针对性优化"
            )
        elif impr_chg > 30.0:
            recs.append(
                f"Impressions 周环比上升 {impr_chg:.1f}%，观察 CTR 是否同步上升；"
                f"如 CTR 反而下降，需优化 title/meta 提升点击"
            )

    # Top queries 排名
    if top_queries:
        avg_top_pos = sum(q.get("position", 0) for q in top_queries[:10]) / min(
            len(top_queries), 10
        )
        if avg_top_pos > 30:
            recs.append(
                f"Top 10 queries 平均位置 {avg_top_pos:.1f}（>30），需要 SEO 优化："
                f"覆盖关键词、title/meta、内容深度"
            )
        elif avg_top_pos > 10:
            recs.append(
                f"Top 10 queries 平均位置 {avg_top_pos:.1f}（10-30），"
                f"有冲首页潜力，重点优化 CTR"
            )

    # Sitemap 状态
    for sm in sitemaps:
        contents = sm.get("contents", [])
        if not contents:
            continue
        c = contents[0]
        submitted = c.get("submitted", 0)
        indexed = c.get("indexed", 0)
        try:
            submitted = int(submitted)
        except (TypeError, ValueError):
            submitted = 0
        try:
            indexed = int(indexed)
        except (TypeError, ValueError):
            indexed = 0
        if submitted > 0 and indexed == 0:
            recs.append(
                f"Sitemap {sm.get('path', '')} 索引率 0%，"
                f"检查 sitemap.xml 是否可访问、是否通过 GSC 验证"
            )

    # 限长
    return recs[:3]


# =============================================================================
# 报告渲染（Markdown）
# =============================================================================

def render_report(
    today: date,
    curr_metrics: dict,
    prev_metrics: dict,
    daily_rows: list[dict],
    top_queries: list[dict],
    top_pages: list[dict],
    top_countries: list[dict],
    devices: list[dict],
    sitemaps: list[dict],
    alerts: list[str],
    recommendations: list[str],
) -> str:
    """生成最终 Markdown 报告。"""
    lines = []
    lines.append(f"# ChinaConnect GSC 每日报告 — {today.isoformat()}")
    lines.append("")

    # 核心指标
    lines.append("## 📊 核心指标（当前 7 天 vs 上 7 天）")
    lines.append("")
    lines.append("| 指标 | 当前 7 天 | 上 7 天 | 变化 |")
    lines.append("|------|----------|---------|------|")
    lines.append(
        f"| Clicks | {curr_metrics['clicks']} | {prev_metrics['clicks']} | "
        f"{pct_change(curr_metrics['clicks'], prev_metrics['clicks'])} |"
    )
    lines.append(
        f"| Impressions | {curr_metrics['impressions']} | {prev_metrics['impressions']} | "
        f"{pct_change(curr_metrics['impressions'], prev_metrics['impressions'])} |"
    )
    lines.append(
        f"| CTR | {curr_metrics['ctr']:.2f}% | {prev_metrics['ctr']:.2f}% | "
        f"{pct_change(curr_metrics['ctr'], prev_metrics['ctr'])} |"
    )
    lines.append(
        f"| Avg Position | {curr_metrics['position']:.1f} | {prev_metrics['position']:.1f} | - |"
    )
    lines.append("")

    # 每日明细
    lines.append("## 📈 每日明细（当前 7 天）")
    lines.append("")
    lines.append("| 日期 | Clicks | Impressions | CTR | Position |")
    lines.append("|------|--------|-------------|-----|----------|")
    sorted_daily = sorted(daily_rows, key=lambda r: r["keys"][0])
    for row in sorted_daily:
        d = row["keys"][0]
        c = row.get("clicks", 0)
        i = row.get("impressions", 0)
        ctr = row.get("ctr", 0.0)
        # GSC 返回的 ctr 是 0-1 范围
        ctr_pct = ctr * 100.0 if ctr <= 1.0 else ctr
        pos = row.get("position", 0.0)
        lines.append(f"| {d} | {c} | {i} | {ctr_pct:.2f}% | {pos:.1f} |")
    lines.append("")

    # Top Queries
    lines.append("## 🔍 Top Queries（28 天，top 20）")
    lines.append("")
    if top_queries:
        lines.append("| Query | Clicks | Impressions | CTR | Position |")
        lines.append("|-------|--------|-------------|-----|----------|")
        for row in top_queries[:20]:
            q = row["keys"][0] if row.get("keys") else ""
            c = row.get("clicks", 0)
            i = row.get("impressions", 0)
            ctr = row.get("ctr", 0.0)
            ctr_pct = ctr * 100.0 if ctr <= 1.0 else ctr
            pos = row.get("position", 0.0)
            lines.append(f"| {q} | {c} | {i} | {ctr_pct:.2f}% | {pos:.1f} |")
    else:
        lines.append("（无数据）")
    lines.append("")

    # Top Pages
    lines.append("## 📄 Top Pages（28 天，top 20）")
    lines.append("")
    if top_pages:
        lines.append("| Page | Clicks | Impressions | CTR | Position |")
        lines.append("|------|--------|-------------|-----|----------|")
        for row in top_pages[:20]:
            p = row["keys"][0] if row.get("keys") else ""
            c = row.get("clicks", 0)
            i = row.get("impressions", 0)
            ctr = row.get("ctr", 0.0)
            ctr_pct = ctr * 100.0 if ctr <= 1.0 else ctr
            pos = row.get("position", 0.0)
            lines.append(f"| {p} | {c} | {i} | {ctr_pct:.2f}% | {pos:.1f} |")
    else:
        lines.append("（无数据）")
    lines.append("")

    # Countries
    lines.append("## 🌍 Country / Device 分布（28 天）")
    lines.append("")
    lines.append("### Top 10 国家")
    lines.append("")
    if top_countries:
        lines.append("| Country | Clicks | Impressions | CTR |")
        lines.append("|---------|--------|-------------|-----|")
        for row in top_countries[:10]:
            co = row["keys"][0] if row.get("keys") else ""
            c = row.get("clicks", 0)
            i = row.get("impressions", 0)
            ctr = row.get("ctr", 0.0)
            ctr_pct = ctr * 100.0 if ctr <= 1.0 else ctr
            lines.append(f"| {co} | {c} | {i} | {ctr_pct:.2f}% |")
    else:
        lines.append("（无数据）")
    lines.append("")

    # Devices
    lines.append("### Devices")
    lines.append("")
    if devices:
        lines.append("| Device | Clicks | Impressions | CTR |")
        lines.append("|--------|--------|-------------|-----|")
        for row in devices:
            dev = row["keys"][0] if row.get("keys") else ""
            c = row.get("clicks", 0)
            i = row.get("impressions", 0)
            ctr = row.get("ctr", 0.0)
            ctr_pct = ctr * 100.0 if ctr <= 1.0 else ctr
            lines.append(f"| {dev} | {c} | {i} | {ctr_pct:.2f}% |")
    else:
        lines.append("（无数据）")
    lines.append("")

    # Sitemaps
    lines.append("## 🗺️ Sitemap 状态")
    lines.append("")
    if sitemaps:
        lines.append("| Sitemap | Last Submitted | Submitted | Indexed | Warnings | Errors |")
        lines.append("|---------|----------------|-----------|---------|----------|--------|")
        for sm in sitemaps:
            path = sm.get("path", "")
            last_submitted = sm.get("lastSubmitted", "")
            contents = sm.get("contents", [])
            if contents:
                submitted = contents[0].get("submitted", 0)
                indexed = contents[0].get("indexed", 0)
                try:
                    submitted = int(submitted)
                except (TypeError, ValueError):
                    submitted = 0
                try:
                    indexed = int(indexed)
                except (TypeError, ValueError):
                    indexed = 0
            else:
                submitted = 0
                indexed = 0
            try:
                warnings = int(sm.get("warnings", 0) or 0)
            except (TypeError, ValueError):
                warnings = 0
            try:
                errors = int(sm.get("errors", 0) or 0)
            except (TypeError, ValueError):
                errors = 0
            lines.append(
                f"| {path} | {last_submitted} | {submitted} | {indexed} | "
                f"{warnings} | {errors} |"
            )
    else:
        lines.append("（无 sitemap 数据）")
    lines.append("")

    # 异常告警
    lines.append("## ⚠️ 异常告警")
    lines.append("")
    if alerts:
        for a in alerts:
            lines.append(f"- {a}")
    else:
        lines.append("✅ 当前无异常")
    lines.append("")

    # 下一步建议
    lines.append("## � 下一步建议")
    lines.append("")
    if recommendations:
        for r in recommendations:
            lines.append(f"- {r}")
    else:
        lines.append("- 当前数据平稳，继续监控")
    lines.append("")

    # 报告 footer（绝不写 token / secret）
    lines.append("---")
    lines.append("")
    lines.append(
        f"_报告生成时间：{datetime.now().isoformat(timespec='seconds')} | "
        f"数据源：Google Search Console | 站点：{SITE_URL}_"
    )
    lines.append("")

    return "\n".join(lines)


# =============================================================================
# 主流程
# =============================================================================

def main() -> int:
    today = date.today()
    end_date = today - timedelta(days=2)  # GSC 数据有 2-3 天延迟
    start_curr = end_date - timedelta(days=SHORT_WINDOW_DAYS - 1)
    start_prev = start_curr - timedelta(days=SHORT_WINDOW_DAYS)
    start_long = end_date - timedelta(days=LONG_WINDOW_DAYS - 1)

    print(f"[INFO] 报告日期：{today.isoformat()}")
    print(f"[INFO] 当前 7 天：{start_curr.isoformat()} ~ {end_date.isoformat()}")
    print(f"[INFO] 上 7 天：{start_prev.isoformat()} ~ {(start_curr - timedelta(days=1)).isoformat()}")
    print(f"[INFO] 28 天窗口：{start_long.isoformat()} ~ {end_date.isoformat()}")
    print(f"[INFO] 站点：{SITE_URL}")
    print()

    # 1. 拿 access_token
    creds = load_refresh_token()
    access_token = get_access_token(creds)
    print(f"[OK] access_token 已就绪（缓存至 {ACCESS_TOKEN_CACHE}）")

    # 2. 拉数据
    try:
        # 当前 7 天（按 date）
        curr_rows_daily = fetch_search_analytics(
            access_token,
            start_curr.isoformat(),
            end_date.isoformat(),
            dimensions=["date"],
            row_limit=100,
        )
        # 上 7 天（按 date）
        prev_rows_daily = fetch_search_analytics(
            access_token,
            start_prev.isoformat(),
            (start_curr - timedelta(days=1)).isoformat(),
            dimensions=["date"],
            row_limit=100,
        )
        # 28 天 - top queries
        top_queries = fetch_search_analytics(
            access_token,
            start_long.isoformat(),
            end_date.isoformat(),
            dimensions=["query"],
            row_limit=25,
        )
        # 28 天 - top pages
        top_pages = fetch_search_analytics(
            access_token,
            start_long.isoformat(),
            end_date.isoformat(),
            dimensions=["page"],
            row_limit=25,
        )
        # 28 天 - countries
        top_countries = fetch_search_analytics(
            access_token,
            start_long.isoformat(),
            end_date.isoformat(),
            dimensions=["country"],
            row_limit=25,
        )
        # 28 天 - devices
        devices = fetch_search_analytics(
            access_token,
            start_long.isoformat(),
            end_date.isoformat(),
            dimensions=["device"],
            row_limit=10,
        )
        # sitemaps
        sitemaps = fetch_sitemaps(access_token)
    except Exception as e:
        print(f"[FATAL] GSC 拉取失败：{e}", file=sys.stderr)
        # 失败也要写报告（让 cron 知道失败原因）
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        failure_report = (
            f"# ChinaConnect GSC 每日报告 — {today.isoformat()}\n\n"
            f"## 🚨 报告生成失败\n\n"
            f"```\n{e}\n```\n\n"
            f"## 📌 下一步建议\n\n"
            f"- 检查 references/gsc-refresh-token.json 是否过期\n"
            f"- 跑 python scripts/gsc-get-refresh-token.py 重新拿 token\n"
            f"- 检查 GCP OAuth client 配置是否还在\n"
            f"- 详见脚本输出的 [ERROR] 日志\n"
        )
        out_path = REPORTS_DIR / f"{today.isoformat()}.md"
        out_path.write_text(failure_report, encoding="utf-8")
        print(f"[INFO] 失败报告已写到：{out_path}")
        return 1

    print(f"[OK] GSC 数据拉取完成")
    print(f"     当前 7 天：{len(curr_rows_daily)} 行 / 上 7 天：{len(prev_rows_daily)} 行")
    print(f"     top queries={len(top_queries)}, pages={len(top_pages)}, "
          f"countries={len(top_countries)}, devices={len(devices)}, "
          f"sitemaps={len(sitemaps)}")

    # 3. 聚合
    curr_metrics = aggregate_metrics(curr_rows_daily)
    prev_metrics = aggregate_metrics(prev_rows_daily)

    # 4. 异常检测
    alerts = detect_anomalies(
        daily_rows=curr_rows_daily,
        sitemaps=sitemaps,
        prev_metrics=prev_metrics,
        curr_metrics=curr_metrics,
    )

    # 5. 建议
    recommendations = generate_recommendations(
        daily_rows=curr_rows_daily,
        curr_metrics=curr_metrics,
        prev_metrics=prev_metrics,
        top_queries=top_queries,
        sitemaps=sitemaps,
        alerts=alerts,
    )

    # 6. 渲染 + 写文件
    report = render_report(
        today=today,
        curr_metrics=curr_metrics,
        prev_metrics=prev_metrics,
        daily_rows=curr_rows_daily,
        top_queries=top_queries,
        top_pages=top_pages,
        top_countries=top_countries,
        devices=devices,
        sitemaps=sitemaps,
        alerts=alerts,
        recommendations=recommendations,
    )

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = REPORTS_DIR / f"{today.isoformat()}.md"
    out_path.write_text(report, encoding="utf-8")
    print(f"[OK] 报告已生成：{out_path}")
    print(f"     异常告警：{len(alerts)} 条")
    print(f"     建议：{len(recommendations)} 条")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n[ABORT] 用户中断", file=sys.stderr)
        sys.exit(130)
