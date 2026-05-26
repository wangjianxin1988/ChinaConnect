export interface ScamType {
  id: string;
  title: string;
  titleCn: string;
  icon: string;
  severity: "high" | "medium" | "low";
  description: string;
  descriptionCn: string;
  signs: string[];
  signsCn: string[];
  prevention: string[];
  preventionCn: string[];
  whatToDo: string[];
  whatToDoCn: string[];
  examples: string[];
  examplesCn: string[];
}

export const SCAM_TYPES: ScamType[] = [
  {
    id: "taxi",
    title: "Taxi Scams",
    titleCn: "出租车骗局",
    icon: "🚕",
    severity: "high",
    description:
      "Taxi drivers may take longer routes, refuse to use the meter, or charge excessive fees, especially to tourists.",
    descriptionCn: "出租车司机可能会绕路、拒绝打表或收取过高的费用，尤其是对游客。",
    signs: [
      "Driver refuses to use meter",
      "Unusually long route",
      "Driver claims meter is broken",
      "Extra passengers appear",
      "Cash only requests",
    ],
    signsCn: [
      "司机拒绝使用计价器",
      "路线异常长",
      "司机声称计价器坏了",
      "突然出现额外乘客",
      "只收现金的要求",
    ],
    prevention: [
      "Use ride-hailing apps (Didi, Meituan) instead",
      "Ensure meter is started",
      "Keep GPS tracking on your phone",
      "Ask locals for approximate fares",
      "Sit in the back seat for safety",
    ],
    preventionCn: [
      "使用叫车应用（滴滴、美团）代替",
      "确保开启计价器",
      "保持手机GPS追踪开启",
      "询问当地人大致票价",
      "坐在后座以确保安全",
    ],
    whatToDo: [
      "Take photos of the vehicle and license plate",
      "Use in-app reporting if using Didi",
      "Negotiate firmly or exit the vehicle",
      "Call police if threatened (110)",
    ],
    whatToDoCn: ["拍摄车辆和车牌照片", "使用滴滴内置投诉", "坚决谈判或下车", "如受威胁拨打110"],
    examples: [
      "Airport to city center: 50km journey charged 800 CNY instead of 200 CNY",
      'Short trip charged 200 CNY because "meter started at 100"',
    ],
    examplesCn: [
      "机场到市中心：50公里收费800元而非200元",
      '短途行程收费200元因为"计价器从100开始"',
    ],
  },
  {
    id: "scenic",
    title: "Scenic Spot Overcharging",
    titleCn: "景区高价陷阱",
    icon: "🎫",
    severity: "high",
    description:
      "Some tourist attractions have inflated ticket prices for foreigners, and vendors sell counterfeit tickets.",
    descriptionCn: "一些旅游景点对外国人收取虚高的门票价格，商贩出售假票。",
    signs: [
      "Dramatically higher price for foreigners",
      "Tickets sold by unofficial vendors",
      "Forced bundling with other services",
      "Entry fee suddenly increased",
    ],
    signsCn: ["对外国人价格明显偏高", "由非官方商贩售票", "强制捆绑其他服务", "门票突然涨价"],
    prevention: [
      "Book tickets through official websites",
      "Check prices on multiple platforms",
      "Use tourism apps with verified prices",
      "Visit during off-peak seasons",
      "Carry exact change",
    ],
    preventionCn: [
      "通过官方网站预订门票",
      "在多个平台比较价格",
      "使用有认证价格的旅游应用",
      "在淡季参观",
      "携带正好金额的现金",
    ],
    whatToDo: [
      "Demand official receipt",
      "Report to tourism bureau (12301)",
      "Leave and find alternative",
      "Document everything",
    ],
    whatToDoCn: ["要求官方收据", "向旅游局投诉（12301）", "离开并寻找替代方案", "记录所有信息"],
    examples: [
      "Tea plantation tour: 30 CNY locals, 300 CNY foreigners",
      'Boat ride: 20 CNY official, 100 CNY "group rate"',
    ],
    examplesCn: ["茶园游览：本地人30元，外国人300元", '划船：官方20元，"团体价"100元'],
  },
  {
    id: "guide",
    title: "Fake/Bad Tour Guides",
    titleCn: "假导游/黑导游",
    icon: "🧭",
    severity: "medium",
    description:
      "Unofficial guides may provide poor service, overcharge for attractions, or lead you to commission-based shops.",
    descriptionCn: "非正式导游可能提供糟糕的服务，对景点过度收费，或带你到拿提成的商店。",
    signs: [
      "Approaches you near tourist sites",
      "No official ID or badge",
      "Promises special access or discounts",
      "Insists on specific restaurants/shops",
      "Aggressive sales tactics",
    ],
    signsCn: [
      "在景点附近主动接近你",
      "没有官方证件或徽章",
      "承诺特殊通道或折扣",
      "坚持要去特定的餐厅/商店",
      "强行推销策略",
    ],
    prevention: [
      "Book through certified agencies only",
      "Verify guide credentials",
      "Use audio guides or official apps",
      "Join group tours from reputable companies",
      "Ignore unsolicited approach",
    ],
    preventionCn: [
      "仅通过认证机构预订",
      "核实导游资质",
      "使用语音导览或官方应用",
      "选择知名公司的团队游",
      "忽略主动接近的人",
    ],
    whatToDo: [
      "Politely decline",
      "Report to local tourism authority",
      "Walk away firmly",
      "Find official information center",
    ],
    whatToDoCn: ["礼貌拒绝", "向当地旅游局举报", "坚决走开", "寻找官方信息中心"],
    examples: [
      "Guide insists on visiting jade shop (gets 50% commission)",
      "Unofficial guide leads you to closed attractions",
    ],
    examplesCn: ["导游坚持带你去玉器店（获得50%提成）", "非正式导游带你去已关闭的景点"],
  },
  {
    id: "tea",
    title: "Tea/Wine Scam",
    titleCn: "茶托/酒托骗局",
    icon: "🍵",
    severity: "high",
    description:
      "Attractive people approach tourists and invite them to tea houses or restaurants where prices are extremely inflated.",
    descriptionCn: "外表吸引人的人接近游客，邀请他们去茶馆或餐厅，价格极高地坑骗。",
    signs: [
      "Stranger suddenly shows romantic interest",
      "Invites you to tea/restaurant",
      "Establishment seems empty or suspicious",
      "Menu has no prices or vague prices",
      "Bill is much higher than expected",
    ],
    signsCn: [
      "陌生人突然表现浪漫兴趣",
      "邀请你去茶馆/餐厅",
      "场所看起来空无一人或可疑",
      "菜单没有标价或价格模糊",
      "账单远高于预期",
    ],
    prevention: [
      "Be cautious of sudden romantic attention",
      "Ask for menu with prices before ordering",
      "Visit only reputable establishments",
      "Use apps to check restaurant reviews",
      "Trust your instincts",
    ],
    preventionCn: [
      "对突然的浪漫关注保持警惕",
      "点单前要求看有价格的菜单",
      "只去有信誉的场所",
      "使用应用查看餐厅评价",
      "相信你的直觉",
    ],
    whatToDo: [
      "Leave immediately if suspicious",
      "Do not be embarrassed to ask for bill breakdown",
      "Negotiate or call police if threatened",
      "Document the experience",
    ],
    whatToDoCn: ["如有怀疑立即离开", "不要不好意思要求账单明细", "如受威胁谈判或报警", "记录经历"],
    examples: [
      "Tea ceremony that costs 2000 CNY for cheap tea",
      "Romantic dinner results in 5000 CNY bill",
    ],
    examplesCn: ["茶道表演便宜的茶收费2000元", "浪漫晚餐结果收费5000元"],
  },
  {
    id: "currency",
    title: "Currency Exchange Scam",
    titleCn: "换汇诈骗",
    icon: "💴",
    severity: "high",
    description:
      "Unauthorized money exchangers may give counterfeit bills or dramatically unfair exchange rates.",
    descriptionCn: "未经授权的货币兑换商可能使用假钞或极不公平的汇率。",
    signs: [
      "Approached on street for exchange",
      "Exchange rate too good to be true",
      "No official receipt",
      "Private meeting requested",
      "Only cash transactions",
    ],
    signsCn: [
      "在街上被主动接近兑换",
      "汇率好得不像真的",
      "没有官方收据",
      "要求私下见面",
      "仅限现金交易",
    ],
    prevention: [
      "Use official banks or ATMs only",
      "Exchange at airport with caution",
      "Use mobile payment (Alipay/WeChat)",
      "Check rates on official apps",
      "Never exchange on street",
    ],
    preventionCn: [
      "仅使用官方银行或ATM",
      "在机场谨慎兑换",
      "使用移动支付（支付宝/微信）",
      "在官方应用查看汇率",
      "绝不在大街上兑换",
    ],
    whatToDo: [
      "Count bills carefully and check authenticity",
      "Refuse if any suspicion",
      "Go to bank immediately if scammed",
      "Report to police",
    ],
    whatToDoCn: ["仔细数钱并检查真伪", "如有怀疑坚决拒绝", "如被骗立即去银行", "向警方报案"],
    examples: [
      "700 CNY exchanged for 100 USD at 7:1 instead of 7.2:1",
      "Counterfeit 100 CNY bills returned",
    ],
    examplesCn: ["700元人民币兑换100美元汇率为7:1而非7.2:1", "收到100元假钞找零"],
  },
  {
    id: "temple",
    title: "Temple Donation Scam",
    titleCn: "寺庙高价香火",
    icon: "🏯",
    severity: "medium",
    description:
      'Some temples pressure visitors into buying expensive incense, making large donations, or purchasing所谓的"开光" items.',
    descriptionCn: '一些寺庙强迫游客购买高价香火、大量捐款，或购买所谓的"开光"物品。',
    signs: [
      "Forced incense purchase at entrance",
      'Monk approaches for "blessing"',
      "Donation box requires minimum amount",
      "Extremely expensive prayer items",
      "Pressure tactics by staff",
    ],
    signsCn: [
      "在入口强迫购买香火",
      '和尚主动接近"祈福"',
      "功德箱要求最低金额",
      "极其昂贵的祈福物品",
      "工作人员的强迫推销",
    ],
    prevention: [
      "Research temples before visiting",
      "Carry small change only",
      "Remember: donations are voluntary",
      "Politely decline purchases",
      "Visit during normal hours",
    ],
    preventionCn: [
      "参观前研究寺庙",
      "只携带少量零钱",
      "记住：捐款是自愿的",
      "礼貌拒绝购买",
      "在正常营业时间参观",
    ],
    whatToDo: [
      'Say "不需要" (bù xūyào - do not need)',
      "Walk away firmly",
      "Do not feel obligated",
      "Report to religious affairs bureau",
    ],
    whatToDoCn: ['说"不需要"', "坚决走开", "不要感到有义务", "向宗教事务局举报"],
    examples: [
      "Incense stick bundle: 300 CNY for 3 sticks",
      '"Blessing" that requires 1000 CNY donation',
    ],
    examplesCn: ["三支香收费300元", '"祈福"需要1000元捐款'],
  },
];

export const SEVERITY_COLORS = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

export const SEVERITY_LABELS = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
};
