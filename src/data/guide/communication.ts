// Communication Guide Data - Stage 3: SIM/eSIM & VPN Setup
export interface SIMOption {
  type: string;
  icon: string;
  description: string;
  descriptionCn: string;
  providers: string[];
  providersCn: string[];
  cost: string;
  costCn: string;
  setupSteps: string[];
  setupStepsCn: string[];
  pros: string[];
  cons: string[];
  whereToBuy: string[];
  whereToBuyCn: string[];
}

export interface VPNInfo {
  name: string;
  icon: string;
  reliability: "high" | "medium" | "low";
  speed: "fast" | "medium" | "slow";
  cost: string;
  features: string[];
  featuresCn: string[];
  setupDifficulty: "easy" | "medium" | "hard";
}

export interface AppRecommendation {
  app: string;
  icon: string;
  category: string;
  categoryCn: string;
  purpose: string;
  purposeCn: string;
  download: string;
  downloadCn: string;
  essential: boolean;
}

// Stage 3: SIM/eSIM Options
export const SIM_OPTIONS: SIMOption[] = [
  {
    type: "Local SIM Card",
    icon: "📱",
    description: "Physical SIM card from Chinese carriers. Best value for data.",
    descriptionCn: "来自中国运营商的实体SIM卡。数据性价比最高。",
    providers: ["China Mobile (中国移动)", "China Unicom (中国联通)", "China Telecom (中国电信)"],
    providersCn: ["中国移动", "中国联通", "中国电信"],
    cost: "30-100 CNY for 10-30GB valid 30 days",
    costCn: "30-100元，10-30GB，有效期30天",
    setupSteps: [
      "Unlock phone for foreign SIM",
      "Visit carrier store at airport",
      "Show passport for registration",
      "Choose data plan",
      "Insert SIM and configure APN",
      "Test data connection",
    ],
    setupStepsCn: [
      "解锁手机以便使用外国SIM",
      "在机场到达厅运营商网点",
      "出示护照进行登记",
      "选择数据套餐",
      "插入SIM并配置APN",
      "测试数据连接",
    ],
    pros: [
      "Best data value",
      "Reliable connection",
      "Local number for calls",
      "Can use in emergencies",
    ],
    cons: ["Need passport registration", "Phone must be SIM-unlocked", "Physical SIM required"],
    whereToBuy: ["Airport arrival halls", "Carrier stores downtown", "Convenience stores"],
    whereToBuyCn: ["机场到达大厅", "市中心运营商门店", "便利店"],
  },
  {
    type: "eSIM",
    icon: "📲",
    description: "Digital SIM activated remotely. Convenient for compatible phones.",
    descriptionCn: "远程激活的数字SIM。适合兼容手机，方便快捷。",
    providers: ["Airalo", "eSIM.net", "Nomad", "Holafly", "China Mobile eSIM"],
    providersCn: ["Airalo", "eSIM.net", "Nomad", "Holafly", "中国移动eSIM"],
    cost: "15-80 USD for regional plans (5-20GB)",
    costCn: "15-80美元，地区套餐（5-20GB）",
    setupSteps: [
      "Check if phone supports eSIM (iPhone XS+, Samsung S20+)",
      "Choose eSIM provider and plan",
      "Download eSIM profile from email/link",
      "Scan QR code to activate",
      "Configure APN if required",
      "Test connection before travel",
    ],
    setupStepsCn: [
      "检查手机是否支持eSIM（iPhone XS+，三星S20+）",
      "选择eSIM提供商和套餐",
      "从邮件/链接下载eSIM配置文件",
      "扫描二维码激活",
      "如需要配置APN",
      "旅行前测试连接",
    ],
    pros: [
      "Instant activation",
      "No physical SIM needed",
      "Easy to manage multiple plans",
      "Works immediately after landing",
    ],
    cons: [
      "Limited phone compatibility",
      "Cannot use for local calls",
      "May need APN configuration",
    ],
    whereToBuy: ["Online before travel", "Provider websites", "App stores"],
    whereToBuyCn: ["旅行前在线购买", "提供商网站", "应用商店"],
  },
  {
    type: "International Roaming",
    icon: "🌍",
    description: "Use your home carrier's service abroad. Most expensive but convenient.",
    descriptionCn: "在国外使用本国运营商服务。最贵但方便。",
    providers: ["Your home carrier", "Global roaming partners"],
    providersCn: ["您的本国运营商", "全球漫游合作伙伴"],
    cost: "10-15 USD/day with flat data (varies by carrier)",
    costCn: "每天10-15美元含固定数据（因运营商而异）",
    setupSteps: [
      "Contact home carrier before travel",
      "Enable international roaming",
      "Understand usage fees",
      "Use as backup to local SIM",
      "Monitor data usage closely",
    ],
    setupStepsCn: [
      "旅行前联系本国运营商",
      "开通国际漫游",
      "了解使用费用",
      "作为本地SIM的备用",
      "密切监控数据使用",
    ],
    pros: [
      "No SIM change needed",
      "Same number for calls/messages",
      "Works immediately",
      "Easy emergency contact",
    ],
    cons: ["Most expensive option", "May have slow data", "Limited data allowance"],
    whereToBuy: ["Home carrier store or website", "Before departure"],
    whereToBuyCn: ["本国运营商门店或网站", "出发前"],
  },
  {
    type: "WiFi Egg/Pocket WiFi",
    icon: "📻",
    description: "Portable device providing WiFi for multiple devices.",
    descriptionCn: "为多台设备提供WiFi的便携设备。",
    providers: ["Wireless Wizard", "WiFi Hero", "China Telecom rental"],
    providersCn: ["Wireless Wizard", "WiFi Hero", "中国电信租赁"],
    cost: "30-50 CNY/day for unlimited data",
    costCn: "每天30-50元，无限流量",
    setupSteps: [
      "Rent device online or at airport",
      "Receive device by mail or pickup",
      "Power on device",
      "Connect phone/laptop to WiFi",
      "Monitor battery life",
      "Return device at end of trip",
    ],
    setupStepsCn: [
      "在线或机场租赁设备",
      "通过邮寄或自取收到设备",
      "开机",
      "手机/笔记本连接WiFi",
      "监控电量",
      "旅行结束时归还设备",
    ],
    pros: ["Shareable among group", "No SIM needed", "Multiple devices", "Good for laptops"],
    cons: [
      "Extra device to carry",
      "Battery life limited",
      "Must return device",
      "Cost adds up for long trips",
    ],
    whereToBuy: ["Online rental services", "Airport pickup", "Hotel concierge"],
    whereToBuyCn: ["在线租赁服务", "机场自取", "酒店礼宾部"],
  },
];

