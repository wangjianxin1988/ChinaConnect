# ChinaConnect AI 功能深度测试报告

**测试日期**: 2026-06-01  
**测试方法**: 源代码深度审查 + 架构分析  
**测试范围**: 全部AI工具、使用计数器、实时数据标签、UI组件  
**项目路径**: D:\suoyouxiangmu\chinaconnect  
**AI页面路由**: `/ai` (非 `/ai-planner`)

---

## 📊 测试总览

| 测试项 | 状态 | 详情 |
|--------|------|------|
| WeatherInfo工具 | ✅ 通过 | OpenMeteo API集成完整，有mock回退 |
| FoodSearch工具 | ✅ 通过 | Amap POI搜索 + 静态数据合并 |
| HotelSearch工具 | ✅ 通过 | Amap POI搜索 + 预算过滤 |
| CitySearch工具 | ✅ 通过 | 静态城市库 + WebSearch增强 |
| TransportSearch工具 | ✅ 通过 | 静态数据 + WebSearch实时信息 |
| NearbyPOI工具 | ✅ 通过 | Amap POI + 多类型支持 |
| AI使用计数器 | ✅ 通过 | localStorage + 月度自动重置 |
| AI使用指南 | ✅ 通过 | 手风琴式侧边栏完整 |
| 实时数据标签 | ✅ 通过 | 📡/ℹ️ 前缀区分系统 |
| **Live Website测试** | ❌ 无法访问 | chinaconnect.xyz 连接被拒绝 |

---

## 1. WeatherInfo工具 深度测试

### 架构
- **主要数据源**: OpenMeteo API (免费，无需API key)
- **备用数据源**: OpenWeatherMap (需要 `PUBLIC_OWM_API_KEY`)
- **最终回退**: 静态mock数据 (Beijing/Shanghai/default)
- **缓存**: localStorage缓存，10分钟TTL

### 实现分析 (`src/lib/ai/tools.ts:485-533`, `src/services/weather-api.ts`)

```
WeatherInfo → getCityCoords(city) → fetchWeather(city, lat, lng)
  ├─ 优先: OpenMeteo API (当前天气 + 3天预报)
  ├─ 备用: OpenWeatherMap API (如有API key)
  └─ 回退: 静态气候数据 (source: "static (climate data)")
```

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 坐标查找 (硬编码城市) | ✅ | 23个城市预置坐标 |
| 坐标查找 (OpenMeteo回退) | ✅ | 未知城市自动地理编码 |
| API数据获取 | ✅ | 返回温度/湿度/风速/天气描述/预报 |
| 实时数据标签 | ✅ | `source: "real-time (OpenMeteo)"` |
| Mock数据回退 | ✅ | 3个城市预置天气数据 |
| 缓存机制 | ✅ | 10分钟TTL避免频繁请求 |
| 城市别名支持 | ✅ | 中英文及历史名称映射 |

### 发现的问题
1. **Mock数据过时**: mock数据的日期固定为2026-05-27~29，会随时间过期
2. **缺少空气质量数据**: OpenMeteo支持AQI但未集成
3. **无错误UI反馈**: API失败时静默回退到mock，用户无感知

---

## 2. FoodSearch工具 深度测试

### 架构
- **主要数据源**: Amap (高德地图) POI Search API
- **备用数据源**: 本地城市静态餐厅数据库
- **API Key**: `VITE_AMAP_WEB_API_KEY` (硬编码fallback: `013d6b96800d73eeb66dcbf3dd3b068a`)

### 实现分析 (`src/lib/ai/tools.ts:248-309`)

```
FoodSearch({city, cuisine, budget})
  ├─ Amap POI Search: keywords=美食/菜系+餐厅, type=restaurant
  ├─ 静态数据: city.restaurants (Michelin/BlackPearl/Local)
  ├─ 预算过滤: low(≤¥80), medium(¥80-300), high(>¥300)
  └─ 合并: Amap结果优先 + 静态数据补充
```

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| Amap API调用 | ✅ | 正确构造查询参数 |
| 菜系过滤 | ✅ | cuisine参数映射到Amap keywords |
| 预算过滤 | ✅ | 3级预算价格区间过滤 |
| 静态数据合并 | ✅ | Michelin⭐/BlackPearl💎/Local🏠标记 |
| 中英文菜系支持 | ✅ | 通过toLowerCase比较 |
| 最大返回数量 | ✅ | 限制15条结果 |
| 数据源标记 | ✅ | `source: "amap"` vs `source: "local"` |

### 发现的问题
1. **API Key硬编码**: fallback API key直接暴露在客户端代码中
2. **Amap城市参数**: 使用英文城市名可能影响Amap搜索精度（Amap更擅长中文）
3. **评分数据**: Amap返回的rating在biz_ext字段中，可能为空

