// Transport Guide Data - Stages 4-7: Arrival to Inter-city Transport
export interface TransportStep {
  step: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  details: string[];
  detailsCn: string[];
}

export interface TransportMode {
  mode: string;
  icon: string;
  description: string;
  descriptionCn: string;
  howToUse: string[];
  howToUseCn: string[];
  tips: string[];
  tipsCn: string[];
  estimatedCost: string;
  estimatedCostCn: string;
}

// Stage 4: Arrival at Airport
export const ARRIVAL_STEPS: TransportStep[] = [
  {
    step: 1,
    title: "Immigration Control",
    titleCn: "边防检查",
    description: "Present passport and completed arrival card to immigration officer.",
    descriptionCn: "向边检人员提交护照和填好的入境卡。",
    icon: "🛂",
    details: [
      "Fill out arrival card (provided on plane)",
      "Queue at passport control",
      "Present passport + visa + arrival card",
      "Fingerprints may be scanned",
      "Officer may ask basic questions",
      "Receive entry stamp in passport",
    ],
    detailsCn: [
      "填写入境卡（在飞机上领取）",
      "排队进行护照检查",
      "提交护照+签证+入境卡",
      "可能需要扫描指纹",
      "工作人员可能询问基本问题",
      "在护照上获得入境章",
    ],
  },
  {
    step: 2,
    title: "Baggage Claim",
    titleCn: "领取行李",
    description: "Collect your luggage from the designated carousel.",
    descriptionCn: "在指定的转盘领取行李。",
    icon: "🧳",
    details: [
      "Check screen for flight number",
      "Find your carousel number",
      "Wait for luggage to appear",
      "Check tags match your destination",
      "Report damaged/missing luggage immediately",
      "Keep baggage receipt until exit",
    ],
    detailsCn: [
      "查看屏幕上的航班号",
      "找到你的转盘号",
      "等待行李出现",
      "检查标签与目的地一致",
      "立即报告损坏/丢失的行李",
      "在离开前保留行李收据",
    ],
  },
  {
    step: 3,
    title: "Customs Declaration",
    titleCn: "海关申报",
    description: "Go through customs with goods to declare if carrying restricted items.",
    descriptionCn: "如携带限制物品，通过海关申报。",
    icon: "🚪",
    details: [
      "Green channel: Nothing to declare",
      "Red channel: Items to declare",
      "Carry cash over 20,000 RMB? Declare it",
      "Know restricted items list",
      "Duty-free allowances apply",
      "Keep purchase receipts for proof",
    ],
    detailsCn: [
      "绿色通道：无申报物品",
      "红色通道：有物品需申报",
      "携带超过20,000元人民币现金？申报",
      "了解限制物品清单",
      "适用免税额度",
      "保留购物收据作为证明",
    ],
  },
];