// VPN Information
export const VPN_OPTIONS: VPNInfo[] = [
  {
    name: "ExpressVPN",
    icon: "🔐",
    reliability: "high",
    speed: "fast",
    cost: "$6.67/month (annual plan)",
    features: ["Split tunneling", "Kill switch", "24/7 support", "Servers in 94 countries"],
    featuresCn: ["分流隧道", "终止开关", "24/7支持", "94个国家服务器"],
    setupDifficulty: "easy",
  },
  {
    name: "NordVPN",
    icon: "🔐",
    reliability: "high",
    speed: "fast",
    cost: "$3.99/month (annual plan)",
    features: ["Double VPN", "Obfuscated servers", "Fast speeds", "6 simultaneous connections"],
    featuresCn: ["双重VPN", "混淆服务器", "快速速度", "6个同时连接"],
    setupDifficulty: "easy",
  },
  {
    name: "SurfShark",
    icon: "🔐",
    reliability: "high",
    speed: "fast",
    cost: "$2.49/month (annual plan)",
    features: ["Unlimited devices", "CleanWeb ad blocker", "MultiHop", "Camouflage mode"],
    featuresCn: ["无限设备", "CleanWeb广告拦截", "MultiHop", "伪装模式"],
    setupDifficulty: "easy",
  },
  {
    name: "Windscribe",
    icon: "🔐",
    reliability: "medium",
    speed: "medium",
    cost: "Free tier available, Pro $5/month",
    features: ["Generous free tier", "Built-in ad blocker", "Wardens", "Customize protocol"],
    featuresCn: ["慷慨的免费版", "内置广告拦截", "Wardens", "自定义协议"],
    setupDifficulty: "medium",
  },
];

