/**
 * App Recommendations Component
 * Suggests useful apps for foreigners in China with English/multilingual support
 */

export interface AppRecommendation {
  id: string;
  name: string;
  nameZh: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  category: AppCategory;
  appStoreUrl?: string;
  androidUrl?: string;
  hasEnglish: boolean;
  isEssential: boolean;
  affiliateLink?: string;
  commission?: string;
  affiliateNote?: string;
}

export type AppCategory =
  | "payment"
  | "transport"
  | "social"
  | "travel"
  | "food"
  | "utilities"
  | "language"
  | "maps"
  | "connectivity";

export const APP_CATEGORIES: Record<AppCategory, { label: string; labelZh: string; icon: string }> =
  {
    payment: { label: "Payment", labelZh: "支付", icon: "💳" },
    transport: { label: "Transport", labelZh: "出行", icon: "🚗" },
    social: { label: "Social", labelZh: "社交", icon: "💬" },
    travel: { label: "Travel", labelZh: "旅行", icon: "✈️" },
    food: { label: "Food", labelZh: "美食", icon: "🍜" },
    utilities: { label: "Utilities", labelZh: "工具", icon: "🔧" },
    language: { label: "Language", labelZh: "语言", icon: "📚" },
    maps: { label: "Maps", labelZh: "地图", icon: "🗺️" },
    connectivity: { label: "Connectivity", labelZh: "上网", icon: "📶" },
  };

