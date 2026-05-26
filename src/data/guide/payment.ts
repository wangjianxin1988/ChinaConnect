// Payment Guide Data - Stages 2 & 10: Payment Systems & Shopping
export interface PaymentMethod {
  method: string;
  icon: string;
  description: string;
  descriptionCn: string;
  howToSetup: string[];
  howToSetupCn: string[];
  usage: string[];
  usageCn: string[];
  tips: string[];
  tipsCn: string[];
  pros: string[];
  cons: string[];
}

export interface ShoppingTip {
  category: string;
  icon: string;
  tip: string;
  tipCn: string;
  warning?: string;
  warningCn?: string;
}

// Stage 2: Payment Setup
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    method: "Alipay (支付宝)",
    icon: "💙",
    description: "China's dominant mobile payment platform, accepted everywhere.",
    descriptionCn: "中国主要的移动支付平台，到处都可以使用。",
    howToSetup: [
      "Download Alipay app",
      "Register with foreign phone number",
      "Verify identity with passport",
      "Link international credit/debit card",
      "Set payment password",
      "Verify with 3D Secure if required",
    ],
    howToSetupCn: [
      "下载支付宝应用",
      "用国外手机号注册",
      "用护照验证身份",
      "绑定国际信用卡/借记卡",
      "设置支付密码",
      "如需要通过3D验证",
    ],
    usage: [
      "Scan merchant QR code to pay",
      "Show personal QR code for merchant to scan",
      "Enter amount and confirm",
      "Use Face++ for large transactions",
      "Set as default in Apple/Google Pay",
    ],
    usageCn: [
      "扫描商家二维码支付",
      "展示个人二维码让商家扫描",
      "输入金额并确认",
      "大额交易使用人脸识别",
      "设为Apple/Google Pay默认",
    ],
    tips: [
      "Check exchange rate before payment",
      "Transaction limit: 50,000 CNY/day",
      'Use "Traveler" mode for easier setup',
      "Keep some cash as backup",
      "Verify final amount before confirming",
    ],
    tipsCn: [
      "支付前查看汇率",
      "交易限额：每天50,000元",
      '使用"旅客"模式更易设置',
      "保留一些现金备用",
      "确认前核实最终金额",
    ],
    pros: [
      "Widely accepted (98%+ merchants)",
      "English interface available",
      "Instant currency conversion",
      "In-app translation features",
    ],
    cons: [
      "May require Chinese bank account for full features",
      "Foreign cards not accepted everywhere",
      "Setup process can be complex",
    ],
  },
  {
    method: "WeChat Pay (微信支付)",
    icon: "💚",
    description: "Integrated with messaging app, second most popular payment.",
    descriptionCn: "集成在通讯应用中，第二大支付方式。",
    howToSetup: [
      "Download WeChat app",
      "Register with foreign phone number",
      "Complete WeChat Pay verification",
      "Link Visa/Mastercard",
      "Add travel card for easier setup",
      "Set payment password",
    ],
    howToSetupCn: [
      "下载微信应用",
      "用国外手机号注册",
      "完成微信支付验证",
      "绑定Visa/万事达卡",
      "添加旅游卡以简化设置",
      "设置支付密码",
    ],
    usage: [
      "Scan QR code via WeChat",
      'Use "Pay" function from chat',
      "Show payment code at checkout",
      "Haggle through WeChat (some vendors)",
      "Send red envelopes to friends",
    ],
    usageCn: [
      "通过微信扫描二维码",
      '在聊天中使用"支付"功能',
      "在结账时展示支付码",
      "部分商家可通过微信砍价",
      "给朋友发红包",
    ],
    tips: [
      "Most vendors accept both Alipay and WeChat",
      "WeChat has better English translation",
      "Connect to credit card for automatic conversion",
      "Keep balance low, reload as needed",
    ],
    tipsCn: [
      "大多数商家同时接受支付宝和微信",
      "微信有更好的英文翻译",
      "连接信用卡自动换汇",
      "余额保持低位，需要时充值",
    ],
    pros: [
      "Built into WeChat messaging",
      "Better customer support for foreigners",
      "Peer-to-peer payments easy",
      "Integrated with many apps",
    ],
    cons: [
      "Slightly less acceptance than Alipay",
      "May have lower transaction limits",
      "Verification takes longer",
    ],
  },
  {
    method: "Tourist Card (TourCard/Wise)",
    icon: "💳",
    description: "Prepaid card designed for tourists, easy setup without bank account.",
    descriptionCn: "为游客设计的预付卡，无需银行账户即可轻松设置。",
    howToSetup: [
      "Order online before travel",
      "Receive card by mail or at airport",
      "Activate through app",
      "Load money in local currency",
      "Verify identity if required",
      "Set PIN for ATM withdrawals",
    ],
    howToSetupCn: [
      "旅行前在线订购",
      "通过邮寄或机场领取获得卡片",
      "通过应用激活",
      "以当地货币充值",
      "如需要验证身份",
      "设置ATM取款密码",
    ],
    usage: [
      "Use as regular credit card",
      "Tap for NFC payments",
      "Add to Apple/Google Pay",
      "Withdraw cash at ATMs",
      "Pay online with card details",
    ],
    usageCn: [
      "作为普通信用卡使用",
      "NFC感应支付",
      "添加到Apple/Google Pay",
      "在ATM取现金",
      "用卡信息在线支付",
    ],
    tips: [
      "Best for those without Chinese bank account",
      "Competitive exchange rates",
      "Accepted at most card terminals",
      "ATM withdrawal fees apply",
    ],
    tipsCn: [
      "最适合没有中国银行账户的人",
      "有竞争力的汇率",
      "大多数刷卡终端都接受",
      "ATM取款收取手续费",
    ],
    pros: [
      "No Chinese bank account needed",
      "Easy online management",
      "Transparent fees",
      "Works globally",
    ],
    cons: ["ATM withdrawal fees", "May not work at some small vendors", "Limited refund options"],
  },
  {
    method: "Cash (现金)",
    icon: "💵",
    description: "Still useful for small vendors, markets, and emergencies.",
    descriptionCn: "对小商贩、市场和紧急情况仍然有用。",
    howToSetup: [
      "Withdraw from ATM on arrival",
      "Exchange currency at bank or airport",
      "Keep small bills for small purchases",
      "Use reputable exchange services",
      "Check exchange rates before exchanging",
    ],
    howToSetupCn: [
      "到达后在ATM取款",
      "在银行或机场兑换货币",
      "保留小额钞票用于小额购买",
      "使用正规兑换服务",
      "兑换前查看汇率",
    ],
    usage: [
      "Count bills before handing over",
      "Check for counterfeit notes",
      "Keep spare change for buses/markets",
      "Negotiate prices in cash (markets)",
      "Have backup cash in hotel safe",
    ],
    usageCn: [
      "交钱前数清楚",
      "检查假钞",
      "为公交和市场保留零钱",
      "用现金砍价（市场）",
      "在酒店保险箱留备用现金",
    ],
    tips: [
      "ATMs available everywhere, fee may apply",
      "ICBC, BOC, ABC have best international rates",
      "Avoid street exchange (scam risk)",
      "Keep small bills ready (10, 20, 50 CNY)",
    ],
    tipsCn: [
      "ATM到处都有，可能有手续费",
      "工行、中行、农行国际汇率最好",
      "避免街头兑换（有诈骗风险）",
      "准备好小额钞票（10、20、50元）",
    ],
    pros: [
      "Universal acceptance",
      "No technology required",
      "Best for bargaining",
      "Essential backup",
    ],
    cons: ["Risk of theft/loss", "Counterfeit risk", "No record of transactions"],
  },
];

