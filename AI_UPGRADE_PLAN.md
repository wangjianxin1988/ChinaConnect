# ChinaConnect AI功能升级实现计划

## 目标
根据开发方案v1.0，实现三大核心功能：
1. **服务端代理 + 工具调用** — AI基于真实数据回复
2. **路线保存** — Supabase集成，用户可保存/加载/分享路线
3. **高德地图可视化** — 行程标记+路线展示

---

## 架构设计

### 整体架构
```
用户 → AIChat组件 → /api/chat (服务端代理) → MiniMax API
                                    ↓
                              工具执行引擎
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              城市数据(tools.ts)  高德API(anysearch)  Supabase
```

### 服务端代理设计
- 路径: `src/pages/api/chat.ts` (Astro API Route)
- 功能: 接收前端请求，调用MiniMax API，执行工具调用，返回流式响应
- 安全: API密钥仅在服务端，不暴露前端

---

## 模块1: 服务端代理 + 工具调用

### 文件结构
```
src/
├── pages/
│   └── api/
│       └── chat.ts          # 服务端代理端点
├── services/
│   └── minimax.ts           # 修改: 改为调用/api/chat
├── lib/
│   └── ai/
│       ├── tools.ts         # 修改: 添加搜索工具
│       ├── tool-executor.ts # 新增: 工具执行引擎
│       └── search/
│           ├── web-search.ts    # 新增: 网络搜索
│           └── amap-search.ts   # 新增: 高德POI搜索
```

### 工具定义 (添加到tools.ts)
```typescript
// 新增工具: WebSearch
{
  type: "function",
  function: {
    name: "WebSearch",
    description: "Search the web for real-time information about attractions, restaurants, hotels, transport, etc.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        category: { type: "string", enum: ["attraction", "restaurant", "hotel", "transport", "general"] }
      },
      required: ["query"]
    }
  }
}

// 新增工具: AmapPOISearch
{
  type: "function",
  function: {
    name: "AmapPOISearch",
    description: "Search for points of interest (restaurants, hotels, attractions) using Amap API",
    parameters: {
      type: "object",
      properties: {
        keywords: { type: "string", description: "Search keywords" },
        city: { type: "string", description: "City name" },
        type: { type: "string", description: "POI type code" }
      },
      required: ["keywords", "city"]
    }
  }
}

// 新增工具: AmapRouteSearch
{
  type: "function",
  function: {
    name: "AmapRouteSearch",
    description: "Get driving or transit route between two locations",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Origin coordinates (lng,lat)" },
        destination: { type: "string", description: "Destination coordinates (lng,lat)" },
        mode: { type: "string", enum: ["driving", "transit", "walking"] }
      },
      required: ["origin", "destination"]
    }
  }
}
```

### 服务端代理实现要点
1. 接收前端请求（messages + tools配置）
2. 调用MiniMax API（带tools参数）
3. 如果返回tool_calls，执行工具并递归调用
4. 流式返回最终响应

---

## 模块2: 路线保存 (Supabase)

### 数据库表设计
```sql
-- 行程表
CREATE TABLE itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  days INTEGER NOT NULL,
  summary JSONB,
  daily_itinerary JSONB,
  practical_info JSONB,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS策略
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- 用户只能读写自己的行程
CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" ON itineraries
  FOR UPDATE USING (auth.uid() = user_id);

-- 分享链接可读
CREATE POLICY "Anyone can view shared itineraries" ON itineraries
  FOR SELECT USING (share_code IS NOT NULL);

-- 索引
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_share_code ON itineraries(share_code);
```

### 服务层 (修改 itinerary-storage.ts)
- 保留localStorage作为缓存/离线支持
- 添加Supabase同步逻辑
- 支持离线创建，在线同步

---

## 模块3: 高德地图可视化

### 组件设计
```
src/
├── components/
│   └── map/
│       ├── ItineraryMap.tsx      # 新增: 行程地图组件
│       ├── AmapContainer.tsx     # 新增: 高德地图容器
│       ├── RouteMarker.tsx       # 新增: 路线标记组件
│       └── RoutePolyline.tsx     # 新增: 路线连线组件
```

### 高德地图API集成
1. **JS API 2.0** — 前端地图展示
2. **Web服务API** — POI搜索、路线规划

### 地图功能
- 显示每日行程的POI标记（带序号）
- 标记之间连线显示路线
- 点击标记显示详情（名称、时间、费用）
- 支持缩放、平移
- 自动适配视口

### API密钥配置
- 前端JS API: `PUBLIC_AMAP_KEY` (可公开，有域名限制)
- 后端Web API: `AMAP_KEY` (服务端，不暴露)

---

## 实现顺序

### Phase 1: 服务端代理 + 工具调用 (优先级最高)
1. 创建 `/api/chat` 端点
2. 修改 `minimax.ts` 改为调用服务端代理
3. 添加搜索工具定义
4. 实现工具执行引擎
5. 测试工具调用流程

### Phase 2: 路线保存
1. 创建Supabase表
2. 修改 `itinerary-storage.ts` 集成Supabase
3. 添加保存/加载UI
4. 测试保存/加载流程

### Phase 3: 高德地图可视化
1. 安装高德JS API
2. 创建 `ItineraryMap` 组件
3. 集成到AIChat组件
4. 测试地图展示

### Phase 4: 集成测试 + 部署
1. 端到端测试
2. 性能优化
3. 部署到Cloudflare Pages

---

## 环境变量

### 服务端 (不暴露)
```
MINIMAX_API_KEY=xxx
AMAP_WEB_KEY=xxx
```

### 前端 (公开)
```
PUBLIC_AMAP_KEY=xxx
PUBLIC_SUPABASE_URL=xxx
PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## 技术要点

### 1. 流式响应处理
- 服务端使用ReadableStream
- 前端使用SSE解析
- 工具调用时暂停流，执行后继续

### 2. 工具调用循环
```
1. 发送消息到MiniMax
2. 如果返回tool_calls → 执行工具
3. 将工具结果添加到消息历史
4. 重新调用MiniMax（带工具结果）
5. 重复直到返回最终响应
```

### 3. 高德坐标系
- 高德使用GCJ-02坐标系
- 已有 `wgs84ToGcj02` 转换函数
- 所有POI坐标需要转换

### 4. 离线支持
- localStorage作为缓存
- 离线时使用本地数据
- 在线时自动同步到Supabase

---

## 风险与对策

| 风险 | 对策 |
|------|------|
| MiniMax不支持tools参数 | 使用prompt engineering + 后处理 |
| 高德API调用限制 | 添加缓存层，限制调用频率 |
| Supabase连接失败 | 降级到localStorage |
| 流式响应中断 | 实现断点续传 |
| 坐标系转换误差 | 使用精确转换算法 |

---

## 验收标准

### 工具调用
- [ ] AI能调用WebSearch获取实时信息
- [ ] AI能调用AmapPOISearch获取POI数据
- [ ] 工具结果正确整合到AI回复
- [ ] 回复内容基于真实数据

### 路线保存
- [ ] 用户可保存行程到Supabase
- [ ] 用户可加载已保存的行程
- [ ] 用户可生成分享链接
- [ ] 离线时可使用localStorage

### 地图可视化
- [ ] 地图显示每日POI标记
- [ ] 标记之间有路线连线
- [ ] 点击标记显示详情
- [ ] 地图支持缩放平移

---

## 时间估算

- Phase 1 (服务端代理+工具调用): 2-3小时
- Phase 2 (路线保存): 1-2小时
- Phase 3 (地图可视化): 2-3小时
- Phase 4 (集成测试+部署): 1小时

**总计: 6-9小时**
