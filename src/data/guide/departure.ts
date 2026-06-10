// Departure Guide Data - Stage 12: Leaving China
export interface DepartureStep {
  step: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  details: string[];
  detailsCn: string[];
  timing: string;
  timingCn: string;
}

export interface TaxRefundInfo {
  category: string;
  icon: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  process: string[];
  processCn: string[];
  tips: string[];
  tipsCn: string[];
}

export interface AirportInfo {
  city: string;
  airport: string;
  code: string;
  distance: string;
  transport: string[];
  transportCn: string[];
  tips: string[];
  tipsCn: string[];
}

// Departure Steps - Stage 12
export const DEPARTURE_STEPS: DepartureStep[] = [
  {
    step: 1,
    title: "3 Days Before: Final Preparations",
    titleCn: "提前3天：最后准备",
    description: "Confirm all bookings, arrange transport, and complete tax refund claims.",
    descriptionCn: "确认所有预订，安排交通，完成退税申请。",
    icon: "📋",
    details: [
      "Confirm flight booking and check-in online",
      "Arrange airport transfer",
      "Apply for VAT refund at stores (up to 15 days before)",
      "Check hotel checkout time",
      "Confirm luggage weight limits with airline",
      "Notify hotel of late checkout if needed",
    ],
    detailsCn: [
      "确认机票并在线值机",
      "安排机场交通",
      "在商店申请增值税退税（最多提前15天）",
      "确认酒店退房时间",
      "确认航空公司行李重量限制",
      "如有需要通知酒店延迟退房",
    ],
    timing: "3 days before departure",
    timingCn: "出发前3天",
  },
  {
    step: 2,
    title: "1 Day Before: Packing & Check-out",
    titleCn: "出发前1天：打包与退房",
    description: "Pack belongings, settle bills, and prepare for departure.",
    descriptionCn: "打包行李，结清账单，准备出发。",
    icon: "🧳",
    details: [
      "Complete packing and check against checklist",
      "Confirm passport and visa validity",
      "Settle hotel bills (check for hidden charges)",
      "Return borrowed items to hotel",
      "Confirm airport transfer time",
      "Check weather for travel day",
    ],
    detailsCn: [
      "完成打包并对照清单检查",
      "确认护照和签证有效期",
      "结清酒店账单（检查是否有隐藏费用）",
      "归还向酒店借用的物品",
      "确认机场接送时间",
      "查看出行日天气",
    ],
    timing: "1 day before departure",
    timingCn: "出发前1天",
  },
  {
    step: 3,
    title: "Day of Departure: Airport Transfer",
    titleCn: "出发日：前往机场",
    description: "Travel to airport with sufficient time for all procedures.",
    descriptionCn: "前往机场，确保有足够时间完成所有手续。",
    icon: "🚗",
    details: [
      "Leave hotel 2-3 hours before flight",
      "Verify airport name matches ticket",
      "Keep passport and ticket easily accessible",
      "Check traffic conditions before leaving",
      "Have hotel address in Chinese for driver",
      "Keep hotel business card for return journey",
    ],
    detailsCn: [
      "在航班起飞前2-3小时离开酒店",
      "确认机场名称与机票一致",
      "护照和机票放在方便取用的地方",
      "出发前查看路况",
      "给司机准备中文酒店地址",
      "保留酒店名片以便回程",
    ],
    timing: "3 hours before international flight",
    timingCn: "国际航班前3小时",
  },
  {
    step: 4,
    title: "At Airport: Check-in & Security",
    titleCn: "在机场：值机与安检",
    description: "Complete airline check-in and airport security procedures.",
    descriptionCn: "完成航空公司值机和机场安检程序。",
    icon: "✈️",
    details: [
      "Proceed to check-in counter (international departures)",
      "Present passport and boarding pass",
      "Check luggage and get boarding pass",
      "Proceed through emigration (exit check)",
      "Go through security screening",
      "Find departure gate and wait",
    ],
    detailsCn: [
      "前往值机柜台（国际出发）",
      "提交护照和登机牌",
      "托运行李并获得登机牌",
      "前往边检（出境检查）",
      "通过安检",
      "找到登机口等候",
    ],
    timing: "2-3 hours before flight",
    timingCn: "航班起飞前2-3小时",
  },
  {
    step: 5,
    title: "Duty-Free Shopping",
    titleCn: "机场免税店购物",
    description: "Make the most of duty-free shopping opportunities.",
    descriptionCn: "充分利用机场免税店购物机会。",
    icon: "🛍️",
    details: [
      "Check duty-free price against destination prices",
      "Purchase alcohol and cigarettes within limits",
      "Buy luxury goods if price advantage exists",
      "Check electronics for savings",
      "Use leftover RMB for purchases",
      "Compare airport vs downtown duty-free prices",
    ],
    detailsCn: [
      "比较免税价格与目的地价格",
      "在限额内购买酒类和香烟",
      "如价格有优势购买奢侈品",
      "查看电子产品是否有优惠",
      "用剩余人民币购买",
      "比较机场与市中心免税价格",
    ],
    timing: "After security, before boarding",
    timingCn: "过安检后，登机前",
  },
  {
    step: 6,
    title: "Boarding & Departure",
    titleCn: "登机与出发",
    description: "Board your flight and begin journey home.",
    descriptionCn: "登上航班，开始返程。",
    icon: "🛫",
    details: [
      "Listen for boarding announcements",
      "Have boarding pass and passport ready",
      "Board according to group/zone",
      "Stow luggage properly overhead or under seat",
      "Keep passport accessible for flight",
      "Complete arrival card if required",
    ],
    detailsCn: [
      "留意登机广播",
      "准备好登机牌和护照",
      "按组别/区域登机",
      "将行李正确放置在头顶行李架或座椅下方",
      "护照放在方便取用的地方",
      "如需要填写抵达卡",
    ],
    timing: "30-45 minutes before departure",
    timingCn: "起飞前30-45分钟",
  },
];

