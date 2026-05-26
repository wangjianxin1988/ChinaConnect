export interface PriceData {
  category: string;
  categoryCn: string;
  icon: string;
  items: PriceItem[];
}

export interface PriceItem {
  name: string;
  nameCn: string;
  localPrice: number;
  foreignPrice: number;
  currency: string;
  note: string;
  noteCn: string;
  warning?: string;
  warningCn?: string;
}

export const PRICE_DATA: PriceData[] = [
  {
    category: "Transportation",
    categoryCn: "交通出行",
    icon: "🚗",
    items: [
      {
        name: "Taxi (per km)",
        nameCn: "出租车（每公里）",
        localPrice: 2.0,
        foreignPrice: 2.0,
        currency: "CNY",
        note: "Meter should be same for everyone",
        noteCn: "计价器对所有人应该一样",
      },
      {
        name: "Metro (urban)",
        nameCn: "地铁（市内地铁）",
        localPrice: 3,
        foreignPrice: 3,
        currency: "CNY",
        note: "Same price for everyone",
        noteCn: "对所有人价格相同",
      },
      {
        name: "Bus (urban)",
        nameCn: "公交（市内）",
        localPrice: 2,
        foreignPrice: 2,
        currency: "CNY",
        note: "Same price for everyone",
        noteCn: "对所有人价格相同",
      },
      {
        name: "Didi (Ride-hailing)",
        nameCn: "滴滴（网约车）",
        localPrice: 8,
        foreignPrice: 8,
        currency: "CNY",
        note: "Base fare, same for everyone with app",
        noteCn: "起步价，对所有使用应用的人一样",
      },
      {
        name: "High-speed train (per km)",
        nameCn: "高铁（每公里）",
        localPrice: 0.46,
        foreignPrice: 0.46,
        currency: "CNY",
        note: "Same price for everyone",
        noteCn: "对所有人价格相同",
        warning: "Book through official 12306 app",
        warningCn: "通过官方12306应用预订",
      },
    ],
  },
  {
    category: "Attractions",
    categoryCn: "景点门票",
    icon: "🎫",
    items: [
      {
        name: "Forbidden City",
        nameCn: "故宫",
        localPrice: 60,
        foreignPrice: 60,
        currency: "CNY",
        note: "Same price, need passport",
        noteCn: "价格相同，需要护照",
      },
      {
        name: "Great Wall (Badaling)",
        nameCn: "长城（八达岭）",
        localPrice: 45,
        foreignPrice: 45,
        currency: "CNY",
        note: "Same price, cable car extra",
        noteCn: "价格相同，缆车另算",
      },
      {
        name: "Terracotta Army",
        nameCn: "兵马俑",
        localPrice: 120,
        foreignPrice: 120,
        currency: "CNY",
        note: "Same price for everyone",
        noteCn: "对所有人价格相同",
      },
      {
        name: "West Lake (Hangzhou)",
        nameCn: "西湖（杭州）",
        localPrice: 0,
        foreignPrice: 0,
        currency: "CNY",
        note: "Free! Boats extra",
        noteCn: "免费！游船另算",
      },
      {
        name: "Local Museum",
        nameCn: "地方博物馆",
        localPrice: 0,
        foreignPrice: 0,
        currency: "CNY",
        note: "Most museums are free",
        noteCn: "大多数博物馆免费",
        warning: "Check for free days",
        warningCn: "注意免费开放日",
      },
    ],
  },
  {
    category: "Food",
    categoryCn: "餐饮",
    icon: "🍜",
    items: [
      {
        name: "Street Food (simple)",
        nameCn: "街头小吃（简单）",
        localPrice: 10,
        foreignPrice: 10,
        currency: "CNY",
        note: "Same price if you order directly",
        noteCn: "直接点餐价格相同",
      },
      {
        name: "Local Restaurant (meal)",
        nameCn: "本地餐厅（一餐）",
        localPrice: 30,
        foreignPrice: 30,
        currency: "CNY",
        note: "Check menu for prices first",
        noteCn: "先看菜单价格",
        warning: "Tourist areas may overcharge",
        warningCn: "旅游区可能加价",
      },
      {
        name: "KFC/麦当劳",
        nameCn: "KFC/McDonalds",
        localPrice: 25,
        foreignPrice: 25,
        currency: "CNY",
        note: "International chains have fixed prices",
        noteCn: "国际连锁价格固定",
      },
      {
        name: "Hot Pot (local)",
        nameCn: "火锅（本地）",
        localPrice: 100,
        foreignPrice: 100,
        currency: "CNY",
        note: "Per person, varies by restaurant",
        noteCn: "按人头，计算方式因餐厅而异",
      },
      {
        name: "Bai Cofe",
        nameCn: "白咖啡",
        localPrice: 20,
        foreignPrice: 20,
        currency: "CNY",
        note: "Same price",
        noteCn: "价格相同",
      },
    ],
  },
  {
    category: "Shopping",
    categoryCn: "购物",
    icon: "🛍️",
    items: [
      {
        name: "Convenience Store",
        nameCn: "便利店",
        localPrice: 5,
        foreignPrice: 5,
        currency: "CNY",
        note: "7-Eleven, FamilyMart - same prices",
        noteCn: "7-11、全家等价格相同",
      },
      {
        name: "Supermarket",
        nameCn: "超市",
        localPrice: 20,
        foreignPrice: 20,
        currency: "CNY",
        note: "Walmart, Carrefour - same prices",
        noteCn: "沃尔玛、家乐福价格相同",
      },
      {
        name: "Tea Shop (tourist)",
        nameCn: "茶店（旅游区）",
        localPrice: 100,
        foreignPrice: 500,
        currency: "CNY",
        note: "Tourist areas may charge 5x more",
        noteCn: "旅游区可能收费5倍",
        warning: "Be careful of tea scams",
        warningCn: "注意茶叶骗局",
      },
      {
        name: "Silk Shop (tourist)",
        nameCn: "丝绸店（旅游区）",
        localPrice: 200,
        foreignPrice: 1000,
        currency: "CNY",
        note: "Quality varies greatly",
        noteCn: "质量差异很大",
        warning: "Check quality before buying",
        warningCn: "购买前检查质量",
      },
    ],
  },
  {
    category: "Accommodation",
    categoryCn: "住宿",
    icon: "🏨",
    items: [
      {
        name: "Hostel (bed)",
        nameCn: "青年旅舍（床位）",
        localPrice: 50,
        foreignPrice: 50,
        currency: "CNY",
        note: "Same price on booking apps",
        noteCn: "在预订应用上价格相同",
      },
      {
        name: "3-Star Hotel",
        nameCn: "三星级酒店",
        localPrice: 200,
        foreignPrice: 200,
        currency: "CNY",
        note: "Same price if booked online",
        noteCn: "网上预订价格相同",
      },
      {
        name: "5-Star Hotel",
        nameCn: "五星级酒店",
        localPrice: 800,
        foreignPrice: 800,
        currency: "CNY",
        note: "International chains have fixed prices",
        noteCn: "国际连锁价格固定",
      },
    ],
  },
];

export const TIPS = [
  {
    title: "Use Mobile Payment",
    titleCn: "使用移动支付",
    icon: "📱",
    content:
      "Alipay and WeChat Pay are widely accepted and offer fair prices. Cash may lead to overcharging.",
    contentCn: "支付宝和微信支付广泛接受且价格公平。现金可能导致被加价。",
  },
  {
    title: "Use Ride-Hailing Apps",
    titleCn: "使用网约车应用",
    icon: "🚗",
    content: "Didi (Chinese Uber) shows exact prices upfront. Avoid street taxis when possible.",
    contentCn: "滴滴显示准确价格。尽可能避免街头出租车。",
  },
  {
    title: "Book Online",
    titleCn: "网上预订",
    icon: "💻",
    content:
      "Book tickets and hotels through official apps. Prices are transparent and the same for everyone.",
    contentCn: "通过官方应用预订门票和酒店。价格透明，对所有人相同。",
  },
  {
    title: "Learn Basic Numbers",
    titleCn: "学习基础数字",
    icon: "🔢",
    content: "Knowing numbers helps you verify prices and spot discrepancies.",
    contentCn: "了解数字有助于核实价格和发现差异。",
  },
];
