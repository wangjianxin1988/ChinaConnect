// i18n translations for ChinaConnect
// Currently: English primary, Chinese secondary

export type Language = 'en' | 'zh';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    cities: string;
    restaurants: string;
    aiChat: string;
    business: string;
    community: string;
    explore: string;
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
    features: string;
    featuresTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
  };
  // Cities
  cities: {
    title: string;
    subtitle: string;
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
      home: 'Home',
      cities: 'Cities',
      restaurants: 'Restaurants',
      aiChat: 'AI Chat',
      business: 'Business Express',
      community: 'Community',
      explore: 'Explore Restaurants',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      search: 'Search...',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      seeMore: 'See More',
      viewAll: 'View All',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
    },
    home: {
      heroTitle: 'Explore China with AI',
      heroSubtitle: 'Your trusted guide to China\'s best cities',
      heroCTA: 'Ask AI for Trip Advice',
      exploreCities: 'Explore Cities',
      statsCities: 'Cities Covered',
      statsRestaurants: 'Michelin Restaurants',
      statsAttractions: 'Top Attractions',
      statsAI: 'AI Assistance',
      featuresTitle: 'Everything You Need for Your China Trip',
      ctaTitle: 'Ready to Explore China?',
      ctaSubtitle: 'Start planning your trip with AI-powered recommendations.',
    },
    cities: {
      title: 'Explore Our Cities',
      subtitle: 'From ancient capitals to modern metropolises',
      attractions: 'Attractions',
      restaurants: 'Restaurants',
      transport: 'Transport',
      hotels: 'Hotels',
      payment: 'Payment',
      culturalTips: 'Cultural Tips',
      emergency: 'Emergency',
      recommendedTime: 'Recommended Visit',
      ticketPrice: 'Ticket',
      openingHours: 'Hours',
    },
    restaurants: {
      title: 'Restaurant Guide',
      subtitle: 'Michelin stars, Black Pearl rankings, and local favorites',
      michelin: 'Michelin',
      blackPearl: 'Black Pearl',
      local: 'Local Favorite',
      avgPrice: 'Avg Price',
      rating: 'Rating',
      cuisine: 'Cuisine',
      address: 'Address',
      hours: 'Hours',
      dishes: 'Signature Dishes',
      tags: 'Tags',
    },
    empty: {
      noResults: 'No results found',
      noRestaurants: 'No restaurants match your criteria',
      noAttractions: 'No attractions found',
      noSearchResults: 'No results for your search',
      tryAdjusting: 'Try adjusting your filters or search terms',
      noFavorites: 'No favorites yet',
      addSome: 'Start exploring and save your favorites!',
    },
    errors: {
      loadFailed: 'Failed to load content',
      networkError: 'Network error. Please check your connection.',
      somethingWrong: 'Something went wrong',
      goBack: 'Go Back',
      goHome: 'Go to Homepage',
    },
    onboarding: {
      welcome: 'Welcome to ChinaConnect!',
      step1Title: 'Discover Great Food',
      step1Desc: 'Find Michelin-starred and Black Pearl restaurants in 12 Chinese cities.',
      step2Title: 'AI-Powered Tips',
      step2Desc: 'Get personalized recommendations and insider knowledge from our AI assistant.',
      step3Title: 'Travel with Confidence',
      step3Desc: 'Access emergency contacts, transport info, and cultural tips all in one place.',
      getStarted: 'Get Started',
      skip: 'Skip',
      next: 'Next',
      done: 'Done',
    },
    tooltips: {
      searchTip: 'Search cities, restaurants, or topics',
      filterTip: 'Filter by cuisine, rating, or price',
      mapTip: 'View on map',
      favoritesTip: 'Add to favorites',
      shareTip: 'Share with friends',
    },
    recents: {
      recentlyViewed: 'Recently Viewed',
      recommended: 'Recommended for You',
      clearHistory: 'Clear History',
      forYou: 'Because you visited {city}',
    },
    language: {
      switchTo: 'Switch to',
      current: 'Current',
      english: 'English',
      chinese: 'Chinese',
    },
  },
  zh: {
    nav: {
      home: '首页',
      cities: '城市',
      restaurants: '餐厅',
      aiChat: 'AI聊天',
      business: '商务快车',
      community: '社区',
      explore: '探索餐厅',
    },
    common: {
      loading: '加载中...',
      error: '错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      search: '搜索...',
      filter: '筛选',
      sort: '排序',
      all: '全部',
      seeMore: '查看更多',
      viewAll: '查看全部',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      open: '打开',
    },
    home: {
      heroTitle: '用AI探索中国',
      heroSubtitle: '您值得信赖的中国城市指南',
      heroCTA: '向AI咨询行程建议',
      exploreCities: '探索城市',
      statsCities: '覆盖城市',
      statsRestaurants: '米其林餐厅',
      statsAttractions: '热门景点',
      statsAI: 'AI助手',
      featuresTitle: '您中国之旅所需的一切',
      ctaTitle: '准备好探索中国了吗？',
      ctaSubtitle: '开始使用AI驱动的推荐来规划您的行程。',
    },
    cities: {
      title: '探索我们的城市',
      subtitle: '从千年古都到现代都市',
      attractions: '景点',
      restaurants: '餐厅',
      transport: '交通',
      hotels: '酒店',
      payment: '支付',
      culturalTips: '文化提示',
      emergency: '紧急联系',
      recommendedTime: '建议游览时间',
      ticketPrice: '门票',
      openingHours: '营业时间',
    },
    restaurants: {
      title: '餐厅指南',
      subtitle: '米其林星级、黑珍珠餐厅和本地美食',
      michelin: '米其林',
      blackPearl: '黑珍珠',
      local: '本地推荐',
      avgPrice: '人均价格',
      rating: '评分',
      cuisine: '菜系',
      address: '地址',
      hours: '营业时间',
      dishes: '招牌菜',
      tags: '标签',
    },
    empty: {
      noResults: '未找到结果',
      noRestaurants: '没有符合条件的餐厅',
      noAttractions: '未找到景点',
      noSearchResults: '搜索无结果',
      tryAdjusting: '尝试调整筛选条件或搜索关键词',
      noFavorites: '暂无收藏',
      addSome: '开始探索并收藏您喜欢的！',
    },
    errors: {
      loadFailed: '加载内容失败',
      networkError: '网络错误，请检查您的连接。',
      somethingWrong: '出错了',
      goBack: '返回',
      goHome: '返回首页',
    },
    onboarding: {
      welcome: '欢迎使用ChinaConnect！',
      step1Title: '发现美食',
      step1Desc: '在12个中国城市找到米其林星级和黑珍珠餐厅。',
      step2Title: 'AI智能推荐',
      step2Desc: '从我们的AI助手获得个性化推荐和内部知识。',
      step3Title: '安心出行',
      step3Desc: '在一个地方获取紧急联系、交通信息和文化提示。',
      getStarted: '开始使用',
      skip: '跳过',
      next: '下一步',
      done: '完成',
    },
    tooltips: {
      searchTip: '搜索城市、餐厅或主题',
      filterTip: '按菜系、评分或价格筛选',
      mapTip: '在地图上查看',
      favoritesTip: '添加到收藏',
      shareTip: '分享给朋友',
    },
    recents: {
      recentlyViewed: '最近浏览',
      recommended: '为您推荐',
      clearHistory: '清除历史',
      forYou: '因为您浏览了{city}',
    },
    language: {
      switchTo: '切换到',
      current: '当前',
      english: '英语',
      chinese: '中文',
    },
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}