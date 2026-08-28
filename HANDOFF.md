# ChinaConnect 项目交接与运维手册

> 交接对象：**Hermes**（后续运营方）
> 编制日期：2026-08-28 ｜ 项目路径：`D:\suoyouxiangmu\chinaconnect` ｜ 仓库：`github.com/wangjianxin1988/ChinaConnect`（分支 `master`）
> 本文档是**运营手册**（怎么维护、怎么发布、怎么排障）。历史会话流水账在 `.audit/HANDOFF.md`（1855 行，逐会话记录，含大量根因细节），两者互补：排障先看本文档 §15 速查表，需要更深的背景再看 `.audit/HANDOFF.md`。
> 读本文档时请用能正确显示 UTF-8 的工具；PowerShell `Get-Content` 直接读中文可能有乱码，必要时用 Python/VS Code。

---

## 0. 交接速览（30 秒版）

- **产品**：ChinaConnect（对外品牌 ChinaGuide AI）— 面向来华外国人的 AI 旅行助手网站，以城市为锚点，覆盖旅游/商务/留学场景，12 语言。
- **线上地址**：`https://chinaengage.org`（Cloudflare Pages 生产域名）
- **代码**：GitHub `wangjianxin1988/ChinaConnect`，`master` 直推即部署。
- **核心后端**：Supabase（PostgreSQL + Auth + Edge Functions）+ Creem（收款）+ Resend（邮件）+ MiniMax（AI）。
- **当前状态**：功能已基本完备，Creem 收款已批准，正在“正式对外营业前最后排查”阶段。
- **交接后第一个动作**：按 §18 清单做一遍凭据验证 + 真实小额支付闭环测试。
- **运营节奏（Hermes 必须执行）**：城市内容每 2 天更新 1 城、博客每 3 天更新 1 篇；所有更新必须 12 语言同步，并在进站弹窗发布更新公告（SOP 见 §17.3）。

---

## 1. 项目概况

| 项 | 内容 |
|---|---|
| 定位 | 外国人来华一站式平台（旅游/商务/留学/数字游民），城市为核心内容单元 |
| 内容规模 | 35 个城市数据 × 12 语言；`src/data/cities/*.json` 为英文源，`src/data/cities-i18n/{lang}/*.json` 为 11 语言翻译（385 个文件） |
| 构建规模 | 静态生成 26,722 个页面（约 110–115s） |
| 测试 | Vitest 128 个单测/集成（12 个文件）+ Playwright E2E（13 个 spec）+ Lighthouse |
| 语言 | en / ja / ko / zh-CN / zh-TW / th / vi / ru / fr / de / ar / fa（12 种） |
| 关键约定 | 中文回复用户；最多 3 个并发子代理；每个新会话先读本文档 |

---

## 2. 技术栈与架构（现状，与旧 README/ARCHITECTURE 不同）

> ⚠️ 仓库里的 `README.md` 和 `ARCHITECTURE.md` 描述的是早期 Dify/Flarum 架构，**已过时**，以本文档为准。

```
浏览器 → Cloudflare Pages (静态 26,722 页 + Pages Functions)
            │
            ├── Pages Functions (functions/)
            │     ├── [[path]].ts        i18n 路由重写 / pages.dev 跳转 / CSP 头 / GSC 验证文件
            │     ├── api/pricing.ts     套餐定价 API（与 Creem 产品一致）
            │     ├── api/search.ts      AnySearch 搜索代理
            │     ├── api/chat.ts        旧 AI 聊天端点（已废弃，现走 Supabase Edge Function）
            │     ├── api/translate.ts   翻译代理
            │     └── api/auth/*         登录状态 / providers / signout
            │
            ├── Supabase (ref: xyvuqbpwrhkukjgzveyc)
            │     ├── PostgreSQL（auth / public 两套 schema，RLS 见 §7）
            │     ├── Auth（邮箱密码 + 免密 OTP + Google/GitHub OAuth）
            │     ├── Edge Functions：chat / checkout / checkout-webhook / checkout-verify
            │     └── 邮件：经 Supabase SMTP → Resend（noreply@mi-to-ai.com）
            │
            ├── Creem（Merchant of Record，收款）
            ├── MiniMax（AI 大模型，Edge Function chat 代理）
            ├── AnySearch（联网搜索）
            ├── OpenMeteo（天气数据）、OpenWeatherMap（天气图标）
            └── 地图：Leaflet + 高德瓦片（国内）/ Esri 瓦片（全球，Google 瓦片国内不可达时的替代）
```

- **前端**：Astro 5（`output: "static"`）+ React 19 islands + Tailwind + Leaflet/react-leaflet + zustand。
- **AI 对话链路**：前端 → `POST {SUPABASE_URL}/functions/v1/chat`（Edge Function）→ MiniMax，服务端做用量计费、会话记忆、工具调用循环、越界拦截（SCOPE_DIRECTIVE）。
- **支付链路**：前端 pricing → `functions/api/pricing.ts` → `supabase/functions/checkout`（生成 Creem 结账 URL）→ Creem 托管收银 → `checkout-webhook`（HMAC 验签 + 落订单/会员/钱包）→ 前端 `checkout/success`。
- **邮件链路**：Supabase Auth 内置邮件 → Resend SMTP（`smtp.resend.com:587`，`noreply@mi-to-ai.com`，60 封/分钟）。

---

## 3. 代码仓库与目录结构

### 3.1 仓库与分支
- 唯一远程 `origin` = `https://github.com/wangjianxin1988/ChinaConnect.git`。
- 当前工作流：**直接在 `master` 提交并 push**，GitHub Actions 自动 CI + 部署（无 PR 门禁）。CI 也监听 `develop`，但实际只推 master。

### 3.2 关键目录（按运维重要度）