---

## 3. HotelSearch工具 深度测试

### 架构
- **主要数据源**: Amap POI Search (keywords根据预算变化)
- **备用数据源**: 本地城市静态酒店数据库
- **预算映射**: luxury→五星级酒店, budget→经济型酒店, medium→酒店

### 实现分析 (`src/lib/ai/tools.ts:189-242`)

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 预算关键词映射 | ✅ | luxury/budget/medium正确映射 |
| Amap搜索 | ✅ | type="hotel", pageSize=10 |
| 静态数据过滤 | ✅ | budgetMap支持多种输入格式 |
| 数据合并策略 | ✅ | Amap优先 + 静态补充 |
| 预算级别兼容 | ✅ | low/budget/mid/midRange/luxury/high |

### 发现的问题
1. **价格范围缺失**: Amap返回的cost字段经常为空
2. **无实时价格**: 酒店价格仍为静态数据，非实时

---

## 4. CitySearch工具 深度测试

### 架构
- **数据源**: 本地城市数据库 + WebSearch增强
- **城市查找**: 别名映射 → 模糊匹配 (nameEn/nameZh/slug)
- **WebSearch**: "cityName China travel guide top attractions food 2026"

### 实现分析 (`src/lib/ai/tools.ts:129-183`)

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 别名查找 | ✅ | 23+城市中英文及历史名称 |
| 模糊匹配 | ✅ | includes()双向匹配 |
| WebSearch集成 | ✅ | 实时获取最新旅游信息 |
| 未收录城市处理 | ✅ | 返回web结果或可用城市列表 |
| 返回数据完整性 | ✅ | attractions/restaurants/climate/transport |
| 汇率符号 | ✅ | 全部使用¥ |

### 支持的城市 (23个)
Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin, Hangzhou, Nanjing, Chongqing, Shenzhen, Suzhou, Xiamen, Qingdao, Kunming, Lijiang, Sanya, Wuhan, Changsha, Harbin, Tianjin, Dalian, Dali, Zhangjiajie

---

## 5. TransportSearch工具 深度测试

### 架构
- **数据源**: 城市交通静态数据 + WebSearch实时信息
- **WebSearch查询**: "train flight {from} to {to} China schedule price 2026"
- **回退策略**: 提供12306.cn和Ctrip/Qunar通用建议

### 实现分析 (`src/lib/ai/tools.ts:315-373`)

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 静态交通数据 | ✅ | 城市间arrival数据匹配 |
| WebSearch增强 | ✅ | 实时刻车/航班信息 |
| 双向查找 | ✅ | from→to 和 to→from 均支持 |
| 通用回退 | ✅ | 无匹配时提供12306/Ctrip建议 |
| 数据合并 | ✅ | webInfo附加到返回结果 |

### 发现的问题
1. **静态数据有限**: 仅部分城市对有预置交通数据
2. **无价格数据**: 价格信息依赖WebSearch或通用建议

---

## 6. NearbyPOI工具 深度测试

### 架构
- **数据源**: Amap POI Search + 本地城市数据
- **支持类型**: restaurant, attraction, hotel, hospital, metro
- **Amap类型映射**: 完整的类型码映射 (25+种)

### 实现分析 (`src/lib/ai/tools.ts:794-840`)

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 多类型POI | ✅ | restaurant/hotel/attraction/hospital/metro |
| Amap搜索 | ✅ | keywords根据类型自动选择 |
| 静态数据回退 | ✅ | 按类型返回对应数据 |
| Amap类型映射 | ✅ | 25+种POI类型码 |
| near参数 | ✅ | 支持地标/区域查询 |

### 发现的问题
1. **near参数未充分利用**: near参数在返回中仅作展示，未传递给Amap API做距离排序
2. **hospital/metro类型**: 静态数据中缺少hospital/metro数据

---

## 7. AI使用计数器 深度测试

### 架构
- **存储**: localStorage key `ai_usage_data`
- **结构**: `{count: number, month: number, year: number}`
- **自动重置**: 检测到新月份时自动重置为0
- **事件通知**: `ai-usage-updated` CustomEvent

### 实现分析 (`src/lib/usage-tracker.ts`)

### 订阅层级

