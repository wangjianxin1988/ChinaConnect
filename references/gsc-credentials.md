# ChinaConnect GSC 凭据配置（独立于 mi-to-ai）

> 本文件是 ChinaConnect（chinaengage.org）Google Search Console OAuth 凭据的**位置索引**。
> 本文件**不包含任何真实凭据值**——只描述凭据放在哪里、权限范围是什么、如何轮换。
>
> 任何情况下都不应把真实 client_id / client_secret / refresh_token 写进这个文件或 git。

## 凭据存放

| 类型 | 文件路径 | git 状态 |
|------|----------|----------|
| OAuth client_id / client_secret | `D:\suoyouxiangmu\chinaconnect\references\gcp-oauth-client.json` | git ignored |
| OAuth refresh_token | `D:\suoyouxiangmu\chinaconnect\references\gsc-refresh-token.json` | git ignored |
| access_token 缓存（1 小时有效） | `D:\suoyouxiangmu\chinaconnect\.audit\.gsc_access_token_cache.json` | git ignored（推荐） |

`gcp-oauth-client.json` 的 JSON 格式：

```json
{
  "client_id": "<在 GCP console 创建 OAuth client 时拿到>",
  "client_secret": "<同上>"
}
```

`gsc-refresh-token.json` 由 `scripts/gsc-get-refresh-token.py` 自动生成，结构：

```json
{
  "refresh_token": "<OAuth flow 拿到的>",
  "client_id": "<从 gcp-oauth-client.json 复制>",
  "client_secret": "<同上>",
  "updated_at": "YYYY-MM-DD"
}
```

## .gitignore 必须包含

```gitignore
references/gcp-oauth-client.json
references/gsc-refresh-token.json
.audit/.gsc_access_token_cache.json
.audit/gsc-reports/
```

## OAuth 流程（首次配置）

1. **创建 GCP OAuth client（Web application）**：
   - 打开 [Google Cloud Console](https://console.cloud.google.com/) → 选 ChinaConnect 项目
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type：**Web application**
   - Name：`ChinaConnect GSC`（任意可识别即可）
   - Authorized JavaScript origins：（留空）
   - **Authorized redirect URIs**：`http://127.0.0.1:8080/`
     - 必须精确匹配：`http`、主机 `127.0.0.1`、端口 `8080`、末尾斜杠
     - 脚本默认端口是 8080（8081-8099 是 fallback）
   - Scope：`https://www.googleapis.com/auth/webmasters`（full scope，**不是** readonly）
   - 点 Create → 拿到 client_id + client_secret

2. **存到 `references/gcp-oauth-client.json`**（git ignored）：
   ```json
   {
     "client_id": "<粘贴 client_id>",
     "client_secret": "<粘贴 client_secret>"
   }
   ```

3. **跑 `python scripts/gsc-get-refresh-token.py`** 启动 OAuth flow：
   - 脚本自动开浏览器到 Google 授权页
   - 登录老板的 Google 账号（chinaengage.org 在 GSC 里 verify 过的那个）
   - 点 Allow → 浏览器跳回 127.0.0.1:8080 → 显示 "Authorization successful"
   - 脚本捕获 code → 换 token → 写到 `references/gsc-refresh-token.json`
   - 整个过程 5 分钟内完成（120 秒 timeout）

4. **验证**：
   ```bash
   python scripts/gsc-daily-report.py
   ls .audit/gsc-reports/$(date +%Y-%m-%d).md  # 应存在
   ```

## OAuth 范围

- **必须用 webmasters full scope**：`https://www.googleapis.com/auth/webmasters`
- 不要用 `webmasters.readonly`（GSC API 的 PUT/DELETE 操作会 403）

## 凭据轮换（refresh_token 失效时）

**触发轮换的信号**：
- `scripts/gsc-daily-report.py` 报 `401 Unauthorized` 或 `invalid_grant`
- GCP console 里 OAuth client 被删 / 重置
- 老板的 Google 账号被改密码 / 撤销权限

**轮换步骤**：
1. 到 https://myaccount.google.com/permissions 撤销 ChinaConnect GSC app 的授权（避免拿不到新 refresh_token）
2. 重跑 `python scripts/gsc-get-refresh-token.py`
3. 验证：`python scripts/gsc-daily-report.py` 不再 401

## 安全铁律

- token / secret **永不进 git**
- token / secret **永不打印到终端**（脚本只打长度，不打内容）
- token / secret **永不发到聊天**（老板铁律 P50）
- token / secret **永不进报告文件**（`.audit/gsc-reports/*.md` 里只有 clicks/impressions/CTR/position 这些公开数据）
- 泄露后**立即轮换**（重跑 OAuth 拿新 refresh_token，删老 token 文件）

## 故障排查

| 症状 | 根因 | 修复 |
|------|------|------|
| `403 Forbidden` | OAuth scope 不是 webmasters full | 重跑 OAuth，授权时确认 scope = webmasters |
| `404 Not Found` | property URL 没用 URL prefix 格式 | 脚本里必须 `https://chinaengage.org/`（末尾斜杠） |
| `401 Unauthorized` | refresh_token 过期 / 被撤销 | 跑 `scripts/gsc-get-refresh-token.py` 重新获取 |
| `redirect_uri_mismatch` | GCP OAuth client redirect URI 没匹配 | 在 GCP console 加 `http://127.0.0.1:8080/` |
| `invalid_grant` | refresh_token 已用过或被撤销 | 撤销权限后重跑 OAuth |
| 浏览器不自动打开 | webbrowser.open 失败 | 手动复制脚本打印的 URL |
| 端口 8080 被占 | 脚本自动切到 8081-8099 | 在 GCP console 注册对应的 redirect URI（端口变了） |
| token 响应里没 refresh_token | 之前已授权过此 client（不重发） | 撤销权限后重跑 OAuth |

### P52 三个铁律（任何 GSC API 报 4xx 时优先检查这三条）

1. **`urllib.parse.urlencode(safe='')`**：URL-encoded body 必须 safe=''，否则特殊字符（`/`, `:`）会被 escape 错。
2. **POST + JSON body**：`searchAnalytics.query` 是 POST + JSON，**不是** GET + query string。
3. **URL prefix property**：siteUrl 必须 `https://chinaengage.org/`（末尾斜杠），不能用 `https://chinaengage.org` 或 domain property。

---

## 与 mi-to-ai 的隔离

- ChinaConnect 的 GSC 凭据**完全独立**于 mi-to-ai（`D:\suoyouxiangmu\ai-student-survival\`）的 GSC 凭据
- 两套用不同的 GCP OAuth client（建议用不同的 GCP project）
- 两套 token JSON 文件互相独立，**绝不共享**
- 任何脚本**绝不读** mi-to-ai 目录下的 `references/gsc-*` 或 `scripts/gsc-*` 文件
