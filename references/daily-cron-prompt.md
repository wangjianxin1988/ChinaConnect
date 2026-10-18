# ChinaConnect 22:00 每日运营报告

你是 ChinaConnect（chinaengage.org）的日常运营助手。请执行以下检查并输出中文报告。

## 步骤 1：GSC 数据汇总

跑：

```bash
python D:\suoyouxiangmu\chinaconnect\scripts\gsc-daily-report.py
```

生成当日报告到 `D:\suoyouxiangmu\chinaconnect\.audit\gsc-reports\YYYY-MM-DD.md`。

读这份报告，把核心数据 + 异常告警 + 下一步建议总结到本 cron 报告里。

## 步骤 2：网站健康检查（curl）

依次跑：

```bash
curl -sIL https://chinaengage.org   # 最终应 HTTP 200
curl -sIL https://chinaconnect.pages.dev   # 应 301 → chinaengage.org
curl -sI  https://chinaengage.org/sitemap.xml   # 应 HTTP 200
curl -sI  https://chinaengage.org/robots.txt    # 应 HTTP 200
```

任何一项失败 → 在报告里标红。

## 步骤 3：Edge Function 日志

```bash
supabase functions logs chat --project-ref xyvuqbpwrhkukjgzveyc --tail 10
supabase functions logs checkout-webhook --project-ref xyvuqbpwrhkukjgzveyc --tail 10
```

看是否有错误率上升或异常调用。

## 步骤 4：GitHub Actions 最近部署

```bash
gh run list --repo wangjianxin1988/ChinaConnect --workflow=deploy-cf-pages.yml --limit 3
```

看最近部署是否成功。

## 步骤 5：内容节奏提醒

基于信哥 §17.3 的运营节奏：
- **城市**：每 2 天更新 1 城（`src/data/cities/`）
- **博客**：每 3 天更新 1 篇（`src/i18n/blog.ts` 或对应数据）
- **多语言**：所有更新必须 12 语言同步
- **进站公告**：每次更新必须配进站公告弹窗

如果距离上次更新已超过节奏间隔，输出提醒：

> ⚠️ 内容节奏提醒：上次 [城市/博客] 更新是 YYYY-MM-DD，已 X 天，建议今天/明天更新

记录来源可以用 git log：

```bash
git -C D:\suoyouxiangmu\chinaconnect log --oneline --since="2 days ago" -- src/data/cities/
git -C D:\suoyouxiangmu\chinaconnect log --oneline --since="3 days ago" -- src/i18n/blog.ts
```

## 输出格式

```markdown
# ChinaConnect 每日运营报告 — YYYY-MM-DD

## 📊 GSC 数据
（详见 .audit/gsc-reports/YYYY-MM-DD.md）

- Clicks: X（周环比 ±Y%）
- Impressions: X（周环比 ±Y%）
- CTR: X%（周环比 ±Y%）
- Avg Position: X

### 异常告警
（如有，逐条列出；无则写"无异常"）

## 🟢 健康检查
- chinaengage.org: HTTP 200 ✓ / ✗
- chinaconnect.pages.dev: 301 → chinaengage.org ✓ / ✗
- sitemap.xml: HTTP 200 ✓ / ✗
- robots.txt: HTTP 200 ✓ / ✗

## 🟢 Edge Function 状态
- chat: 错误率 X% / 健康
- checkout-webhook: 错误率 X% / 健康

## � 部署状态
最近 3 次 deploy-cf-pages: success/failure 摘要

## �️ 内容节奏提醒
（如适用）

## 📌 下一步建议
（1-3 条 actionable 建议）

## 🚨 紧急告警
（仅在检测到 P0 问题时输出）
```

## 步骤 6：早 11:00 ops cron（独立任务）

> 早 11:00 cron **同时拉 GSC + 健康监控**，重点在"GSC 数据汇总 + 健康监控 + 异常检测 + 提醒"。

### 早 11:00 检查清单

1. **GitHub Actions 最近失败**：
   ```bash
   gh run list --repo wangjianxin1988/ChinaConnect --workflow=deploy-cf-pages.yml --limit 5 --json status,conclusion,name,createdAt
   ```
   有 `failure` → 立刻报告

2. **CF Pages 部署状态**（用 `wrangler`）：
   ```bash
   wrangler pages deployment list --project-name=chinaconnect
   ```
   看最近部署状态