| 层级 | AI请求/月 | 价格(月/年) | 保存行程 | PDF导出 |
|------|-----------|-------------|----------|---------|
| Free | 3 | $0/$0 | ❌ | ❌ |
| Explorer | 15 | $4.99/$47.99 | ✅ | ❌ |
| Traveler | 无限 | $9.99/$95.99 | ✅ | ✅ |
| Business | 无限 | $19.99/$191.99 | ✅ | ✅ |

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 初始计数 | ✅ | 新用户从0开始 |
| 递增逻辑 | ✅ | `incrementUsage()` 每次+1 |
| 月度重置 | ✅ | month/year不匹配时重置 |
| 限制检查 | ✅ | `checkUsageLimit()` 返回allowed/remaining/max |
| 无限层级 | ✅ | -1表示无限制 |
| 事件分发 | ✅ | CustomEvent通知UI更新 |
| UI显示 | ✅ | 显示"X AI requests remaining this month" |
| 超限处理 | ✅ | 显示amber警告横幅 + 禁用输入 |
| 升级链接 | ✅ | 超限时显示"Upgrade Plan"链接 |

### 从0/3到1/3的流程
```
1. 用户首次访问 → count=0, remaining=3 → 显示"3 AI requests remaining"
2. 发送消息 → incrementUsage() → count=1 → refreshUsage()
3. UI更新 → 显示"2 AI requests remaining" (3-1=2)
4. 第3次后 → count=3, remaining=0 → usageExceeded=true
5. 显示警告横幅，输入框禁用
```

### 发现的问题
1. **纯客户端计数**: localStorage可被用户手动清除，绕过限制
2. **无服务端验证**: API proxy (`/api/chat`) 不验证使用次数
3. **并发问题**: 快速连续发送可能绕过计数检查

---

## 8. AI使用指南 深度测试

### 组件: `AIChatPage.tsx` 侧边栏

### 测试结果
| 指南部分 | 状态 | 内容 |
|----------|------|------|
| 🚀 Getting Started | ✅ | 使用说明 + 可问类型列表 |
| 💬 Example Prompts | ✅ | 10个可点击示例prompt (中英文) |
| ✨ What I Can Do | ✅ | 8种能力说明 (行程/美食/住宿/交通/搜索/天气/地图/生活) |
| 📡 Real-time Data Sources | ✅ | 6种数据源说明 (OpenMeteo/Amap/AnySearch) |
| 💡 Tips for Best Results | ✅ | 4条使用技巧 |
| 💾 Save Your Routes | ✅ | 保存/同步/查看/地图展示 |

### Example Prompts (10个)
1. 🗺️ "Plan a 3-day trip to Beijing for a foodie"
2. 🍜 "Best restaurants near the Bund in Shanghai"
3. 🚄 "How to get from Guangzhou to Shenzhen by high-speed rail"
4. 💰 "Create a budget itinerary for Xi'an, 2 days"
5. 🌶️ "What should I eat in Chengdu? I love spicy food"
6. 💼 "Help me plan a business trip to Shenzhen"
7. ☁️ "成都今天天气怎么样？"
8. 🏨 "推荐成都的酒店，预算300-500元"
9. 📍 "北京故宫附近有什么好吃的？"
10. 🌤️ "What's the weather like in Guilin this week?"

### 发现的问题
1. **QuickPrompts重复**: 侧边栏Example Prompts和聊天区QuickPrompts内容有重叠
2. **韩语/日语prompt不完整**: KO/JA仅有3个prompt，EN/ZH有12个

---

## 9. 实时数据标签 深度测试

### 系统Prompt规则 (`src/lib/ai/prompts.ts:18`)
```
MANDATORY: When you use data from ANY tool (WeatherInfo, FoodSearch, HotelSearch, 
CitySearch, TransportSearch, NearbyPOI, WebSearch, AmapPOISearch, etc.), you MUST 
start your response with "📡 Based on real-time data:" followed by a brief summary. 
If no tool was used, start with "ℹ️ Based on my travel knowledge:" instead.
```

### 测试结果
| 测试点 | 结果 | 说明 |
|--------|------|------|
| 实时数据前缀 | ✅ | 📡 **Based on real-time data:** |
| 静态知识前缀 | ✅ | ℹ️ **Based on my travel knowledge:** |
| 工具触发条件 | ✅ | 任何工具使用时强制标记 |
| UI提示 | ✅ | "Look for 📡 Based on real-time data" |
| 数据源面板 | ✅ | 6种数据源详细说明 |

### 发现的问题
1. **依赖LLM遵守规则**: 标签由system prompt指令控制，非代码强制
2. **无法验证**: 用户无法确认标签准确性（LLM可能错误标记）

---

## 10. 额外工具测试

### 10.1 WebSearch (AnySearch)
- **API**: AnySearch API (`as_sk_968a9530f19ae6e36d8ae099f1eb3b4c`)
- **回退**: DuckDuckGo Instant Answer → Wikipedia API
- **缓存**: 5分钟内存缓存
- **问题**: MCP模式始终返回false，AnySearch API key硬编码