| 路径 | 说明 |
|---|---|
| `src/pages/` | Astro 页面。`[lang]/` 下是 11 个非英文语言的同构页面；根目录是英文版。重点：`[lang]/account.astro`、`ai.astro`、`pricing.astro`、`city/[slug].astro`、`auth/*`、`itinerary/index.astro`、`trip/index.astro` |
| `src/components/` | React 组件。`user/`（登录/账户/头像）、`ai/`（AI 对话/行程显示）、`city/`（城市页各板块）、`Map/`（Leaflet 双引擎地图）、`account/`、`trip/` |
| `src/hooks/` | `useAuth.ts`（认证状态机，含 `?code=`/`#access_token` 链路消费）、`useAIConversation.ts`（会话/行程管理） |
| `src/services/` | `auth.ts`（Supabase Auth 封装）、`weather-api.ts`、`llm-router.ts`、`minimax.ts`、`supabase.ts` |
| `src/lib/auth/` | `supabase-auth.ts`（用户/资料/订单/行程查询封装） |
| `src/lib/ai/` | AI 核心：`prompts.ts`、`tools.ts`、`route-saver.ts`（行程抽取保存）、`export-itinerary.ts`（PDF/文本/JSON 导出）、`itinerary-builder.ts`、`schemas.ts` |
| `src/data/` | `cities/*.json`（35 城英文源，**勿改**）、`cities-i18n/`（11 语言翻译）、`guide/`、`payment/`、`seo/` |
| `src/i18n/` | `translations.ts`（52,989 行运行时 UI 大字典）、`locales/` |
| `functions/` | Cloudflare Pages Functions（见 §2） |
| `supabase/functions/` | Edge Functions：`chat`（868 行核心）、`checkout`、`checkout-webhook`、`checkout-verify`、`flarum-sso`（遗留，未用） |
| `supabase/migrations/` | 27 个迁移文件（从 20260526 到 20260909），数据库演进的唯一真相 |
| `.github/workflows/` | `deploy-cf-pages.yml`（部署）、`ci.yml`（lint/typecheck/i18n/单测）、`e2e.yml`（Playwright+Lighthouse） |
| `tests/` | `unit/`、`integration/`、`e2e/`（13 个 spec） |
| `.audit/HANDOFF.md` | 历史会话流水账（1855 行），背景知识库 |
| `public/_headers` | 安全响应头 + CSP（**与 functions/[[path]].ts 中的 CSP 必须同步**） |
| `public/img/ext/` | 2,275 张城市图片（哈希文件名 `.webp`） |

### 3.3 根目录历史遗留文件（可忽略，勿删核心配置）
- 大量 `build*.log`、`content-*.json`（~2.7MB×12 语言）、`*-translations.json`、`_*.mjs/_*.py` 临时脚本、`ar-translations.json` 等是历史构建/翻译产物与调试残留，多数未纳入 git（gitignore）或在根目录躺平，**不要提交它们**。
- `README.md` / `ARCHITECTURE.md` / `CLAUDE.md` 已过时，仅供参考。
- `src/pages/[lang]/index.astro.bak` 是未跟踪历史残留，可删。

---

## 4. 本地开发

### 4.1 环境要求
- Node.js 24（本机 `v24.14.0`；CI 用 node 20 + pnpm 9）、pnpm 11（**禁用 npm/yarn**）。
- Supabase CLI `2.100.1`（已登录）。
- Playwright Chromium 已装（`C:\Users\Administrator\AppData\Local\ms-playwright\chromium-*`）。

### 4.2 首次搭建
```powershell
cd D:\suoyouxiangmu\chinaconnect
pnpm install
Copy-Item .env.example .env   # 然后按 §5 填入真实值
pnpm dev
```
- 本地开发连的是**生产 Supabase**（`.env` 里是生产项目 `xyvuqbpwrhkukjgzveyc`），注意别在本地测试时污染生产数据。
- **dev server 必须 `astro dev --host`**（不带值），否则只监听 IPv4，IPv6 `[::1]` 会卡死。

### 4.3 常用命令

| 命令 | 用途 |
|---|---|
| `pnpm dev` | 本地开发（默认 `http://localhost:4321`） |
| `pnpm typecheck` | TypeScript 检查（`tsc --noEmit`） |
| `pnpm test` | Vitest 单测 + 集成（128 个） |
| `pnpm test:e2e:smoke` / `pnpm test:e2e` | Playwright E2E（先起 dev 或 preview） |
| `pnpm check:i18n` | 12 语言覆盖校验（CI 必跑，0 缺口才过） |
| `pnpm build` | `check:i18n` + `astro build`（**CI 里不要用，见 §14**） |
| `npx astro build` | 直接构建（本地验证用） |
| `node scripts/pack-food-details.mjs` | 打包美食详情（CI 部署同款步骤） |
| `pnpm lint` | Biome（仓库有 683 个历史 lint 错误，CI 用 `|| true` 兜底，**不要批量修**） |

---

## 5. 环境变量与密钥（只写位置，不写值）

### 5.1 本地文件
| 文件 | 内容 | 说明 |
|---|---|---|
| `.env` | 生产 Supabase URL/anon key、MiniMax、Amap key | 本地 dev 用（已被 gitignore） |
| `.env.verify.local` | `PUBLIC_SUPABASE_URL`、`PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` | 运维验证/脚本用，**绝不可提交** |
| `.env.creem.local` | Creem 相关密钥 | 支付调试用 |
| `.env.backup` | 历史备份（含真实 key，勿提交） | gitignore 已挡 |

### 5.2 密钥获取方式（给 Hermes 的凭据地图）
| 凭据 | 在哪里 | 如何获取 |
|---|---|---|
| Supabase 管理令牌（`sbp_`） | Windows 凭据管理器（`cmdkey`/凭据管理器）| `supabase login` 重新登录即刷新；历史写法：`[Text.Encoding]::ASCII.GetString([IO.File]::ReadAllBytes("$env:TEMP\supabase_blob.bin"))`（临时文件可能已清） |
| Supabase service_role key | Supabase Dashboard → Settings → API | 也可从 `.env.verify.local` 读 |
| GitHub Actions secrets | repo Settings → Secrets and variables → Actions | 含 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`PUBLIC_*`、`MINIMAX_API_KEY`、`ANYSEARCH_API_KEY`、`OAUTH_PROVIDERS_ENABLED` 等 |
| Cloudflare 密钥 | 在 GitHub secrets 里，不落本地 | Dashboard 也可重置 |
| Resend API key | 文件 `D:\suoyouxiangmu\ai-student-survival\.env`（历史会话记录） | 真实收发测试用；SMTP 凭据在 Supabase Dashboard → Auth → SMTP |
| Creem 店铺 | creem.io 控制台（店主账号由老板持有） | 店铺名 `xinshoping` |
| 高德 key | `.env` 的 `VITE_AMAP_WEB_API_KEY` / `PUBLIC_AMAP_SECURITY_KEY` | 高德开放平台控制台 |

### 5.3 安全纪律
- 任何 `.env*`、`*.key`、service_role、API key **绝不提交**（gitignore 已覆盖，但历史上有过 P0 泄露事故，见 `.audit/HANDOFF.md` 会话 #44）。
- 改 Supabase auth 配置（如 SMTP）时用**全量 PATCH**，单字段 PATCH 会重置其它项（历史踩坑）。
- 密钥轮换前先和老板确认（历史用户选择不轮换，见会话 #45）。

---

## 6. 外部服务清单