// Essential Apps
export const ESSENTIAL_APPS: AppRecommendation[] = [
  {
    app: "WeChat",
    icon: "💚",
    category: "Communication",
    categoryCn: "通讯",
    purpose: "Messaging, payments, social media - essential in China",
    purposeCn: "消息、支付、社媒——在中国必不可少",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Alipay",
    icon: "💙",
    category: "Payment",
    categoryCn: "支付",
    purpose: "Mobile payments, taxi, food delivery",
    purposeCn: "移动支付、打车、外卖",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Didi",
    icon: "🚕",
    category: "Transport",
    categoryCn: "交通",
    purpose: "Ride-hailing with English interface",
    purposeCn: "打车应用，有英文界面",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Metro (City-specific)",
    icon: "🚇",
    category: "Transport",
    categoryCn: "交通",
    purpose: "Subway routes and payment (e.g., Metro大都会 for Shanghai)",
    purposeCn: "地铁路线和支付（如上海用Metro大都会）",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Pleco",
    icon: "📖",
    category: "Translation",
    categoryCn: "翻译",
    purpose: "Chinese-English dictionary with camera OCR",
    purposeCn: "汉英词典，支持相机OCR",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Google Translate",
    icon: "🔤",
    category: "Translation",
    categoryCn: "翻译",
    purpose: "Offline translation, camera translation",
    purposeCn: "离线翻译、相机翻译",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Maps.me",
    icon: "🗺️",
    category: "Navigation",
    categoryCn: "导航",
    purpose: "Offline maps work without VPN",
    purposeCn: "离线地图，无需VPN即可使用",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: true,
  },
  {
    app: "Trip.com",
    icon: "✈️",
    category: "Travel",
    categoryCn: "旅行",
    purpose: "Flights, trains, hotels - English interface",
    purposeCn: "机票、火车票、酒店——英文界面",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: false,
  },
  {
    app: "大众点评",
    icon: "🍽️",
    category: "Dining",
    categoryCn: "餐饮",
    purpose: "Restaurant reviews, takeout, reservations (Chinese interface)",
    purposeCn: "餐厅点评、外卖、预约（中文界面）",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: false,
  },
  {
    app: "Meituan",
    icon: "🛒",
    category: "Delivery",
    categoryCn: "外卖",
    purpose: "Food delivery, movie tickets, services",
    purposeCn: "外卖、电影票、服务",
    download: "App Store / Android",
    downloadCn: "App Store / 安卓",
    essential: false,
  },
];

