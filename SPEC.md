# ChinaConnect 美食推荐系统 - 技术规格

## 1. 项目概述

- **项目名称**: ChinaConnect 美食推荐系统
- **项目路径**: D:/suoyouxiangmu/chinaconnect
- **技术栈**: Astro 4.x + React 18 + TypeScript + TailwindCSS
- **地图**: Leaflet (免费开源，无需API Key)
- **状态**: 开发中

## 2. 功能规格

### 2.1 核心功能

#### 三合一地图系统
- 米其林指南图层 (⭐ 星级标识)
- 黑珍珠榜单图层 (💎 钻级标识)
- 本地人推荐图层 (🔥 博主推荐标识)
- 图层可切换显示/隐藏
- 点击标记显示餐厅预览卡片

#### 智能筛选
- 菜系筛选 (中餐/西餐/日料/东南亚/其他)
- 价格区间 (0-100/100-300/300-500/500+)
- 距离筛选 (1km/3km/5km/10km)
- 评分筛选 (4.0+/4.5+/4.8+)
- 外国人友好标签

#### 餐厅详情页 /food/[id]
- 餐厅基础信息
- 菜品展示
- 用户评价
- 地图位置
- 联系方式

#### 点菜助手 UI
- 拍照上传界面
- 菜单翻译结果显示
- 推荐菜品展示
- 过敏原提示区

### 2.2 数据模型

#### Restaurant (餐厅)
```typescript
interface Restaurant {
  id: string;
  name: string;
  nameEn?: string;
  type: 'michelin' | 'blackpearl' | 'local';
  // 米其林/黑珍珠字段
  star?: 1 | 2 | 3;        // 米其林星级
  diamond?: 1 | 2 | 3;    // 黑珍珠钻级
  // 基础信息
  cuisine: string;         // 菜系
  avgPrice: number;        // 人均价格(RMB)
  rating: number;          // 评分
  address: string;
  addressEn?: string;
  city: string;
  district?: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;           // 营业时间
  // 本地推荐特有
  bloggerName?: string;     // 博主名称
  bloggerPlatform?: string; // 抖音/小红书/B站
  dishHighlights?: string[]; // 推荐菜品
  // 通用
  tags: string[];           // 外国人友好等标签
  imageUrl?: string;
  description?: string;
  descriptionEn?: string;
}
```

### 2.3 页面结构

```
src/
├── pages/
│   ├── index.astro              # 首页
│   ├── food/
│   │   └── [id].astro          # 餐厅详情页
│   └── api/
│       └── restaurants.ts      # 餐厅API
├── components/
│   └── food/
│       ├── FoodMap.tsx         # 地图组件
│       ├── LayerToggle.tsx     # 图层切换
│       ├── RestaurantFilter.tsx # 筛选组件
│       ├── RestaurantCard.tsx   # 餐厅卡片
│       └── DishAssistant.tsx   # 点菜助手
├── data/
│   └── food/
│       ├── restaurants.ts      # 餐厅数据
│       └── cities.ts           # 城市数据
└── types/
    └── food.ts                 # 类型定义
```

## 3. MVP城市数据

每个城市至少5家餐厅，覆盖三种类型：

| 城市 | 城市中文 |
|------|---------|
| beijing | 北京 |
| shanghai | 上海 |
| hangzhou | 杭州 |
| chengdu | 成都 |
| guangzhou | 广州 |
| xian | 西安 |

## 4. 验收标准

- [ ] pnpm build 成功
- [ ] 地图组件正常显示
- [ ] 三种图层可切换
- [ ] 筛选功能可用
- [ ] 餐厅详情页正常访问
- [ ] 6个城市数据完整
- [ ] 点菜助手UI可交互