| 服务 | 用途 | 账号/项目标识 | 备注 |
|---|---|---|---|
| Supabase | 数据库 + Auth + Edge Functions | 项目 ref `xyvuqbpwrhkukjgzveyc`，站点 `https://chinaengage.org` | 免费/付费额度需留意用量 |
| Cloudflare Pages | 静态托管 + Functions | 项目名 `chinaconnect`，自定义域名 `chinaengage.org` | `chinaconnect.pages.dev` 自动 301 到主域名 |
| GitHub | 代码 + Actions | `wangjianxin1988/ChinaConnect` | CI/CD 全在 Actions |
| Creem | 收款（Merchant of Record） | 店铺 `xinshoping`，已批准 | 6 个产品，见 §9 |
| Resend | 事务邮件 | sender `noreply@mi-to-ai.com` | 经 Supabase SMTP（587，user `resend`） |
| MiniMax | AI 大模型 | `api.minimaxi.com` | Edge Function chat 用；有频率限制，脚本并发别超 3 |
| AnySearch | 联网搜索 | `api.anysearch.ai` | AI 工具/搜索代理用 |
| 高德地图 | 地图瓦片/JS SDK | 有 web key + security code | 国内网络可用 |
| OpenMeteo | 天气数据 | 免费 API | 对数据中心 IP 限流，测试环境偶发 503 |
| OpenWeatherMap | 天气图标 | 免费 | 同上，需带 Referer |
| Esri ArcGIS | 全球地图瓦片（Google 替代） | 免费 | 国内可达 |
| mail.tm | 临时测试邮箱 | emalupe.com 域 | 历史 E2E 用它收真实邮件 |
*** End Part 1
---

## 7. 数据库（Supabase PostgreSQL，schema `public`）

### 7.1 核心表清单

| 表 | 用途 | 隔离方式 |
|---|---|---|
| `profiles` | 用户资料（display_name/avatar/bio/nationality/travel_level 等） | 公开可读（公共主页/点评需要），`wallet_balance` 等敏感列已**列级隐藏（仅本人可见）** |
| `ai_conversations` / `ai_messages` | AI 对话与消息 | `auth.uid()` 严格隔离 |
| `ai_routes` | 保存的行程（title/route_data/days 等） | 本人可见 + `is_public` 行公开分享 |
| `ai_usage_daily` / `ai_usage` | AI 用量与限额 | 本人可见 |
| `ai_conversation_snapshots` | 会话快照/恢复 | 本人可见 |
| `orders` | 支付订单 | 本人可见 |
| `user_memberships` | 会员/套餐 | 本人可见 |
| `wallets` / `wallet_transactions` | 余额/流水 | 仅本人 |
| `bookmarks` | 收藏 | 本人可见 |
| `itineraries` / `itinerary_days` | 公开行程内容库 | 公开读（刻意设计） |
| `check_ins` / `community_posts` / `post_comments` / `content_likes` | 社区/点评 | 公开读，仅作者写 |
| `cities` / `restaurants` / `attractions` / `emergency_info` / `city_scores` 等 | 公开内容 | 公开读，**写权限已回收**（2026-08-27 RLS 加固） |
| `membership_tiers` | 套餐档位定义 | 只读 |
| `invoices` | 发票 | 本人可见 |
| `user_dashboard` | 仪表盘聚合视图 | security invoker + 本人 |

### 7.2 RLS 模型（关键原则）
- **所有用户数据按 `auth.uid()` 隔离**：SELECT/INSERT/UPDATE/DELETE 的 policy 均限定 `user_id = auth.uid()`（或通过会话归属判断）。
- 已实测双账号交叉验证：A 保存的行程/会话/订单，B 读不到、改不动、删不掉。
- 公开内容表（cities/restaurants 等 14 张）2026-08-27 起启用 RLS：`anon`/`authenticated` 只读，写权限全部回收（之前任何人都能增删改全库，P0 已修复）。
- `profiles` 敏感列（如 `wallet_balance`）用列级权限隐藏，匿名/他人查不到，本人可见。
- 关键迁移文件：`20260827_rls_harden_public_content.sql`、`20260827_hide_profiles_sensitive_columns.sql`、`20260901_ai_isolation_hardening.sql`、`20260902_close_privilege_escalation.sql`、`20260908_subscription_lifecycle.sql`、`20260909_comments_table.sql`。

### 7.3 运维查询方式
- Management API：`POST https://api.supabase.com/v1/projects/xyvuqbpwrhkukjgzveyc/database/query`，Body `{"query": "..."}`，Header `Authorization: Bearer <sbp_token>`。
- 本地 schema 快照：`.supabase-schema/`（有 `supabase-skill` 工具可 `context/table/search` 查询）。
- 参考命令（PowerShell）：`Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/xyvuqbpwrhkukjgzveyc/database/query" -Method Post -Headers @{Authorization="Bearer $token";"Content-Type"="application/json"} -Body (@{query=$sql}|ConvertTo-Json)`

---

## 8. 认证体系（Supabase Auth）

### 8.1 登录方式
| 方式 | 实现 | 状态 |
|---|---|---|
| 邮箱 + 密码 | `signInWithPassword` | ✅ 正常 |
| 免密登录（邮件 6 位验证码） | `signInWithOtp`（MAGIC_LINK_UI=Email code，模板 `mailer_templates_magic_link_content` 显示 `{{ .Token }}`） | ✅ 正常 |
| Google / GitHub OAuth | Supabase 内置，`redirect_to=/auth/callback` | ✅ 已配置并实测跳转 |
| 注册 | 邮箱确认（`mailer_autoconfirm=false`），注册后需点确认链接 | ✅ 正常（2026-08-27 修复注册后无提示 bug） |

### 8.2 关键配置（Dashboard 当前值）
- `site_url = https://chinaengage.org`；回调白名单含 `chinaengage.org` 与 localhost。
- `mailer_autoconfirm = false`（必须邮件确认）。
- `rate_limit_email_sent = 30`（封/小时），`mailer_otp_length = 6`，`mailer_otp_exp = 3600`。
- SMTP：`smtp.resend.com:587`，user `resend`，sender `noreply@mi-to-ai.com`，`smtp_max_frequency = 60/min`。
- 邮件模板：确认/免密（显示 6 位码）/找回均已自定义且验证可用。

### 8.3 认证关键代码
- `src/hooks/useAuth.ts` — 认证状态机；**在挂载时消费 `?code=`（PKCE）、`?token_hash=`、`#access_token=`**，所以 callback 页/reset-password 页能直接完成会话建立。
- `src/services/auth.ts` — Auth API 封装（`verifyMagicLink` 处理三种链接格式；`verifyEmailOtp` 校验 6 位码）。
- `src/components/user/LoginPage.tsx` — 统一登录/注册/免密/找回页（12 语言）。
- `src/components/user/ResetPasswordPage.tsx` — 找回后改密页。
- `src/pages/[lang]/auth/callback.astro` — OAuth/邮件链接回调。
- `functions/api/auth/providers.ts` / `state.ts` / `signout.ts` — 登录状态与 OAuth 可用性探测。

### 8.4 已验证链路（2026-08 多轮实测）
- 注册 → 确认邮件（noreply@mi-to-ai.com）→ 点击链接 → 自动登录进 `/account` ✅
- 免密登录 → 邮件 6 位码 → 登录页输入 → `/account` ✅
- 找回密码 → 恢复邮件 → `/auth/reset-password` → 新密码 → `/account`，新密码可登录、旧密码被拒 ✅
- OAuth → Google/GitHub 真实跳转 → callback ✅

---

## 9. 支付体系（Creem）