export const APP_RECOMMENDATIONS: AppRecommendation[] = [
  // Payment - Essential
  {
    id: "wechat",
    name: "WeChat",
    nameZh: "微信",
    nameEn: "WeChat",
    description: "Essential messaging, payments, mini-programs",
    descriptionEn:
      "Essential messaging, payments, mini-programs, and social platform for daily life in China. Supports English interface.",
    icon: "💬",
    category: "payment",
    appStoreUrl: "https://apps.apple.com/app/wechat/id414478124",
    androidUrl: "https://play.google.com/store/apps/details?id=com.tencent.mm",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "alipay",
    name: "Alipay",
    nameZh: "支付宝",
    nameEn: "Alipay",
    description: "Payment, transfers, government services",
    descriptionEn:
      "China's dominant payment app. Pay anywhere, transfer money, access government services. Full English support available.",
    icon: "💰",
    category: "payment",
    appStoreUrl: "https://apps.apple.com/app/alipay/id333206289",
    androidUrl: "https://play.google.com/store/apps/details?id=com.eg.android.AlipayGphone",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "wechat-pay",
    name: "WeChat Pay",
    nameZh: "微信支付",
    nameEn: "WeChat Pay",
    description: "QR payments, split bills, store payments",
    descriptionEn:
      "Link your foreign card to WeChat Pay for QR code payments at stores and restaurants throughout China.",
    icon: "💳",
    category: "payment",
    appStoreUrl: "https://apps.apple.com/app/wechat/id414478124",
    hasEnglish: true,
    isEssential: true,
  },

  // Transport
  {
    id: "didi",
    name: "DiDi",
    nameZh: "滴滴出行",
    nameEn: "DiDi",
    description: "Taxi, ride-hailing with English interface",
    descriptionEn:
      "Book taxis, private cars, and rides with English interface. Supports international credit cards and English destination input.",
    icon: "🚗",
    category: "transport",
    appStoreUrl: "https://apps.apple.com/app/didi-passenger/id1138808114",
    androidUrl: "https://play.google.com/store/apps/details?id=com.sdu.didi.psnger",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "ctrip",
    name: "Trip.com",
    nameZh: "携程",
    nameEn: "Trip.com",
    description: "Flights, hotels, trains - full English",
    descriptionEn:
      "Book flights, hotels, trains, and tours with full English interface. Excellent for international travelers. Join affiliate program for commissions on bookings.",
    icon: "✈️",
    category: "travel",
    appStoreUrl: "https://apps.apple.com/app/trip-com-flights-hotels/id616396150",
    androidUrl: "https://play.google.com/store/apps/details?id=ctrip.android.view",
    hasEnglish: true,
    isEssential: true,
    affiliateLink: "https://www.trip.com/partners",
    commission: "2-7%",
  },
  {
    id: "baidu-maps",
    name: "Baidu Maps",
    nameZh: "百度地图",
    nameEn: "Baidu Maps",
    description: "Maps with English place names, navigation",
    descriptionEn:
      "Navigate with turn-by-turn directions in English. Search places using English. Works offline with download.",
    icon: "🗺️",
    category: "maps",
    appStoreUrl: "https://apps.apple.com/app/bidu-maps/id452696370",
    androidUrl: "https://play.google.com/store/apps/details?id=com.baidu.BaiduMap",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "amap",
    name: "Amap (AutoNavi)",
    nameZh: "高德地图",
    nameEn: "Amap",
    description: "Precise navigation, real-time traffic",
    descriptionEn:
      "High-precision navigation, real-time traffic updates, and walking directions. Popular among locals.",
    icon: "🗺️",
    category: "maps",
    appStoreUrl: "https://apps.apple.com/app/autonavi-maps/id572143177",
    androidUrl: "https://play.google.com/store/apps/details?id=com.autonavi.minimap",
    hasEnglish: true,
    isEssential: false,
  },

  // Food
  {
    id: "meituan",
    name: "Meituan",
    nameZh: "美团",
    nameEn: "Meituan",
    description: "Food delivery, restaurant reviews, deals",
    descriptionEn:
      "Order food delivery, browse restaurant menus (with translation), find deals. Has English menu feature for local restaurants.",
    icon: "🍜",
    category: "food",
    appStoreUrl: "https://apps.apple.com/app/meituan-takeaway-food-ordering/id938124123",
    androidUrl: "https://play.google.com/store/apps/details?id=com.sankuai.meituan",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "ele-me",
    name: "Ele.me",
    nameZh: "饿了么",
    nameEn: "Ele.me",
    description: "Food delivery with real-time tracking",
    descriptionEn:
      "Major food delivery platform with wide restaurant coverage. Track your order in real-time.",
    icon: "🍔",
    category: "food",
    appStoreUrl: "https://apps.apple.com/app/ele-me-food-delivery/id1071811712",
    androidUrl: "https://play.google.com/store/apps/details?id=me.ele",
    hasEnglish: false,
    isEssential: false,
  },

  // Language & Utilities
  {
    id: "pleco",
    name: "Pleco",
    nameZh: "Pleco",
    nameEn: "Pleco Chinese Dictionary",
    description: "Best Chinese dictionary with OCR",
    descriptionEn:
      "The ultimate Chinese learning companion. Camera OCR, flash cards, example sentences. Essential for reading menus and signs.",
    icon: "📚",
    category: "language",
    appStoreUrl: "https://apps.apple.com/app/pleco-document-camera-ocr/id384387940",
    androidUrl: "https://play.google.com/store/apps/details?id=com.pleco.chinesesystem",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "google-translate",
    name: "Google Translate",
    nameZh: "谷歌翻译",
    nameEn: "Google Translate",
    description: "Chinese translation with camera",
    descriptionEn:
      "Point your camera at Chinese text for instant translation. Download offline Chinese language pack.",
    icon: "🌐",
    category: "language",
    appStoreUrl: "https://apps.apple.com/app/google-translate/id469823299",
    androidUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.translate",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "chatgpt-translator",
    name: "Translate with ChatGPT",
    nameZh: "AI翻译",
    nameEn: "AI Translation",
    description: "Accurate AI-powered translation",
    descriptionEn:
      "More accurate than Google for nuanced Chinese. Great for menu translation and conversations.",
    icon: "🤖",
    category: "language",
    hasEnglish: true,
    isEssential: false,
  },

  // Social & Travel
  {
    id: "xiaohongshu",
    name: "Xiaohongshu (RED)",
    nameZh: "小红书",
    nameEn: "Xiaohongshu",
    description: "Social discovery, local recommendations",
    descriptionEn:
      "Chinese social platform with local recommendations, reviews, and travel guides. Great for finding hidden gems and local tips.",
    icon: "📕",
    category: "social",
    appStoreUrl: "https://apps.apple.com/app/xiaohongshu/id741292507",
    androidUrl: "https://play.google.com/store/apps/details?id=com.xingin.xhs",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    nameZh: "TripAdvisor",
    nameEn: "TripAdvisor",
    description: "English reviews, travel planning",
    descriptionEn:
      "English-language reviews for restaurants, attractions, and hotels in China. Good for cross-referencing recommendations.",
    icon: "🏨",
    category: "travel",
    appStoreUrl: "https://apps.apple.com/app/tripadvisor-hotels-flights/id284876795",
    androidUrl: "https://play.google.com/store/apps/details?id=com.tripadvisor.tripadvisor",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "163-mail",
    name: "NetEase Mail",
    nameZh: "163邮箱",
    nameEn: "163 Mail",
    description: "Email with English interface",
    descriptionEn:
      "Free email service often needed for Chinese app registrations. Clean English interface.",
    icon: "📧",
    category: "utilities",
    appStoreUrl: "https://apps.apple.com/app/163-mail/id413948029",
    androidUrl: "https://play.google.com/store/apps/details?id=com.netease.mail",
    hasEnglish: false,
    isEssential: false,
  },

  // Train & Transport
  {
    id: "train-ticket",
    name: "Trip.com Trains",
    nameZh: "携程火车票",
    nameEn: "Trip.com Trains",
    description: "Book high-speed train tickets",
    descriptionEn:
      "Easy train ticket booking with English interface. Supports international credit cards.",
    icon: "🚄",
    category: "transport",
    appStoreUrl: "https://apps.apple.com/app/trip-com-flights-hotels/id616396150",
    androidUrl: "https://play.google.com/store/apps/details?id=ctrip.android.view",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "shanghai-metro",
    name: "Metro Now",
    nameZh: "metro大都会",
    nameEn: "Metro Now",
    description: "Metro QR code payment",
    descriptionEn:
      "Scan QR codes to enter metro stations in Shanghai and other cities. Links to Alipay/WeChat Pay.",
    icon: "🚇",
    category: "transport",
    appStoreUrl: "https://apps.apple.com/app/metro%E5%A4%A7%E9%83%BD%E4%BC%9A/id1202750238",
    androidUrl: "https://play.google.com/store/apps/details?id=com.stec.smartmetro",
    hasEnglish: false,
    isEssential: false,
  },
  // New Apps from Research
  {
    id: "dianping",
    name: "Dianping",
    nameZh: "大众点评",
    nameEn: "Dianping",
    description: "Restaurant reviews, deals, booking",
    descriptionEn:
      "The Yelp+Groupon of China. Browse restaurant reviews, find deals, and book tables. English interface available.",
    icon: "🍽️",
    category: "food",
    appStoreUrl: "https://apps.apple.com/app/dianping/id423433029",
    androidUrl: "https://play.google.com/store/apps/details?id=com.dianping.v1",
    hasEnglish: true,
    isEssential: true,
  },
  {
    id: "wise",
    name: "Wise (TransferWise)",
    nameZh: "Wise",
    nameEn: "Wise",
    description: "International transfers, travel card",
    descriptionEn:
      "Best rates for currency exchange. Get a Wise card for travel with real exchange rates and low fees in China.",
    icon: "💳",
    category: "payment",
    appStoreUrl: "https://apps.apple.com/app/wise-money/id1304618831",
    androidUrl: "https://play.google.com/store/apps/details?id=com.transferwise.android",
    hasEnglish: true,
    isEssential: true,
    affiliateLink: "https://wise.com/",
  },
  {
    id: "airalo",
    name: "Airalo eSIM",
    nameZh: "Airalo eSIM",
    nameEn: "Airalo eSIM",
    description: "eSIM data plans for China",
    descriptionEn:
      "Stay connected in China with affordable eSIM data plans. No physical SIM needed. Supports China data packages.",
    icon: "📱",
    category: "connectivity",
    appStoreUrl: "https://apps.apple.com/app/airalo-esim/id1486867646",
    androidUrl: "https://play.google.com/store/apps/details?id=com.mobillium.airalo",
    hasEnglish: true,
    isEssential: true,
    affiliateLink: "https://airalo.com/",
    commission: "10-30%",
  },
  {
    id: "holafly",
    name: "Holafly eSIM",
    nameZh: "Holafly eSIM",
    nameEn: "Holafly eSIM",
    description: "Unlimited data eSIM for China",
    descriptionEn:
      "Unlimited data plans for China. Easy setup, instant activation. Perfect for travelers who need reliable internet.",
    icon: "🌏",
    category: "connectivity",
    appStoreUrl: "https://apps.apple.com/app/holafly-esim-unlimited-data/id1511917051",
    androidUrl: "https://play.google.com/store/apps/details?id=com.holafly.holafly",
    hasEnglish: true,
    isEssential: false,
    affiliateLink: "https://holafly.com/",
    commission: "10-30%",
  },
  {
    id: "nihao-travel",
    name: "Nihao China",
    nameZh: "你好中国",
    nameEn: "Nihao China",
    description: "Setup service for foreigners",
    descriptionEn:
      "Helps foreigners set up WeChat Pay, Alipay, and other Chinese apps. English support and guided assistance.",
    icon: "🤝",
    category: "utilities",
    appStoreUrl: "https://apps.apple.com/app/nihao-china/id1630264602",
    hasEnglish: true,
    isEssential: false,
    affiliateLink: "https://nihaocn.com/",
  },
];

export function getAppsByCategory(category: AppCategory): AppRecommendation[] {
  return APP_RECOMMENDATIONS.filter((app) => app.category === category);
}

export function getEssentialApps(): AppRecommendation[] {
  return APP_RECOMMENDATIONS.filter((app) => app.isEssential);
}

export function getAppsByCategories(categories: AppCategory[]): AppRecommendation[] {
  return APP_RECOMMENDATIONS.filter((app) => categories.includes(app.category));
}

export function getEnglishFriendlyApps(): AppRecommendation[] {
  return APP_RECOMMENDATIONS.filter((app) => app.hasEnglish);
}