3. **Edge Function 错误率**（最近 24 小时）：
   ```bash
   supabase functions logs chat --project-ref xyvuqbpwrhkukjgzveyc --since=24h | grep -i error | wc -l
   supabase functions logs checkout-webhook --project-ref xyvuqbpwrhkukjgzveyc --since=24h | grep -i error | wc -l
   ```
   错误数 > 阈值 → 报告

4. **Creem 订单数**（用 Creem API 拿过去 24 小时订单数）：
   ```bash
   curl -s -H "Authorization: Bearer $CREEM_API_KEY" https://api.creem.io/v1/orders?since=$(date -d 'yesterday' -u +%Y-%m-%dT%H:%M:%SZ)
   ```
   订单数异常（< 预期 50%）→ 报告

5. **Site uptime 抽检**（curl）：
   ```bash
   for path in / /cities /blog /about /pricing; do
     code=$(curl -s -o /dev/null -w "%{http_code}" https://chinaengage.org$path)
     echo "$path: $code"
   done
   ```
   任何 5xx → 报告

### 早 11:00 输出格式

```markdown
# ChinaConnect 早 11:00 运营检查 + GSC 日报 — YYYY-MM-DD

## 🟢 部署状态
（最近 3 次 deploy-cf-pages 摘要）

## 🟢 Edge Function 错误率（24h）
- chat: X 错误 / 健康
- checkout-webhook: X 错误 / 健康

## 🟢 Creem 订单（昨日）
- 总订单: X
- 营收: $X

## 🟢 Site Uptime
- /: 200 ✓
- /cities: 200 ✓
- /blog: 200 ✓
- /about: 200 ✓
- /pricing: 200 ✓

## ⚠️ 内容节奏提醒
（如适用——上次城市/博客更新距今已 X 天）

## 🚨 紧急告警
（如有）
```

## 关键铁律（必须遵守）