### 9.1 产品与定价（站点与 Creem 完全一致，2026-08-27 复验）
| 套餐 | 月付 | 年付 |
|---|---|---|
| Explorer | $4.99 | $47.99 |
| Traveler | $9.99 | $95.99 |
| Business | $19.99 | $191.99 |

### 9.2 链路与文件
- 定价数据：`functions/api/pricing.ts`（唯一真相，与 Creem 后台 6 个产品一一对应）。
- 结算：`supabase/functions/checkout`（生成 Creem 结账 URL；支持月/年）。
- 回调：`supabase/functions/checkout-webhook` — `verify_jwt=false`（2026-08-27 修复），用 `creem-signature` 做 HMAC 验签；已实测假签名 401、真签名 200。
- 订单落库：`orders`（order_type 如 `membership_renew`）；会员 `user_memberships`；余额 `wallets`。
- 前端：`/pricing`、`/checkout/success`、账户页 `BillingHistory` / `PlanComparison`。

### 9.3 订阅规则（2026-08-23 起已实现）
- 防重复充值、续费/升级逻辑、升级即时生效、降级/去重拦截，规则在 `20260908_subscription_lifecycle.sql` 与 `supabase/functions/checkout*`。
- 测试账号 `ai.codextest.1787386274959@example.com` 为 Business 档，保留作回归用。

### 9.4 未完成（重要）
- **尚未跑过“真实小额支付”闭环**（真实 Creem 结账 → webhook → 订单/会员/档位生效）。上线前建议老板本人完成一笔真实支付验证（.audit 会话 #59 已备）。

---

## 10. AI 体系

### 10.1 架构
- 前端 AI 页（`/ai`，组件 `AIChat.tsx`）→ `POST {SUPABASE_URL}/functions/v1/chat`（Edge Function，verify_jwt=true，需登录）→ MiniMax `MiniMax-Text-01`（或路由到其它模型）。
- Edge Function `supabase/functions/chat/index.ts`（868 行）负责：用量计数（`ai_usage_daily`）、会话记忆（`ai_conversations`/`ai_messages`）、工具调用循环、服务端越界拦截（SCOPE_DIRECTIVE，问题 8 已修：无条件追加，不随语言参数跳过）。

### 10.2 边界（已按用户要求收严）
- 服务端无条件追加 SCOPE_DIRECTIVE：禁止用 AI 做与本服务无关的事（写代码/开发软件等），但保留自由度的旅行规划回答。生产已实测：写爬虫/写开发计划被拒，正常行程规划正常输出。

### 10.3 用量限制
- 按 `membership_tiers.limits` 控制：Free 5 次/月等；`check_ai_limit` RPC 做服务端校验（`20260905_check_ai_limit_guard.sql`）。

### 10.4 行程保存/查看/导出/分享
- 保存：AI 对话确定行程后，前端 `route-saver.ts` 抽取路由 → 写 `ai_routes`（title/route_data/days）。
- 查看：AI 页侧栏预览卡片（Save/Export/Share + “View Full Details” CTA）；详情页 `/itinerary/<id>`（客户端解析 id，RLS 门禁）；账户页“已保存的行程”列表可点进详情。
- 导出：`src/lib/ai/export-itinerary.ts` — PDF 用 html2canvas 光栅化（**解决 CJK 乱码**），文本/JSON 均随**界面语言**输出（EXPORT_LABELS 12 语言）。
- 分享：`/trip/<share_token>`（公开分享页 `TripView.tsx`）。

### 10.5 已知注意
- 对话会持久化到 Supabase；刷新可恢复（`ai_conversation_snapshots`）。
- 免费档 5 次/月是硬限制，测试勿用真实账号刷额度。
- 修改 `supabase/functions/chat/index.ts` 后需 `supabase functions deploy chat --project-ref xyvuqbpwrhkukjgzveyc` 才生效。
---

## 11. 前端页面与功能地图

### 11.1 路由总览
- 英文版在根路径（如 `/ai`、`/pricing`），其余 11 语言在 `/{lang}/`（如 `/ja/ai`）。Astro i18n 配置 `prefixDefaultLocale: false`（`astro.config.mjs`）。
- `functions/[[path]].ts` 负责：无尾斜杠重写、`chinaconnect.pages.dev` → `chinaengage.org` 301、HTML 响应的 CSP/安全头、GSC 验证文件放行。

| 路径 | 页面 | 语言 |
|---|---|---|
| `/` | 首页（hero / 城市搜索 / 推荐 / 博客 / CTA） | 12 |
| `/cities`、`/{lang}/cities` | 城市列表 | 12 |
| `/city/[slug]`、`/{lang}/city/[slug]` | 城市详情（概览/美食/景点/交通/酒店/支付/SIM/App/文化/紧急） | 12 |
| `/city/[slug]/food`、`/attractions`、`/guide`、`/scenic-spots` 等 | 城市子页 | 12 |
| `/pricing` | 套餐页（金额唯一真相 = `functions/api/pricing.ts`） | 12 |
| `/ai` | AI 对话 + 行程保存/预览/导出/分享 | 12 |
| `/account` | 我的账户（资料/头像/订阅/用量/已保存行程/收藏/订单/钱包） | 12 |
| `/profile/[username]` | 公开主页 | 12 |
| `/auth/login`、`/auth/register`、`/auth/callback`、`/auth/reset-password` | 认证页 | 12 |
| `/checkout/success` | 支付回跳页 | 12 |
| `/itinerary/[id]` | 行程详情页（RLS 门禁，仅本人 / 公开分享可见） | 12 |
| `/trip/[share_token]` | 公开行程分享页 | 12 |
| `/blog`、`/guide`、`/food`、`/scenic-spots`、`/emergency`、`/contact`、`/terms`、`/privacy`、`/404`、`/offline` | 内容 / 信息页 | 12 |
| `/sitemap.xml`、`/robots.txt` | SEO（生成器在 `src/pages/sitemap.xml.ts`、`robots.txt.ts`） | — |

### 11.2 功能模块与代码位置（2026-08 已全部验证可用）

| 功能 | 关键代码 | 状态 |
|---|---|---|
| 登录 / 注册 / 免密 / 找回 | `src/components/user/LoginPage.tsx`、`ResetPasswordPage.tsx`、`src/hooks/useAuth.ts`、`src/services/auth.ts` | ✅ |
| 头像（预设 12 个 SVG + 默认兜底） | `src/components/user/UserAvatar.tsx`、`UserProfile.tsx` | ✅ |
| 账户资料编辑 | `src/components/user/UserProfilePage.tsx` | ✅ |
| AI 对话 | `src/components/ai/AIChat.tsx` + Edge Function `chat` | ✅ |
| 行程保存 / 详情 / 导出 / 分享 | `src/lib/ai/route-saver.ts`、`export-itinerary.ts`、`src/pages/itinerary/`、`src/pages/trip/`、`src/components/trip/TripView.tsx` | ✅ |
| 地图（双引擎自动降级） | `src/components/Map/DualMap.tsx` 等（见 §12） | ✅ |
| 天气 | `src/services/weather-api.ts`（OpenMeteo + OpenWeatherMap 图标） | ✅ |
| 支付 | `/pricing`、`supabase/functions/checkout*`（见 §9） | ✅（真实收款闭环待测） |
| 社区 / 点评 | `post_comments` 等表 + 评论组件（20260909_comments_table.sql） | ✅ |
| 收藏 | `bookmarks` 表 + `Favorites.tsx`（20260826_bookmarks_real_favorites.sql） | ✅ |
| 徽章 / 积分 | `BadgeDisplay.tsx`、`LevelBadge.tsx`、`PointsDisplay.tsx`、`GamificationPanel.tsx` | ✅ |