// Stage 5 & 6: Local Transport
export const LOCAL_TRANSPORT_MODES: TransportMode[] = [
  {
    mode: "Metro/Subway",
    icon: "🚇",
    description: "Fast, cheap, and reliable urban transport in major cities.",
    descriptionCn: "主要城市快速、便宜、可靠的公共交通。",
    howToUse: [
      "Download subway app (Metro大都会 for Shanghai)",
      "Purchase single journey token at machines",
      "Use mobile payment (Alipay/WeChat) at gates",
      "Tap card at entry and exit gates",
      "Transfer within 30 min (free)",
      "Check line maps in English at stations",
    ],
    howToUseCn: [
      "下载地铁应用（上海用Metro大都会）",
      "在机器购买单程票",
      "在闸机使用移动支付（支付宝/微信）",
      "进站和出站刷卡",
      "30分钟内换乘（免费）",
      "在车站查看英文线路图",
    ],
    tips: [
      "Avoid rush hours (7:30-9:30, 17:30-19:30)",
      "Metro closes around 11 PM most cities",
      "First class carriages available on some lines",
      "women/children priority seats available",
      "No eating or drinking in carriages",
    ],
    tipsCn: [
      "避开高峰期（7:30-9:30, 17:30-19:30）",
      "大多数城市地铁约23:00停运",
      "部分线路有头等车厢",
      "有妇女/儿童优先座位",
      "车厢内禁止饮食",
    ],
    estimatedCost: "3-9 CNY per trip",
    estimatedCostCn: "每次3-9元",
  },
  {
    mode: "Bus",
    icon: "🚌",
    description: "Extensive network covering areas not served by metro.",
    descriptionCn: "覆盖地铁未覆盖地区的广泛网络。",
    howToUse: [
      "Board at front, exit at middle",
      "Scan QR code with WeChat/Alipay",
      "Announcements in Chinese + English",
      "Request stop by pressing button",
      "Keep ticket until exit",
      "Transfers possible with same day ticket",
    ],
    howToUseCn: [
      "前门上车，中门下车",
      "用微信/支付宝扫描二维码",
      "广播有中文+英文",
      "按按钮报站下车",
      "下车前保留车票",
      "当天票可换乘",
    ],
    tips: [
      "Download app for route planning",
      "Exact fare needed in cash",
      "Check bus number and route before boarding",
      "Very crowded during peak hours",
      "AC available on most modern buses",
    ],
    tipsCn: [
      "下载应用规划路线",
      "现金需要正好车费",
      "上车前查看公交号和路线",
      "高峰时段非常拥挤",
      "大多数现代公交车有空调",
    ],
    estimatedCost: "2-5 CNY per trip",
    estimatedCostCn: "每次2-5元",
  },
  {
    mode: "Taxi/Ride-hailing (Didi)",
    icon: "🚕",
    description: "Convenient for door-to-door transport, especially at night.",
    descriptionCn: "方便的门到门交通，尤其是在晚上。",
    howToUse: [
      "Download Didi app (English version available)",
      "Set pickup and drop-off location",
      "Choose vehicle type (economy/premium)",
      "Pay via app or cash",
      "Show driver destination in Chinese",
      "Track ride in real-time on app",
    ],
    howToUseCn: [
      "下载滴滴应用（有英文版）",
      "设置上下车地点",
      "选择车型（经济型/高级）",
      "通过应用或现金支付",
      "向司机展示中文目的地",
      "在应用中实时追踪行程",
    ],
    tips: [
      "Request car at designated pick-up zone",
      "Confirm license plate matches app",
      "Insist on using meter for street taxis",
      "Keep receipt for expense tracking",
      "Night surcharge starts at 23:00",
    ],
    tipsCn: [
      "在指定接载区叫车",
      "确认车牌与应用的车辆匹配",
      "坚持让出租车使用计价器",
      "保留收据以便报销",
      "23:00起收取夜间附加费",
    ],
    estimatedCost: "15-80 CNY per trip (within city)",
    estimatedCostCn: "每次15-80元（市中心内）",
  },
  {
    mode: "Bicycle (Mobike/OFO)",
    icon: "🚴",
    description: "Shared bikes available for short trips, payment via app.",
    descriptionCn: "共享单车适用于短途旅行，通过应用支付。",
    howToUse: [
      "Download Mobike or Hello bicycle app",
      "Scan QR code on bike to unlock",
      "Park in designated areas",
      "Lock bike manually when finished",
      "Check pricing before ride",
      "Deposit may be required for foreigners",
    ],
    howToUseCn: [
      "下载摩拜或ofo等共享单车应用",
      "扫描自行车上的二维码解锁",
      "停在指定区域",
      "结束时手动锁车",
      "骑行前查看价格",
      "外国人可能需要押金",
    ],
    tips: [
      "Check bike condition before scanning",
      "Follow traffic rules strictly",
      "Avoid riding on sidewalks",
      "Helmet rental available in some cities",
      "Report damaged bikes via app",
    ],
    tipsCn: [
      "扫描前检查车况",
      "严格遵守交通规则",
      "避免在人行道上骑行",
      "部分城市有头盔租赁",
      "通过应用报告损坏的车辆",
    ],
    estimatedCost: "1-2 CNY per 30 minutes",
    estimatedCostCn: "每30分钟1-2元",
  },
];

