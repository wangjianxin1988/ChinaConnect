// Visa Guide Data - Stage 1: Pre-departure Preparation
export interface VisaRequirement {
  country: string;
  visaType: string;
  duration: string;
  processingTime: string;
  fee: string;
  notes: string[];
}

export interface VisaStep {
  step: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  tips: string[];
  tipsCn: string[];
}

export const VISA_REQUIREMENTS: VisaRequirement[] = [
  {
    country: "United States",
    visaType: "Tourist (L)",
    duration: "10 years multiple entry",
    processingTime: "3-5 business days",
    fee: "$140",
    notes: [
      "DS-160 form required",
      "Interview at embassy required",
      "Proof of return ticket needed",
      "Bank statements required",
    ],
  },
  {
    country: "United Kingdom",
    visaType: "Standard Visitor",
    duration: "2 years multiple entry",
    processingTime: "3 weeks",
    fee: "£95-£775",
    notes: [
      "Apply online via UKVI",
      "Biometric appointment required",
      "Proof of accommodation needed",
    ],
  },
  {
    country: "Australia",
    visaType: "ETA (Subclass 601)",
    duration: "12 months multiple entry",
    processingTime: "Minutes to 12 hours",
    fee: "AUD $20",
    notes: ["Only for passport holders", "App-based application", "Max 3 months per visit"],
  },
  {
    country: "Canada",
    visaType: "eTA",
    duration: "5 years or passport expiry",
    processingTime: "Minutes",
    fee: "CAD $7",
    notes: ["For visa-exempt countries", "Air travel only", "Must apply online"],
  },
  {
    country: "Germany/Schengen",
    visaType: "Schengen (C)",
    duration: "90 days within 180 days",
    processingTime: "2-4 weeks",
    fee: "€80",
    notes: ["Apply at Chinese embassy", "Travel insurance required", "Proof of accommodation"],
  },
  {
    country: "Japan",
    visaType: "Tourist",
    duration: "15-90 days single entry",
    processingTime: "4-10 business days",
    fee: "¥650-¥1,300",
    notes: [
      "Proof of itinerary required",
      "Hotel reservations needed",
      "Bank balance verification",
    ],
  },
  {
    country: "Singapore",
    visaType: "Transit Visa",
    duration: "96 hours (transit)",
    processingTime: "Instant",
    fee: "Free",
    notes: [
      "Only for transit passengers",
      "Must have onward ticket",
      "Valid for specific nationalities",
    ],
  },
  {
    country: "South Korea",
    visaType: "K-ETA",
    duration: "90 days",
    processingTime: "24-72 hours",
    fee: "₩10,000",
    notes: ["Must apply online", "Valid for 2 years", "Multiple entries allowed"],
  },
];

export const VISA_PROCESS_STEPS: VisaStep[] = [
  {
    step: 1,
    title: "Determine Visa Type",
    titleCn: "确定签证类型",
    description:
      "Identify the correct visa category for your travel purpose. Most tourists need an L visa (Tourist).",
    descriptionCn: "确定适合您旅行目的的正确签证类别。大多数游客需要L签证（旅游）。",
    tips: [
      "Tourist (L): General sightseeing and visits",
      "Business (M): Commercial activities",
      "Transit (G): Through travel",
      "Crew (C): Aviation crew members",
    ],
    tipsCn: [
      "旅游签证(L)：一般观光和访问",
      "商务签证(M)：商业活动",
      "过境签证(G)：过境旅行",
      "机组人员签证(C)：航空机组人员",
    ],
  },
  {
    step: 2,
    title: "Gather Required Documents",
    titleCn: "准备所需材料",
    description:
      "Compile all necessary documents including passport, photos, application form, and supporting materials.",
    descriptionCn: "整理所有必要文件，包括护照、照片、申请表和辅助材料。",
    tips: [
      "Valid passport (6+ months validity)",
      "Completed visa application form",
      "Passport-size photos (2 inches)",
      "Proof of accommodation",
      "Round-trip flight itinerary",
      "Bank statements (last 3 months)",
    ],
    tipsCn: [
      "有效护照（有效期6个月以上）",
      "填写完整的签证申请表",
      "护照照片（2英寸）",
      "住宿证明",
      "往返航班行程",
      "银行流水（近3个月）",
    ],
  },
  {
    step: 3,
    title: "Submit Application",
    titleCn: "提交申请",
    description:
      "Submit your application to the Chinese embassy/consulate or authorized visa center.",
    descriptionCn: "向中国大使馆/领事馆或授权签证中心提交申请。",
    tips: [
      "Book appointment online",
      "Pay application fee",
      "Submit biometrics if required",
      "Keep payment receipt",
    ],
    tipsCn: ["在线预约", "支付申请费", "如需要提交生物识别信息", "保留付款收据"],
  },
  {
    step: 4,
    title: "Interview (if required)",
    titleCn: "面试（如需要）",
    description:
      "Attend interview at embassy/consulate if scheduled. Be prepared to answer questions about your trip.",
    descriptionCn: "如被安排，前往大使馆/领事馆面试。准备好回答关于您旅行的问题。",
    tips: [
      "Dress professionally",
      "Bring all original documents",
      "Be honest about itinerary",
      "Know your accommodation details",
      "Explain purpose of visit clearly",
    ],
    tipsCn: ["穿着正式", "携带所有原始文件", "如实说明行程", "了解住宿详情", "清楚解释访问目的"],
  },
  {
    step: 5,
    title: "Collect Passport",
    titleCn: "领取护照",
    description:
      "Collect your passport with visa stamp once processed. Verify all details are correct.",
    descriptionCn: "处理完成后领取带有签证印章的护照。核实所有信息正确。",
    tips: [
      "Check visa validity dates",
      "Verify personal information",
      "Confirm number of entries",
      "Keep copy of visa page",
      "Store passport safely",
    ],
    tipsCn: ["检查签证有效期", "核实个人信息", "确认入境次数", "保存签证页复印件", "安全存放护照"],
  },
];