---

## 12. 地图体系（Leaflet 双引擎）

### 12.1 工作方式
- 核心组件 `src/components/Map/DualMap.tsx` + hooks `useMap` / `useGeoLocation`：
  1. 打开时先 IP 地理探测：判定访客在中国 → 默认高德瓦片；否则默认 Google 系瓦片。
  2. 当前 provider 瓦片加载失败（用户网络不可达）→ 自动切换到另一 provider（`2f70863` 修复）。
  3. 图层按钮：标准 / 卫星；高德用 `webrd`（style=8，道路）与 `webst`（style=6，卫星）。
- 瓦片 provider：
  - **高德**：JS SDK `webapi.amap.com` + 瓦片 `webrd0{1-4}.is.autonavi.com`；key = `.env` 的 `VITE_AMAP_WEB_API_KEY` + `PUBLIC_AMAP_SECURITY_KEY`（安全码）。
  - **Esri**：全球瓦片（国内可达），作为 Google 瓦片在国内不可达时的兜底（`GoogleTileLayer.tsx` / `LeafletMap.tsx` 内实现）。
  - 行程 AI 地图用 `ItineraryMap.tsx` + 高德 JS API（`uri.amap.com/route/plan` 外链做导航，站内只标记显示）。

### 12.2 历史踩坑（均已修复，勿回退）
- Google 瓦片国内被墙 → 必须保留 Esri/高德兜底；`TileLayer` 切换 provider 必须 **remount**（子域不同，直接 update 不生效，`1809e9e`）。
- 高德卫星/地形 style 编号无效会 404 → 只能用 style=8（道路）/6（卫星），`ca50015`。
- TileLayer 必须传合法 subdomains（undefined 会崩 `_getSubdomain`），`a805eab`。
- CSP 必须放行 `*.amap.com` / `*.autonavi.com`（script-src + connect-src + img-src），`public/_headers` 与 `functions/[[path]].ts` **两处同步**（`1fe019b`）。
- 高德 key 曾缺失导致 AI 行程地图不显示，已恢复（`0a4962b`）。

### 12.3 验证方式
- 国内网络：`/ja/city/shanghai` 应显示高德瓦片；海外网络：Esri/Google 瓦片。
- 打开页面后切换“标准/卫星”与 provider 按钮，瓦片均应渲染且标记（marker）位置正确。
---

## 13. 内容与 i18n 体系（12 语言）

### 13.1 三层翻译（缺一不可）
1. `src/i18n/translations.ts` — 运行时 UI 大字典（约 52,989 行），浏览器实际使用；源文件是根目录 `en-translations.json` + 11 个 `<lang>-translations.json`（扁平 dot-key）。
2. `src/i18n/locales/{lang}.json` — 简版 UI 字典。
3. `src/data/cities-i18n/{lang}/{slug}.json` — 35 城 × 11 语言的字段级翻译（385 个文件）。

### 13.2 数据源与铁律
- `src/data/cities/*.json` = 英文源（35 城），**禁止改动**；翻译一律走 `cities-i18n` 或翻译管线。
- 新增/修改 UI 文案流程：改 `en-translations.json` → `node gen-missing.mjs all` → `node merge-i18n.mjs` → `pnpm check:i18n`（0 缺口才过 CI）。
- 新增语言：在 `src/i18n/translations.ts` 的 `SUPPORTED_LANGUAGES`、`scripts/check-i18n.mjs` 的 SUPPORTED 数组、`<lang>-translations.json` 三处登记。
- 博客：`src/i18n/blog.ts`，每篇 12 语言齐全（CI 校验 slug 一致性），字段要求见 `docs/i18n.md`。
- 图片：`public/img/ext/` 2,275 张 `.webp`（哈希名），本地化由 `scripts/localize-images.mjs` 处理。
- 城市评分：`scripts/dynamic-city-scores.mjs` + GitHub Actions 每周自动跑（注意 `city-scores.yml` 与 `update-city-scores.yml` 两个文件内容有重复，运维勿同时改两处）。

### 13.3 语言一致性要求（2026-08 用户反复强调的重点）
- 所有环节必须跟随用户当前界面语言：AI 回复、保存的行程内容、导出文档（PDF/文本/JSON）、分享页文案、提示弹窗。
- `src/lib/ai/export-itinerary.ts` 的 `EXPORT_LABELS` 覆盖 12 语言；PDF 用 html2canvas 光栅化以解决 CJK 乱码。
- AI Edge Function 内有 `LANGUAGE_DIRECTIVES`（按语言强制整段回复语言），改 prompt 时勿删除。
- 排障重点抽查：`/ja/...`（日语）、`/zh-CN/...`、`/en`、`/ar`（RTL 布局）。

---

## 14. 构建与部署（CI/CD）

### 14.1 工作流清单（`.github/workflows/`）
| 文件 | 触发 | 内容 |
|---|---|---|
| `ci.yml` | push/PR master+develop | lint（`\|\| true` 兜底）、typecheck（`\|\| true`）、`check:i18n`（0 缺口）、unit、integration、build |
| `deploy-cf-pages.yml` | push master | 构建 + `wrangler pages deploy` → 生产 |
| `e2e.yml` | push master（chromium + 全浏览器）/PR | Playwright 13 个 spec |
| `city-scores.yml` / `update-city-scores.yml` | 每周定时 + 手动 | 城市评分计算 |
| `list-secrets.yml` | 手动 | 列出 Cloudflare Pages secrets |

### 14.2 部署路径
`git push origin master` → Actions `deploy-cf-pages` → Cloudflare Pages 项目 `chinaconnect` → `https://chinaengage.org`。
- CI 构建命令是 `pnpm check:i18n && node node_modules/astro/astro.js build`；**不要用 `pnpm build`**（其 prebuild 会重跑翻译管线、损坏 i18n，历史多次踩坑）。
- 部署前先 `node scripts/pack-food-details.mjs`（CI 同款步骤）。
- `wrangler.toml` 的 `[vars]` 里 `PUBLIC_SUPABASE_ANON_KEY` 必须是**真实 anon key**（历史占位符 `REDACTED_JWT` 导致 `/api/auth/providers` 探测失败、登录页 OAuth 按钮消失，会话 #50）。
- CSP/安全头有**两处**：`public/_headers`（静态）+ `functions/[[path]].ts`（HTML 响应），改一处必须同步另一处。