// VAT Tax Refund - Stage 12
export const TAX_REFUND_INFO: TaxRefundInfo[] = [
  {
    category: "Eligibility",
    icon: "✅",
    description: "Who can get tax refund and what items qualify.",
    descriptionCn: "谁可以获得退税，哪些商品符合条件。",
    requirements: [
      "Foreign passport holders (non-Chinese)",
      "Single purchase over 200 CNY at participating stores (reduced from 500 CNY in April 2025)",
      "Items to be taken out of China (not consumed in China)",
      "Valid invoice with tax refund symbol",
      "Store participates in tax refund program",
    ],
    requirementsCn: [
      "外国护照持有者（非中国籍）",
      "在参与商店单笔消费超过200元人民币（2025年4月起从500元降至200元）",
      "将物品带出中国（不在中国境内消费）",
      "有效发票带有退税标识",
      "商店参与退税计划",
    ],
    process: [],
    processCn: [],
    tips: [
      "Tourist tax refund rate: 3-11% depending on item",
      "Luxury goods have higher refund rates",
      "Electronics and cosmetics often qualify",
    ],
    tipsCn: ["旅客退税率：3-11%，视商品而定", "奢侈品退税率更高", "电子产品和小化妆品通常符合条件"],
  },
  {
    category: "Process at Store",
    icon: "🏪",
    description: "How to claim tax refund at the time of purchase.",
    descriptionCn: "如何在购买时申请退税。",
    requirements: [],
    requirementsCn: [],
    process: [
      "Show passport before payment",
      "Request tax refund invoice",
      "Fill out tax refund form (边境购物退税申请单)",
      "Get verification code from store",
      "Keep invoice and form for airport processing",
    ],
    processCn: [
      "付款前出示护照",
      "索取退税发票",
      "填写退税申请表",
      "从商店获取验证码",
      "保留发票和表格以便机场办理",
    ],
    tips: [
      "Process must be done at time of purchase",
      "Date on invoice must match departure within 90 days",
      "Keep all original packaging",
    ],
    tipsCn: ["必须在购买时完成手续", "发票日期必须在90天内出发", "保留所有原始包装"],
  },
  {
    category: "Process at Airport",
    icon: "🏢",
    description: "How to complete tax refund at airport before departure.",
    descriptionCn: "如何在出发前在机场完成退税。",
    requirements: [],
    requirementsCn: [],
    process: [
      "Go to tax refund counter at departure hall (离境退税点)",
      "Present passport, invoice, and items",
      "Show boarding pass (or show booking)",
      "Receive refund in cash or to card",
      "Alternative: global blue refund counters",
    ],
    processCn: [
      "前往出发大厅退税点",
      "提交护照、发票和物品",
      "出示登机牌（或展示预订）",
      "获得现金或退回卡上",
      "或者前往Global Blue退税点",
    ],
    tips: [
      "Process at least 30 minutes before flight",
      "Must have boarding pass to verify departure",
      "Security restrictions apply to liquid items",
      "Staff may inspect larger purchases",
    ],
    tipsCn: [
      "至少在航班前30分钟办理",
      "必须有登机牌以验证出境",
      "液体物品有安检限制",
      "工作人员可能检查较大宗购买",
    ],
  },
];