export const ESSENTIAL_DOCUMENTS = {
  beforeTravel: [
    { item: "Passport", note: "Valid 6+ months beyond travel dates", icon: "🛂" },
    { item: "Visa", note: "Printed copy of approval/visa", icon: "📋" },
    { item: "Flight tickets", note: "Printed or digital itinerary", icon: "✈️" },
    { item: "Hotel confirmations", note: "All accommodation bookings", icon: "🏨" },
    { item: "Travel insurance", note: "Policy and emergency numbers", icon: "🛡️" },
    { item: "Vaccination certificate", note: "If required from your country", icon: "💉" },
    { item: "Bank cards", note: "Credit/debit for international use", icon: "💳" },
    { item: "Emergency contacts", note: "List of important numbers", icon: "📞" },
  ],
  copies: [
    { item: "Passport photo copies", note: "Keep separate from original", icon: "📄" },
    { item: "Visa copy", note: "Digital backup in cloud storage", icon: "☁️" },
    { item: "Insurance policy", note: "Physical and digital copies", icon: "📃" },
    { item: "Emergency contacts", note: "Family and embassy numbers", icon: "👨‍👩‍👧" },
  ],
};

export const VISA_TIPS = [
  {
    icon: "⏰",
    title: "Apply Early",
    titleCn: "提前申请",
    tip: "Start visa process at least 4-6 weeks before travel. Processing times vary by country and season.",
    tipCn: "在旅行前至少4-6周开始签证流程。处理时间因国家和季节而异。",
  },
  {
    icon: "📱",
    title: "Use Official Channels",
    titleCn: "使用官方渠道",
    tip: "Only use official embassy websites or authorized visa centers. Avoid third-party agents claiming guaranteed approval.",
    tipCn: "仅使用官方大使馆网站或授权签证中心。避免使用声称保证批准的第三方代理。",
  },
  {
    icon: "📝",
    title: "Complete Forms Accurately",
    titleCn: "准确填写表格",
    tip: "Double-check all information on application forms. Errors can cause delays or rejection.",
    tipCn: "仔细检查申请表上的所有信息。错误可能导致延误或拒签。",
  },
  {
    icon: "💰",
    title: "Budget for Fees",
    titleCn: "预算签证费",
    tip: "Visa fees vary widely by nationality and visa type. Factor in courier and service charges.",
    tipCn: "签证费用因国籍和签证类型而异。算上快递和服务费。",
  },
  {
    icon: "🗣️",
    title: "Learn Basic Phrases",
    titleCn: "学习基本短语",
    tip: 'Learning "你好" (hello) and "谢谢" (thank you) goes a long way. Even basic attempts are appreciated.',
    tipCn: '学会"你好"和"谢谢"大有帮助。即使是基本的尝试也会受到赞赏。',
  },
];

export const VISA_FAQS = [
  {
    question: "Can I get a visa on arrival in China?",
    answer:
      "Transit visas (G) are available on arrival for some nationalities at specific ports. However, tourist visas must be obtained before travel.",
  },
  {
    question: "How long can I stay with a tourist visa?",
    answer:
      "Typically 30-60 days depending on your nationality and visa type. Extensions can be applied for at local PSB (Public Security Bureau).",
  },
  {
    question: "Is multiple entry visa worth it?",
    answer:
      "If you plan to visit neighboring countries (Japan, Korea, etc.) and return to China, a multiple entry visa saves time and money.",
  },
  {
    question: "What if my visa application is rejected?",
    answer:
      "You can reapply with additional documentation. Common reasons for rejection include incomplete forms, insufficient funds, or unclear travel purpose.",
  },
  {
    question: "Do I need a visa for Hong Kong/Macau?",
    answer:
      "Hong Kong and Macau have separate immigration policies. Many nationalities get 7-14 days visa-free access.",
  },
];