### 14.3 Edge Functions 部署（改后必须 deploy 才生效）
```powershell
supabase functions deploy chat --project-ref xyvuqbpwrhkukjgzveyc
supabase functions deploy checkout --project-ref xyvuqbpwrhkukjgzveyc
supabase functions deploy checkout-webhook --project-ref xyvuqbpwrhkukjgzveyc
supabase functions deploy checkout-verify --project-ref xyvuqbpwrhkukjgzveyc
```

### 14.4 数据库迁移（Supabase）
- 新迁移写入 `supabase/migrations/`（按日期命名，当前到 20260909，共 27 个）；本地 `supabase migration up --linked`，生产 `--project-ref xyvuqbpwrhkukjgzveyc`。
- 改动表结构后跑 `pnpm db:generate`（`supabase gen types typescript --project-id xyvuqbpwrhkukjgzveyc > src/types/database.ts`）。
- 任何 DDL 后更新 `.supabase-schema` 快照（`supabase-skill snapshot`）。
---

## 15. 排障速查表（先查这里，再翻 `.audit/HANDOFF.md` 找根因细节）

| 症状 | 可能根因 | 处置 |
|---|---|---|
| 右上角头像不显示 | `functions/api/auth/state.ts` 曾查不存在的 `level` 列（已修为 `travel_level`）；或 `profiles.avatar_url` 为空 | 检查该用户 profiles 行是否存在；前端 UserAvatar 有 12 个预设 SVG + 默认头像兜底 |
| 无法购买 / “Please sign in to your ChinaConnect account before subscribing” | 未登录就点套餐购买 | 购买前必须登录（checkout Edge Function `verify_jwt=true`）；已登录仍报错则查 localStorage 会话 token 是否过期 |
| 升级 / 续费 / 重复充值 | 订阅生命周期规则 | 规则在 `20260908_subscription_lifecycle.sql` + `supabase/functions/checkout*`；已实现防重复扣款、升级即时生效、降级/去重拦截 |
| 注册后收不到确认邮件 | SMTP / Resend / 限流 | Supabase Dashboard → Auth → 邮件日志；`rate_limit_email_sent=30`（封/小时）、`smtp_max_frequency=60/min`；**勿用 @example.com 收件**（Resend 保留域名必拒） |
| 邮箱验证链接点击后“验证失败” | PKCE 曾破坏 verify（已改 implicit） | `useAuth.ts` 需消费 `?code=` / `?token_hash=` / `#access_token=` 三路；检查 `/auth/callback` 页 |
| 免密登录失败 | 模板未显示验证码 | 邮件模板用 `{{ .Token }}` 显示 6 位码；前端 `verifyEmailOtp` 校验 |
| 忘记密码链路失败 | 恢复邮件 / 重置页 | 模板 + `ResetPasswordPage.tsx`；改密后旧密码应被拒、新密码可登录 |
| AI 回复时对话框上下变窄 | 流式渲染容器高度塌陷 | 已修（可读气泡布局，`8d7569f`）；回归看 `/ai` 页 |
| 保存的行程太简陋 / 显示代码 | route-saver 抽取不完整；详情页把 JSON 当代码渲染 | 详情页 `/itinerary/<id>` 客户端解析 id；分享页 `TripView.tsx` 解析 share_token |
| 导出 PDF 乱码 / 排版差 | 直接用 jsPDF 写中文 | 导出用 html2canvas 光栅化（`export-itinerary.ts`）；文案随界面语言（EXPORT_LABELS） |
| 对话问两次 / 答两次 | 前端重复提交 | `ai_messages.client_msg_id` 唯一约束（`20260907`）去重 |
| 城市详情页出现大量“？” | 城市 JSON 编码损坏 | `scripts/fix-city-data-cjk*.mjs` 等修复脚本；检查源 JSON 编码 |
| 地图不显示（Google/高德都不显示） | 瓦片不可达 / CSP / 子域 / style 编号 | 双引擎自动降级（`DualMap.tsx`）；CSP 两处同步；TileLayer remount；高德 style=8/6；详见 §12 |
| 不同用户数据交叉显示 | RLS 缺失 / policy 写错 | 所有用户表按 `auth.uid()` 隔离；新增表先建 RLS（参考 `20260901_ai_isolation_hardening.sql`、`20260902_close_privilege_escalation.sql`） |
| 套餐定价与支付渠道不一致 | pricing.ts 与 Creem 产品不同步 | 以 `functions/api/pricing.ts` 为唯一真相，与 Creem 后台 6 个产品逐一核对 |
| webhook 返回 401 | `verify_jwt` 未关 / HMAC 签名错 | `checkout-webhook` 的 `verify_jwt=false` + 用 `creem-signature` 做 HMAC 验签；Creem 后台确认 webhook URL 正确 |
| SMTP 550/535 | Resend key 失效 | 测 key（`D:\suoyouxiangmu\ai-student-survival\.env`）；**改 Supabase auth 配置必须全量 PATCH**（单字段会重置其它项） |
| 登录页 OAuth 按钮消失 / “正在配置中” | `/api/auth/providers` 探测失败 | 检查 `wrangler.toml` 的 anon key 是否为真实值；Supabase 侧 google/github 是否 enabled |
| AI 会话刷新后丢失 | 未写快照 | `ai_conversation_snapshots` 持久化，刷新可恢复；查 RLS 是否挡住快照写入 |
| OpenMeteo 天气 503 | 数据中心 IP 被限流 | 重试 / 页面兜底文案 |
| `chinaconnect.pages.dev` 被收录 | 未 301 | `functions/[[path]].ts` 跳转逻辑；确认 CSP 未挡跳转 |
| 匿名用户能读到 `wallet_balance` | 列级权限未隐藏 | `20260827_hide_profiles_sensitive_columns.sql`；新增敏感列时同步处理 |

---

## 16. 已知问题与遗留事项（2026-08-28 快照）