// Stage 7: Inter-city Transport
export const INTERCITY_TRANSPORT: TransportMode[] = [
  {
    mode: "High-Speed Rail (高铁)",
    icon: "🚄",
    description: "Faster than planes for distances under 1000km, frequent departures.",
    descriptionCn: "1000公里以下比飞机更快，班次频繁。",
    howToUse: [
      "Book via 12306 app or website",
      "Select departure/arrival stations",
      "Choose seat class (business/first/second)",
      "Pay with UnionPay or foreign cards",
      "Use ID/passport at ticket gates",
      "Arrive 30 min before departure",
    ],
    howToUseCn: [
      "通过12306应用或网站预订",
      "选择出发/到达站",
      "选择座位等级（商务/一等/二等）",
      "用银联或外卡支付",
      "在检票口使用身份证/护照",
      "出发前30分钟到达",
    ],
    tips: [
      "CRH trains (blue): regional, slower, cheaper",
      "G trains: high-speed, faster, more expensive",
      "Food available on board at reasonable prices",
      "Station WiFi available in most stations",
      "Luggage size limits enforced",
    ],
    tipsCn: [
      "CRH列车（蓝色）：区域，慢，便宜",
      "G列车：高铁，快，贵",
      "车上供应价格合理的餐食",
      "大多数车站有WiFi",
      "有行李尺寸限制",
    ],
    estimatedCost: "100-600 CNY depending on distance",
    estimatedCostCn: "根据距离100-600元",
  },
  {
    mode: "Domestic Flight",
    icon: "✈️",
    description: "Best for long distances; airlines offer competitive prices.",
    descriptionCn: "最适合长途；航空公司提供有竞争力的价格。",
    howToUse: [
      "Book via airline app or travel sites",
      "Check-in online 24h before",
      "Use passport at airport check-in",
      "Proceed to security 90 min before",
      "Gate info on boarding pass",
      "Download boarding pass to phone",
    ],
    howToUseCn: [
      "通过航空公司应用或旅游网站预订",
      "提前24小时在线值机",
      "在机场值机使用护照",
      "起飞前90分钟过安检",
      "登机口信息在登机牌上",
      "下载电子登机牌到手机",
    ],
    tips: [
      "Budget airlines: Spring, June, West Air",
      "Full-service: Air China, China Eastern",
      "Meals not included on domestic flights",
      "Flight delays common; build buffer time",
      "Use translation app for airport staff",
    ],
    tipsCn: [
      "低成本航空：春秋、祥鹏、西部航空",
      "全服务航空：国航、东航",
      "国内航班不含餐食",
      "航班延误常见；预留缓冲时间",
      "使用翻译应用与机场工作人员沟通",
    ],
    estimatedCost: "200-1500 CNY depending on route",
    estimatedCostCn: "根据航线200-1500元",
  },
  {
    mode: "Long-distance Bus",
    icon: "🚌",
    description: "Cheapest option for budget travelers, longer travel time.",
    descriptionCn: "最便宜的选择，适合预算有限的旅行者，时间较长。",
    howToUse: [
      "Buy tickets at bus station",
      "Check seat number on ticket",
      "Board through rear door",
      "Store luggage under seat or overhead",
      "Request stop by pressing button",
      "Show ticket when exiting",
    ],
    howToUseCn: [
      "在汽车站购票",
      "查看票上的座位号",
      "后门上车的",
      "行李放在座位下或行李架上",
      "按按钮报站下车",
      "下车时出示车票",
    ],
    tips: [
      "Book in advance for popular routes",
      "Overnight buses available for long routes",
      "AC may be very cold; bring jacket",
      "Toilets not always available",
      "Bring motion sickness medication",
    ],
    tipsCn: [
      "热门线路提前订票",
      "长途线路有卧铺车",
      "空调可能很冷；带件外套",
      "不一定有厕所",
      "带晕车药",
    ],
    estimatedCost: "100-400 CNY depending on distance",
    estimatedCostCn: "根据距离100-400元",
  },
];