// Communication Setup Steps
export const COMMUNICATION_SETUP_STEPS = [
  {
    step: 1,
    title: "Choose Communication Method",
    titleCn: "选择通讯方式",
    icon: "📡",
    description:
      "Decide between local SIM, eSIM, or international roaming based on your phone compatibility and trip duration.",
    descriptionCn: "根据手机兼容性和旅行时间，在本地SIM、eSIM或国际漫游之间做出选择。",
    actionItems: [
      "Check phone SIM unlock status",
      "Check if phone supports eSIM",
      "Compare costs of different options",
      "Read reviews from recent travelers",
    ],
    actionItemsCn: [
      "检查手机SIM解锁状态",
      "检查手机是否支持eSIM",
      "比较不同选项的费用",
      "阅读近期旅客的评价",
    ],
  },
  {
    step: 2,
    title: "Prepare VPN Before Travel",
    titleCn: "旅行前准备VPN",
    icon: "🔐",
    description:
      "Download and set up VPN before arriving in China since many VPN websites are blocked domestically.",
    descriptionCn: "在抵达中国前下载并设置VPN，因为许多VPN网站在中国国内被封锁。",
    actionItems: [
      "Subscribe to reliable VPN service",
      "Download VPN app and configuration",
      "Test VPN connection at home",
      "Learn how to connect/reconnect",
      "Note customer support contacts",
    ],
    actionItemsCn: [
      "订阅可靠的VPN服务",
      "下载VPN应用和配置",
      "在家测试VPN连接",
      "学习如何连接/重连",
      "记下客服联系方式",
    ],
  },
  {
    step: 3,
    title: "Download Essential Apps",
    titleCn: "下载必备应用",
    icon: "📲",
    description:
      "Install apps before arrival since Google Play is blocked. Use APK from alternative stores or download links.",
    descriptionCn: "在到达前安装应用，因为Google Play被封锁。使用替代应用商店的APK或下载链接。",
    actionItems: [
      "Download WeChat",
      "Download Alipay",
      "Install VPN app",
      "Download translation apps",
      "Install offline maps",
      "Get transport apps",
    ],
    actionItemsCn: [
      "下载微信",
      "下载支付宝",
      "安装VPN应用",
      "下载翻译应用",
      "安装离线地图",
      "获取交通应用",
    ],
  },
  {
    step: 4,
    title: "Set Up at Airport",
    titleCn: "在机场设置",
    icon: "✈️",
    description: "Once you land, follow these steps to get connected quickly.",
    descriptionCn: "落地后，按照以下步骤快速连接网络。",
    actionItems: [
      "Insert SIM or scan eSIM QR",
      "Configure APN settings if required",
      "Connect to airport WiFi",
      "Test VPN connection",
      "Test mobile payment setup",
      "Keep passport ready for registration",
    ],
    actionItemsCn: [
      "插入SIM或扫描eSIM二维码",
      "如需要配置APN设置",
      "连接机场WiFi",
      "测试VPN连接",
      "测试移动支付设置",
      "准备好护照以便登记",
    ],
  },
  {
    step: 5,
    title: "Configure for Best Experience",
    titleCn: "配置以获得最佳体验",
    icon: "⚙️",
    description: "Fine-tune settings for optimal communication and payment experience.",
    descriptionCn: "微调设置以获得最佳通讯和支付体验。",
    actionItems: [
      "Add VPN to auto-connect",
      "Set WeChat backup to cloud",
      "Configure translation app offline mode",
      "Save important contacts in multiple places",
      "Set up emergency contact sharing",
    ],
    actionItemsCn: [
      "设置VPN自动连接",
      "设置微信备份到云端",
      "配置翻译应用离线模式",
      "在多处保存重要联系人",
      "设置紧急联系人共享",
    ],
  },
];

// APN Settings for Major Carriers
export const APN_SETTINGS = [
  {
    carrier: "China Mobile (中国移动)",
    apn: "cmnet",
    mmsc: "http://mmsc.monternet.com",
    proxy: "10.0.0.172",
    port: "80",
    notes: "Most widely available, good coverage",
  },
  {
    carrier: "China Unicom (中国联通)",
    apn: "3gnet",
    mmsc: "http://mmsc.myuni.com.cn",
    proxy: "",
    port: "",
    notes: "Good for data-heavy users, 4G LTE",
  },
  {
    carrier: "China Telecom (中国电信)",
    apn: "ctnet",
    mmsc: "http://mms.ctnet189.com",
    proxy: "10.0.0.200",
    port: "80",
    notes: "Good in urban areas, CDMA network",
  },
];

export const COMMUNICATION_HELPERS = {
  usefulPhrases: [
    {
      english: "I need a SIM card",
      chinese: "我需要一张SIM卡",
      pronunciation: "wǒ xūyào yī zhāng SIM kǎ",
    },
    {
      english: "How much data do I have?",
      chinese: "我有多少流量?",
      pronunciation: "wǒ yǒu duōshǎo liúliàng?",
    },
    {
      english: "The internet is not working",
      chinese: "网络上不去",
      pronunciation: "shàngwǎng shàng bù qù",
    },
    {
      english: "Can I use my phone here?",
      chinese: "这里可以用手机吗?",
      pronunciation: "zhèlǐ kěyǐ yòng shǒujī ma?",
    },
    {
      english: "I need more data",
      chinese: "我需要更多流量",
      pronunciation: "wǒ xūyào gèng duō liúliàng",
    },
    {
      english: "Where is the carrier store?",
      chinese: "运营商门店在哪里?",
      pronunciation: "yùnyíng shāng méndiǎn zài nǎlǐ?",
    },
  ],
  troubleshooting: [
    {
      problem: "No data connection",
      solution: "Check APN settings, restart phone, try different carrier",
    },
    {
      problem: "VPN not connecting",
      solution: "Try different server, switch protocol, reinstall app",
    },
    {
      problem: "Alipay/WeChat not working",
      solution: "Verify identity, check card validity, contact support",
    },
    { problem: "Calls not working", solution: "Check SIM registration, enable roaming, try VoLTE" },
  ],
};