// Stage 1 additional: Pre-departure checklist
export const PRE_DEPARTURE_CHECKLIST = {
  weeksBefore: [
    {
      item: "Check passport validity (must be 6+ months)",
      icon: "🛂",
      note: "Renew if expiring soon",
    },
    { item: "Apply for visa (L tourist visa)", icon: "📋", note: "Allow 4-6 weeks processing" },
    { item: "Book flights and accommodation", icon: "✈️", note: "Required for visa application" },
    { item: "Purchase travel insurance", icon: "🛡️", note: "Medical + evacuation coverage" },
    { item: "Download and configure VPN", icon: "🔐", note: "Required before arriving in China" },
    { item: "Download essential apps", icon: "📱", note: "WeChat, Alipay, translation apps" },
    { item: "Notify bank of travel plans", icon: "💳", note: "Prevent card blocks abroad" },
    { item: "Register with embassy travel notification", icon: "🏛️", note: "For emergency alerts" },
  ],
  daysBefore: [
    { item: "Confirm all bookings", icon: "✅", note: "Flights, hotels, activities" },
    { item: "Test VPN connection", icon: "🔐", note: "Ensure it works before departure" },
    { item: "Download offline maps", icon: "🗺️", note: "Maps.me or Google Maps offline" },
    { item: "Charge all devices", icon: "🔋", note: "Power banks, adapters" },
    { item: "Pack documents in carry-on", icon: "🎒", note: "Passport, visa, insurance" },
    { item: "Exchange small amount of cash", icon: "💵", note: "For airport arrival" },
    { item: "Download boarding pass", icon: "🎫", note: "Digital backup" },
  ],
  whatToBring: {
    electronics: [
      { item: "Phone charger + power bank", icon: "🔌" },
      { item: "Universal travel adapter", icon: "🔌" },
      { item: "VPN app already installed", icon: "🔐" },
      { item: "Offline translation app", icon: "🔤" },
      { item: "Headphones", icon: "🎧" },
    ],
    essentials: [
      { item: "Passport (6+ months validity)", icon: "🛂" },
      { item: "Visa copy (printed + digital)", icon: "📋" },
      { item: "Travel insurance card", icon: "🛡️" },
      { item: "Hotel confirmations", icon: "🏨" },
      { item: "Emergency contact list", icon: "📞" },
      { item: "Credit/debit cards", icon: "💳" },
      { item: "Cash (500-1000 CNY)", icon: "💵" },
    ],
  },
};

export const VPN_RECOMMENDATIONS = [
  {
    name: "ExpressVPN",
    reliability: "High",
    speed: "Fast",
    cost: "$6.67/mo",
    setup: "Easy",
    note: "Best overall for China",
  },
  {
    name: "NordVPN",
    reliability: "High",
    speed: "Fast",
    cost: "$3.99/mo",
    setup: "Easy",
    note: "Best value",
  },
  {
    name: "Surfshark",
    reliability: "High",
    speed: "Fast",
    cost: "$2.49/mo",
    setup: "Easy",
    note: "Unlimited devices",
  },
  {
    name: "Windscribe",
    reliability: "Medium",
    speed: "Medium",
    cost: "Free tier",
    setup: "Medium",
    note: "Free option available",
  },
];

export const ESSENTIAL_APPS_LIST = [
  { app: "WeChat", purpose: "Messaging, payments, social - essential in China", essential: true },
  { app: "Alipay", purpose: "Mobile payments everywhere", essential: true },
  { app: "Didi", purpose: "Ride-hailing with English mode", essential: true },
  { app: "Pleco", purpose: "Chinese-English dictionary with camera OCR", essential: true },
  { app: "Google Translate", purpose: "Offline translation + camera", essential: true },
  { app: "Maps.me", purpose: "Offline maps (works without VPN)", essential: true },
  { app: "Trip.com", purpose: "Flights, trains, hotels - English", essential: false },
  { app: "大众点评", purpose: "Restaurant reviews, takeout", essential: false },
  { app: "Metro (city app)", purpose: "Subway routes and payment", essential: false },
];

export const FLIGHT_BOOKING_TIPS = [
  { tip: "Book 2-4 weeks ahead for best prices", icon: "💰" },
  { tip: "Use Trip.com or Google Flights for comparison", icon: "🔍" },
  { tip: "Direct flights reduce travel fatigue", icon: "✈️" },
  { tip: "Check airline luggage policies before booking", icon: "🧳" },
  { tip: "Beijing (PEK/PKX) and Shanghai (PVG/SHA) are major hubs", icon: "🏙️" },
  { tip: "Download airline app for mobile boarding pass", icon: "📱" },
];

export const TRAVEL_INSURANCE_RECOMMENDATIONS = [
  { coverage: "Medical expenses", importance: "Critical", note: "At least 300,000 CNY coverage" },
  {
    coverage: "Emergency evacuation",
    importance: "Critical",
    note: "For remote areas or serious illness",
  },
  { coverage: "Trip cancellation", importance: "High", note: "Reimburses if trip is cancelled" },
  { coverage: "Lost baggage", importance: "Medium", note: "Covers essential replacements" },
  {
    coverage: "Personal liability",
    importance: "Medium",
    note: "In case you accidentally injure someone",
  },
  {
    coverage: "COVID-19 coverage",
    importance: "High",
    note: "Check current policy - many exclude it",
  },
];
