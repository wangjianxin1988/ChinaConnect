# ChinaConnect 架构文档

> 版本：v1.0 | 日期：2026-05-25 | 状态：MVP开发中

## 一、项目概述

**产品**：ChinaConnect — 外国人来华一站式平台
**定位**：以城市为锚点，以AI智能体为核心引擎
**目标用户**：来华外国人（旅游/商务/留学/数字游民）+ AI Agents

## 二、技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Astro 5 (SSG) + React 18 | 静态优先，交互用React Island |
| 样式 | TailwindCSS + shadcn/ui | 移动优先响应式 |
| 后端 | Supabase | Auth + PostgreSQL + Realtime |
| AI | Dify + 通义千问/Claude | AI Agent编排 |
| 社区 | Flarum + Supabase SSO | 独立部署 + 单点登录 |
| 搜索 | MiniMax API | 全站搜索 |
| 地图 | Google Maps + 高德地图 | 双引擎自动切换 |
| 部署 | Cloudflare Pages | 免费无限带宽 |
| CI/CD | GitHub Actions | 自动构建部署 |

## 三、目录结构

```
chinaconnect/
├── src/
│   ├── components/       # React组件
│   │   ├── ui/          # shadcn/ui组件
│   │   ├── city/         # 城市相关组件
│   │   ├── food/         # 美食相关组件
│   │   ├── map/          # 地图组件
│   │   ├── ai/           # AI对话组件
│   │   ├── emergency/    # 紧急求助组件
│   │   └── user/         # 用户相关组件
│   ├── pages/            # Astro页面
│   │   ├── index.astro   # 首页
│   │   ├── city/         # 城市页面
│   │   │   └── [slug].astro
│   │   ├── food/         # 美食页面
│   │   │   └── [id].astro
│   │   ├── guide/        # 指南页面
│   │   │   ├── scam-prevention.astro
│   │   │   ├── payment.astro
│   │   │   ├── transportation.astro
│   │   │   └── culture.astro
│   │   └── user/         # 用户页面
│   │       └── [id].astro
│   ├── services/         # 服务层
│   │   ├── supabase.ts  # Supabase客户端
│   │   ├── dify.ts      # Dify API客户端
│   │   ├── maps.ts      # 地图服务
│   │   └── search.ts     # 搜索服务
│   ├── data/            # 静态数据
│   │   ├── cities/      # 城市数据
│   │   │   ├── beijing.json
│   │   │   ├── shanghai.json
│   │   │   ├── guangzhou.json
│   │   │   ├── xian.json
│   │   │   ├── chengdu.json
│   │   │   └── guilin.json
│   │   └── food/        # 美食数据
│   ├── hooks/           # React Hooks
│   ├── lib/             # 工具函数
│   ├── types/           # TypeScript类型
│   └── styles/          # 全局样式
├── supabase/
│   ├── schema.sql       # 数据库DDL
│   ├── seed.sql         # 种子数据
│   └── config.json      # Supabase配置
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── tests/
│   ├── e2e/            # Playwright E2E测试
│   └── unit/            # Vitest单元测试
├── drizzle/             # Drizzle ORM（如使用）
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## 四、数据库Schema（核心表）

### users
```sql
id: UUID PRIMARY KEY
email: TEXT UNIQUE
display_name: TEXT
avatar: TEXT
nationality: TEXT
level: INTEGER DEFAULT 1
points: INTEGER DEFAULT 0
created_at: TIMESTAMPTZ
```

### cities
```sql
id: UUID PRIMARY KEY
name_en: TEXT
name_zh: TEXT
slug: TEXT UNIQUE
country: TEXT
lat: FLOAT
lng: FLOAT
description: TEXT
cover_image: TEXT
climate: TEXT
best_season: TEXT[]
```

### restaurants
```sql
id: UUID PRIMARY KEY
city_id: UUID REFERENCES cities
name: TEXT
cuisine: TEXT
price_range: TEXT
lat: FLOAT
lng: FLOAT
michelin_stars: INTEGER
heizhenzhu_rank: INTEGER
blogger_recommended: BOOLEAN
description: TEXT
```

### itineraries
```sql
id: UUID PRIMARY KEY
user_id: UUID REFERENCES users
title: TEXT
cities: UUID[]
days: INTEGER
budget: TEXT
type: TEXT
content_json: JSONB
is_public: BOOLEAN DEFAULT false
created_at: TIMESTAMPTZ
```

## 五、AI Agent工作流（Dify）

```
用户输入 → 意图识别 → 参数提取 → 城市匹配 → 路线生成 → 内容丰富化 → 实用信息注入 → 格式化输出 → 保存
```

### 工具集（Tools）
- 高德地图API（POI搜索、路径规划）
- 天气API
- 翻译API
- 火车票/航班查询
- 酒店搜索

## 六、页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| / | 首页 | Hero + AI入口 + 城市搜索 |
| /city/[slug] | 城市页 | 城市攻略中心 |
| /city/[slug]/food | 美食页 | 美食地图 |
| /city/[slug]/attractions | 景点页 | 景点列表 |
| /city/[slug]/transport | 交通页 | 交通指南 |
| /food/[id] | 餐厅详情 | 餐厅信息 |
| /ai-chat | AI对话 | AI路线规划 |
| /guide/scam-prevention | 防坑指南 | 诈骗类型+应对 |
| /guide/payment | 支付指南 | 支付宝/微信教程 |
| /guide/emergency | 紧急求助 | 紧急电话+翻译卡片 |
| /user/[id] | 用户资料 | 用户信息+积分 |
| /community | 社区首页 | Flarum嵌入 |

## 七、SEO/GEO策略

### Schema.org类型
- TouristAttraction（景点）
- Restaurant（餐厅）
- City（城市）
- FAQPage（常见问题）
- BreadcrumbList（面包屑）

### AI爬虫
- GPTBot ✅ Allow: /
- ClaudeBot ✅ Allow: /
- PerplexityBot ✅ Allow: /

## 八、部署架构

### ChinaConnect 主站
```
GitHub Push → GitHub Actions → Cloudflare Pages
                                    ↓
                              astro build
                                    ↓
                              dist/ 部署
```

### Flarum 论坛 (独立部署)
```
VPS Server (Docker)
    ├── Flarum (PHP Forum)
    ├── MySQL 8.0 (Forum DB)
    └── Redis (Cache)
            ↓ Nginx Reverse Proxy + SSL
       community.chinaconnect.com
            ↓ SSO
       ChinaConnect 主站 (Supabase Auth)
```

### 九、Flarum 集成状态

- [x] 独立部署方案决策完成
- [x] Docker Compose 配置完成
- [x] SSO 集成方案完成
- [ ] 服务器配置完成
- [ ] SSL 证书配置完成
- [ ] Flarum 安装完成
- [ ] Supabase Edge Function 部署完成

## 十、MVP里程碑

- [x] 项目初始化
- [ ] 6城市页面完整
- [ ] AI路线规划可用
- [ ] 美食数据接入
- [ ] 双地图切换
- [ ] 支付/紧急指南
- [ ] SEO/GEO完成
- [ ] E2E测试通过

## 十、Phase 2计划

- 社区系统上线
- 扩展到20城市
- AI Agent工具集扩展
- 多语言支持
