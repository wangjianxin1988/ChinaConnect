// i18n translations for ChinaConnect
// 12 Languages: English, Japanese, Korean, Simplified Chinese, Traditional Chinese, Thai, Vietnamese, Russian, French, German, Arabic, Persian

export type Language =
  | "en" // English
  | "ja" // Japanese
  | "ko" // Korean
  | "zh-CN" // Simplified Chinese
  | "zh-TW" // Traditional Chinese
  | "th" // Thai
  | "vi" // Vietnamese
  | "ru" // Russian
  | "fr" // French
  | "de" // German
  | "ar" // Arabic
  | "fa"; // Persian

export const SUPPORTED_LANGUAGES: {
  code: Language;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", dir: "ltr" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย", dir: "ltr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl" },
];

export const RTL_LANGUAGES: Language[] = ["ar", "fa"];
export const CJK_LANGUAGES: Language[] = ["ja", "ko", "zh-CN", "zh-TW"];

export function isRTL(lang: Language): boolean {
  return RTL_LANGUAGES.includes(lang);
}

export function isCJK(lang: Language): boolean {
  return CJK_LANGUAGES.includes(lang);
}

export interface Translations {
  // Navigation
  nav: {
    home: string;
    cities: string;
    restaurants: string;
    aiChat: string;
    guide: string;
    business: string;
    tagline: string;
    [key: string]: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    search: string;
    filter: string;
    sort: string;
    all: string;
    seeMore: string;
    viewAll: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
  };
  // Home
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroCTA: string;
    exploreCities: string;
    statsCities: string;
    statsRestaurants: string;
    statsAttractions: string;
    statsAI: string;
    featuresTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    [key: string]: string;
  };
  // Cities
  cities: {
    title: string;
    subtitle: string;
    exploreGuide: string;
    attractions: string;
    restaurants: string;
    transport: string;
    hotels: string;
    payment: string;
    culturalTips: string;
    emergency: string;
    recommendedTime: string;
    ticketPrice: string;
    openingHours: string;
    [key: string]: string;
  };
  // Restaurants
  restaurants: {
    title: string;
    subtitle: string;
    michelin: string;
    blackPearl: string;
    local: string;
    avgPrice: string;
    rating: string;
    cuisine: string;
    address: string;
    hours: string;
    dishes: string;
    tags: string;
  };
  // Empty states
  empty: {
    noResults: string;
    noRestaurants: string;
    noAttractions: string;
    noSearchResults: string;
    tryAdjusting: string;
    noFavorites: string;
    addSome: string;
  };
  // Errors
  errors: {
    loadFailed: string;
    networkError: string;
    somethingWrong: string;
    goBack: string;
    goHome: string;
  };
  // Onboarding
  onboarding: {
    welcome: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    getStarted: string;
    skip: string;
    next: string;
    done: string;
  };
  // Tooltips
  tooltips: {
    searchTip: string;
    filterTip: string;
    mapTip: string;
    favoritesTip: string;
    shareTip: string;
  };
  // Recently viewed / Recommendations
  recents: {
    recentlyViewed: string;
    recommended: string;
    clearHistory: string;
    forYou: string;
  };
  // Features section
  features: {
    restaurantGuide: string;
    restaurantGuideDesc: string;
    attractions: string;
    attractionsDesc: string;
    transport: string;
    transportDesc: string;
    emergency: string;
    emergencyDesc: string;
    payment: string;
    paymentDesc: string;
    accommodation: string;
    accommodationDesc: string;
    culturalTips: string;
    culturalTipsDesc: string;
    aiAssistant: string;
    aiAssistantDesc: string;
  };
  // Language
  language: {
    switchTo: string;
    current: string;
    english: string;
    chinese: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      cities: "Cities",
      restaurants: "Restaurants",
      aiChat: "AI Concierge",
      guide: "Travel Guide",
      business: "Business Express",
      tagline: "Explore China with AI",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
      cancel: "Cancel",
      confirm: "Confirm",
      search: "Search...",
      filter: "Filter",
      sort: "Sort",
      all: "All",
      seeMore: "See More",
      viewAll: "View All",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      open: "Open"
    },
    home: {
      heroTitle: "Your AI-Powered China Guide",
      heroSubtitle: "Your trusted guide to China's best cities",
      heroCTA: "Ask AI for Trip Advice",
      exploreCities: "Explore Cities",
      statsCities: "Cities Covered",
      statsRestaurants: "Michelin Restaurants",
      statsAttractions: "Top Attractions",
      statsAI: "AI Assistance",
      featuresTitle: "Everything You Need for Your China Trip",
      ctaTitle: "Ready to Explore China?",
      ctaSubtitle: "Start planning your trip with AI-powered recommendations."
    },
    cities: {
      title: "Explore Our Cities",
      subtitle: "From ancient capitals to modern metropolises",
      exploreGuide: "Explore Guide",
      attractions: "Attractions",
      restaurants: "Restaurants",
      transport: "Transport",
      hotels: "Hotels",
      payment: "Payment",
      culturalTips: "Cultural Tips",
      emergency: "Emergency",
      recommendedTime: "Recommended Visit",
      ticketPrice: "Ticket",
      openingHours: "Hours"
    },
    restaurants: {
      title: "Restaurant Guide",
      subtitle: "Michelin stars, Black Pearl rankings, and local favorites",
      michelin: "Michelin",
      blackPearl: "Black Pearl",
      local: "Local Favorite",
      avgPrice: "Avg Price",
      rating: "Rating",
      cuisine: "Cuisine",
      address: "Address",
      hours: "Hours",
      dishes: "Signature Dishes",
      tags: "Tags"
    },
    empty: {
      noResults: "No results found",
      noRestaurants: "No restaurants match your criteria",
      noAttractions: "No attractions found",
      noSearchResults: "No results for your search",
      tryAdjusting: "Try adjusting your filters or search terms",
      noFavorites: "No favorites yet",
      addSome: "Start exploring and save your favorites!"
    },
    errors: {
      loadFailed: "Failed to load content",
      networkError: "Network error. Please check your connection.",
      somethingWrong: "Something went wrong",
      goBack: "Go Back",
      goHome: "Go to Homepage"
    },
    onboarding: {
      welcome: "Welcome to ChinaConnect!",
      step1Title: "Discover Great Food",
      step1Desc: "Find Michelin-starred and Black Pearl restaurants in 12 Chinese cities.",
      step2Title: "AI-Powered Tips",
      step2Desc: "Get personalized recommendations and insider knowledge from our AI assistant.",
      step3Title: "Travel with Confidence",
      step3Desc: "Access emergency contacts, transport info, and cultural tips all in one place.",
      getStarted: "Get Started",
      skip: "Skip",
      next: "Next",
      done: "Done"
    },
    tooltips: {
      searchTip: "Search cities, restaurants, or topics",
      filterTip: "Filter by cuisine, rating, or price",
      mapTip: "View on map",
      favoritesTip: "Add to favorites",
      shareTip: "Share with friends"
    },
    recents: {
      recentlyViewed: "Recently Viewed",
      recommended: "Recommended for You",
      clearHistory: "Clear History",
      forYou: "Because you visited {city}"
    },
    // Features section
    features: {
      restaurantGuide: "Restaurant Guide",
      restaurantGuideDesc: "Michelin stars, Black Pearl rankings, and local favorites with detailed reviews",
      attractions: "Attractions",
      attractionsDesc: "Top-rated attractions with opening hours, tickets, and local tips",
      transport: "Transport",
      transportDesc: "How to get there and around - flights, trains, metro, and local tips",
      emergency: "Emergency",
      emergencyDesc: "Hospital, police, embassy contacts and important phone numbers",
      payment: "Payment Guide",
      paymentDesc: "Alipay, WeChat Pay, cash tips, and card acceptance info",
      accommodation: "Accommodation",
      accommodationDesc: "Hotel recommendations for every budget from luxury to budget",
      culturalTips: "Cultural Tips",
      culturalTipsDesc: "Local customs, etiquette, and cultural insights for each city",
      aiAssistant: "AI Assistant",
      aiAssistantDesc: "Ask questions in English, get instant answers about China travel",
    },
    language: {
      switchTo: "Switch to",
      current: "Current",
      english: "English",
      chinese: "Chinese"
    }
    },

  ja: {
    nav: {
      home: "ホーム",
      cities: "都市",
      restaurants: "レストラン",
      aiChat: "AI コンシェルジュ",
      guide: "旅行ガイド",
      business: "ビジネスエクスプレス",
      tagline: "AIと一緒に中国を探索",
    },
    common: {
      loading: "読み込み中...",
      error: "エラー",
      retry: "再試行",
      cancel: "キャンセル",
      confirm: "確認",
      search: "検索...",
      filter: "フィルター",
      sort: "並び替え",
      all: "すべて",
      seeMore: "もっと見る",
      viewAll: "すべて見る",
      back: "戻る",
      next: "次へ",
      previous: "前へ",
      close: "閉じる",
      open: "開く"
    },
    home: {
      heroTitle: "AIで中国を巡る",
      heroSubtitle: "中国の都市を巡る信頼できるガイド",
      heroCTA: "AIに旅程を相談",
      exploreCities: "都市を探す",
      statsCities: "対応都市",
      statsRestaurants: "ミシュランレストラン",
      statsAttractions: "人気景点",
      statsAI: "AIアシスタント",
      featuresTitle: "中国旅行に必要なすべて",
      ctaTitle: "中国探索の準備はできましたか？",
      ctaSubtitle: "AIを活用したおすすめで旅程を計画しましょう。"
    },
    cities: {
      title: "都市を探す",
      exploreGuide: "ガイドを見る",
      subtitle: "古代の首都から現代の大都市まで",
      attractions: "景点",
      restaurants: "レストラン",
      transport: "交通",
      hotels: "ホテル",
      payment: "決済",
      culturalTips: "文化ガイド",
      emergency: "緊急連絡先",
      recommendedTime: "最佳訪問時間",
      ticketPrice: "チケット",
      openingHours: "営業時間"
    },
    restaurants: {
      title: "レストランガイド",
      subtitle: "ミシュラン星级、黒真珠レストラン、地元のおすすめ",
      michelin: "ミシュラン",
      blackPearl: "黒真珠",
      local: "地元おすすめ",
      avgPrice: "平均価格",
      rating: "評価",
      cuisine: "料理",
      address: "住所",
      hours: "営業時間",
      dishes: "おすすめ料理",
      tags: "タグ"
    },
    empty: {
      noResults: "結果が見つかりません",
      noRestaurants: "条件に 맞는レストランがありません",
      noAttractions: "景点が見つかりません",
      noSearchResults: "検索結果がありません",
      tryAdjusting: "フィルターまたは検索語を調整してみてください",
      noFavorites: "お気に入りがまだありません",
      addSome: "探索してお気に入りを追加しましょう！"
    },
    errors: {
      loadFailed: "コンテンツの読み込みに失敗しました",
      networkError: "ネットワークエラー。接続を確認してください。",
      somethingWrong: "問題が発生しました",
      goBack: "戻る",
      goHome: "ホームページへ"
    },
    onboarding: {
      welcome: "ChinaConnectへようこそ！",
      step1Title: "素晴らしい料理を発見",
      step1Desc: "12的中国都市でミシュラン星级・黒真珠レストランを見つけましょう。",
      step2Title: "AIパワーのお手伝い",
      step2Desc: "AIアシスタントからパーソナライズされたおすすめとインサイトを入手。",
      step3Title: "安心な旅行を",
      step3Desc: "緊急連絡先、交通情報、文化ガイドを一度に確認。",
      getStarted: "始める",
      skip: "スキップ",
      next: "次へ",
      done: "完了"
    },
    tooltips: {
      searchTip: "都市、レストラン、トピックを検索",
      filterTip: "料理、評価、価格で確認",
      mapTip: "地図で表示",
      favoritesTip: "お気に入りに追加",
      shareTip: "友達にシェア"
    },
    recents: {
      recentlyViewed: "最近見た",
      recommended: "おすすめ",
      clearHistory: "履歴をクリア",
      forYou: "{city}を見た的你へのおすすめ"
    },
    // Features section
    features: {
      restaurantGuide: "レストランガイド",
      restaurantGuideDesc: "ミシュラン星、黒真珠ランキング、地元のお気に入りを詳細レビュー付きで紹介",
      attractions: "観光名所",
      attractionsDesc: "営業時間、チケット、現地 tips を含むトップ評価の観光名所",
      transport: "交通",
      transportDesc: "行き方と移動手段 - 飛行機、電車、地下鉄、現地 tips",
      emergency: "緊急時",
      emergencyDesc: "病院、警察、大使館の連絡先と重要な電話番号",
      payment: "支払いガイド",
      paymentDesc: "Alipay、WeChat Pay、現金 tips、カード利用情報",
      accommodation: "宿泊",
      accommodationDesc: "高級から予算まで、あらゆる予算のホテル推奨",
      culturalTips: "文化 tips",
      culturalTipsDesc: "現地の習慣、エチケット、各都市の文化的な洞察",
      aiAssistant: "AI アシスタント",
      aiAssistantDesc: "中国旅行について英語で質問し、すぐに回答を得る",
    },
    language: {
      switchTo: "切り替える",
      current: "現在",
      english: "英語",
      chinese: "中国語"
    }
    },

  ko: {
    nav: {
      home: "홈",
      cities: "도시",
      restaurants: "음식점",
      aiChat: "AI 컨시어지",
      guide: "여행 가이드",
      business: "비즈니스 익스프레스",
      tagline: "AI와 함께 중국 탐험",
    },
    common: {
      loading: "로딩 중...",
      error: "오류",
      retry: "다시 시도",
      cancel: "취소",
      confirm: "확인",
      search: "검색...",
      filter: "필터",
      sort: "정렬",
      all: "전체",
      seeMore: "더보기",
      viewAll: "전체 보기",
      back: "뒤로",
      next: "다음",
      previous: "이전",
      close: "닫기",
      open: "열기"
    },
    home: {
      heroTitle: "AI로 중국 탐험",
      heroSubtitle: "중국 최고의 도시를 위한 신뢰할 수 있는 가이드",
      heroCTA: "AI에게 여행 조언 받기",
      exploreCities: "도시 탐험",
      statsCities: "커버 도시",
      statsRestaurants: "미슐랭레스토랑",
      statsAttractions: "인기 명소",
      statsAI: "AI 어시스턴트",
      featuresTitle: "중국 여행에 필요한 모든 것",
      ctaTitle: "중국 탐험을 준비하셨나요?",
      ctaSubtitle: "AI 기반 추천으로 여행을 계획하세요."
    },
    cities: {
      title: "도시 탐험",
      exploreGuide: "가이드 보기",
      subtitle: "고대 수도에서 현대 대도시까지",
      attractions: "명소",
      restaurants: "음식점",
      transport: "교통",
      hotels: "호텔",
      payment: "결제",
      culturalTips: "문화 팁",
      emergency: "비상 연락처",
      recommendedTime: "추천 방문 시간",
      ticketPrice: "티켓",
      openingHours: "운영 시간"
    },
    restaurants: {
      title: "음식점 가이드",
      subtitle: "미슐랭 스타, 블랙 펄, 현지 인기 맛집",
      michelin: "미슐랭",
      blackPearl: "블랙 펄",
      local: "현지 추천",
      avgPrice: "평균 가격",
      rating: "평점",
      cuisine: "요리",
      address: "주소",
      hours: "운영 시간",
      dishes: "시그니처 요리",
      tags: "태그"
    },
    empty: {
      noResults: "결과 없음",
      noRestaurants: "조건에 맞는 음식점 없음",
      noAttractions: "명소 없음",
      noSearchResults: "검색 결과 없음",
      tryAdjusting: "필터 또는 검색어 조정",
      noFavorites: "아직 즐겨찾기 없음",
      addSome: "탐험을 시작하고 즐겨찾기에 추가하세요!"
    },
    errors: {
      loadFailed: "콘텐츠 로드 실패",
      networkError: "네트워크 오류. 연결을 확인하세요.",
      somethingWrong: "문제가 발생했습니다",
      goBack: "뒤로 가기",
      goHome: "홈으로 가기"
    },
    onboarding: {
      welcome: "ChinaConnect에 오신 것을 환영합니다!",
      step1Title: "좋은 음식 발견",
      step1Desc: "12개 중국 도시에서 미슐랭 및 블랙 펄 레스토랑을 찾으세요.",
      step2Title: "AI 기반 팁",
      step2Desc: "AI 어시스턴트에서 개인화된 추천과 내부 정보를 확인하세요.",
      step3Title: "안심하고 여행하기",
      step3Desc: "비상 연락처, 교통 정보, 문화 팁을 한 곳에서 확인하세요.",
      getStarted: "시작하기",
      skip: "건너뛰기",
      next: "다음",
      done: "완료"
    },
    tooltips: {
      searchTip: "도시, 음식점, 주제 검색",
      filterTip: "요리, 평점, 가격으로 필터",
      mapTip: "지도로 보기",
      favoritesTip: "즐겨찾기에 추가",
      shareTip: "친구와 공유"
    },
    recents: {
      recentlyViewed: "최근 본 것",
      recommended: "추천",
      clearHistory: "기록 지우기",
      forYou: "{city}을 본 당신을 위한 추천"
    },
    // Features section
    features: {
      restaurantGuide: "레스토랑 가이드",
      restaurantGuideDesc: "미슐랭 스타, 블랙펄 랭킹, 그리고 상세한 리뷰와 함께하는 현지 인기 식당",
      attractions: "관광 명소",
      attractionsDesc: "운영 시간, 티켓, 현지 팁이 포함된 최고 평점 관광 명소",
      transport: "교통",
      transportDesc: "가는 법과 이동 수단 - 항공편, 기차, 지하철, 현지 팁",
      emergency: "긴급 상황",
      emergencyDesc: "병원, 경찰, 대사관 연락처 및 중요한 전화번호",
      payment: "결제 가이드",
      paymentDesc: "Alipay, WeChat Pay, 현금 팁, 카드 사용 정보",
      accommodation: "숙박",
      accommodationDesc: "럭셔리부터 예산까지 모든 예산의 호텔 추천",
      culturalTips: "문화 팁",
      culturalTipsDesc: "현지 관습, 에티켓, 각 도시의 문화 통찰",
      aiAssistant: "AI 어시스턴트",
      aiAssistantDesc: "중국 여행에 대한 질문을 영어로 하고 즉각적인 답변 받기",
    },
    language: {
      switchTo: "전환",
      current: "현재",
      english: "영어",
      chinese: "중국어"
    }
    },

  "zh-CN": {
    nav: {
      home: "首页",
      cities: "城市",
      restaurants: "餐厅",
      aiChat: "AI 管家",
      guide: "旅游指南",
      business: "商务快车",
      tagline: "AI 探索中国",
    },
    common: {
      loading: "加载中...",
      error: "错误",
      retry: "重试",
      cancel: "取消",
      confirm: "确认",
      search: "搜索...",
      filter: "筛选",
      sort: "排序",
      all: "全部",
      seeMore: "查看更多",
      viewAll: "查看全部",
      back: "返回",
      next: "下一步",
      previous: "上一步",
      close: "关闭",
      open: "打开"
    },
    home: {
      heroTitle: "用AI探索中国",
      heroSubtitle: "您值得信赖的中国城市指南",
      heroCTA: "向AI咨询行程建议",
      exploreCities: "探索城市",
      statsCities: "覆盖城市",
      statsRestaurants: "米其林餐厅",
      statsAttractions: "热门景点",
      statsAI: "AI助手",
      featuresTitle: "您中国之旅所需的一切",
      ctaTitle: "准备好探索中国了吗？",
      ctaSubtitle: "开始使用AI驱动的推荐来规划您的行程。"
    },
    cities: {
      title: "探索我们的城市",
      exploreGuide: "探索指南",
      subtitle: "从千年古都到现代都市",
      attractions: "景点",
      restaurants: "餐厅",
      transport: "交通",
      hotels: "酒店",
      payment: "支付",
      culturalTips: "文化提示",
      emergency: "紧急联系",
      recommendedTime: "建议游览时间",
      ticketPrice: "门票",
      openingHours: "营业时间"
    },
    restaurants: {
      title: "餐厅指南",
      subtitle: "米其林星级、黑珍珠餐厅和本地美食",
      michelin: "米其林",
      blackPearl: "黑珍珠",
      local: "本地推荐",
      avgPrice: "人均价格",
      rating: "评分",
      cuisine: "菜系",
      address: "地址",
      hours: "营业时间",
      dishes: "招牌菜",
      tags: "标签"
    },
    empty: {
      noResults: "未找到结果",
      noRestaurants: "没有符合条件的餐厅",
      noAttractions: "未找到景点",
      noSearchResults: "搜索无结果",
      tryAdjusting: "尝试调整筛选条件或搜索关键词",
      noFavorites: "暂无收藏",
      addSome: "开始探索并收藏您喜欢的！"
    },
    errors: {
      loadFailed: "加载内容失败",
      networkError: "网络错误，请检查您的连接。",
      somethingWrong: "出错了",
      goBack: "返回",
      goHome: "返回首页"
    },
    onboarding: {
      welcome: "欢迎使用ChinaConnect！",
      step1Title: "发现美食",
      step1Desc: "在12个中国城市找到米其林星级和黑珍珠餐厅。",
      step2Title: "AI智能推荐",
      step2Desc: "从我们的AI助手获得个性化推荐和内部知识。",
      step3Title: "安心出行",
      step3Desc: "在一个地方获取紧急联系、交通信息和文化提示。",
      getStarted: "开始使用",
      skip: "跳过",
      next: "下一步",
      done: "完成"
    },
    tooltips: {
      searchTip: "搜索城市、餐厅或主题",
      filterTip: "按菜系、评分或价格筛选",
      mapTip: "在地图上查看",
      favoritesTip: "添加到收藏",
      shareTip: "分享给朋友"
    },
    recents: {
      recentlyViewed: "最近浏览",
      recommended: "为您推荐",
      clearHistory: "清除历史",
      forYou: "因为您浏览了{city}"
    },
    // Features section
    features: {
      restaurantGuide: "餐厅指南",
      restaurantGuideDesc: "米其林星级、黑珍珠排名和本地最爱，配有详细评价",
      attractions: "景点",
      attractionsDesc: "顶级景点，附带开放时间、门票和本地贴士",
      transport: "交通",
      transportDesc: "如何到达和出行 - 航班、火车、地铁和本地贴士",
      emergency: "紧急联系",
      emergencyDesc: "医院、警察、大使馆联系方式和重要电话号码",
      payment: "支付指南",
      paymentDesc: "支付宝、微信支付、现金贴士和刷卡信息",
      accommodation: "住宿",
      accommodationDesc: "从豪华到经济型，各类预算的酒店推荐",
      culturalTips: "文化贴士",
      culturalTipsDesc: "各地风俗、礼仪和每个城市的文化见解",
      aiAssistant: "AI 助手",
      aiAssistantDesc: "用中文提问，立刻获得中国旅行相关解答",
    },
    language: {
      switchTo: "切换到",
      current: "当前",
      english: "英语",
      chinese: "中文"
    }
    },

  "zh-TW": {
    nav: {
      home: "首頁",
      cities: "城市",
      restaurants: "餐廳",
      aiChat: "AI 管家",
      guide: "旅遊指南",
      business: "商務快車",
      tagline: "AI 探索中國",
    },
    common: {
      loading: "載入中...",
      error: "錯誤",
      retry: "重試",
      cancel: "取消",
      confirm: "確認",
      search: "搜尋...",
      filter: "篩選",
      sort: "排序",
      all: "全部",
      seeMore: "查看更多",
      viewAll: "查看全部",
      back: "返回",
      next: "下一步",
      previous: "上一步",
      close: "關閉",
      open: "打開"
    },
    home: {
      heroTitle: "用AI探索中國",
      heroSubtitle: "您值得信賴的中國城市指南",
      heroCTA: "向AI諮詢行程建議",
      exploreCities: "探索城市",
      statsCities: "覆蓋城市",
      statsRestaurants: "米其林餐廳",
      statsAttractions: "熱門景點",
      statsAI: "AI助手",
      featuresTitle: "您中國之旅所需的一切",
      ctaTitle: "準備好探索中國了嗎？",
      ctaSubtitle: "開始使用AI驅動的推薦來規劃您的行程。"
    },
    cities: {
      title: "探索我們的城市",
      exploreGuide: "探索指南",
      subtitle: "從千年古都到現代都市",
      attractions: "景點",
      restaurants: "餐廳",
      transport: "交通",
      hotels: "酒店",
      payment: "支付",
      culturalTips: "文化提示",
      emergency: "緊急聯繫",
      recommendedTime: "建議遊覽時間",
      ticketPrice: "門票",
      openingHours: "營業時間"
    },
    restaurants: {
      title: "餐廳指南",
      subtitle: "米其林星級、黑珍珠餐廳和本地美食",
      michelin: "米其林",
      blackPearl: "黑珍珠",
      local: "本地推薦",
      avgPrice: "人均價格",
      rating: "評分",
      cuisine: "菜系",
      address: "地址",
      hours: "營業時間",
      dishes: "招牌菜",
      tags: "標籤"
    },
    empty: {
      noResults: "未找到結果",
      noRestaurants: "沒有符合條件的餐廳",
      noAttractions: "未找到景點",
      noSearchResults: "搜尋無結果",
      tryAdjusting: "嘗試調整篩選條件或搜尋關鍵詞",
      noFavorites: "暫無收藏",
      addSome: "開始探索並收藏您喜歡的！"
    },
    errors: {
      loadFailed: "載入內容失敗",
      networkError: "網絡錯誤，請檢查您的連接。",
      somethingWrong: "出錯了",
      goBack: "返回",
      goHome: "返回首頁"
    },
    onboarding: {
      welcome: "歡迎使用ChinaConnect！",
      step1Title: "發現美食",
      step1Desc: "在12個中國城市找到米其林星級和黑珍珠餐廳。",
      step2Title: "AI智能推薦",
      step2Desc: "從我們的AI助手獲得個性化推薦和內部知識。",
      step3Title: "安心出行",
      step3Desc: "在一個地方獲取緊急聯繫、交通信息和文化提示。",
      getStarted: "開始使用",
      skip: "跳過",
      next: "下一步",
      done: "完成"
    },
    tooltips: {
      searchTip: "搜尋城市、餐廳或主題",
      filterTip: "按菜系、評分或價格篩選",
      mapTip: "在地圖上查看",
      favoritesTip: "添加到收藏",
      shareTip: "分享給朋友"
    },
    recents: {
      recentlyViewed: "最近瀏覽",
      recommended: "為您推薦",
      clearHistory: "清除歷史",
      forYou: "因為您瀏覽了{city}"
    },
    // Features section
    features: {
      restaurantGuide: "餐廳指南",
      restaurantGuideDesc: "米其林星級、黑珍珠排名和本地最愛，附有詳細評論",
      attractions: "景點",
      attractionsDesc: "頂級景點，附帶開放時間、門票和本地貼士",
      transport: "交通",
      transportDesc: "如何到達和出行 - 航班、火車、地鐵和本地貼士",
      emergency: "緊急聯絡",
      emergencyDesc: "醫院、警察、大使館聯絡方式和重要電話號碼",
      payment: "支付指南",
      paymentDesc: "支付寶、微信支付、現金貼士和刷卡資訊",
      accommodation: "住宿",
      accommodationDesc: "從豪華到經濟型，各類預算的飯店推薦",
      culturalTips: "文化貼士",
      culturalTipsDesc: "各地風俗、禮儀和每個城市的文化見解",
      aiAssistant: "AI 助理",
      aiAssistantDesc: "用中文提問，立即獲得中國旅行相關解答",
    },
    language: {
      switchTo: "切換到",
      current: "當前",
      english: "英語",
      chinese: "中文"
    }
    },

  th: {
    nav: {
      home: "หน้าแรก",
      cities: "เมือง",
      restaurants: "ร้านอาหาร",
      aiChat: "AI ผู้ช่วยส่วนตัว",
      guide: "คู่มือท่องเที่ยว",
      business: "ธุรกิจด่วน",
      tagline: "สำรวจจีนด้วย AI",
    },
    common: {
      loading: "กำลังโหลด...",
      error: "ข้อผิดพลาด",
      retry: "ลองอีกครั้ง",
      cancel: "ยกเลิก",
      confirm: "ยืนยัน",
      search: "ค้นหา...",
      filter: "กรอง",
      sort: "เรียงลำดับ",
      all: "ทั้งหมด",
      seeMore: "ดูเพิ่มเติม",
      viewAll: "ดูทั้งหมด",
      back: "กลับ",
      next: "ถัดไป",
      previous: "ก่อนหน้า",
      close: "ปิด",
      open: "เปิด"
    },
    home: {
      heroTitle: "สำรวจจีนกับ AI",
      heroSubtitle: "คู่มือที่เชื่อถือได้ของคุณสำหรับเมืองที่ดีที่สุดในจีน",
      heroCTA: "ถาม AI เพื่อขอคำแนะนำการเดินทาง",
      exploreCities: "สำรวจเมือง",
      statsCities: "เมืองที่ครอบคลุม",
      statsRestaurants: "ร้านอาหารมิชลิน",
      statsAttractions: "สถานที่ท่องเที่ยวยอดนิยม",
      statsAI: "ผู้ช่วย AI",
      featuresTitle: "ทุกสิ่งที่คุณต้องการสำหรับการเดินทางไปจีน",
      ctaTitle: "พร้อมสำรวจจีนหรือยัง?",
      ctaSubtitle: "เริ่มวางแผนการเดินทางของคุณด้วยคำแนะนำที่ขับเคลื่อนด้วย AI"
    },
    cities: {
      title: "สำรวจเมืองของเรา",
      exploreGuide: "สำรวจคู่มือ",
      subtitle: "จากเมืองหลวงโบราณถึงเมืองใหญ่สมัยใหม่",
      attractions: "สถานที่ท่องเที่ยว",
      restaurants: "ร้านอาหาร",
      transport: "การเดินทาง",
      hotels: "โรงแรม",
      payment: "การชำระเงิน",
      culturalTips: "เคล็ดลับวัฒนธรรม",
      emergency: "ฉุกเฉิน",
      recommendedTime: "เวลาที่แนะนำ",
      ticketPrice: "บัตร",
      openingHours: "เวลาเปิด"
    },
    restaurants: {
      title: "คู่มือร้านอาหาร",
      subtitle: "มิชลินสตาร์, แบล็กเพิร์ล, และร้านอาหารท้องถิ่นยอดนิยม",
      michelin: "มิชลิน",
      blackPearl: "แบล็กเพิร์ล",
      local: "ท้องถิ่นยอดนิยม",
      avgPrice: "ราคาเฉลี่ย",
      rating: "คะแนน",
      cuisine: "อาหาร",
      address: "ที่อยู่",
      hours: "เวลาเปิด",
      dishes: "เมนู Signature",
      tags: "แท็ก"
    },
    empty: {
      noResults: "ไม่พบผลลัพธ์",
      noRestaurants: "ไม่มีร้านอาหารที่ตรงกับเกณฑ์ของคุณ",
      noAttractions: "ไม่พบสถานที่ท่องเที่ยว",
      noSearchResults: "ไม่มีผลลัพธ์การค้นหา",
      tryAdjusting: "ลองปรับตัวกรองหรือคำค้นหาของคุณ",
      noFavorites: "ยังไม่มีรายการโปรด",
      addSome: "เริ่มสำรวจและบันทึกรายการโปรดของคุณ!"
    },
    errors: {
      loadFailed: "ไม่สามารถโหลดเนื้อหา",
      networkError: "ข้อผิดพลาดเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ",
      somethingWrong: "มีบางอย่างผิดพลาด",
      goBack: "กลับ",
      goHome: "ไปหน้าแรก"
    },
    onboarding: {
      welcome: "ยินดีต้อนรับสู่ ChinaConnect!",
      step1Title: "ค้นพบอาหารที่ยอดเยี่ยม",
      step1Desc: "ค้นหาร้านอาหารมิชลินสตาร์และแบล็กเพิร์ลใน 12 เมืองของจีน",
      step2Title: "เคล็ดลับจาก AI",
      step2Desc: "รับคำแนะนำส่วนบุคคลและความรู้ภายในจากผู้ช่วย AI ของเรา",
      step3Title: "เดินทางอย่างมั่นใจ",
      step3Desc: "เข้าถึงข้อมูลติดต่อฉุกเฉิน ข้อมูลการเดินทาง และเคล็ดลับวัฒนธรรมในที่เดียว",
      getStarted: "เริ่มต้น",
      skip: "ข้าม",
      next: "ถัดไป",
      done: "เสร็จสิ้น"
    },
    tooltips: {
      searchTip: "ค้นหาเมือง ร้านอาหาร หรือหัวข้อ",
      filterTip: "กรองตามอาหาร คะแนน หรือราคา",
      mapTip: "ดูบนแผนที่",
      favoritesTip: "เพิ่มในรายการโปรด",
      shareTip: "แชร์กับเพื่อน"
    },
    recents: {
      recentlyViewed: "ดูล่าสุด",
      recommended: "แนะนำสำหรับคุณ",
      clearHistory: "ล้างประวัติ",
      forYou: "เพราะคุณเยี่ยมชม {city}"
    },
    // Features section
    features: {
      restaurantGuide: "คู่มือร้านอาหาร",
      restaurantGuideDesc: "ดาวมิชลิน, Black Pearl และร้านโปรดท้องถิ่น พร้อมรีวิวละเอียด",
      attractions: "สถานที่ท่องเที่ยว",
      attractionsDesc: "สถานที่ท่องเที่ยวยอดนิยมพร้อมเวลาเปิด ตั๋ว และเคล็ดลับท้องถิ่น",
      transport: "การเดินทาง",
      transportDesc: "วิธีไปและท่องเที่ยว - เครื่องบิน รถไฟ รถไฟใต้ดิน และเคล็ดลับท้องถิ่น",
      emergency: "ฉุกเฉิน",
      emergencyDesc: "โรงพยาบาล ตำรวจ สถานทูต และหมายเลขโทรศัพท์สำคัญ",
      payment: "คู่มือการชำระเงิน",
      paymentDesc: "Alipay, WeChat Pay, เงินสด และข้อมูลการใช้บัตร",
      accommodation: "ที่พัก",
      accommodationDesc: "คำแนะนำโรงแรมสำหรับทุกงบประมาณ ตั้งแต่หรูหราจนถึงประหยัด",
      culturalTips: "เคล็ดลับวัฒนธรรม",
      culturalTipsDesc: "ประเพณีท้องถิ่น มารยาท และข้อมูลเชิงลึกทางวัฒนธรรมของแต่ละเมือง",
      aiAssistant: "ผู้ช่วย AI",
      aiAssistantDesc: "ถามคำถามเกี่ยวกับการท่องเที่ยวจีน ได้รับคำตอบทันที",
    },
    language: {
      switchTo: "เปลี่ยนเป็น",
      current: "ปัจจุบัน",
      english: "อังกฤษ",
      chinese: "จีน"
    }
    },

  vi: {
    nav: {
      home: "Trang chủ",
      cities: "Thành phố",
      restaurants: "Nhà hàng",
      aiChat: "Trợ lý AI",
      guide: "Hướng dẫn du lịch",
      business: "Doanh nghiệp",
      tagline: "Khám phá Trung Quốc với AI",
    },
    common: {
      loading: "Đang tải...",
      error: "Lỗi",
      retry: "Thử lại",
      cancel: "Hủy",
      confirm: "Xác nhận",
      search: "Tìm kiếm...",
      filter: "Lọc",
      sort: "Sắp xếp",
      all: "Tất cả",
      seeMore: "Xem thêm",
      viewAll: "Xem tất cả",
      back: "Quay lại",
      next: "Tiếp theo",
      previous: "Trước đó",
      close: "Đóng",
      open: "Mở"
    },
    home: {
      heroTitle: "Khám phá Trung Quốc với AI",
      heroSubtitle: "Hướng dẫn đáng tin cậy của bạn về các thành phố tốt nhất Trung Quốc",
      heroCTA: "Hỏi AI để được tư vấn chuyến đi",
      exploreCities: "Khám phá Thành phố",
      statsCities: "Thành phố",
      statsRestaurants: "Nhà hàng Michelin",
      statsAttractions: "Địa điểm hàng đầu",
      statsAI: "Hỗ trợ AI",
      featuresTitle: "Mọi thứ bạn cần cho chuyến đi Trung Quốc",
      ctaTitle: "Sẵn sàng khám phá Trung Quốc?",
      ctaSubtitle: "Bắt đầu lập kế hoạch chuyến đi với đề xuất từ AI."
    },
    cities: {
      title: "Khám phá Thành phố của chúng tôi",
      exploreGuide: "Khám phá hướng dẫn",
      subtitle: "Từ thủ đô cổ đến đô thị hiện đại",
      attractions: "Địa điểm",
      restaurants: "Nhà hàng",
      transport: "Giao thông",
      hotels: "Khách sạn",
      payment: "Thanh toán",
      culturalTips: "Mẹo văn hóa",
      emergency: "Khẩn cấp",
      recommendedTime: "Thời gian đề xuất",
      ticketPrice: "Vé",
      openingHours: "Giờ mở cửa"
    },
    restaurants: {
      title: "Hướng dẫn Nhà hàng",
      subtitle: "Michelin, Black Pearl, và các địa điểm địa phương được yêu thích",
      michelin: "Michelin",
      blackPearl: "Black Pearl",
      local: "Địa phương",
      avgPrice: "Giá trung bình",
      rating: "Đánh giá",
      cuisine: "Ẩm thực",
      address: "Địa chỉ",
      hours: "Giờ mở cửa",
      dishes: "Món đặc trưng",
      tags: "Thẻ"
    },
    empty: {
      noResults: "Không tìm thấy kết quả",
      noRestaurants: "Không có nhà hàng phù hợp",
      noAttractions: "Không tìm thấy địa điểm",
      noSearchResults: "Không có kết quả tìm kiếm",
      tryAdjusting: "Thử điều chỉnh bộ lọc hoặc từ khóa",
      noFavorites: "Chưa có mục yêu thích",
      addSome: "Bắt đầu khám phá và lưu mục yêu thích của bạn!"
    },
    errors: {
      loadFailed: "Không thể tải nội dung",
      networkError: "Lỗi mạng. Vui lòng kiểm tra kết nối của bạn.",
      somethingWrong: "Đã xảy ra sự cố",
      goBack: "Quay lại",
      goHome: "Đến Trang chủ"
    },
    onboarding: {
      welcome: "Chào mừng đến với ChinaConnect!",
      step1Title: "Khám phá ẩm thực tuyệt vời",
      step1Desc: "Tìm nhà hàng Michelin và Black Pearl ở 12 thành phố Trung Quốc.",
      step2Title: "Mẹo từ AI",
      step2Desc: "Nhận đề xuất cá nhân hóa từ trợ lý AI của chúng tôi.",
      step3Title: "Đi du lịch tự tin",
      step3Desc: "Truy cập liên hệ khẩn cấp, thông tin giao thông và mẹo văn hóa ở một nơi.",
      getStarted: "Bắt đầu",
      skip: "Bỏ qua",
      next: "Tiếp theo",
      done: "Xong"
    },
    tooltips: {
      searchTip: "Tìm kiếm thành phố, nhà hàng hoặc chủ đề",
      filterTip: "Lọc theo ẩm thực, đánh giá hoặc giá",
      mapTip: "Xem trên bản đồ",
      favoritesTip: "Thêm vào mục yêu thích",
      shareTip: "Chia sẻ với bạn bè"
    },
    recents: {
      recentlyViewed: "Đã xem gần đây",
      recommended: "Đề xuất cho bạn",
      clearHistory: "Xóa lịch sử",
      forYou: "Vì bạn đã xem {city}"
    },
    // Features section
    features: {
      restaurantGuide: "Hướng dẫn nhà hàng",
      restaurantGuideDesc: "Sao Michelin, xếp hạng Black Pearl và các món địa phương yêu thích kèm đánh giá chi tiết",
      attractions: "Điểm tham quan",
      attractionsDesc: "Điểm tham quan hàng đầu với giờ mở cửa, vé và mẹo địa phương",
      transport: "Phương tiện",
      transportDesc: "Cách đi và di chuyển - máy bay, tàu hỏa, tàu điện ngầm và mẹo địa phương",
      emergency: "Khẩn cấp",
      emergencyDesc: "Bệnh viện, cảnh sát, đại sứ quán và các số điện thoại quan trọng",
      payment: "Hướng dẫn thanh toán",
      paymentDesc: "Alipay, WeChat Pay, mẹo tiền mặt và thông tin thẻ",
      accommodation: "Chỗ ở",
      accommodationDesc: "Đề xuất khách sạn cho mọi ngân sách từ sang trọng đến tiết kiệm",
      culturalTips: "Mẹo văn hóa",
      culturalTipsDesc: "Phong tục địa phương, nghi thức và hiểu biết văn hóa cho mỗi thành phố",
      aiAssistant: "Trợ lý AI",
      aiAssistantDesc: "Đặt câu hỏi về du lịch Trung Quốc, nhận câu trả lời ngay",
    },
    language: {
      switchTo: "Chuyển sang",
      current: "Hiện tại",
      english: "Tiếng Anh",
      chinese: "Tiếng Trung"
    }
    },

  ru: {
    nav: {
      home: "Главная",
      cities: "Города",
      restaurants: "Рестораны",
      aiChat: "ИИ-консьерж",
      guide: "Путеводитель",
      business: "Бизнес Экспресс",
      tagline: "Изучайте Китай с ИИ",
    },
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      retry: "Повторить",
      cancel: "Отмена",
      confirm: "Подтвердить",
      search: "Поиск...",
      filter: "Фильтр",
      sort: "Сортировка",
      all: "Все",
      seeMore: "Подробнее",
      viewAll: "Смотреть все",
      back: "Назад",
      next: "Далее",
      previous: "Предыдущий",
      close: "Закрыть",
      open: "Открыть"
    },
    home: {
      heroTitle: "Исследуйте Китай с AI",
      heroSubtitle: "Ваш надежный гид по лучшим городам Китая",
      heroCTA: "Спросите AI о советах по путешествию",
      exploreCities: "Исследовать города",
      statsCities: "Городов",
      statsRestaurants: "Ресторанов Michelin",
      statsAttractions: "Достопримечательностей",
      statsAI: "AI Помощник",
      featuresTitle: "Все, что вам нужно для поездки в Китай",
      ctaTitle: "Готовы исследовать Китай?",
      ctaSubtitle: "Начните планировать поездку с рекомендациями на основе AI."
    },
    cities: {
      title: "Исследуйте наши города",
      exploreGuide: "Исследовать путеводитель",
      subtitle: "От древних столиц до современных мегаполисов",
      attractions: "Достопримечательности",
      restaurants: "Рестораны",
      transport: "Транспорт",
      hotels: "Отели",
      payment: "Оплата",
      culturalTips: "Культурные советы",
      emergency: "Экстренная связь",
      recommendedTime: "Рекомендуемое время",
      ticketPrice: "Билет",
      openingHours: "Часы работы"
    },
    restaurants: {
      title: "Гид по ресторанам",
      subtitle: "Мишленовские звезды, Black Pearl и местные фавориты",
      michelin: "Мишлен",
      blackPearl: "Black Pearl",
      local: "Местный фаворит",
      avgPrice: "Средняя цена",
      rating: "Рейтинг",
      cuisine: "Кухня",
      address: "Адрес",
      hours: "Часы работы",
      dishes: "Фирменные блюда",
      tags: "Теги"
    },
    empty: {
      noResults: "Результатов не найдено",
      noRestaurants: "Нет ресторанов по вашим критериям",
      noAttractions: "Достопримечательности не найдены",
      noSearchResults: "Нет результатов поиска",
      tryAdjusting: "Попробуйте изменить фильтры или условия поиска",
      noFavorites: "Пока нет избранного",
      addSome: "Начните исследовать и сохраняйте избранное!"
    },
    errors: {
      loadFailed: "Не удалось загрузить контент",
      networkError: "Ошибка сети. Проверьте подключение.",
      somethingWrong: "Что-то пошло не так",
      goBack: "Вернуться",
      goHome: "На главную"
    },
    onboarding: {
      welcome: "Добро пожаловать в ChinaConnect!",
      step1Title: "Откройте для себя отличную еду",
      step1Desc: "Найдите рестораны Michelin и Black Pearl в 12 китайских городах.",
      step2Title: "Советы от AI",
      step2Desc: "Получите персональные рекомендации от нашего AI-ассистента.",
      step3Title: "Путешествуйте уверенно",
      step3Desc:
        "Получите экстренные контакты, информацию о транспорте и культурные советы в одном месте.",
      getStarted: "Начать",
      skip: "Пропустить",
      next: "Далее",
      done: "Готово"
    },
    tooltips: {
      searchTip: "Искать города, рестораны или темы",
      filterTip: "Фильтровать по кухне, рейтингу или цене",
      mapTip: "Показать на карте",
      favoritesTip: "Добавить в избранное",
      shareTip: "Поделиться с друзьями"
    },
    recents: {
      recentlyViewed: "Недавно просмотренные",
      recommended: "Рекомендуем",
      clearHistory: "Очистить историю",
      forYou: "Потому что вы посетили {city}"
    },
    // Features section
    features: {
      restaurantGuide: "Гид по ресторанам",
      restaurantGuideDesc: "Звезды Мишлен, рейтинг Black Pearl и местные фавориты с подробными обзорами",
      attractions: "Достопримечательности",
      attractionsDesc: "Лучшие достопримечательности с часами работы, билетами и местными советами",
      transport: "Транспорт",
      transportDesc: "Как добраться и передвигаться - рейсы, поезда, метро и местные советы",
      emergency: "Экстренные случаи",
      emergencyDesc: "Больницы, полиция, посольства и важные телефонные номера",
      payment: "Гид по оплате",
      paymentDesc: "Alipay, WeChat Pay, советы по наличным и информация о картах",
      accommodation: "Проживание",
      accommodationDesc: "Рекомендации отелей для любого бюджета - от роскошных до бюджетных",
      culturalTips: "Культурные советы",
      culturalTipsDesc: "Местные обычаи, этикет и культурные особенности каждого города",
      aiAssistant: "ИИ-ассистент",
      aiAssistantDesc: "Задавайте вопросы о путешествиях по Китаю на английском, получайте мгновенные ответы",
    },
    language: {
      switchTo: "Переключить на",
      current: "Текущий",
      english: "Английский",
      chinese: "Китайский"
    }
    },

  fr: {
    nav: {
      home: "Accueil",
      cities: "Villes",
      restaurants: "Restaurants",
      aiChat: "Conciergerie IA",
      guide: "Guide de Voyage",
      business: "Express Affaires",
      tagline: "Explorez la Chine avec l’IA",
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      retry: "Réessayer",
      cancel: "Annuler",
      confirm: "Confirmer",
      search: "Rechercher...",
      filter: "Filtrer",
      sort: "Trier",
      all: "Tout",
      seeMore: "Voir plus",
      viewAll: "Voir tout",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      close: "Fermer",
      open: "Ouvrir"
    },
    home: {
      heroTitle: "Explorez la Chine avec l'IA",
      heroSubtitle: "Votre guide de confiance pour les meilleures villes de Chine",
      heroCTA: "Demander des conseils de voyage à l'IA",
      exploreCities: "Explorer les villes",
      statsCities: "Villes",
      statsRestaurants: "Restaurants Michelin",
      statsAttractions: "Attractions",
      statsAI: "Assistance IA",
      featuresTitle: "Tout ce dont vous avez besoin pour votre voyage en Chine",
      ctaTitle: "Prêt à explorer la Chine?",
      ctaSubtitle:
        "Commencez à planifier votre voyage avec des recommandations alimentées par l'IA."
    },
    cities: {
      title: "Explorez nos villes",
      exploreGuide: "Explorer le guide",
      subtitle: "Des capitales anciennes aux métropoles modernes",
      attractions: "Attractions",
      restaurants: "Restaurants",
      transport: "Transport",
      hotels: "Hôtels",
      payment: "Paiement",
      culturalTips: "Conseils culturels",
      emergency: "Urgence",
      recommendedTime: "Temps recommandé",
      ticketPrice: "Billet",
      openingHours: "Horaires"
    },
    restaurants: {
      title: "Guide des restaurants",
      subtitle: "Étoiles Michelin, Black Pearl et favoris locaux",
      michelin: "Michelin",
      blackPearl: "Black Pearl",
      local: "Favori local",
      avgPrice: "Prix moyen",
      rating: "Note",
      cuisine: "Cuisine",
      address: "Adresse",
      hours: "Horaires",
      dishes: "Plats signatures",
      tags: "Tags"
    },
    empty: {
      noResults: "Aucun résultat trouvé",
      noRestaurants: "Aucun restaurant ne correspond à vos critères",
      noAttractions: "Aucune attraction trouvée",
      noSearchResults: "Aucun résultat de recherche",
      tryAdjusting: "Essayez d'ajuster vos filtres ou termes de recherche",
      noFavorites: "Pas encore de favoris",
      addSome: "Commencez à explorer et ajoutez vos favoris!"
    },
    errors: {
      loadFailed: "Échec du chargement du contenu",
      networkError: "Erreur réseau. Veuillez vérifier votre connexion.",
      somethingWrong: "Une erreur s'est produite",
      goBack: "Retour",
      goHome: "Aller à l'accueil"
    },
    onboarding: {
      welcome: "Bienvenue sur ChinaConnect!",
      step1Title: "Découvrez une excellente cuisine",
      step1Desc:
        "Trouvez des restaurants étoilés Michelin et Black Pearl dans 12 villes chinoises.",
      step2Title: "Conseils alimentés par l'IA",
      step2Desc:
        "Obtenez des recommandations personnalisées et des connaissances insider de notre assistant IA.",
      step3Title: "Voyagez en toute confiance",
      step3Desc:
        "Accédez aux contacts d'urgence, infos transport et conseils culturels au même endroit.",
      getStarted: "Commencer",
      skip: "Passer",
      next: "Suivant",
      done: "Terminé"
    },
    tooltips: {
      searchTip: "Rechercher villes, restaurants ou sujets",
      filterTip: "Filtrer par cuisine, note ou prix",
      mapTip: "Voir sur la carte",
      favoritesTip: "Ajouter aux favoris",
      shareTip: "Partager avec des amis"
    },
    recents: {
      recentlyViewed: "Vus récemment",
      recommended: "Recommandé pour vous",
      clearHistory: "Effacer l'historique",
      forYou: "Parce que vous avez visité {city}"
    },
    // Features section
    features: {
      restaurantGuide: "Guide des restaurants",
      restaurantGuideDesc: "Étoiles Michelin, classement Black Pearl et favoris locaux avec avis détaillés",
      attractions: "Attractions",
      attractionsDesc: "Attractions les mieux notées avec horaires, billets et conseils locaux",
      transport: "Transport",
      transportDesc: "Comment s’y rendre et se déplacer - vols, trains, métro et conseils locaux",
      emergency: "Urgence",
      emergencyDesc: "Hôpitaux, police, contacts ambassade et numéros de téléphone importants",
      payment: "Guide de paiement",
      paymentDesc: "Alipay, WeChat Pay, astuces espèces et informations sur les cartes",
      accommodation: "Hébergement",
      accommodationDesc: "Recommandations d’hôtels pour tous les budgets, du luxe à l’économique",
      culturalTips: "Conseils culturels",
      culturalTipsDesc: "Coutumes locales, étiquette et perspectives culturelles pour chaque ville",
      aiAssistant: "Assistant IA",
      aiAssistantDesc: "Posez des questions en anglais sur les voyages en Chine, obtenez des réponses instantanées",
    },
    language: {
      switchTo: "Passer à",
      current: "Actuel",
      english: "Anglais",
      chinese: "Chinois"
    }
    },

  de: {
    nav: {
      home: "Startseite",
      cities: "Städte",
      restaurants: "Restaurants",
      aiChat: "KI-Concierge",
      guide: "Reiseführer",
      business: "Business Express",
      tagline: "China mit KI entdecken",
    },
    common: {
      loading: "Laden...",
      error: "Fehler",
      retry: "Erneut versuchen",
      cancel: "Abbrechen",
      confirm: "Bestätigen",
      search: "Suchen...",
      filter: "Filtern",
      sort: "Sortieren",
      all: "Alle",
      seeMore: "Mehr anzeigen",
      viewAll: "Alle anzeigen",
      back: "Zurück",
      next: "Weiter",
      previous: "Vorherige",
      close: "Schließen",
      open: "Öffnen"
    },
    home: {
      heroTitle: "China mit KI erkunden",
      heroSubtitle: "Ihr vertrauenswürdiger Führer zu den besten Städten Chinas",
      heroCTA: "KI nach Reiseberatung fragen",
      exploreCities: "Städte erkunden",
      statsCities: "Städte",
      statsRestaurants: "Michelin Restaurants",
      statsAttractions: "Top Attraktionen",
      statsAI: "KI Unterstützung",
      featuresTitle: "Alles was Sie für Ihre China Reise brauchen",
      ctaTitle: "Bereit China zu erkunden?",
      ctaSubtitle: "Beginnen Sie mit KI-gestützten Empfehlungen Ihre Reise zu planen."
    },
    cities: {
      title: "Unsere Städte erkunden",
      exploreGuide: "Reiseführer erkunden",
      subtitle: "Von antiken Hauptstädten bis zu modernen Metropolen",
      attractions: "Attraktionen",
      restaurants: "Restaurants",
      transport: "Transport",
      hotels: "Hotels",
      payment: "Zahlung",
      culturalTips: "Kulturelle Tipps",
      emergency: "Notfall",
      recommendedTime: "Empfohlene Zeit",
      ticketPrice: "Ticket",
      openingHours: "Öffnungszeiten"
    },
    restaurants: {
      title: "Restaurant Guide",
      subtitle: "Michelin Sterne, Black Pearl und lokale Favoriten",
      michelin: "Michelin",
      blackPearl: "Black Pearl",
      local: "Lokaler Favorit",
      avgPrice: "Durchschnittspreis",
      rating: "Bewertung",
      cuisine: "Küche",
      address: "Adresse",
      hours: "Öffnungszeiten",
      dishes: "Signature Gerichte",
      tags: "Tags"
    },
    empty: {
      noResults: "Keine Ergebnisse gefunden",
      noRestaurants: "Keine Restaurants entsprechen Ihren Kriterien",
      noAttractions: "Keine Attraktionen gefunden",
      noSearchResults: "Keine Suchergebnisse",
      tryAdjusting: "Versuchen Sie Ihre Filter oder Suchbegriffe anzupassen",
      noFavorites: "Noch keine Favoriten",
      addSome: "Beginnen Sie zu erkunden und speichern Sie Ihre Favoriten!"
    },
    errors: {
      loadFailed: "Inhalt konnte nicht geladen werden",
      networkError: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
      somethingWrong: "Etwas ist schief gelaufen",
      goBack: "Zurück",
      goHome: "Zur Startseite"
    },
    onboarding: {
      welcome: "Willkommen bei ChinaConnect!",
      step1Title: "Entdecken Sie großartiges Essen",
      step1Desc:
        "Finden Sie Michelin-prämierte und Black Pearl Restaurants in 12 chinesischen Städten.",
      step2Title: "KI-gestützte Tipps",
      step2Desc:
        "Erhalten Sie personalisierte Empfehlungen und Insider-Wissen von unserem KI-Assistenten.",
      step3Title: "Reisen Sie mit Vertrauen",
      step3Desc: "Zugang zu Notfallkontakten, Transportinfos und kulturellen Tipps an einem Ort.",
      getStarted: "Loslegen",
      skip: "Überspringen",
      next: "Weiter",
      done: "Fertig"
    },
    tooltips: {
      searchTip: "Städte, Restaurants oder Themen suchen",
      filterTip: "Nach Küche, Bewertung oder Preis filtern",
      mapTip: "Auf Karte anzeigen",
      favoritesTip: "Zu Favoriten hinzufügen",
      shareTip: "Mit Freunden teilen"
    },
    recents: {
      recentlyViewed: "Kürzlich angesehen",
      recommended: "Für Sie empfohlen",
      clearHistory: "Verlauf löschen",
      forYou: "Weil Sie {city} besucht haben"
    },
    // Features section
    features: {
      restaurantGuide: "Restaurantführer",
      restaurantGuideDesc: "Michelin-Sterne, Black-Pearl-Bewertung und lokale Favoriten mit ausführlichen Bewertungen",
      attractions: "Sehenswürdigkeiten",
      attractionsDesc: "Top-bewertete Attraktionen mit Öffnungszeiten, Tickets und lokalen Tipps",
      transport: "Transport",
      transportDesc: "Anreise und Fortbewegung - Flüge, Züge, U-Bahn und lokale Tipps",
      emergency: "Notfälle",
      emergencyDesc: "Krankenhaus, Polizei, Botschaftskontakte und wichtige Telefonnummern",
      payment: "Zahlungsführer",
      paymentDesc: "Alipay, WeChat Pay, Bargeldtipps und Karteninformationen",
      accommodation: "Unterkunft",
      accommodationDesc: "Hotelempfehlungen für jedes Budget, von luxuriös bis preiswert",
      culturalTips: "Kulturelle Tipps",
      culturalTipsDesc: "Lokale Bräuche, Etikette und kulturelle Einblicke für jede Stadt",
      aiAssistant: "KI-Assistent",
      aiAssistantDesc: "Stellen Sie Fragen auf Englisch zu China-Reisen und erhalten Sie sofort Antworten",
    },
    language: {
      switchTo: "Wechseln zu",
      current: "Aktuell",
      english: "Englisch",
      chinese: "Chinesisch"
    }
    },

  ar: {
    nav: {
      home: "الرئيسية",
      cities: "المدن",
      restaurants: "المطاعم",
      aiChat: "مساعد الذكاء الاصطناعي",
      guide: "دليل السفر",
      business: "أعمال سريعة",
      tagline: "استكشف الصين بالذكاء الاصطناعي",
    },
    common: {
      loading: "جاري التحميل...",
      error: "خطأ",
      retry: "إعادة المحاولة",
      cancel: "إلغاء",
      confirm: "تأكيد",
      search: "بحث...",
      filter: "تصفية",
      sort: "ترتيب",
      all: "الكل",
      seeMore: "عرض المزيد",
      viewAll: "عرض الكل",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      close: "إغلاق",
      open: "فتح"
    },
    home: {
      heroTitle: "استكشف الصين مع الذكاء الاصطناعي",
      heroSubtitle: "دليلك الموثوق لأفضل مدن الصين",
      heroCTA: "اسأل الذكاء الاصطناعي للحصول على نصائح السفر",
      exploreCities: "استكشف المدن",
      statsCities: "المدن المغطاة",
      statsRestaurants: "مطاعم ميشلان",
      statsAttractions: "أبرز المعالم",
      statsAI: "مساعدة الذكاء الاصطناعي",
      featuresTitle: "كل ما تحتاجه لرحلتك إلى الصين",
      ctaTitle: "هل أنت مستعد لاستكشاف الصين؟",
      ctaSubtitle: "ابدأ التخطيط لرحلتك مع توصيات مدعومة بالذكاء الاصطناعي."
    },
    cities: {
      title: "استكشف مدننا",
      exploreGuide: "استكشف الدليل",
      subtitle: "من العواصم القديمة إلى المدن الكبرى الحديثة",
      attractions: "المعالم",
      restaurants: "المطاعم",
      transport: "المواصلات",
      hotels: "الفنادق",
      payment: "الدفع",
      culturalTips: "نصائح ثقافية",
      emergency: "الطوارئ",
      recommendedTime: "الوقت الموصى به",
      ticketPrice: "التذكرة",
      openingHours: "ساعات العمل"
    },
    restaurants: {
      title: "دليل المطاعم",
      subtitle: "نجوم ميشلان، بلاك بيرل، والمفضلات المحلية",
      michelin: "ميشلان",
      blackPearl: "بلاك بيرل",
      local: "المفضل المحلي",
      avgPrice: "متوسط السعر",
      rating: "التقييم",
      cuisine: "المطبخ",
      address: "العنوان",
      hours: "ساعات العمل",
      dishes: "الأطباق المميزة",
      tags: "الوسوم"
    },
    empty: {
      noResults: "لم يتم العثور على نتائج",
      noRestaurants: "لا توجد مطاعم تطابق معاييرك",
      noAttractions: "لم يتم العثور على معالم",
      noSearchResults: "لا توجد نتائج بحث",
      tryAdjusting: "حاول تعديل عوامل التصفية أو مصطلحات البحث",
      noFavorites: "لا توجد مفضلات بعد",
      addSome: "ابدأ الاستكشاف واحفظ مفضلاتك!"
    },
    errors: {
      loadFailed: "فشل تحميل المحتوى",
      networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
      somethingWrong: "حدث خطأ ما",
      goBack: "رجوع",
      goHome: "الذهاب للرئيسية"
    },
    onboarding: {
      welcome: "مرحباً بك في ChinaConnect!",
      step1Title: "اكتشف الطعام الرائع",
      step1Desc: "ابحث عن مطاعم ميشلان وبلاك بيرل في 12 مدينة صينية.",
      step2Title: "نصائح مدعومة بالذكاء الاصطناعي",
      step2Desc: "احصل على توصيات شخصية ومعرفة داخلية من مساعدنا الذكي.",
      step3Title: "سافر بثقة",
      step3Desc: "احصل على جهات اتصال الطوارئ ومعلومات النقل والنصائح الثقافية في مكان واحد.",
      getStarted: "ابدأ",
      skip: "تخطي",
      next: "التالي",
      done: "تم"
    },
    tooltips: {
      searchTip: "ابحث عن مدن أو مطاعم أو مواضيع",
      filterTip: "تصفية حسب المطبخ أو التقييم أو السعر",
      mapTip: "عرض على الخريطة",
      favoritesTip: "إضافة إلى المفضلات",
      shareTip: "مشاركة مع الأصدقاء"
    },
    recents: {
      recentlyViewed: "شوهدت مؤخراً",
      recommended: "موصى به لك",
      clearHistory: "مسح السجل",
      forYou: "لأنك زرت {city}"
    },
    // Features section
    features: {
      restaurantGuide: "دليل المطاعم",
      restaurantGuideDesc: "نجوم ميشلان، ترتيب بلاك بيرل والمفضلات المحلية مع مراجعات مفصلة",
      attractions: "المعالم",
      attractionsDesc: "أفضل المعالم مع ساعات العمل والتذاكر والنصائح المحلية",
      transport: "النقل",
      transportDesc: "كيفية الوصول والتنقل - الرحلات الجوية، القطارات، المترو والنصائح المحلية",
      emergency: "الطوارئ",
      emergencyDesc: "المستشفى، الشرطة، جهات اتصال السفارة وأرقام الهواتف المهمة",
      payment: "دليل الدفع",
      paymentDesc: "Alipay، WeChat Pay، نصائح نقدية ومعلومات البطاقات",
      accommodation: "الإقامة",
      accommodationDesc: "توصيات الفنادق لكل ميزانية من الفاخر إلى الاقتصادي",
      culturalTips: "نصائح ثقافية",
      culturalTipsDesc: "العادات المحلية، آداب السلوك والرؤى الثقافية لكل مدينة",
      aiAssistant: "مساعد الذكاء الاصطناعي",
      aiAssistantDesc: "اطرح أسئلة حول السفر إلى الصين واحصل على إجابات فورية",
    },
    language: {
      switchTo: "التغيير إلى",
      current: "الحالي",
      english: "الإنجليزية",
      chinese: "الصينية"
    }
    },

  fa: {
    nav: {
      home: "صفحه اصلی",
      cities: "شهرها",
      restaurants: "رستوران‌ها",
      aiChat: "دستیار هوش مصنوعی",
      guide: "راهنمای سفر",
      business: "بیزینس اکسپرس",
      tagline: "چین را با هوش مصنوعی کاوش کنید",
    },
    common: {
      loading: "در حال بارگذاری...",
      error: "خطا",
      retry: "تلاش مجدد",
      cancel: "لغو",
      confirm: "تأیید",
      search: "جستجو...",
      filter: "فیلتر",
      sort: "مرتب‌سازی",
      all: "همه",
      seeMore: "بیشتر ببینید",
      viewAll: "مشاهده همه",
      back: "بازگشت",
      next: "بعدی",
      previous: "قبلی",
      close: "بستن",
      open: "باز کردن"
    },
    home: {
      heroTitle: "چین را با AI کاوش کنید",
      heroSubtitle: "راهنمای قابل اعتماد شما برای بهترین شهرهای چین",
      heroCTA: "از AI برای مشاوره سفر بپرسید",
      exploreCities: "کاوش شهرها",
      statsCities: "شهرهای تحت پوشش",
      statsRestaurants: "رستوران‌های میشلین",
      statsAttractions: "جاذبه‌های برتر",
      statsAI: "کمک AI",
      featuresTitle: "همه چیز مورد نیاز شما برای سفر به چین",
      ctaTitle: "آماده کاوش چین هستید؟",
      ctaSubtitle: "سفر خود را با توصیه‌های مبتنی بر AI برنامه‌ریزی کنید."
    },
    cities: {
      title: "شهرهای ما را کاوش کنید",
      exploreGuide: "راهنمای اکتشاف",
      subtitle: "از پایتخت‌های باستانی تا کلان‌شهرهای مدرن",
      attractions: "جاذبه‌ها",
      restaurants: "رستوران‌ها",
      transport: "حمل‌ونقل",
      hotels: "هتل‌ها",
      payment: "پرداخت",
      culturalTips: "نکات فرهنگی",
      emergency: "اضطراری",
      recommendedTime: "زمان پیشنهادی",
      ticketPrice: "بلیت",
      openingHours: "ساعات کاری"
    },
    restaurants: {
      title: "راهنمای رستوران",
      subtitle: "ستاره‌های میشلین، بلك پرل و غذاهای محلی محبوب",
      michelin: "میشلین",
      blackPearl: "بلک پرل",
      local: "محبوب محلی",
      avgPrice: "قیمت متوسط",
      rating: "امتیاز",
      cuisine: "غذا",
      address: "آدرس",
      hours: "ساعات کاری",
      dishes: "غذاهایsignature",
      tags: "برچسب‌ها"
    },
    empty: {
      noResults: "نتیجه‌ای یافت نشد",
      noRestaurants: "هیچ رستورانی با معیارهای شما مطابقت ندارد",
      noAttractions: "جاذبه‌ای یافت نشد",
      noSearchResults: "نتیجه جستجویی وجود ندارد",
      tryAdjusting: "فیلترها یا کلمات جستجو را تنظیم کنید",
      noFavorites: "هنوز علاقه‌مندی ندارید",
      addSome: "کاوش را شروع کنید و علاقه‌مندی‌های خود را ذخیره کنید!"
    },
    errors: {
      loadFailed: "بارگذاری محتوا ناموفق بود",
      networkError: "خطای شبکه. لطفاً اتصال خود را بررسی کنید.",
      somethingWrong: "مشکلی پیش آمد",
      goBack: "بازگشت",
      goHome: "رفتن به صفحه اصلی"
    },
    onboarding: {
      welcome: "به ChinaConnect خوش آمدید!",
      step1Title: "غذای عالی کشف کنید",
      step1Desc: "رستوران‌های ستاره میشلین و بلك پرل را در 12 شهر چین پیدا کنید.",
      step2Title: "نکات مبتنی بر AI",
      step2Desc: "توصیه‌های شخصی‌سازی شده و دانش داخلی از دستیار AI ما دریافت کنید.",
      step3Title: "با اعتماد به نفس سفر کنید",
      step3Desc: "دسترسی به مخاطبین اضطراری، اطلاعات حمل‌ونقل و نکات فرهنگی در یک مکان.",
      getStarted: "شروع کنید",
      skip: "رد کردن",
      next: "بعدی",
      done: "انجام شد"
    },
    tooltips: {
      searchTip: "جستجوی شهرها، رستوران‌ها یا موضوعات",
      filterTip: "فیلتر بر اساس غذا، امتیاز یا قیمت",
      mapTip: "مشاهده روی نقشه",
      favoritesTip: "افزودن به علاقه‌مندی‌ها",
      shareTip: "اشتراک‌گذاری با دوستان"
    },
    recents: {
      recentlyViewed: "اخیراً مشاهده شده",
      recommended: "پیشنهاد شده برای شما",
      clearHistory: "پاک کردن تاریخچه",
      forYou: "چون شما {city} را بازدید کرده‌اید"
    },
    // Features section
    features: {
      restaurantGuide: "راهنمای رستوران",
      restaurantGuideDesc: "ستارهای میشلن، رتبه‌بندی بلک پرل و موارد دلخواه محلی با نقد و بررسی دقیق",
      attractions: "جاذبه‌ها",
      attractionsDesc: "جاذبه‌های برتر با ساعات کار، بلیط و نکات محلی",
      transport: "حمل و نقل",
      transportDesc: "چگونگی رسیدن و گشت و گذار - پروازها، قطارها، مترو و نکات محلی",
      emergency: "اورژانس",
      emergencyDesc: "بیمارستان، پلیس، تماس‌های سفارت و شماره تلفن‌های مهم",
      payment: "راهنمای پرداخت",
      paymentDesc: "Alipay، WeChat Pay، نکات نقدی و اطلاعات کارت",
      accommodation: "اقامت",
      accommodationDesc: "توصیه‌های هتل برای هر بودجه‌ای از لوکس تا اقتصادی",
      culturalTips: "نکات فرهنگی",
      culturalTipsDesc: "آداب و رسوم محلی، آداب معاشرت و بینش‌های فرهنگی برای هر شهر",
      aiAssistant: "دستیار هوش مصنوعی",
      aiAssistantDesc: "سوالاتی درباره سفر به چین بپرسید و پاسخ‌های فوری دریافت کنید",
    },
    language: {
      switchTo: "تغییر به",
      current: "فعلی",
      english: "انگلیسی",
      chinese: "چینی"
    }
    },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function getLanguageFromUrl(url: string): Language {
  const match = url.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\/?/);
  if (match) {
    const lang = match[1].toLowerCase();
    if (lang === "zhcn") return "zh-CN";
    if (lang === "zhtw") return "zh-TW";
    const supported = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    if (supported) return supported.code;
  }
  return "en";
}

export function addLangPrefix(path: string, lang: Language): string {
  if (!path) return `/${lang}`;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
}