// Major Airport Information
export const AIRPORT_INFO: AirportInfo[] = [
  {
    city: "Beijing",
    airport: "Beijing Capital International Airport",
    code: "PEK",
    distance: "25-40 km from city center",
    transport: [
      "Airport Express Line (25 CNY, 30 min)",
      "Taxi (80-150 CNY, 40-60 min)",
      "Didi (60-100 CNY)",
      "Capital Airport Bus (15-30 CNY)",
    ],
    transportCn: [
      "机场快线（25元，30分钟）",
      "出租车（80-150元，40-60分钟）",
      "滴滴（60-100元）",
      "机场大巴（15-30元）",
    ],
    tips: [
      "Terminal 3 is huge - allow extra time",
      "Terminal 2 for domestic flights",
      "Use地铁for connections",
    ],
    tipsCn: ["3号航站楼很大——留出额外时间", "2号航站楼为国内航班", "转机用地铁"],
  },
  {
    city: "Shanghai",
    airport: "Shanghai Pudong International Airport",
    code: "PVG",
    distance: "40-60 km from city center",
    transport: [
      "Maglev + Metro Line 2 (50 CNY, 45 min)",
      "Airport Bus (30 CNY, 60-90 min)",
      "Taxi (150-250 CNY, 60-90 min)",
    ],
    transportCn: [
      "磁悬浮+2号线（50元，45分钟）",
      "机场大巴（30元，60-90分钟）",
      "出租车（150-250元，60-90分钟）",
    ],
    tips: [
      "Maglev is fastest option",
      "Book taxi in advance during peak hours",
      "Terminals are well connected",
    ],
    tipsCn: ["磁悬浮是最快选择", "高峰时段提前预约出租车", "航站楼之间联通良好"],
  },
  {
    city: "Shanghai (Hongqiao)",
    airport: "Shanghai Hongqiao International Airport",
    code: "SHA",
    distance: "15 km from city center",
    transport: ["Metro Line 2 (5 CNY, 30 min)", "Taxi (50-80 CNY, 20-40 min)", "Bus (6-20 CNY)"],
    transportCn: ["2号线（5元，30分钟）", "出租车（50-80元，20-40分钟）", "公交（6-20元）"],
    tips: [
      "Closer to city center than Pudong",
      "Good metro connection to high-speed rail",
      "Better for domestic flights",
    ],
    tipsCn: ["比浦东更接近市中心", "地铁连通高铁便利", "更适合国内航班"],
  },
  {
    city: "Guangzhou",
    airport: "Guangzhou Baiyun International Airport",
    code: "CAN",
    distance: "30 km from city center",
    transport: [
      "Metro Line 3 (10 CNY, 45 min)",
      "Airport Express Bus (25-35 CNY)",
      "Taxi (100-150 CNY, 40-60 min)",
    ],
    transportCn: [
      "3号线（10元，45分钟）",
      "机场快线大巴（25-35元）",
      "出租车（100-150元，40-60分钟）",
    ],
    tips: [
      "Metro is most reliable",
      "International flights from T2",
      "Check terminal for your flight",
    ],
    tipsCn: ["地铁最可靠", "国际航班在T2", "查看航班航站楼"],
  },
];