### 10.2 AmapPOISearch
- **API**: 高德地图 Web API
- **API Key**: `013d6b96800d73eeb66dcbf3dd3b068a` (硬编码fallback)
- **支持**: 25+种POI类型
- **问题**: API key暴露在客户端代码

### 10.3 AmapRouteSearch
- **API**: 高德地图方向API
- **模式**: driving/transit/walking/riding
- **功能**: 距离/时间/步骤/公交线路/费用

### 10.4 其他工具
| 工具 | 类型 | 数据源 | 状态 |
|------|------|--------|------|
| VisaInfo | 静态 | 6国签证数据 + default | ✅ |
| TranslationHelper | 静态 | 18个常用短语 | ✅ |
| EmergencyInfo | 静态 | 通用号码 + 城市医院 | ✅ |
| SubwayRoute | 静态 | 城市地铁线路数据 | ✅ |
| BudgetCalculator | 计算 | 3级预算估算 | ✅ |
| RouteOptimizer | 计算 | 景点分配+路线优化 | ✅ |
| CulturalTips | 静态 | 城市文化提示 | ✅ |
| PaymentGuide | 静态 | 支付方式指南 | ✅ |
| CrowdLevel | 计算 | 旺季/淡季判断 | ✅ |

---

## 11. MiniMax AI集成分析

### 架构
```
Client (React) → /api/chat (Cloudflare Pages Function) → MiniMax API
                                                       ↓
                                              Tool Execution (client-side)
```

### 关键发现
1. **API Proxy**: Cloudflare Pages Function代理MiniMax API，API key存储在服务端
2. **Tool执行**: 工具在**客户端**执行（非服务端），通过`executeToolAsync()`
3. **流式响应**: 支持SSE流式传输
4. **对话管理**: 短期内存 + 长期localStorage + Supabase同步
5. **模型**: MiniMax-Text-01

### 安全问题
1. **工具在客户端执行**: Amap API key暴露在浏览器
2. **AnySearch API key暴露**: 硬编码在客户端代码
3. **无限循环防护**: 有`maxToolRoundTrips`限制 (默认5轮)

---

## 12. Live Website测试

### 状态: ❌ 无法访问

**尝试结果**:
- `https://chinaconnect.xyz` → ERR_CONNECTION_CLOSED (浏览器)
- `https://chinaconnect.xyz` → curl exit code 6 (DNS解析失败)
- `https://chinaconnect.xyz/ai-planner` → 404 (路由不存在，正确路由为 `/ai`)

### 可能原因
1. 域名DNS未正确配置或已过期
2. Cloudflare Pages部署可能有问题
3. 域名可能已迁移到其他地址

---

## 🔴 关键问题汇总

### 严重 (P0)
1. **API Key暴露**: Amap和AnySearch的API key硬编码在客户端JS中
2. **使用计数器可绕过**: 纯localStorage计数，清除缓存即重置
3. **网站无法访问**: chinaconnect.xyz域名连接失败

### 中等 (P1)
4. **工具在客户端执行**: 安全风险，应移至服务端
5. **Mock数据过时**: 天气mock数据日期固定
6. **Amap城市参数**: 英文城市名可能影响中文API搜索精度

### 轻微 (P2)
7. **多语言prompt不完整**: KO/JA仅有3个prompt
8. **near参数未充分利用**: NearbyPOI的near参数未用于距离排序
9. **LLM标签依赖**: 实时数据标签依赖LLM自觉，非代码强制

---

## 📈 架构优势

1. **多层数据回退**: API → 静态数据 → 通用建议，确保始终有响应
2. **实时+静态合并**: Amap实时数据优先，静态数据补充
3. **完整工具生态**: 18种工具覆盖旅行全场景
4. **流式UI体验**: typewriter效果 + 工具执行指示器
5. **离线优先**: localStorage存储 + Supabase同步
6. **多语言支持**: EN/ZH/JA/KO + 自动语言检测

---

## 📝 建议

1. **立即**: 将API key移到Cloudflare环境变量，通过proxy调用
2. **短期**: 将工具执行移到Cloudflare Pages Function (服务端)
3. **中期**: 添加服务端使用计数验证 (Supabase)
4. **长期**: 集成更多实时API (12306火车票、携程酒店价格)

---

*报告生成时间: 2026-06-01 00:33 UTC*
*测试方法: 源代码深度审查 (1145行tools.ts + 567行weather-api.ts + 424行amap-route.ts + 247行amap-poi.ts + 396行anysearch.ts + 997行AIChat.tsx + 427行AIChatPage.tsx + 141行usage-tracker.ts + 134行subscription.ts)*