1. **真实小额支付闭环未跑**：Creem 已批准、6 产品 checkout 全通、webhook HMAC 已实测（假签名 401 / 真签名 200），但还没用真实卡走完“Creem 结账 → webhook → orders → user_memberships → AI 档位生效”。上线前由老板本人完成一笔（推荐 Explorer 月付 $4.99），见 §18-F。
2. **密钥轮换待办**：Supabase service_role / MiniMax / AnySearch / 高德 / Pexels 曾在历史会话出现泄露痕迹，老板同意上线后轮换（`.audit/HANDOFF.md` 会话 #45 / #59）。
3. **lint 683 个历史错误**：CI 用 `|| true` 兜底，**不要批量修**（避免大规模无关改动）。
4. **CI 不要用 `pnpm build`**：prebuild 会损坏 i18n；用 `check:i18n + astro build` 组合。
5. **SMTP 限流**：`rate_limit_email_sent=30`（封/小时）；若真实用户高峰出现 429，需调高或升级 Resend。
6. **测试账号保留**：`ai.codextest.1787386274959@example.com`（Business 档）作支付/订阅回归。
7. **免费档 5 次/月**是硬限制，AI 测试勿用真实账号刷额度。
8. 旧 `README.md` / `ARCHITECTURE.md` / `CLAUDE.md` 已过时；根目录大量翻译/构建残留文件（`build*.log`、`content-*.json`、`*-translations.json` 等）**勿提交**。
9. `.github/workflows` 的 `city-scores.yml` 与 `update-city-scores.yml` 是重复任务，后续可合并（低优先）。
10. `src/pages/[lang]/index.astro.bak` 未跟踪残留，可删。
11. ~~右上角头像“退出登录再登录后不显示”~~：2026-08-28 已修复并上线（commit `b1da477`）——头部头像 `<img>` 增加 `onerror` 回退到预设头像、`/api/auth/state` 优先返回 `profiles.avatar_url`、Service Worker 不再缓存 `/api/auth/*`（版本升到 `v1.3.0-avatar-harden` 触发旧缓存清理）。若用户再报旧现象，先让用户 `Ctrl+Shift+R` 强刷清旧 SW 缓存再判断。
---

## 17. 日常运营 SOP

### 17.1 每日
- GitHub Actions：ci / deploy-cf-pages / e2e 是否全绿；部署失败 = 线上停留在上个版本。
- Cloudflare Pages 项目页部署状态 + `curl -I https://chinaengage.org` 探活。
- Supabase Dashboard → Edge Functions 日志（chat / checkout / checkout-webhook 的错误率）。
- Creem 仪表盘：新订单、拒付、结算状态。

### 17.2 每周
- 城市评分两个 workflow 自动跑，核对结果是否有异常。
- Resend 送达率；有退信/进垃圾箱 → 检查模板与 SPF/DKIM（Supabase SMTP 已配）。
- Supabase 用量（DB 大小、Auth MAU、Edge Function 调用数），超预算前预警。

### 17.3 内容更新（运营节奏：城市每 2 天 1 城、博客每 3 天 1 篇）

> **铁律（老板 2026-08-28 明确要求）**：
> 1. 所有内容更新必须**同步 12 种语言**（en/ja/ko/zh-CN/zh-TW/th/vi/ru/fr/de/ar/fa），任何语言缺漏都算事故；
> 2. 每次更新发布时，必须在进站弹窗里发布更新公告（见 §17.3.3）；
> 3. 新城市必须达到与现有 35 城完全一致的标准（字段、翻译、图片、链接齐全）。

#### 17.3.1 新城市（每 2 天更新 1 城）
1. 英文源：新建 `src/data/cities/<slug>.json`，字段与 `beijing.json` 完全一致，必须包含：`slug / name / nameEn / country / population / coordinates / timezone / description / coverImage / highlights / climate / attractions / restaurants / transport / hotels / payment / culturalTips / emergencyContacts / quickFacts`。
   - `attractions[]` 每项含：`id / name / nameEn / category / image / description / address / coordinates / openingHours / ticketPrice / recommendedVisitTime / highlights / tips / phone`；
   - `restaurants[] / hotels[]` 字段对齐现有城市（含 `image / description / address / phone / price / coordinates / tags` 等，以现有城市文件为准）；
   - `coverImage` 与所有 `image` 必须指向真实存在且可访问的 webp（`/img/ext/xxx.webp`）。
2. 图片：新图放入 `public/img/ext/`（webp），然后跑 `node scripts/localize-images.mjs` 处理本地化。
3. 翻译：`node scripts/auto-translate-new-cities.mjs` 生成 `src/data/cities-i18n/{lang}/<slug>.json`（11 语言），**必须人工抽查** ja / zh-CN / ar（RTL）等重点语言，禁止出现未翻译的英文残留或机翻错乱。
4. 校验与发布：`pnpm check:i18n`（0 缺口）→ 本地 `node node_modules/astro/astro.js build` 通过 → push `master`（GitHub Actions 自动部署）。勿用 `pnpm build`（会损坏 i18n）。
5. 公告：在 `src/data/announcements.ts` 顶部加一条（见 §17.3.3）。

#### 17.3.2 新博客（每 3 天更新 1 篇，SEO/GEO + 日常阅读）
1. 选题：旅行攻略 / 美食 / 文化 / 城市指南 / 新闻热点均可（热点注意事实核查与时效性）。
2. 位置：`src/i18n/blog.ts` 的 `blogPosts`，给 **12 种语言各加一篇同 slug** 的条目（CI 强制 slug 一致性，漏一种语言就过不了 `pnpm check:i18n`）。
   - 每篇字段：`slug / title / description / body / date / author / category / tags / coverImage? / readingMinutes`；`body` 为 Markdown 且 **≥200 字符**。
   - `category` 限：`guide / food / travel / culture / city / announcement`。
3. 封面图：入 `public/img/ext/`（webp），或复用已有图片。
4. 翻译：优先人工写英文源再人工/`node scripts/auto-translate-new-blog.mjs` 补 11 语言，输出必须自然、贴合当地表达（SEO 面向 Google/GEO，机翻腔会掉排名）。
5. 发布：`pnpm check:i18n` → push 自动部署 → 在 `announcements.ts` 顶部加公告（`link` 指到 `/blog/<slug>`）。

#### 17.3.3 进站更新公告弹窗（每次更新必做）
- 文件：`src/data/announcements.ts`（数组**最前面**新增，已读状态前端记 localStorage `chinaconnect_announcement_seen`）。
- 字段：`id`（`YYYY-MM-DD-<slug>`，必须唯一）、`date`、`title`（12 语言）、`body`（12 语言）、可选 `link`。
- 语言助手：`L(en, ja, ko, zhCN, zhTW, th, vi, ru, fr, de, ar, fa)` 按固定顺序传 12 个字符串。
- 机制：`src/components/EntryPopup.astro` 挂在首页（`src/pages/index.astro` 与 `src/pages/[lang]/index.astro`），未读公告在用户进站时自动弹窗。
- 验证：部署后开**无痕窗口**访问 `https://chinaengage.org` → 应弹出新公告，点“知道了”后不再弹出。

#### 17.3.4 其它内容更新
- 图片：入 `public/img/ext/`（webp），跑 `node scripts/localize-images.mjs`。
- 定价/套餐：改 `functions/api/pricing.ts` **且** 同步 Creem 后台产品（两侧必须一致，这是 Creem 审核红线）。

### 17.4 安全例行
- 新表必须带 RLS + 敏感列级隐藏；新 Edge Function 后检查 JWT 策略（需要登录的置 `verify_jwt=true`，webhook 用 HMAC 验签）。
- 密钥疑似泄露 → 立即轮换并同步三处：GitHub Secrets / Supabase Secrets / `wrangler.toml [vars]`。
- 每周跑 `node scripts/verify-links.mjs` 与 `node scripts/verify-launch.mjs`（仓库内脚本）。