// 12306 Ticket Guide - Stage 7: Train Booking
export const TRAIN_BOOKING_GUIDE = {
  platforms: [
    {
      name: "12306 (Official)",
      icon: "🚂",
      url: "www.12306.cn",
      description: "Official train booking, best prices, sometimes English interface",
      pros: "Best prices, real-time availability",
      cons: "Chinese interface can be tricky",
    },
    {
      name: "Trip.com",
      icon: "✈️",
      url: "www.trip.com",
      description: "English interface, easy booking",
      pros: "Good English support, price comparison",
      cons: "May have small service fee",
    },
    {
      name: "携程 (Ctrip)",
      icon: "📱",
      url: "www.ctrip.com",
      description: "Popular Chinese app",
      pros: "Popular in China",
      cons: "Chinese language primarily",
    },
  ],
  seatClasses: [
    {
      class: "Business Class (商务座)",
      price: "2x first class",
      features: ["Lie-flat seats", "Premium meals", "Priority boarding", "Lounge access"],
      suitable: "Long distance comfort",
    },
    {
      class: "First Class (一等座)",
      price: "1.5x second class",
      features: ["Wider seats", "More legroom", "Power outlets", "Better service"],
      suitable: "Comfortable travel",
    },
    {
      class: "Second Class (二等座)",
      price: "Standard",
      features: ["Good legroom", "Power outlets", "AC", "Clean"],
      suitable: "Best value for most",
    },
    {
      class: "Hard Sleeper (硬卧)",
      price: "Cheap",
      features: ["6 bunks per compartment", "Shared space", "No door"],
      suitable: "Budget overnight",
    },
    {
      class: "Soft Sleeper (软卧)",
      price: "Premium",
      features: ["4 bunks per compartment", "Door for privacy", "Cleaner"],
      suitable: "Comfortable overnight",
    },
  ],
  tips: [
    { tip: "Book 2-3 weeks ahead for popular routes", icon: "📅" },
    { tip: "G-trains are fastest (300+ km/h)", icon: "⚡" },
    { tip: "CRH trains are regional (200-250 km/h)", icon: "🚄" },
    { tip: "Bring your passport - required at ticket gates", icon: "🛂" },
    { tip: "Arrive 30 minutes before departure", icon: "⏰" },
    { tip: "Food available on board at reasonable prices", icon: "🍜" },
  ],
};

// City Distance Table
export const CITY_DISTANCE_TABLE = [
  {
    from: "Beijing",
    to: "Shanghai",
    byTrain: "4.5 hours (G train)",
    byPlane: "2.5 hours",
    recommendation: "Train recommended - comparable time when including airport",
  },
  {
    from: "Beijing",
    to: "Xian",
    byTrain: "5.5 hours (G train)",
    byPlane: "2 hours",
    recommendation: "Train recommended - scenic journey",
  },
  {
    from: "Beijing",
    to: "Chengdu",
    byTrain: "8 hours (G train)",
    byPlane: "2.5 hours",
    recommendation: "Plane for time, train for experience",
  },
  {
    from: "Beijing",
    to: "Guangzhou",
    byTrain: "8 hours (G train)",
    byPlane: "3 hours",
    recommendation: "Plane for time",
  },
  {
    from: "Shanghai",
    to: "Hangzhou",
    byTrain: "45 min (G train)",
    byPlane: "N/A",
    recommendation: "Train - very frequent departures",
  },
  {
    from: "Shanghai",
    to: "Nanjing",
    byTrain: "1 hour (G train)",
    byPlane: "N/A",
    recommendation: "Train - fastest option",
  },
  {
    from: "Shanghai",
    to: "Xian",
    byTrain: "7 hours (G train)",
    byPlane: "2.5 hours",
    recommendation: "Train for scenic journey",
  },
  {
    from: "Shanghai",
    to: "Guangzhou",
    byTrain: "8 hours (G train)",
    byPlane: "2.5 hours",
    recommendation: "Plane or train both good",
  },
  {
    from: "Xian",
    to: "Chengdu",
    byTrain: "3 hours (G train)",
    byPlane: "1.5 hours",
    recommendation: "Train recommended - beautiful scenery",
  },
  {
    from: "Chengdu",
    to: "Guangzhou",
    byTrain: "8 hours (G train)",
    byPlane: "2.5 hours",
    recommendation: "Plane for speed",
  },
];