// Shopping Tips for Duty-Free
export const DUTY_FREE_SHOPPING = [
  {
    category: "Best Deals",
    icon: "💰",
    tip: "Electronics, cosmetics, and luxury goods often cheaper in Chinese duty-free.",
    tipCn: "电子产品、小化妆品和奢侈品在中国免税店通常更便宜。",
    note: "Compare prices with destination airport before buying.",
    noteCn: "购买前与目的地机场价格比较。",
  },
  {
    category: "Restrictions",
    icon: "⚠️",
    tip: "Liquids >100ml must be in checked luggage. Spirits limited by country rules.",
    tipCn: "超过100毫升液体必须托运。酒类受各国规定限制。",
    note: "Check your country's import limits before purchase.",
    noteCn: "购买前查看您的国家进口限制。",
  },
  {
    category: "Payment",
    icon: "💳",
    tip: "Use credit card for duty-free purchases for better exchange rates.",
    tipCn: "使用信用卡购买免税商品汇率更好。",
    note: "Keep receipt for customs declaration if required.",
    noteCn: "如有需要保留收据以便海关申报。",
  },
  {
    category: "Timing",
    icon: "⏰",
    tip: "Arrive at airport 3+ hours early for duty-free shopping time.",
    tipCn: "提前3小时以上到达机场以便购物。",
    note: "Duty-free closes 30 min before departure.",
    noteCn: "免税店在起飞前30分钟关门。",
  },
];

// Departure Checklist
export const DEPARTURE_CHECKLIST = {
  documents: [
    { item: "Passport", note: "Check validity (6+ months)", icon: "🛂" },
    { item: "Visa", note: "Ensure exit not overdue", icon: "📋" },
    { item: "Boarding pass", note: "Printed or mobile", icon: "🎫" },
    { item: "Tax refund documents", note: "If claiming refund", icon: "💰" },
    { item: "Customs forms", note: "If carrying restricted items", icon: "📄" },
  ],
  packing: [
    { item: "Luggage", note: "Within weight limits", icon: "🧳" },
    { item: "Valuables", note: "In carry-on", icon: "💎" },
    { item: "Duty-free purchases", note: "Follow liquid rules", icon: "🛍️" },
    { item: "Souvenirs", note: "Check export restrictions", icon: "🎁" },
  ],
  payments: [
    { item: "Hotel bill", note: "Settled", icon: "🏨" },
    { item: "Local payments", note: "Convert or spend remaining CNY", icon: "💵" },
    { item: "Tax refund", note: "Processed at airport", icon: "💹" },
  ],
  departure: [
    { item: "Airport transfer", note: "Confirmed", icon: "🚗" },
    { item: "Check-in online", note: "Done", icon: "💻" },
    { item: "Leave hotel", note: "On time", icon: "🏨" },
  ],
};

export const DEPARTURE_FAQS = [
  {
    question: "How early should I arrive at the airport?",
    answer:
      "For international flights, arrive 3 hours before departure. This gives time for check-in, emigration, security, and duty-free shopping.",
  },
  {
    question: "Can I get VAT refund on items I bought earlier in my trip?",
    answer:
      "Yes, if you have the tax refund invoice from the store. Process at the airport departure hall. Items must be unused and with original packaging.",
  },
  {
    question: "What happens at Chinese emigration?",
    answer:
      "Present passport and boarding pass. Officer checks your visa and may ask about purpose of visit. No exit fee required for most nationalities.",
  },
  {
    question: "How do I exchange remaining RMB?",
    answer:
      "Exchange at airport currency counters before security or in departure hall. Alternatively, spend in duty-free shops. Exchange rates at airports are less favorable but convenient.",
  },
  {
    question: "What if my luggage is overweight?",
    answer:
      " airline fees apply for overweight luggage. Pay at check-in counter. Consider wearing heavy items or redistributing weight among bags.",
  },
  {
    question: "Can I bring souvenirs through customs?",
    answer:
      "Most souvenirs are fine. Check your destination country's restrictions on food, plants, and animal products. Keep purchase receipts for valuable items.",
  },
];

// Memory Collection Status
export const MEMORY_COLLECTION = {
  title: "收集旅行回忆",
  titleCn: "Collect Travel Memories",
  description: "Before leaving, make sure to collect and backup your travel memories.",
  descriptionCn: "在离开前，确保收集并备份您的旅行回忆。",
  items: [
    { icon: "📸", title: "Photos", note: "Backup to cloud or external drive" },
    { icon: "🎫", title: "Tickets & receipts", note: "Keep as souvenirs and records" },
    { icon: "📱", title: "WeChat moments", note: "Screenshot or export" },
    { icon: "💳", title: "Transaction records", note: "Export payment history" },
  ],
};