// Stage 10: Shopping Tips
export const SHOPPING_TIPS: ShoppingTip[] = [
  {
    category: "Markets & Bargaining",
    icon: "🏪",
    tip: "Bargaining is expected at markets. Start at 30-40% of asking price.",
    tipCn: "在市场砍价是预期的。从要价的30-40%开始砍。",
    warning: "Don't bargain if you don't intend to buy",
    warningCn: "如果不打算买就不要砍价",
  },
  {
    category: "Fake/Quality Issues",
    icon: "⚠️",
    tip: "Be cautious of extremely low prices on luxury goods - likely counterfeits.",
    tipCn: "对奢侈品极低价格保持警惕——可能是假货。",
    warning: "Authenticity verification available at some malls",
    warningCn: "部分商场提供正品验证",
  },
  {
    category: "Tax Refund",
    icon: "💰",
    tip: "You can get VAT refund on purchases over 500 CNY at participating stores.",
    tipCn: "在参与活动的商店购买超过500元可获得增值税退税。",
    warning: "Keep the invoice and get tax refund form at store",
    warningCn: "保留发票并在商店获取退税单",
  },
  {
    category: "Delivery Services",
    icon: "📦",
    tip: "Most stores offer delivery to hotel - negotiate this service.",
    tipCn: "大多数商店提供送货到酒店——可以谈这个服务。",
    warning: "Confirm total cost including delivery before agreeing",
    warningCn: "同意前确认包含运费的总额",
  },
  {
    category: "Payment Methods",
    icon: "💳",
    tip: "Use card for large purchases (safer, easier for returns). Cash for markets.",
    tipCn: "大件用卡支付（更安全，退货更容易）。市场用现金。",
    warning: "Some stores have minimum card purchase amount",
    warningCn: "部分商店有最低刷卡消费额",
  },
  {
    category: "Restaurants",
    icon: "🍜",
    tip: "Check menu prices before sitting - some tourist spots overcharge.",
    tipCn: "入座前查看菜单价格——部分景区餐厅收费过高。",
    warning: "Look for bilingual menus with prices listed",
    warningCn: "寻找标有价格的双语菜单",
  },
];