### 17.5 AI 运营
- 改 chat Edge Function 后必须 `supabase functions deploy chat`。
- MiniMax 用量/账单在 MiniMax 控制台；并发脚本别超 3，防止频率限制。
- 越界拦截（SCOPE_DIRECTIVE）在服务端无条件追加，**不要**在客户端放松或按语言跳过。

---

## 18. 交接验证清单（上线前必做，逐项打勾）

**A. 凭据与基础设施**
- [ ] `supabase login` 可登录，项目 ref `xyvuqbpwrhkukjgzveyc` 可访问。
- [ ] 本机 `.env` / `.env.verify.local` 与生产一致（URL / anon；service_role 只放 `.env.verify.local`）。
- [ ] GitHub repo 可见、Actions secrets 齐全、`deploy-cf-pages` 可跑通。
- [ ] Cloudflare Pages 项目 `chinaconnect` 可部署，`chinaengage.org` 200，`.pages.dev` 301。
- [ ] Creem 仪表盘可登录，6 产品在线，webhook 指向 `https://xyvuqbpwrhkukjgzveyc.supabase.co/functions/v1/checkout-webhook`。
- [ ] Resend SMTP（Supabase Dashboard → Auth → SMTP）可收发，sender `noreply@mi-to-ai.com`。

**B. 认证与邮箱（真实邮箱逐项实测）**
- [ ] 注册 → 确认邮件 → 点击链接 → 自动登录 `/account`。
- [ ] 邮箱+密码登录。
- [ ] 免密登录：邮件 6 位验证码 → 登录成功。
- [ ] 忘记密码 → 恢复邮件 → 重置页 → 新密码可登录、旧密码被拒。
- [ ] Google / GitHub OAuth 真实跳转 + 回调。
- [ ] 登出、会话过期行为正常。

**C. 数据隔离（两账号 A/B 交叉实测）**
- [ ] A 保存行程/会话/订单/收藏，B 全部读不到、改不动、删不掉。
- [ ] 匿名读不到私有数据；`profiles.wallet_balance` 列级隐藏生效。
- [ ] 公开内容（城市/餐厅/景点）匿名可读、匿名写被拒。

**D. AI 与行程**
- [ ] `/ai` 对话正常；Free 档计数、Business 无限制。
- [ ] 越界测试：要求写代码/开发软件 → 被拒；问“上海 3 日游” → 详细回答 + 链接。
- [ ] 多轮对话确定行程 → 保存 → 详情页完整显示（无代码、排版正常）。
- [ ] 导出 PDF（日语、中文各一次）排版正常、语言跟随界面、无乱码。
- [ ] 分享链接 → 匿名打开 `/trip/<token>` 正常。
- [ ] 会话刷新可恢复，无重复提问/回答。

**E. 地图与天气**
- [ ] 城市详情页地图：国内网络高德瓦片、海外 Esri/Google；切换 provider 正常；标记正确。
- [ ] 天气组件有数据或合理兜底。

**F. 支付（真实闭环，关键）**
- [ ] 定价页与 Creem 6 产品金额一一对应。
- [ ] 老板本人真实支付一笔 Explorer 月付 → webhook → `orders` 落单、`user_memberships` 生效、AI 档位升级。
- [ ] 重复点击不重复扣款；升级即时生效；降级/重复充值被拦。

**G. 全站与 12 语言**
- [ ] 抽查 en / zh-CN / ja / ar（RTL）的首页、城市页、pricing、ai、account。
- [ ] `/sitemap.xml`、`/robots.txt` 正常；GSC 验证文件可访问。
- [ ] 关键页 Lighthouse 达标。
- [ ] 手机端视口抽查（行程卡片 / 地图 / 登录表单）。

---

## 19. 账号归属与联系方式

| 平台 | 归属 | 备注 |
|---|---|---|
| GitHub `wangjianxin1988/ChinaConnect` | 王建信 | Hermes 用继承的 token/SSH 提交，不另建分支策略 |
| Supabase `xyvuqbpwrhkukjgzveyc` | 王建信 | Dashboard 管理员；CLI 用 `sbp_` token（`supabase login`） |
| Cloudflare Pages `chinaconnect` | 王建信 | API token 在 GitHub secrets |
| Creem 店铺 `xinshoping` | 王建信 | 店主账号老板持有；收款人 Wang Jianxin（Alipay 18801400211） |
| Resend | 王建信 | key 见 `D:\suoyouxiangmu\ai-student-survival\.env` |
| MiniMax / AnySearch / 高德 / Pexels | 王建信 | key 在 `.env` 与 GitHub secrets |
| 对外支持邮箱 | 18801400211@163.com | 公开公示用 |

- 联系老板：王建信（信哥），手机 / 支付宝 18801400211。
- 重大变更（改收费、改定价、动生产数据、轮换密钥）**先汇报后执行**，不要静默上线。

---

## 20. 附录：关键文件索引

| 想做什么 | 看哪里 |
|---|---|
| 定价 | `functions/api/pricing.ts` + Creem 后台 |
| AI 边界 / 模型 | `supabase/functions/chat/index.ts`（SCOPE_DIRECTIVE ≈ 696 行） |
| 行程导出 | `src/lib/ai/export-itinerary.ts` |
| 行程保存 | `src/lib/ai/route-saver.ts` |
| 认证状态机 | `src/hooks/useAuth.ts`、`src/services/auth.ts` |
| 登录 / 注册 UI | `src/components/user/LoginPage.tsx`、`ResetPasswordPage.tsx` |
| 地图 | `src/components/Map/DualMap.tsx`、`AmapTileLayer.tsx`、`GoogleTileLayer.tsx` |
| i18n | `scripts/check-i18n.mjs`、`src/i18n/translations.ts`、`docs/i18n.md` |
| 城市数据 | `src/data/cities/*.json`（英文源，勿改）、`src/data/cities-i18n/` |
| RLS / 迁移 | `supabase/migrations/`（27 个，按日期命名） |
| 部署 | `.github/workflows/deploy-cf-pages.yml` |
| CSP / 安全头 | `public/_headers` + `functions/[[path]].ts`（两处同步） |
| 历史背景 | `.audit/HANDOFF.md`（1855 行逐会话流水账） |
| 验证脚本 | `scripts/verify-launch.mjs`、`scripts/verify-links.mjs`、`scripts/check-i18n.mjs` |

---

*本文档由王建信（信哥）授权编写，交接给 Hermes 运营。每次重要变更请在本文档末尾追加「变更日志」小节，保持运营手册与线上事实一致。*

### 变更日志
- 2026-08-28 初版成稿：§0–§10 由历史会话整理，§11–§20 补全（页面/地图/i18n/构建部署/排障/遗留/SOP/验证清单/账号/附录）；修正迁移文件数 29→27。
- 2026-08-28 v2：新增 §17.3 内容运营节奏（城市每 2 天 1 城 / 博客每 3 天 1 篇 / 12 语言同步 / 进站弹窗公告 SOP）；§16 补充头像“退出后再登录不显示”已修复记录（commit `b1da477`）；§0 增加运营节奏速览。
