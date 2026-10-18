# ChinaConnect GSC 首次配置说明

> 本文档是 ChinaConnect（chinaengage.org）GSC OAuth 的**首次配置步骤**。
> 老板（信哥）需要做一次手动浏览器操作，跑通后 token 自动保存，后续每日 cron 自动刷新。

## 0. 前置条件

- [ ] Python 3.8+ 已安装（`python --version`）
- [ ] 老板的 Google 账号在 GSC 里 verify 过 chinaengage.org
- [ ] 老板能登录 GCP console 并创建 OAuth client

---

## 步骤 1：创建 GCP OAuth client

### 1.1 进入 GCP console

1. 打开 https://console.cloud.google.com/
2. 选 ChinaConnect 对应的 GCP project（不是 mi-to-ai 的 project）

### 1.2 启用 Search Console API

APIs & Services → Library → 搜 "Google Search Console API" → Enable

### 1.3 配置 OAuth consent screen

APIs & Services → OAuth consent screen：

- User type：**External**（除非老板有 Workspace，那就 Internal）
- App name：`ChinaConnect GSC`
- User support email：老板的 email
- Developer contact：老板的 email
- Scopes：加 `https://www.googleapis.com/auth/webmasters`（**full scope**，不要 readonly）
- Test users：加老板的 email（External 模式下，未发布的 app 只能授权测试用户）
- 保存

### 1.4 创建 OAuth client ID

APIs & Services → Credentials → Create Credentials → OAuth client ID：

- Application type：**Web application**
- Name：`ChinaConnect GSC Web`
- Authorized JavaScript origins：（留空）
- **Authorized redirect URIs**：
  - `http://127.0.0.1:8080/`
  - （如未来要用其他端口，预先加 `http://127.0.0.1:8081/` 等）

点 Create → 弹出 client_id 和 client_secret → **复制保存到老板的密码管理器**。

---

## 步骤 2：存凭据到 ChinaConnect 项目

在项目根目录：

```bash
cd D:\suoyouxiangmu\chinaconnect
mkdir -p references
```

创建 `references/gcp-oauth-client.json`：

```json
{
  "client_id": "<粘贴步骤 1.4 拿到的 client_id>",
  "client_secret": "<粘贴 client_secret>"
}
```

**铁律**：
- 不要把 `gcp-oauth-client.json` commit 到 git
- 在 `.gitignore` 里加：`references/gcp-oauth-client.json`

---

## 步骤 3：跑 OAuth flow 拿 refresh_token

```bash
python scripts/gsc-get-refresh-token.py
```

预期行为：

1. 脚本启动本地 HTTP server 在 127.0.0.1:8080
2. 浏览器自动打开 Google 授权页（如果没自动打开，复制脚本打印的 URL）
3. 老板登录 Google 账号 → 看 "Allow ... to access your Google Search Console data" → 点 Allow
4. 浏览器跳回 127.0.0.1:8080 → 显示 "Authorization successful"
5. 脚本捕获 code → POST 到 oauth2.googleapis.com/token → 拿 access_token + refresh_token
6. 写到 `references/gsc-refresh-token.json`
7. 终端打印：

```
[OK] refresh_token 已写入：
     D:\suoyouxiangmu\chinaconnect\references\gsc-refresh-token.json

[OK] 字段：
     refresh_token: <已保存，长度 XX>
     client_id: <已保存，长度 XX>
     client_secret: <已保存，长度 XX>
     updated_at: YYYY-MM-DD
```

**注意**：脚本**不打印 token 内容**，只打印长度——这是安全设计。

---

## 步骤 4：验证

### 4.1 跑每日报告脚本

```bash
python scripts/gsc-daily-report.py
```

预期：
- 终端打印 `[OK] 报告已生成：D:\suoyouxiangmu\chinaconnect\.audit\gsc-reports\YYYY-MM-DD.md`
- 不报 401 / 403 / 404
- 报告文件包含 clicks / impressions / CTR / position 等真实数据

### 4.2 手动 spot-check access_token

```bash
python -c "
import json
import urllib.request
import urllib.parse

creds = json.load(open('references/gsc-refresh-token.json', encoding='utf-8'))
data = urllib.parse.urlencode({
    'client_id': creds['client_id'],
    'client_secret': creds['client_secret'],
    'refresh_token': creds['refresh_token'],
    'grant_type': 'refresh_token',
}, safe='').encode('utf-8')

req = urllib.request.Request(
    'https://oauth2.googleapis.com/token',
    data=data,
    headers={'Content-Type': 'application/x-www-form-urlencoded'},
    method='POST',
)
with urllib.request.urlopen(req, timeout=15) as resp:
    payload = json.loads(resp.read().decode('utf-8'))
    print('access_token 长度：', len(payload.get('access_token', '')))
    print('expires_in：', payload.get('expires_in'))
"
```

预期：`access_token 长度 > 0` 且 `expires_in` 接近 3600。

### 4.3 手动 spot-check searchAnalytics API