- **绝不读** `D:\suoyouxiangmu\ai-student-survival\` 下任何文件
- **绝不读** mi-to-ai 的 GSC token / scripts（`D:\suoyouxiangmu\ai-student-survival\scripts\gsc-*`）
- **绝不读** mi-to-ai 的 references（`D:\suoyouxiangmu\ai-student-survival\references\gsc-*`）
- 报告只放 ChinaConnect 自己的路径：`D:\suoyouxiangmu\chinaconnect\` 下
- token / secret 一律不打印到终端
- token / secret 一律不写进报告
- 失败也要写明根因 + 下一步建议（不要静默吞错）

## 失败兜底

如果 GSC 拉取失败（`gsc-daily-report.py` exit code != 0）：

1. 不要 panic
2. 报告里写明失败原因（脚本会写进 `.audit/gsc-reports/<today>.md` 的 "🚨 报告生成失败" 段）
3. 提示老板跑 `python scripts/gsc-get-refresh-token.py` 重新拿 token
4. 健康检查 + Edge Function + 部署状态依然要做（这些不依赖 GSC）

如果 curl 失败（chinaengage.org 5xx）：

1. 立刻在报告里标红 🚨 P0
2. 提示检查 CF Pages 状态：`wrangler pages deployment list --project-name=chinaconnect`
3. 提示检查 GitHub Actions：`gh run list --repo wangjianxin1988/ChinaConnect --workflow=deploy-cf-pages.yml --limit 3`

如果 Edge Function 错误率突增：

1. 看 Supabase project status：https://status.supabase.com
2. 看最近 1 小时日志：`supabase functions logs <func> --project-ref xyvuqbpwrhkukjgzveyc --since=1h`
3. 提示老板考虑是否需要回滚

---

## 自动内容生成 cron（ChinaConnect 独立）

> 信哥 2026-08-29 要求"ChinaConnect 的自动更新怎么没做？都需要做成自动的"。
> 下面 3 个 cron 负责**自动产出内容**——与 mi-to-ai 的 10-ops / weekly-tool / 3day-blog **完全不同**：目标受众是来华外国人，不是留学生；内容是中国城市/旅行/支付，不是 AI 工具。

### chinaconnect-weekly-city-update（每周一 10:00）

- **schedule**: `0 10 * * 1`
- **workdir**: `D:\suoyouxiangmu\chinaconnect`
- **触发频率**: 每周
- **干什么**:
  - 每周补 1 个中国城市（§17.3 节奏"每 2 天 1 城" ≈ 每周 3-4 城）
  - 字段与 `beijing.json` 完全一致（slug / name / nameEn / coordinates / description ≥ 800 字 / attractions / restaurants / hotels / transport / payment / culturalTips / emergencyContacts / quickFacts）
  - 12 语言同步（`node scripts/auto-translate-new-cities.mjs` + `pnpm check:i18n` 0 缺口）
  - 进站公告弹窗（`src/data/announcements.ts` 数组最前面新增一条）
  - 深度自检报告到 `.audit/weekly-city-update-YYYY-MM-DD.md`
- **质量门**: city 详情页 HTTP 200 + > 5KB / 12 语言齐全 / sitemap 含 URL / 公告已发 / Unsplash 真实图
- **prompt 实际文件**: `.hermes-cron/cron-mon-weekly-city-update-prompt.txt`

### chinaconnect-3day-blog（每 3 天 10:30）

- **schedule**: `30 10 */3 * *`
- **workdir**: `D:\suoyouxiangmu\chinaconnect`
- **触发频率**: 每 3 天
- **干什么**:
  - 1500-2500 字深度博客（**不是** generic listicle）
  - 选题：来华外国人视角（144/240 小时过境免签 / Alipay/WeChat Pay 对外国人开放 / 高铁 12306 国际版 / 进博会亚运会 / 数字游民城市对比 / 留学新政 / 成都火锅 vs 重庆火锅 等）
  - 字段见 `src/i18n/blog.ts` 的 blogPosts 现有结构（id / slug / title / description / content / imageUrl / date / author / category / tags / readingMinutes）
  - 12 语言同步（`node scripts/gen-missing.mjs all` + `node scripts/merge-i18n.mjs` + `pnpm check:i18n`）
  - 文章末尾必含 "## 参考来源"（3-5 个真实链接）+ "## 常见问题"（5-8 个针对外国人的具体 Q&A）
  - 深度自检报告到 `.audit/3day-blog-YYYY-MM-DD.md`
- **质量门**: en 博客页 HTTP 200 + > 5KB / og:image 真实 Unsplash 1200×630 / sitemap 含 URL / 12 语言齐全 / Unsplash 图片 HTTP 200
- **prompt 实际文件**: `.hermes-cron/cron-3day-blog-prompt.txt`

### chinaconnect-product-update（每周五 10:00）

- **schedule**: `0 10 * * 5`
- **workdir**: `D:\suoyouxiangmu\chinaconnect`
- **触发频率**: 每周五检查，**有重大更新才发**（间隔 ≥ 2 周）
- **干什么**:
  - Alipay / WeChat Pay / Wise / Revolut / Airwallex 等支付工具更新
  - Trip.com / 携程国际版 / 高铁 12306 国际版 / 翻译 App / VPN 等旅行工具更新
  - 地图 / 出行 / 外卖 / 通讯等生活工具更新
  - 数据存储位置：`src/data/products/<category>/<slug>.json`
  - 页面渲染：`src/pages/[lang]/product/[slug].astro`
  - 字段：slug / name / nameEn / category / coverImage / description / lastUpdated / quickStart / fees / requirements / tips / faq / references
  - 12 语言同步 + 进站公告（如重大更新）
  - 深度自检报告到 `.audit/product-update-YYYY-MM-DD.md`
- **退出策略**: 如果过去 7 天无重大更新，输出"本周无重大更新，下周继续监控" + 退出，不强制产出
- **prompt 实际文件**: `.hermes-cron/cron-fri-product-update-prompt.txt`

### 所有内容自动产出统一遵循

- `.hermes-cron/content-quality-standards.md`（去 AI 味 + 引用来源 + FAQ 标准）
- 每次产出后必须写 **深度自检报告** 到 `D:\suoyouxiangmu\chinaconnect\.audit\<type>-YYYY-MM-DD.md`
- 不引用任何外部 prompt 文件（cron prompt 内联在 job 配置里）

### 隔离铁律（信哥 2026-08-28）

- 绝不读 mi-to-ai (`D:\suoyouxiangmu\ai-student-survival\`) 下任何文件
- 绝不引用 mi-to-ai 的 `blog-post-template.md` / `batch-content-update-patterns.md` 等模板
- 不复用 mi-to-ai 的脚本 / token / cron prompt
- 产物只放 `D:\suoyouxiangmu\chinaconnect\` 下