export const ATM_LOCATIONS = [
  {
    bank: "ICBC (Industrial and Commercial Bank)",
    icon: "🏦",
    notes: "Most ATMs, good for international cards",
  },
  { bank: "Bank of China (BOC)", icon: "🏦", notes: "Wide coverage, reliable service" },
  { bank: "China Construction Bank (CCB)", icon: "🏦", notes: "Good for Visa/Mastercard" },
  { bank: "HSBC", icon: "🏦", notes: "Best for foreign cardholders" },
  { bank: "Standard Chartered", icon: "🏦", notes: "Good exchange rates" },
];

export const PAYMENT_FAQS = [
  {
    question: "Do I need a Chinese bank account for mobile payments?",
    answer:
      "Foreign credit cards now work with Alipay and WeChat Pay, but with limitations. For full features, a Chinese bank account is helpful but not always required.",
  },
  {
    question: "Is it safe to use mobile payments?",
    answer:
      "Yes, mobile payments in China are very secure. Alipay and WeChat have millions of users with strong security measures. Use biometric verification for large transactions.",
  },
  {
    question: "What if my card is declined?",
    answer:
      "Try a different payment method, ensure you have sufficient funds in local currency, or use an ATM for cash withdrawal. Contact your bank to ensure international transactions are enabled.",
  },
  {
    question: "Can I get a refund if I pay with mobile and need to return goods?",
    answer:
      "Yes, refunds go back to the original payment method. Process may take 3-7 business days. Keep proof of purchase and communicate in Chinese if possible.",
  },
  {
    question: "What exchange rate should I expect?",
    answer:
      "Bank exchange rates are competitive. Avoid street exchange. Use card payments when possible for transparent rates. Compare rates on XE or Google before large transactions.",
  },
  {
    question: "How much cash should I bring?",
    answer:
      "For emergencies, carry 500-1000 CNY equivalent in local currency. Most urban places accept mobile payment. Rural areas may need more cash.",
  },
];