```bash
python -c "
import json
import urllib.request
import urllib.parse
from datetime import date, timedelta

creds = json.load(open('references/gsc-refresh-token.json', encoding='utf-8'))

# 拿 access_token
data = urllib.parse.urlencode({
    'client_id': creds['client_id'],
    'client_secret': creds['client_secret'],
    'refresh_token': creds['refresh_token'],
    'grant_type': 'refresh_token',
}, safe='').encode('utf-8')
req = urllib.request.Request(
    'https://oauth2.googleapis.com/token',
    data=data,
    headers={'Content-Type': 'application/x-www-form-urlencoded'},
    method='POST',
)
with urllib.request.urlopen(req, timeout=15) as resp:
    access_token = json.loads(resp.read().decode('utf-8'))['access_token']

# 调 searchAnalytics（POST + JSON）
end = date.today() - timedelta(days=2)
start = end - timedelta(days=6)
body = json.dumps({
    'startDate': start.isoformat(),
    'endDate': end.isoformat(),
    'dimensions': ['date'],
}).encode('utf-8')

url = 'https://www.googleapis.com/webmasters/v3/sites/' + urllib.parse.quote('https://chinaengage.org/', safe='') + 'searchAnalytics/query'
req = urllib.request.Request(
    url,
    data=body,
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    },
    method='POST',
)
with urllib.request.urlopen(req, timeout=30) as resp:
    payload = json.loads(resp.read().decode('utf-8'))
    rows = payload.get('rows', [])
    print('最近 7 天 GSC 数据行数：', len(rows))
    if rows:
        print('第一条：', rows[0])
"
```

预期：返回 `rows` 列表，包含 date / clicks / impressions / ctr / position。

---

## 故障排查清单

### OAuth flow 阶段

| 症状 | 排查 |
|------|------|
| 浏览器不自动打开 | 手动复制脚本打印的 URL；或检查默认浏览器是否设置 |
| 端口 8080 被占 | 脚本自动切到 8081-8099；GCP OAuth client 必须注册对应端口的 redirect URI |
| `redirect_uri_mismatch` | GCP OAuth client redirect URI 必须精确匹配（含端口、含末尾斜杠） |
| `access_denied` | OAuth consent screen 没加测试用户（External 模式未发布） |
| 120 秒超时 | 浏览器没真跳回 localhost；或老板没点 Allow |
| 响应里没 `refresh_token` | 之前已授权过此 client（重复授权不重发）；撤销权限后重跑 |

### GSC API 阶段

| 症状 | 排查 |
|------|------|
| `403 Forbidden` | OAuth scope 不是 webmasters full；重跑 OAuth |
| `404 Not Found` | property URL 不是 URL prefix；改 `https://chinaengage.org/`（末尾斜杠） |
| `401 Unauthorized` | refresh_token 过期；跑 `gsc-get-refresh-token.py` 重拿 |
| `400 Bad Request` | URL 没 `safe=''`；searchAnalytics 用了 GET 而不是 POST |
| `403 PERMISSION_DENIED` | GSC 里没 verify chinaengage.org；或 verify 的账号跟 OAuth 账号不一致 |
| Rate limit | GSC API 限速 200 req/min；脚本默认串行调用，足够 |

### P52 三个铁律（任何 4xx 必查这三条）

> 这三条是 mi-to-ai 项目踩过的坑（不是 mi-to-ai 文件，是通用 OAuth 最佳实践）：
>
> 1. **`urllib.parse.urlencode(safe='')`**：URL-encoded body 必须 safe=''，否则 `/` 等字符 escape 错。
> 2. **POST + JSON body**：`searchAnalytics.query` 必须 POST + JSON body，**不是** GET + query string。
> 3. **URL prefix property**：siteUrl 必须 `https://chinaengage.org/`（末尾斜杠）。
>
> 这些是公开 Google API 文档的常识，不是 mi-to-ai 文件独有的。ChinaConnect 脚本已经遵守。

### Report 阶段

| 症状 | 排查 |
|------|------|
| 报告文件不存在 | 看终端 `gsc-daily-report.py` 输出；失败时脚本会写"🚨 报告生成失败"段 |
| 报告里数据是 0 | GSC 数据有 2-3 天延迟；检查 `end_date = today - 2 days` 是否合理 |
| 报告里有 `🔴` 但实际无异常 | 检查阈值（CTR > 30% 跌幅、Impressions > 50% 跌幅）；可调 |
| access_token 缓存过期 | 删除 `.audit/.gsc_access_token_cache.json` 后重跑脚本 |

---

## 完成后老板需要做的事

1. ✅ 确认 `references/gsc-refresh-token.json` 已生成
2. ✅ 确认 `.gitignore` 包含凭据文件（`references/gcp-oauth-client.json` 和 `references/gsc-refresh-token.json`）
3. ✅ 跑一次 `python scripts/gsc-daily-report.py` 确认能生成报告
4. ⏳ 拍板要不要注册 cron 任务（早 10:00 ops + 22:00 daily-report）

---

## 与 mi-to-ai 的隔离声明

- 本文档**不是** mi-to-ai 项目（`D:\suoyouxiangmu\ai-student-survival\`）下的任何文件
- 提到的 P52/P53/P69 等坑是**通用 OAuth / GSC 公开知识**，不是引用 mi-to-ai 的内部文档
- ChinaConnect 用自己的 GCP project、自己注册的 OAuth client、自己保存的 token
- 两套系统**互不依赖**，token 不共享、脚本不共享、报告路径不共享