// Taxi/ride-hailing details
export const TAXI_GUIDE = {
  types: [
    {
      type: "Street Taxi (路边打车)",
      icon: "🚕",
      description: "Traditional taxis with meters",
      tips: ['Look for "TAXI" sign', "Use meter always", "Get receipt"],
      price: "Base 13 CNY, then 2.3 CNY/km",
    },
    {
      type: "Didi Economy",
      icon: "🚗",
      description: "Budget ride-hailing option",
      tips: ["English interface available", "Same prices as taxi", "Know exact cost upfront"],
      price: "Starts at 8 CNY",
    },
    {
      type: "Didi Premier",
      icon: "🚙",
      description: "Premium ride-hailing",
      tips: ["Cleaner cars", "Professional drivers", "Higher price"],
      price: "2x economy",
    },
  ],
  usefulPhrases: [
    { english: "Please take me to...", chinese: "请带我去...", pronunciation: "qǐng dài wǒ qù..." },
    {
      english: "Stop here please",
      chinese: "请在这里停车",
      pronunciation: "qǐng zài zhèlǐ tíng chē",
    },
    { english: "How much does it cost?", chinese: "多少钱?", pronunciation: "duōshǎo qián?" },
    { english: "I need a receipt", chinese: "我需要发票", pronunciation: "wǒ xūyào fāpiào" },
    {
      english: "Can you use the meter?",
      chinese: "可以打表吗?",
      pronunciation: "kěyǐ dǎ biǎo ma?",
    },
  ],
};

export const TRANSPORT_HELPERS = {
  getToCityCenter: [
    {
      city: "Beijing",
      options: [
        {
          mode: "Airport Express",
          duration: "25-35 min",
          cost: "25 CNY",
          tip: "Line 10 to Dongzhimen, then transfer",
        },
        {
          mode: "Taxi",
          duration: "30-90 min",
          cost: "80-200 CNY",
          tip: "Use Didi to avoid overcharging",
        },
        {
          mode: "Didi",
          duration: "30-90 min",
          cost: "60-150 CNY",
          tip: "Request in English via app",
        },
      ],
    },
    {
      city: "Shanghai",
      options: [
        {
          mode: "Maglev + Metro",
          duration: "15+20 min",
          cost: "50 CNY",
          tip: "Maglev to Longyang Road, then Metro Line 2",
        },
        {
          mode: "Metro Line 2",
          duration: "60-90 min",
          cost: "8 CNY",
          tip: "Direct to Nanjing Road East",
        },
        {
          mode: "Taxi",
          duration: "45-90 min",
          cost: "100-200 CNY",
          tip: "Long wait during peak hours",
        },
      ],
    },
  ],
  usefulPhrases: [
    { english: "Where is the metro?", chinese: "地铁站在哪里?" },
    { english: "I want to go to...", chinese: "我想去..." },
    { english: "How much is the ticket?", chinese: "票价多少钱?" },
    { english: "Please take me to this address", chinese: "请带我去这个地址" },
    { english: "Stop here please", chinese: "请在这里停车" },
    { english: "How long does it take?", chinese: "需要多长时间?" },
    { english: "Is this the right bus for...?", chinese: "这辆车是去...的吗?" },
    { english: "Where can I buy a ticket?", chinese: "在哪里买票?" },
  ],
};
