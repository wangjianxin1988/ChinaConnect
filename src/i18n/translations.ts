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
  // Auth - register page
  register?: {
    subtitle: string;
    username: string;
    usernamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    submit: string;
    orContinueWith: string;
    signUpWithGoogle: string;
    haveAccount: string;
    signIn: string;
    errorPasswordMismatch: string;
    errorPasswordLength: string;
    creating: string;
    errorTimeout: string;
    successEmailSent: string;
    accountCreated: string;
    errorGoogle: string;
    errorDefault: string;
  };

  // 404 page
  notFound?: {
    title: string;
    description: string;
    heading: string;
    primary: string;
    descriptionText: string;
    goHome: string;
    exploreCities: string;
    askAi: string;
  };
  // Emergency page
  emergencyPage?: {
    title: string;
    subtitle: string;
    police: string;
    ambulance: string;
    fire: string;
    traffic: string;
    oneTapCalls: string;
    oneTapDesc: string;
    phrases: string;
    phrasesDesc: string;
    gps: string;
    gpsDesc: string;
    contacts: string;
    contactsDesc: string;
    howToSave: string;
    howToSave1: string;
    howToSave2: string;
    howToSave3: string;
    nearbyHelp: string;
    nearbyDesc: string;
    pageTitle?: string;
    pageDescription?: string;
    heroHeading?: string;
    hospitalsTitle?: string;
    hospitalSearch?: string;
    hospitalInternational?: string;
    hospitalCommon?: string;
    pharmaciesTitle?: string;
    pharmacyGreenCross?: string;
    pharmacyChains?: string;
    pharmacyNoRx?: string;
    policeTitle?: string;
    policeSearch?: string;
    policeEnglish?: string;
    policeForeignAffairs?: string;
    embassyTitle?: string;
    embassyDesc?: string;
    sosButtonTitle?: string;
    sosButtonDesc?: string;
    howToUseSOSTitle?: string;
    sosItem1?: string;
    sosItem2?: string;
    sosItem3?: string;
    sosItem4?: string;
    offlineHeading?: string;
    offlineDesc?: string;
    // Offline Available section
    offlineAvailableTitle?: string;
    offlineItem1?: string;
    offlineItem2?: string;
    offlineItem3?: string;
    offlineItem4?: string;
    // Safety Tips section
    safetyTipsTitle?: string;
    keepDocsTitle?: string;
    keepDocs1?: string;
    keepDocs2?: string;
    keepDocs3?: string;
    keepDocs4?: string;
    preparednessTitle?: string;
    preparedness1?: string;
    preparedness2?: string;
    preparedness3?: string;
    preparedness4?: string;
    communicationTitle?: string;
    communication1?: string;
    communication2?: string;
    communication3?: string;
    communication4?: string;
    // Lost Passport section
    lostPassportTitle?: string;
    inChinaTitle?: string;
    lpStep1Title?: string;
    lpStep1Desc?: string;
    lpStep2Title?: string;
    lpStep2Desc?: string;
    lpStep3Title?: string;
    lpStep3Desc?: string;
    importantTipsTitle?: string;
    lpTip1?: string;
    lpTip2?: string;
    lpTip3?: string;
    lpTip4?: string;
  };
  // AI page
  aiPage?: {
    title: string;
    description: string;
    // Hero
    heroBadge?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    startPlanningCTA?: string;
    // Prompts
    promptsTitle?: string;
    promptsSubtitle?: string;
    prompts?: { icon: string; text: string }[];
    // AuthGate
    authGateTitle?: string;
    authGateSignupTitle?: string;
    authGateDescription?: string;
    emailPlaceholder?: string;
    passwordPlaceholder?: string;
    signInButton?: string;
    signUpButton?: string;
    orContinueWith?: string;
    noAccountPrompt?: string;
    haveAccountPrompt?: string;
    switchToSignUp?: string;
    switchToSignIn?: string;
    googleButton?: string;
    githubButton?: string;
    authFailed?: string;
    // ConversationSidebar
    conversationsTitle?: string;
    showSidebarTitle?: string;
    hideSidebarTitle?: string;
    newChatButton?: string;
    noConversationsYet?: string;
    messageLabel?: string;
    messagesLabel?: string;
    deleteConfirm?: string;
    deleteTitle?: string;
  };
  // Account page loading states
  accountPage?: {
    loading: string;
    signInRequired: string;
    signInRequiredDesc: string;
    signIn: string;
  };

  // Business Guide sub-pages (/guide/business/*)
  businessGuidePage?: {
    backToGuide: string;
    indexTitle: string;
    indexDescription: string;
    indexSubtitle: string;
    registrationShort: string;
    registrationTitle: string;
    registrationDescription: string;
    registrationSubtitle: string;
    etiquetteShort: string;
    etiquetteTitle: string;
    etiquetteDescription: string;
    etiquetteSubtitle: string;
    expoShort: string;
    expoTitle: string;
    expoDescription: string;
    expoSubtitle: string;
    invitationShort: string;
    invitationTitle: string;
    invitationDescription: string;
    invitationSubtitle: string;
    translationShort: string;
    translationTitle: string;
    translationDescription: string;
    translationSubtitle: string;
  };
  // Travel Guide (/guide/*)
  guidePage?: {
    home: string;
    travelGuide: string;
    visaSubtitle: string;
    visaTitleShort: string;
    visaStageTitle: string;
    visaStageDescription: string;
    paymentSubtitle: string;
    paymentTitleShort: string;
    paymentStageTitle: string;
    paymentStageDescription: string;
    communicationSubtitle: string;
    communicationTitleShort: string;
    communicationStageTitle: string;
    communicationStageDescription: string;
    transportSubtitle: string;
    transportTitleShort: string;
    transportStageTitle: string;
    transportStageDescription: string;
    accommodationSubtitle: string;
    accommodationTitleShort: string;
    accommodationStageTitle: string;
    accommodationStageDescription: string;
    emergencySubtitle: string;
    emergencyTitleShort: string;
    emergencyStageTitle: string;
    emergencyStageDescription: string;
    departureSubtitle: string;
    departureTitleShort: string;
    departureStageTitle: string;
    departureStageDescription: string;
    diningSubtitle: string;
    diningTitleShort: string;
    diningStageTitle: string;
    diningStageDescription: string;
    culturalWarningsSubtitle: string;
    culturalWarningsTitleShort: string;
    scamPreventionSubtitle: string;
    scamPreventionTitleShort: string;
    transparencySubtitle: string;
    transparencyTitleShort: string;
    emergencyHeading: string;
    emergencyPolice: string;
    emergencyAmbulance: string;
    emergencyFire: string;
    emergencyTourism: string;
    viewAttractions: string;
    viewFullEmergency: string;
    popularByCity: string;
    quickBeijingDesc: string;
    quickFoodDesc: string;
    quickScamDesc: string;
    cityBeijing: string;
    cityShanghai: string;
    cityXian: string;
    cityChengdu: string;
    indexHeroTitle: string;
    indexHeroSubtitle: string;
    indexStagesTitle: string;
    indexGuidesHeading: string;
    indexBusinessHeading: string;
    indexBusinessSubtitle: string;
    viewAllBusinessTools: string;
    viewAllBusinessToolsCta: string;
    viewAllBusinessToolsDesc: string;
  };
  // City sub-pages (/city/[slug]/*)
  cityPage?: {
    home: string;
    gettingTo: string;
    attractionsHeading: string;
    attractionsSubtitle: string;
    attractionsExploreCount: string;
    phoneIcon: string;
    bestTimeHeading: string;
    quickFactsHeading: string;
    topHighlightsHeading: string;
    foodHeading: string;
    foodSubtitle: string;
    hotelsHeading: string;
    transportSubtitle: string;
    noResults: string;
    noResultsDesc: string;
    noHotels: string;
    noHotelsDesc: string;
    dataSourcesHeading: string;
    dataSourcesDesc: string;
    foodHighlightsHeading: string;
    foodHighlightsSubtitle: string;
    hotelsCountUnit: string;
    viewAllHotels: string;
  };
  // Food sub-page (/city/[slug]/food)
  foodPage?: {
    subtitle: string;
    indexTitle: string;
    exploreFood: string;
    noCityTitle: string;
    showingCount: string;
    citiesUnit: string;
    back: string;
    heroCityFood: string;
    restaurantsUnit: string;
    filteringLabel: string;
    backToCity: string;
    callPhone: string;
    amapNav: string;
    navigate: string;
    perPerson: string;
    emptyTitle: string;
    emptyDesc: string;
    dataSourcesHeading: string;
    dataSourcesDesc: string;
    filterMichelin: string;
    filterBlackPearl: string;
    filterLocal: string;
    filterCasual: string;
    filterBudget: string;
    otherRestaurants: string;
    cityEmpty: string;
    cityEmptyDesc: string;
    cityEmptySubtitle: string;
    emptyCta: string;
    metaFooter: string;
  };
  // Offline page
  offlinePage?: {
    title: string;
    bannerTitle: string;
    tryAgain: string;
    tipsHeading: string;
    tipsList1: string;
    tipsList2: string;
    tipsList3: string;
    tipsList4: string;
    tipsList5: string;
    tipsList6: string;
    phrase1En: string;
    phrase2En: string;
    phrase3En: string;
    phrase4En: string;
    phrase5En: string;
    phrase6En: string;
    phrase7En: string;
  };
  // Profile page (/profile)
  profilePage?: {
    title: string;
  };
  // User profile page (/user/[id])
  userPage?: {
    title: string;
  };
  // Auth pages
  authPage?: {
    callbackTitle: string;
    authTitle: string;
    loginTitle: string;
    signingYouIn: string;
  };
  // Checkout pages
  checkoutPage?: {
    title: string;
    description: string;
    successTitle: string;
    successDesc: string;
    successAccess: string;
    processingDesc: string;
    startPlanning: string;
    viewAccount: string;
    backToPricing: string;
    errorTitle: string;
    errorDesc: string;
  };
  // Pricing page
  pricing?: {
    cancelledNotice: string;
    trustedBy: string;
    heroTitle: string;
    heroSubtitle: string;
    saveBadge: string;
    billingMonthly: string;
    billingAnnual: string;
    billingPeriodMonth: string;
    billingPeriodYear: string;
    priceFree: string;
    freeForever: string;
    currentPlan: string;
    subscribeNow: string;
    popularBadge: string;
    free: {
      name: string;
      description: string;
      feature1: string;
      feature2: string;
      feature3: string;
      featureDisabled1: string;
      featureDisabled2: string;
    };
    explorer: {
      name: string;
      description: string;
      price: string;
      annualNote: string;
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
      feature5: string;
      featureDisabled: string;
    };
    traveler: {
      name: string;
      description: string;
      price: string;
      annualNote: string;
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
      feature5: string;
    };
    business: {
      name: string;
      description: string;
      price: string;
      annualNote: string;
      feature1: string;
      feature2: string;
      feature3: string;
      feature4: string;
      feature5: string;
    };
    trustBadges: {
      moneyBack: string;
      securePayment: string;
      cancelAnytime: string;
    };
    compareTitle: string;
    compareSubtitle: string;
    compareFeatures: {
      aiRequests: string;
      saveItineraries: string;
      conversationHistory: string;
      pdfExport: string;
      premiumCustomization: string;
      advancedTools: string;
      prioritySupport: string;
      api: string;
      dedicatedSupport: string;
    };
    unlimited: string;
    testimonialsTitle: string;
    testimonialsSubtitle: string;
    testimonial1Quote: string;
    testimonial1Author: string;
    testimonial1Role: string;
    testimonial1Country: string;
    testimonial2Quote: string;
    testimonial2Author: string;
    testimonial2Role: string;
    testimonial2Country: string;
    testimonial3Quote: string;
    testimonial3Author: string;
    testimonial3Role: string;
    testimonial3Country: string;
    faqTitle: string;
    faqSubtitle: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    faq4Q: string;
    faq4A: string;
    faq5Q: string;
    faq5A: string;
    faq6Q: string;
    faq6A: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
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
      aiChat: "ChinaGuide AI",
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
      open: "Open",
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
      ctaSubtitle: "Start planning your trip with AI-powered recommendations.",
      recentlyViewed: "Recently Viewed",
      recommendedForYou: "Recommended for You",
      heroDesc:
        "Discover restaurants (Michelin & Black Pearl), attractions, transport tips, and emergency info - all powered by AI and curated by locals.",
      citiesTitle: "Explore Our Cities",
      citiesSubtitle:
        "From ancient capitals to modern metropolises, discover the best of China with our comprehensive city guides.",
      featuresSubtitle: "Everything you need for a great trip",
      viewAllCities: "View All Cities",
      chatWithAI: "Chat with AI",
      exploreBeijing: "Explore Beijing",
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
      openingHours: "Hours",
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
      tags: "Tags",
    },
    empty: {
      noResults: "No results found",
      noRestaurants: "No restaurants match your criteria",
      noAttractions: "No attractions found",
      noSearchResults: "No results for your search",
      tryAdjusting: "Try adjusting your filters or search terms",
      noFavorites: "No favorites yet",
      addSome: "Start exploring and save your favorites!",
    },
    errors: {
      loadFailed: "Failed to load content",
      networkError: "Network error. Please check your connection.",
      somethingWrong: "Something went wrong",
      goBack: "Go Back",
      goHome: "Go to Homepage",
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
      done: "Done",
    },
    tooltips: {
      searchTip: "Search cities, restaurants, or topics",
      filterTip: "Filter by cuisine, rating, or price",
      mapTip: "View on map",
      favoritesTip: "Add to favorites",
      shareTip: "Share with friends",
    },
    recents: {
      recentlyViewed: "Recently Viewed",
      recommended: "Recommended for You",
      clearHistory: "Clear History",
      forYou: "Because you visited {city}",
    },
    // Features section
    features: {
      restaurantGuide: "Restaurant Guide",
      restaurantGuideDesc:
        "Michelin stars, Black Pearl rankings, and local favorites with detailed reviews",
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
    register: {
      subtitle: "Create your account",
      username: "Username",
      usernamePlaceholder: "Your display name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "At least 6 characters",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Repeat your password",
      submit: "Create Account",
      orContinueWith: "or continue with",
      signUpWithGoogle: "Sign up with Google",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      errorPasswordMismatch: "Passwords do not match",
      errorPasswordLength: "Password must be at least 6 characters",
      creating: "Creating account...",
      errorTimeout: "Registration timed out. Please try again.",
      successEmailSent:
        "Account created! Please check your email to confirm your account, then sign in.",
      accountCreated: "Account Created",
      errorGoogle: "Google sign-up failed",
      errorDefault: "Registration failed",
    },
    notFound: {
      title: "Page Not Found - ChinaConnect",
      description: "The page you're looking for doesn't exist.",
      heading: "404",
      primary: "Page Not Found",
      descriptionText:
        "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
      goHome: "Go Home",
      exploreCities: "Explore Cities",
      askAi: "Ask ChinaGuide AI",
    },
    emergencyPage: {
      title: "Emergency Contacts & Help",
      subtitle: "Essential phone numbers, phrases, and tools for your safety in China",
      police: "Police",
      ambulance: "Ambulance",
      fire: "Fire",
      traffic: "Traffic",
      oneTapCalls: "One-Tap Emergency Calls",
      oneTapDesc: "Tap any number to call immediately. Works with any phone - no app needed.",
      phrases: "Emergency Translation Phrases",
      phrasesDesc: "Tap any phrase to hear the pronunciation. This card works offline.",
      gps: "GPS Location Share",
      gpsDesc:
        "Get your current location and share it with emergency services. The system also helps you find nearby hospitals, pharmacies, and police stations.",
      contacts: "Emergency Contacts",
      contactsDesc:
        "Save your hotel, tour guide, or family contacts for quick access during emergencies.",
      howToSave: "How to save contacts",
      howToSave1: "Look for the red SOS button in the bottom-right corner of any page",
      howToSave2: "Tap the menu button to open the emergency menu",
      howToSave3: "Go to the Contacts tab and add your emergency contacts",
      nearbyHelp: "Finding Help Nearby",
      nearbyDesc: "Use these tips to find medical help, pharmacies, and police quickly.",
      pageTitle: "Emergency Contacts & Phrases - ChinaConnect",
      pageDescription:
        "Essential emergency contacts and translation phrases for travelers in China. Includes police, ambulance, fire, embassy info, GPS location, and offline emergency phrases.",
      heroHeading: "Emergency Contacts & Help",
      hospitalsTitle: "Hospitals",
      hospitalSearch: "Search 'hospital' in any map app",
      hospitalInternational: "International hospitals recommended for foreigners",
      hospitalCommon: "Common: Peking Union Medical College Hospital, Beijing United Family",
      pharmaciesTitle: "Pharmacies",
      pharmacyGreenCross: "Look for the green cross symbol",
      pharmacyChains: "Large chains: Guoji Yiyao, Lianhua, Yixinke",
      pharmacyNoRx: "Many medications available without prescription",
      policeTitle: "Police Stations",
      policeSearch: "Search 'police station' for local police stations",
      policeEnglish: "English-speaking officers available at major stations",
      policeForeignAffairs: "Foreign Affairs Police can help foreigners",
      embassyTitle: "Embassy & Consulate Information",
      embassyDesc:
        "Find your embassy for passport replacement, emergency assistance, and legal help.",
      sosButtonTitle: "SOS Button - Available on Every Page",
      sosButtonDesc:
        "The emergency SOS button is always available in the bottom-right corner of every page.",
      howToUseSOSTitle: "How to Use SOS",
      sosItem1: "Tap the red SOS button to immediately call police (110)",
      sosItem2: "Long-press for 3 seconds to auto-dial your embassy",
      sosItem3: "Share your GPS location with one tap",
      sosItem4: "Long-press or right-click for quick menu access",
      offlineHeading: "Works Without Internet",
      offlineDesc: "Save emergency numbers before you travel - they work offline.",
      offlineAvailableTitle: "Offline Available",
      offlineItem1: "SOS button works without internet",
      offlineItem2: "Translation phrases cached for offline use",
      offlineItem3: "Emergency numbers (110, 120, 119, 122) always accessible",
      offlineItem4: "Download offline maps for better preparedness",
      safetyTipsTitle: "Safety Tips for Travelers",
      keepDocsTitle: "Keep Documents Safe",
      keepDocs1: "Scan passport and keep digital copy",
      keepDocs2: "Keep physical copy separate from original",
      keepDocs3: "Store embassy contact info in phone",
      keepDocs4: "Note down local emergency numbers",
      preparednessTitle: "Emergency Preparedness",
      preparedness1: "Save emergency numbers in phone contacts",
      preparedness2: "Download offline maps (Google Maps)",
      preparedness3: "Keep power bank charged",
      preparedness4: "Save hotel address in Chinese",
      communicationTitle: "Communication Tips",
      communication1: "Learn basic Mandarin phrases",
      communication2: "Use translation apps when needed",
      communication3: "Download emergency phrase cards",
      communication4: "Save your nationality in phone notes",
      lostPassportTitle: "Lost Passport? Here's What to Do",
      inChinaTitle: "In China",
      lpStep1Title: "Report to Police",
      lpStep1Desc: "Go to nearest police station and get a police report",
      lpStep2Title: "Contact Embassy",
      lpStep2Desc: "Call your embassy for emergency travel document",
      lpStep3Title: "Visit Embassy",
      lpStep3Desc: "Bring police report, photos, and ID to get emergency passport",
      importantTipsTitle: "Important Tips",
      lpTip1: "Keep digital copies of passport in cloud storage",
      lpTip2: "Emergency passport is usually valid for limited time",
      lpTip3: "Your embassy can contact family if needed",
      lpTip4: "Keep hotel card with Chinese address",
    },
    aiPage: {
      title: "ChinaGuide AI - Your Intelligent China Travel Expert",
      description:
        "Your personal China travel intelligence - expert itinerary planning, real-time recommendations, local insights, and cultural guidance, all powered by advanced AI.",
      heroBadge: "Powered by Advanced AI",
      heroTitle: "ChinaGuide AI",
      heroSubtitle:
        "Your personal China travel intelligence - itineraries, local insights, and real-time guidance.",
      startPlanningCTA: "Start Planning",
      promptsTitle: "Try asking",
      promptsSubtitle: "Pick a prompt or type your own below",
      prompts: [
        { icon: "🏯", text: "Plan a 5-day Beijing trip with imperial history and modern culture" },
        { icon: "🍜", text: "Best local street food in Chengdu that tourists usually miss" },
        { icon: "🚄", text: "How to travel from Shanghai to Xi'an by high-speed rail?" },
        { icon: "💳", text: "Can I use Apple Pay in China? What payment apps do I need?" },
        { icon: "🏨", text: "Recommend boutique hotels in Hangzhou near West Lake" },
        { icon: "🤝", text: "Business etiquette tips for meeting Chinese partners" },
      ],
      authGateTitle: "Sign in to chat",
      authGateSignupTitle: "Create your account",
      authGateDescription:
        "AI Chat requires a free account so we can track your monthly usage and save your conversations.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "Password (min 6 chars)",
      signInButton: "Sign in",
      signUpButton: "Create account",
      orContinueWith: "or",
      noAccountPrompt: "No account yet?",
      haveAccountPrompt: "Already have one?",
      switchToSignUp: "Create one",
      switchToSignIn: "Sign in",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "Authentication failed",
      conversationsTitle: "Conversations",
      showSidebarTitle: "Show conversations",
      hideSidebarTitle: "Hide sidebar",
      newChatButton: "+ New chat",
      noConversationsYet: "No conversations yet",
      messageLabel: "message",
      messagesLabel: "messages",
      deleteConfirm: "Delete this conversation?",
      deleteTitle: "Delete",
    },
    accountPage: {
      loading: "Loading your account...",
      signInRequired: "Sign in required",
      signInRequiredDesc: "Please sign in to view your account.",
      signIn: "Sign In",
    },
    language: {
      switchTo: "Switch to",
      current: "Current",
      english: "English",
      chinese: "Chinese",
    },
    pricing: {
      cancelledNotice: "Payment was cancelled. You can try again below.",
      trustedBy: "Trusted by 10,000+ travelers",
      heroTitle: "Simple, Transparent Pricing",
      heroSubtitle:
        "One plan for every traveler - start free, upgrade when you need more AI power.",
      saveBadge: "Save 20%",
      billingMonthly: "Monthly",
      billingAnnual: "Annual",
      billingPeriodMonth: "/mo",
      billingPeriodYear: "/yr",
      priceFree: "$0",
      freeForever: "Free forever",
      currentPlan: "Current Plan",
      subscribeNow: "Subscribe Now",
      popularBadge: "Most Popular",
      free: {
        name: "Free",
        description: "Get started with basic planning",
        feature1: "5 AI requests per month",
        feature2: "Basic travel planning",
        feature3: "View itineraries",
        featureDisabled1: "Save itineraries",
        featureDisabled2: "PDF export",
      },
      explorer: {
        name: "Explorer",
        description: "Best for casual travelers",
        price: "$4.99",
        annualNote: "Billed $47.99/year (save $12)",
        feature1: "20 AI requests per month",
        feature2: "Save itineraries",
        feature3: "Conversation history",
        feature4: "3 cities unlocked",
        feature5: "Priority email support",
        featureDisabled: "PDF export",
      },
      traveler: {
        name: "Traveler",
        description: "For frequent China visitors",
        price: "$9.99",
        annualNote: "Billed $95.99/year (save $24)",
        feature1: "40 AI requests per month",
        feature2: "Save & export itineraries",
        feature3: "PDF export",
        feature4: "Premium customization",
        feature5: "Advanced travel tools",
      },
      business: {
        name: "Business",
        description: "For travel agents and teams",
        price: "$29.99",
        annualNote: "Billed $287.99/year (save $72)",
        feature1: "Unlimited AI requests",
        feature2: "Team collaboration (up to 5)",
        feature3: "White-label itineraries",
        feature4: "API access",
        feature5: "Dedicated account manager",
      },
      trustBadges: {
        moneyBack: "30-day money-back",
        securePayment: "Secure payment",
        cancelAnytime: "Cancel anytime",
      },
      compareTitle: "Compare All Features",
      compareSubtitle:
        "See exactly what is included in each plan. All plans include access to our AI-powered travel assistant.",
      compareFeatures: {
        aiRequests: "AI Requests per Month",
        saveItineraries: "Save Itineraries",
        conversationHistory: "Conversation History",
        pdfExport: "PDF Export",
        premiumCustomization: "Premium Customization",
        advancedTools: "Advanced Travel Tools",
        prioritySupport: "Priority Support",
        api: "API Access",
        dedicatedSupport: "Dedicated Support",
      },
      unlimited: "Unlimited",
      testimonialsTitle: "Loved by Travelers Worldwide",
      testimonialsSubtitle: "Hear what our users say about their ChinaConnect experience",
      testimonial1Quote:
        "ChinaConnect made planning my first trip to Beijing incredibly easy. The AI suggestions for local restaurants were spot on.",
      testimonial1Author: "Sarah K.",
      testimonial1Role: "Explorer Plan",
      testimonial1Country: "USA",
      testimonial2Quote:
        "As a travel agent, the Business plan is worth every penny. I create custom itineraries for clients in minutes. The PDF export feature saves me hours of work.",
      testimonial2Author: "Li Wei T.",
      testimonial2Role: "Business Plan",
      testimonial2Country: "UK",
      testimonial3Quote:
        "I upgraded to Traveler after my free requests ran out. The premium customization helped me plan a perfect 2-week cultural immersion trip. Highly recommend.",
      testimonial3Author: "Maria R.",
      testimonial3Role: "Traveler Plan",
      testimonial3Country: "Germany",
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "Everything you need to know about our plans and billing",
      faq1Q: "How do I upgrade or downgrade my plan?",
      faq1A:
        "You can change your plan at any time from your account settings. When upgrading, you will get immediate access to new features and be charged a prorated amount. Downgrades take effect at the start of your next billing cycle - you will keep your current features until then.",
      faq2Q: "How do I cancel my subscription?",
      faq2A:
        "You can cancel your subscription anytime from your account page. After cancellation, you will continue to have access to paid features until the end of your current billing period. Your account will then revert to the Free plan automatically.",
      faq3Q: "What is your refund policy?",
      faq3A:
        "We offer a 7-day money-back guarantee for new subscribers. If you are not satisfied within the first 7 days, contact our support team for a full refund. After 7 days, refunds are handled on a case-by-case basis. Annual plans can be refunded prorated within the first 30 days.",
      faq4Q: "When does my monthly quota reset?",
      faq4A:
        "Your AI request quota resets on the 1st of each month at midnight UTC. Unused requests do not roll over to the next month. If you upgrade mid-cycle, your new higher limit takes effect immediately.",
      faq5Q: "What happens when I reach my AI request limit?",
      faq5A:
        "You will see a friendly reminder suggesting an upgrade. You can still view your saved itineraries and use all other features available in your current tier. Your remaining features are never locked.",
      faq6Q: "What payment methods do you accept?",
      faq6A:
        "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover). All payments are securely processed through our payment partner with industry-standard encryption. We never store your card details on our servers.",
      ctaTitle: "Ready to Start Your China Adventure?",
      ctaSubtitle:
        "Join thousands of travelers using AI to plan their perfect China trip. Start free today.",
      ctaPrimary: "Start Free Today",
      ctaSecondary: "Explore Features",
    },
    businessGuidePage: {
      backToGuide: "← Back to Travel Guide",
      indexTitle: "Business Express - ChinaConnect",
      indexDescription: "Practical tools for foreign business travelers in China.",
      indexSubtitle: "Business Express",
      registrationShort: "Company Registration Guide",
      registrationTitle: "China Company Registration Guide - ChinaConnect",
      registrationDescription:
        "Step-by-step guide to registering a WFOE, Representative Office, or other entity in China as a foreign investor. Complete timeline and document checklist.",
      registrationSubtitle: "工商注册指南",
      etiquetteShort: "Business Etiquette Essentials",
      etiquetteTitle: "China Business Etiquette - ChinaConnect",
      etiquetteDescription:
        "Master Chinese business etiquette: greetings, gift-giving, dining, and meeting protocols for foreign professionals.",
      etiquetteSubtitle: "商务礼仪速成",
      expoShort: "Expo & Event Calendar",
      expoTitle: "China Expo & Trade Show Calendar - ChinaConnect",
      expoDescription:
        "Plan trips around China's top trade shows and industry events. Canton Fair, CIIE, design weeks, and hundreds of regional expos with dates and venues.",
      expoSubtitle: "展会与活动日厈",
      invitationShort: "Business Invitation Letters",
      invitationTitle: "China Business Invitation Letter Templates - ChinaConnect",
      invitationDescription:
        "Download ready-to-use bilingual invitation letters for visa applications. Editable formats covering trade delegations, conference attendance, and partner visits.",
      invitationSubtitle: "商务邀请函模板",
      translationShort: "Translation & Interpreting",
      translationTitle: "Translation & Interpreting Services - ChinaConnect",
      translationDescription:
        "Book vetted interpreters and translators for meetings, conferences, and negotiations in China.",
      translationSubtitle: "翻译服务预约",
    },
    guidePage: {
      home: "← Back to Home",
      travelGuide: "Travel Guide",
      visaSubtitle: "Visa - Complete guide for entering China",
      visaTitleShort: "Visa Guide",
      visaStageTitle: "1. Visa & Entry",
      visaStageDescription: "Everything you need before boarding the plane.",
      paymentSubtitle: "Payment - Alipay, WeChat Pay & cash tips",
      paymentTitleShort: "Payment Guide",
      paymentStageTitle: "2. Payment Setup",
      paymentStageDescription: "Get Alipay and WeChat Pay working before you arrive.",
      communicationSubtitle: "Communication - SIM cards, VPN, and apps",
      communicationTitleShort: "Communication Guide",
      communicationStageTitle: "3. Communication",
      communicationStageDescription: "Stay connected with eSIMs, VPN and essential apps.",
      transportSubtitle: "Transport - Getting around China with confidence",
      transportTitleShort: "Transport Guide",
      transportStageTitle: "4. Transport",
      transportStageDescription: "Navigate metros, high-speed trains and ride-hailing apps.",
      accommodationSubtitle: "Accommodation - Hotels, hostels and booking tips",
      accommodationTitleShort: "Accommodation Guide",
      accommodationStageTitle: "5. Accommodation",
      accommodationStageDescription: "Find and book the right place to stay for every budget.",
      emergencySubtitle: "Emergency - Police, ambulance, embassy contacts",
      emergencyTitleShort: "Emergency Guide",
      emergencyStageTitle: "6. Emergency",
      emergencyStageDescription: "Critical contacts and phrasebook for emergencies.",
      departureSubtitle: "Departure - Tax refunds and leaving China",
      departureTitleShort: "Departure Guide",
      departureStageTitle: "7. Departure",
      departureStageDescription: "Tax refunds, customs, and final tips before you fly home.",
      diningSubtitle: "Dining - Restaurants, etiquette and tipping",
      diningTitleShort: "Dining Guide",
      diningStageTitle: "8. Dining",
      diningStageDescription: "Order with confidence and discover local favorites.",
      culturalWarningsSubtitle: "Cultural differences and faux pas to avoid",
      culturalWarningsTitleShort: "Cultural Warnings",
      scamPreventionSubtitle: "Protect yourself from common scams in China",
      scamPreventionTitleShort: "Scam Prevention",
      transparencySubtitle: "Know the fair prices, avoid being overcharged",
      transparencyTitleShort: "Price Transparency",
      emergencyHeading: "Emergency Contacts",
      emergencyPolice: "Police 110",
      emergencyAmbulance: "Ambulance 120",
      emergencyFire: "Fire 119",
      emergencyTourism: "Tourist Hotline 12301",
      viewAttractions: "View top attractions",
      viewFullEmergency: "View full emergency guide",
      popularByCity: "Popular by city",
      quickBeijingDesc: "Capital highlights & must-eats",
      quickFoodDesc: "Michelin, Black Pearl & local favorites",
      quickScamDesc: "Common scams and how to avoid them",
      cityBeijing: "Beijing",
      cityShanghai: "Shanghai",
      cityXian: "Xi'an",
      cityChengdu: "Chengdu",
      indexHeroTitle: "🇨🇳 China Complete Travel Guide",
      indexHeroSubtitle:
        "Complete Travel Guide to China — from preparation to departure, covering every aspect of travel, including business travel tools.",
      indexStagesTitle: "8 Stages for a Smooth China Trip",
      indexGuidesHeading: "🗺️ Travel Guides",
      indexBusinessHeading: "🚀 Business Travel Tools",
      indexBusinessSubtitle:
        "From invitation letters to business etiquette — five practical tools for foreign business travelers.",
      viewAllBusinessTools: "View all business tools",
      viewAllBusinessToolsCta: "Open Business Express",
      viewAllBusinessToolsDesc:
        "See all business tools with detailed stats and quick-start guides.",
    },
    cityPage: {
      home: "← Back to city home",
      gettingTo: "Getting to {city}",
      attractionsHeading: "Top Attractions",
      attractionsSubtitle: "Must-visit places picked by locals and travelers",
      attractionsExploreCount: "{city} — {count} places to explore",
      phoneIcon: "📞",
      bestTimeHeading: "Best Time to Visit",
      quickFactsHeading: "Quick Facts",
      topHighlightsHeading: "Top Highlights",
      foodHeading: "Where to Eat",
      foodSubtitle: "Michelin stars, Black Pearl picks, and local favorites",
      hotelsHeading: "Where to Stay",
      transportSubtitle: "Getting around {city}",
      noResults: "No attractions found",
      noResultsDesc: "Try adjusting your filters or search keywords.",
      noHotels: "No hotels found",
      noHotelsDesc: "Try a different price range or category.",
      dataSourcesHeading: "Data Sources",
      dataSourcesDesc: "Where this data comes from",
      foodHighlightsHeading: "Food Highlights",
      foodHighlightsSubtitle: "Locally recommended",
      hotelsCountUnit: "hotels",
      viewAllHotels: "View all {totalHotelCount} hotels",
    },
    foodPage: {
      subtitle: "Michelin, Black Pearl & local favorites",
      indexTitle: "🍜 China Food Map",
      exploreFood: "Explore Food",
      noCityTitle: "Can't find the city you want?",
      showingCount: "Showing",
      citiesUnit: "cities",
      back: "← Back to {city}",
      heroCityFood: "{city} Food",
      restaurantsUnit: "restaurants",
      filteringLabel: "Filtering:",
      backToCity: "Back to {city}",
      callPhone: "Call",
      amapNav: "Amap",
      navigate: "Navigate",
      perPerson: "/person",
      emptyTitle: "No restaurants yet",
      emptyDesc: "No restaurants in this category. Try another filter.",
      dataSourcesHeading: "Reference Sources",
      dataSourcesDesc: "These sources can help you learn more about {city}'s food culture:",
      filterMichelin: "Michelin",
      filterBlackPearl: "Black Pearl",
      filterLocal: "Local Favorite",
      filterCasual: "Casual",
      filterBudget: "Budget",
      otherRestaurants: "Other restaurants in {city}",
      cityEmpty: "No restaurants yet",
      cityEmptyDesc: "We're still curating restaurants for {city}.",
      cityEmptySubtitle: "Add some restaurants to start exploring",
      emptyCta: "View all restaurants",
      metaFooter: "Restaurant data sourced from public reviews and guides",
    },
    offlinePage: {
      title: "You are offline",
      bannerTitle: "Offline mode",
      tryAgain: "Try again",
      tipsHeading: "Travel tips while offline",
      tipsList1: "Save key phrases and addresses before going offline.",
      tipsList2: "Download offline maps in your maps app.",
      tipsList3: "Keep a screenshot of your hotel booking.",
      tipsList4: "Use hotel Wi-Fi for video calls back home.",
      tipsList5: "Most cafes and malls have free Wi-Fi.",
      tipsList6: "Carry a small notepad for writing addresses.",
      phrase1En: "Help!",
      phrase2En: "Call the police!",
      phrase3En: "I need an ambulance",
      phrase4En: "Fire!",
      phrase5En: "I am lost",
      phrase6En: "I need help",
      phrase7En: "Where is the hospital?",
    },
    profilePage: {
      title: "My Profile - ChinaConnect",
    },
    userPage: {
      title: "User Profile - ChinaConnect",
    },
    authPage: {
      callbackTitle: "Signing in...",
      authTitle: "Login / Register - ChinaConnect",
      loginTitle: "Sign In - ChinaConnect",
      signingYouIn: "Signing you in...",
    },
    checkoutPage: {
      title: "Payment Successful - ChinaConnect",
      description: "Your subscription has been activated successfully",
      successTitle: "Payment Successful!",
      successDesc: "Your subscription has been activated.",
      successAccess: "You now have access to all the features of your new plan.",
      processingDesc: "Please wait while we confirm your subscription.",
      startPlanning: "Start Planning",
      viewAccount: "View account",
      backToPricing: "← Back to pricing",
      errorTitle: "Something went wrong",
      errorDesc: "We couldn't process your payment. Please try again or contact support.",
    },
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
      open: "開く",
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
      ctaSubtitle: "AIを活用したおすすめで旅程を計画しましょう。",
      recentlyViewed: "最近見た",
      recommendedForYou: "あなたへのおすすめ",
      heroDesc:
        "ミシュラン・黒珍珠のレストラン、観光地、交通情報、緊急連絡先まで — AIと地元在住者によって厳選された情報をお届けします。",
      citiesTitle: "都市を探す",
      citiesSubtitle: "古都から現代都市まで、包括的なシティガイドで中国の魅力を発見しましょう。",
      featuresSubtitle: "素晴らしい旅に必要なすべて",
      viewAllCities: "すべての都市を見る",
      chatWithAI: "AIとチャット",
      exploreBeijing: "北京を探索",
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
      openingHours: "営業時間",
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
      tags: "タグ",
    },
    empty: {
      noResults: "結果が見つかりません",
      noRestaurants: "条件に 맞는レストランがありません",
      noAttractions: "景点が見つかりません",
      noSearchResults: "検索結果がありません",
      tryAdjusting: "フィルターまたは検索語を調整してみてください",
      noFavorites: "お気に入りがまだありません",
      addSome: "探索してお気に入りを追加しましょう！",
    },
    errors: {
      loadFailed: "コンテンツの読み込みに失敗しました",
      networkError: "ネットワークエラー。接続を確認してください。",
      somethingWrong: "問題が発生しました",
      goBack: "戻る",
      goHome: "ホームページへ",
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
      done: "完了",
    },
    tooltips: {
      searchTip: "都市、レストラン、トピックを検索",
      filterTip: "料理、評価、価格で確認",
      mapTip: "地図で表示",
      favoritesTip: "お気に入りに追加",
      shareTip: "友達にシェア",
    },
    recents: {
      recentlyViewed: "最近見た",
      recommended: "おすすめ",
      clearHistory: "履歴をクリア",
      forYou: "{city}を見た的你へのおすすめ",
    },
    // Features section
    features: {
      restaurantGuide: "レストランガイド",
      restaurantGuideDesc:
        "ミシュラン星、黒真珠ランキング、地元のお気に入りを詳細レビュー付きで紹介",
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
      chinese: "中国語",
    },

    emergencyPage: {
      title: "緊急連絡先とサポート",
      subtitle: "中国での安全のための重要な電話番号、文例、ツール",
      police: "警察",
      ambulance: "救急車",
      fire: "消防",
      traffic: "交通事故",
      oneTapCalls: "ワンタップ緊急通報",
      oneTapDesc:
        "いずれかの番号をタップするとすぐに通話できます。アプリ不要、どんな電話でも使えます。",
      phrases: "緊急翻訳フレーズ",
      phrasesDesc:
        "フレーズをタップすると発音を聞くことができます。このカードはオフラインで動作します。",
      gps: "GPS位置情報共有",
      gpsDesc: "現在地を取得して緊急サービスと共有します。近くの病院、薬局、警察署も検索できます。",
      contacts: "緊急連絡先",
      contactsDesc:
        "ホテル、ツアーガイド、ご家族の連絡先を保存して、緊急時にすぐにアクセスできます。",
      howToSave: "連絡先の保存方法",
      howToSave1: "任意のページ右下にある赤い SOS ボタンを探してください",
      howToSave2: "メニューボタンをタップして緊急メニューを開きます",
      howToSave3: "「連絡先」タブで緊急連絡先を追加してください",
      nearbyHelp: "近くのサポートを探す",
      nearbyDesc: "医療、薬局、警察を素早く見つけるためのヒントです。",
      pageTitle: "緊急連絡先とフレーズ - ChinaConnect",
      pageDescription:
        "中国を旅行する方向けの必須の緊急連絡先と翻訳フレーズ。警察、救急、消防、大使館情報、GPS位置、オフライン緊急フレーズを含みます。",
      heroHeading: "緊急連絡先とサポート",
      hospitalsTitle: "病院",
      hospitalSearch: "地図アプリで「病院」を検索",
      hospitalInternational: "外国人向け推奨病院",
      hospitalCommon: "例：北京協和医院、北京和睦家医院",
      pharmaciesTitle: "薬局",
      pharmacyGreenCross: "緑の十字マークを探してください",
      pharmacyChains: "大手チェーン：国薬、蓮花、一心堂",
      pharmacyNoRx: "多くの薬が処方箋なしで購入可能",
      policeTitle: "警察署",
      policeSearch: "「警察署」で地元の警察署を検索",
      policeEnglish: "主要警察署では英語対応 officer がいます",
      policeForeignAffairs: "外国人対応警察が外国人を支援します",
      embassyTitle: "大使館・領事館情報",
      embassyDesc: "パスポートの再発行、緊急支援、法的手続きについては大使館にご相談ください。",
      sosButtonTitle: "SOS ボタン - 全ページで利用可能",
      sosButtonDesc: "緊急 SOS ボタンはすべてのページの右下隅で常に利用可能です。",
      howToUseSOSTitle: "SOS の使い方",
      sosItem1: "赤い SOS ボタンをタップして警察（110）に通報",
      sosItem2: "3 秒間長押しすると大使館に自動ダイヤル",
      sosItem3: "ワンタップで GPS 位置情報を共有",
      sosItem4: "長押しまたは右クリックでクイックメニューにアクセス",
      offlineHeading: "オフラインで動作",
      offlineDesc: "旅行前に緊急番号を保存しておけば、オフラインでも使用できます。",
      offlineAvailableTitle: "オフライン対応",
      offlineItem1: "SOS ボタンはインターネットなしで作動",
      offlineItem2: "翻訳フレーズはオフライン用にキャッシュ",
      offlineItem3: "緊急番号 (110, 120, 119, 122) はいつでも利用可能",
      offlineItem4: "オフラインマップをダウンロードして備えましょう",
      safetyTipsTitle: "旅行者向け安全のヒント",
      keepDocsTitle: "書類を守る",
      keepDocs1: "パスポートをスキャンしてデジタルコピーを保存",
      keepDocs2: "原本とは別に物理コピーを保管",
      keepDocs3: "大使館の連絡先を電話に保存",
      keepDocs4: "現地の緊急番号をメモ",
      preparednessTitle: "緊急時の準備",
      preparedness1: "緊急番号を電話の連絡先に保存",
      preparedness2: "オフラインマップ (Google Maps) をダウンロード",
      preparedness3: "モバイルバッテリーを充電しておく",
      preparedness4: "ホテルの住所を中国語で保存",
      communicationTitle: "コミュニケーションのヒント",
      communication1: "基本的な中国語フレーズを学ぶ",
      communication2: "必要に応じて翻訳アプリを使用",
      communication3: "緊急フレーズカードをダウンロード",
      communication4: "国籍を電話のメモに保存",
      lostPassportTitle: "パスポートを紛失したら？",
      inChinaTitle: "中国国内で",
      lpStep1Title: "警察に通報",
      lpStep1Desc: "最寄り警察署で盗難届を提出",
      lpStep2Title: "大使館に連絡",
      lpStep2Desc: "緊急渡航文書のために大使館に電話",
      lpStep3Title: "大使館を訪問",
      lpStep3Desc: "警察届、写真、身分証明書を持参し緊急パスポートを取得",
      importantTipsTitle: "重要なお知らせ",
      lpTip1: "パスポートのデジタルコピーをクラウドに保存",
      lpTip2: "緊急パスポートは通常有効期間が限られています",
      lpTip3: "大使館は必要に応じてご家族に連絡できます",
      lpTip4: "中国語の住所が書かれたホテルカードをお持ちください",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "AI 搭載",
      heroTitle: "ChinaGuide AI",
      heroSubtitle:
        "あなたの専属中国旅行インテリジェンス — 旅程プラン、ローカル洞察、リアルタイム案内。",
      startPlanningCTA: "プランを始める",
      promptsTitle: "質問例",
      promptsSubtitle: "プロンプトを選ぶか、下に自由入力",
      prompts: [
        {
          icon: "🏯",
          text: "北京 5 日間の旅行プラン（宮廷史と現代文化）",
        },
        {
          icon: "🍜",
          text: "成都で観光客が見落としがちな地元のストリートフード",
        },
        {
          icon: "🚄",
          text: "上海から西安への高速鉄道の行き方",
        },
        {
          icon: "💳",
          text: "中国で Apple Pay は使える？必要な決済アプリは？",
        },
        {
          icon: "🏨",
          text: "杭州西湖近くのブティックホテルを推薦して",
        },
        {
          icon: "🤝",
          text: "中国のパートナーとの商談エチケット",
        },
      ],
      authGateTitle: "サインインしてチャット",
      authGateSignupTitle: "アカウント作成",
      authGateDescription:
        "AI チャットは無料アカウントが必要です。月間利用状況と会話履歴の保存のためです。",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "パスワード（6 文字以上）",
      signInButton: "サインイン",
      signUpButton: "アカウント作成",
      orContinueWith: "または",
      noAccountPrompt: "アカウント未登録？",
      haveAccountPrompt: "登録済みですか？",
      switchToSignUp: "作成する",
      switchToSignIn: "サインイン",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "認証に失敗しました",
      conversationsTitle: "会話",
      showSidebarTitle: "会話を表示",
      hideSidebarTitle: "サイドバーを隠す",
      newChatButton: "+ 新しいチャット",
      noConversationsYet: "まだ会話がありません",
      messageLabel: "メッセージ",
      messagesLabel: "メッセージ",
      deleteConfirm: "この会話を削除しますか？",
      deleteTitle: "削除",
    },
    accountPage: {
      loading: "アカウントを読み込み中...",
      signInRequired: "サインインが必要です",
      signInRequiredDesc: "アカウントを表示するにはサインインしてください。",
      signIn: "サインイン",
    },
    profilePage: {
      title: "マイプロフィール - ChinaConnect",
    },
    userPage: {
      title: "ユーザープロフィール - ChinaConnect",
    },
    authPage: {
      callbackTitle: "サインイン中...",
      authTitle: "ログイン / 登録 - ChinaConnect",
      loginTitle: "サインイン - ChinaConnect",
      signingYouIn: "サインイン処理中...",
    },
    checkoutPage: {
      title: "支払い成功 - ChinaConnect",
      description: "サブスクリプションが正常に有効化されました",
      successTitle: "支払い成功！",
      successDesc: "サブスクリプションが有効化されました。",
      successAccess: "新しいプランの全機能にアクセスできます。",
      processingDesc: "サブスクリプションを確認中です。",
      startPlanning: "プランを始める",
      viewAccount: "アカウントを表示",
      backToPricing: "← 料金に戻る",
      errorTitle: "問題が発生しました",
      errorDesc: "お支払いを処理できませんでした。再試行するかサポートにお問い合わせください。",
    },
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
      open: "열기",
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
      ctaSubtitle: "AI 기반 추천으로 여행을 계획하세요.",
      recentlyViewed: "최근 본 것",
      recommendedForYou: "추천 항목",
      heroDesc:
        "미슐랭·흑진주 레스토랑, 관광지, 교통 팁, 응급 연락처까지 — AI와 현지인들이 선별한 정보를 제공합니다.",
      citiesTitle: "도시 탐험",
      citiesSubtitle: "고대 수도부터 현대 도시까지, 종합 도시 가이드로 중국의 매력을 발견하세요.",
      featuresSubtitle: "훌륭한 여행을 위한 모든 것",
      viewAllCities: "모든 도시 보기",
      chatWithAI: "AI와 채팅",
      exploreBeijing: "베이징 탐험",
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
      openingHours: "운영 시간",
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
      tags: "태그",
    },
    empty: {
      noResults: "결과 없음",
      noRestaurants: "조건에 맞는 음식점 없음",
      noAttractions: "명소 없음",
      noSearchResults: "검색 결과 없음",
      tryAdjusting: "필터 또는 검색어 조정",
      noFavorites: "아직 즐겨찾기 없음",
      addSome: "탐험을 시작하고 즐겨찾기에 추가하세요!",
    },
    errors: {
      loadFailed: "콘텐츠 로드 실패",
      networkError: "네트워크 오류. 연결을 확인하세요.",
      somethingWrong: "문제가 발생했습니다",
      goBack: "뒤로 가기",
      goHome: "홈으로 가기",
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
      done: "완료",
    },
    tooltips: {
      searchTip: "도시, 음식점, 주제 검색",
      filterTip: "요리, 평점, 가격으로 필터",
      mapTip: "지도로 보기",
      favoritesTip: "즐겨찾기에 추가",
      shareTip: "친구와 공유",
    },
    recents: {
      recentlyViewed: "최근 본 것",
      recommended: "추천",
      clearHistory: "기록 지우기",
      forYou: "{city}을 본 당신을 위한 추천",
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
      chinese: "중국어",
    },

    emergencyPage: {
      title: "긴급 연락처 및 도움말",
      subtitle: "중국 내 안전을 위한 필수 전화번호, 문장 및 도구",
      police: "경찰",
      ambulance: "구급차",
      fire: "소방",
      traffic: "교통사고",
      oneTapCalls: "원탭 긴급 전화",
      oneTapDesc:
        "아무 번호나 탭하면 바로 통화됩니다. 앱 불필요, 어떤 전화机都可以 사용 가능합니다.",
      phrases: "긴급 통역 문장",
      phrasesDesc: "문장을 탭하면 발음을 들을 수 있습니다. 이 카드는 오프라인에서 작동합니다.",
      gps: "GPS 위치 공유",
      gpsDesc:
        "현재 위치를 가져와 긴급 서비스와 공유합니다. 근처 병원, 약국, 경찰서도 검색할 수 있습니다.",
      contacts: "긴급 연락처",
      contactsDesc: "호텔, 투어 가이드, 가족 연락처를 저장해 긴급 시 빠르게 접근하세요.",
      howToSave: "연락처 저장 방법",
      howToSave1: "모든 페이지 오른쪽 하단의 빨간 SOS 버튼을 찾으세요",
      howToSave2: "메뉴 버튼을 눌러 긴급 메뉴를 엽니다",
      howToSave3: "「연락처」 탭에서 긴급 연락처를 추가하세요",
      nearbyHelp: "주변 도움말 찾기",
      nearbyDesc: "의료, 약국, 경찰을 빠르게 찾는 팁입니다.",
      pageTitle: "긴급 연락처 및 문장 - ChinaConnect",
      pageDescription:
        "중국 여행자를 위한 필수 긴급 연락처 및 통역 문장. 경찰, 구급차, 소방, 대사관 정보, GPS 위치, 오프라인 긴급 문장을 포함합니다.",
      heroHeading: "긴급 연락처 및 도움말",
      hospitalsTitle: "병원",
      hospitalSearch: "지도 앱에서 「병원」 검색",
      hospitalInternational: "외국인 추천 병원",
      hospitalCommon: "예: 北京协和医院, 北京和睦家",
      pharmaciesTitle: "약국",
      pharmacyGreenCross: "녹색 십자 마크를 찾으세요",
      pharmacyChains: "대형 체인: 国药, 莲花, 一心堂",
      pharmacyNoRx: "많은 의약품이 처방전 없이 구매 가능",
      policeTitle: "경찰서",
      policeSearch: "「경찰서」로 지역 경찰서 검색",
      policeEnglish: "주요 경찰서에서 영어 가능 직원 제공",
      policeForeignAffairs: "외국인 담당 경찰이 외국인을 지원합니다",
      embassyTitle: "대사관 및 영사관 정보",
      embassyDesc: "여권 재발급, 긴급 지원, 법적 도움은 대사관에 문의하세요.",
      sosButtonTitle: "SOS 버튼 - 모든 페이지에서 사용 가능",
      sosButtonDesc: "긴급 SOS 버튼은 모든 페이지의 오른쪽 하단에서 항상 사용 가능합니다.",
      howToUseSOSTitle: "SOS 사용법",
      sosItem1: "빨간 SOS 버튼을 눌러 즉시 경찰(110)에 전화",
      sosItem2: "3초간 길게 눌러 대사관 자동 전화 걸기",
      sosItem3: "한 번 눌러 GPS 위치 공유",
      sosItem4: "길게 누르거나 오른쪽 클릭으로 빠른 메뉴 접근",
      offlineHeading: "오프라인에서도 작동",
      offlineDesc: "여행 전에 긴급 번호를 저장해 두면 오프라인에서도 사용할 수 있습니다.",
      offlineAvailableTitle: "오프라인 사용 가능",
      offlineItem1: "SOS 버튼은 인터넷 없이 작동",
      offlineItem2: "번역 문장은 오프라인용으로 캐시됨",
      offlineItem3: "긴급 번호 (110, 120, 119, 122) 항상 접근 가능",
      offlineItem4: "더 나은 준비를 위해 오프라인 지도 다운로드",
      safetyTipsTitle: "여행자를 위한 안전 팁",
      keepDocsTitle: "문서 안전하게 보관",
      keepDocs1: "여권 스캔 및 디지털 사본 보관",
      keepDocs2: "원본과 별도로 물리적 사본 보관",
      keepDocs3: "대사관 연락처를 전화에 저장",
      keepDocs4: "현지 긴급 번호 메모",
      preparednessTitle: "긴급 대비",
      preparedness1: "긴급 번호를 전화 연락처에 저장",
      preparedness2: "오프라인 지도 (Google Maps) 다운로드",
      preparedness3: "보조배터리 충전 유지",
      preparedness4: "호텔 주소를 중국어로 저장",
      communicationTitle: "의사소통 팁",
      communication1: "기본 중국어 문장 학습",
      communication2: "필요시 번역 앱 사용",
      communication3: "긴급 문장 카드 다운로드",
      communication4: "국적을 전화 메모에 저장",
      lostPassportTitle: "여권을 잃어버리면?",
      inChinaTitle: "중국에서",
      lpStep1Title: "경찰에 신고",
      lpStep1Desc: "가장 가까운 경찰서에서 경찰 보고서를 받으세요",
      lpStep2Title: "대사관에 연락",
      lpStep2Desc: "긴급 여행 문서를 위해 대사관에 전화하세요",
      lpStep3Title: "대사관 방문",
      lpStep3Desc: "경찰 보고서, 사진, 신분증을 가져가서 긴급 여권을 받으세요",
      importantTipsTitle: "중요한 팁",
      lpTip1: "여권의 디지털 사본을 클라우드에 보관",
      lpTip2: "긴급 여권은 보통 제한된 기간만 유효합니다",
      lpTip3: "필요시 대사관이 가족에게 연락할 수 있습니다",
      lpTip4: "중국어 주소가 적힌 호텔 카드를 보관하세요",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "AI 기반",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "당신의 중국 여행 인텔리전스 — 일정, 현지 통찰, 실시간 안내.",
      startPlanningCTA: "계획 시작",
      promptsTitle: "질문 예시",
      promptsSubtitle: "프롬프트를 선택하거나 직접 입력",
      prompts: [
        {
          icon: "🏯",
          text: "베이징 5 일 일정 (제왕 역사 + 현대 문화)",
        },
        {
          icon: "🍜",
          text: "청두에서 관광객이 놓치는 길거리 음식",
        },
        {
          icon: "🚄",
          text: "상하이에서 시안까지 고속철도 이용법",
        },
        {
          icon: "💳",
          text: "중국에서 Apple Pay 사용 가능? 어떤 결제 앱이 필요한가?",
        },
        {
          icon: "🏨",
          text: "항저우 서호附近的 부티크 호텔 추천",
        },
        {
          icon: "🤝",
          text: "중국 파트너와의 비즈니스 매너 팁",
        },
      ],
      authGateTitle: "로그인하여 채팅",
      authGateSignupTitle: "계정 만들기",
      authGateDescription:
        "AI 채팅은 무료 계정이 필요합니다. 월간 사용량과 대화 기록을 저장하기 위해서입니다.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "비밀번호 (6 자 이상)",
      signInButton: "로그인",
      signUpButton: "계정 만들기",
      orContinueWith: "또는",
      noAccountPrompt: "계정이 없으신가요?",
      haveAccountPrompt: "이미 계정이 있나요?",
      switchToSignUp: "만들기",
      switchToSignIn: "로그인",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "인증 실패",
      conversationsTitle: "대화",
      showSidebarTitle: "대화 표시",
      hideSidebarTitle: "사이드바 숨기기",
      newChatButton: "+ 새 채팅",
      noConversationsYet: "아직 대화가 없습니다",
      messageLabel: "메시지",
      messagesLabel: "메시지",
      deleteConfirm: "이 대화를 삭제하시겠습니까?",
      deleteTitle: "삭제",
    },
    accountPage: {
      loading: "계정 로드 중...",
      signInRequired: "로그인 필요",
      signInRequiredDesc: "계정을 보려면 로그인하세요.",
      signIn: "로그인",
    },
    profilePage: {
      title: "내 프로필 - ChinaConnect",
    },
    userPage: {
      title: "사용자 프로필 - ChinaConnect",
    },
    authPage: {
      callbackTitle: "로그인 중...",
      authTitle: "로그인 / 가입 - ChinaConnect",
      loginTitle: "로그인 - ChinaConnect",
      signingYouIn: "로그인 처리 중...",
    },
    checkoutPage: {
      title: "결제 성공 - ChinaConnect",
      description: "구독이 성공적으로 활성화되었습니다",
      successTitle: "결제 성공！",
      successDesc: "구독이 활성화되었습니다.",
      successAccess: "새 플랜의 모든 기능에 접근할 수 있습니다.",
      processingDesc: "구독을 확인하는 중입니다.",
      startPlanning: "계획 시작",
      viewAccount: "계정 보기",
      backToPricing: "← 요금제로 돌아가기",
      errorTitle: "문제가 발생했습니다",
      errorDesc: "결제를 처리할 수 없습니다. 다시 시도하거나 지원팀에 문의하세요.",
    },
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
      open: "เปิด",
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
      ctaSubtitle: "เริ่มวางแผนการเดินทางของคุณด้วยคำแนะนำที่ขับเคลื่อนด้วย AI",
      recentlyViewed: "เพิ่งดูล่าสุด",
      recommendedForYou: "แนะนำสำหรับคุณ",
      heroDesc:
        "ร้านอาหารมิชลินและแบล็กเพิร์ล, สถานที่ท่องเที่ยว, เคล็ดลับการเดินทาง และข้อมูลฉุกเฉิน — ขับเคลื่อนด้วย AI และคัดสรรโดยคนท้องถิ่น",
      citiesTitle: "สำรวจเมืองของเรา",
      citiesSubtitle: "จากเมืองหลวงโบราณสู่เมืองสมัยใหม่ ค้นพบสิ่งที่ดีที่สุดของจีนด้วยคู่มือเมืองที่ครอบคลุม",
      featuresSubtitle: "ทุกสิ่งที่คุณต้องการสำหรับการเดินทางที่ยอดเยี่ยม",
      viewAllCities: "ดูเมืองทั้งหมด",
      chatWithAI: "แชทกับ AI",
      exploreBeijing: "สำรวจปักกิ่ง",
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
      openingHours: "เวลาเปิด",
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
      tags: "แท็ก",
    },
    empty: {
      noResults: "ไม่พบผลลัพธ์",
      noRestaurants: "ไม่มีร้านอาหารที่ตรงกับเกณฑ์ของคุณ",
      noAttractions: "ไม่พบสถานที่ท่องเที่ยว",
      noSearchResults: "ไม่มีผลลัพธ์การค้นหา",
      tryAdjusting: "ลองปรับตัวกรองหรือคำค้นหาของคุณ",
      noFavorites: "ยังไม่มีรายการโปรด",
      addSome: "เริ่มสำรวจและบันทึกรายการโปรดของคุณ!",
    },
    errors: {
      loadFailed: "ไม่สามารถโหลดเนื้อหา",
      networkError: "ข้อผิดพลาดเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ",
      somethingWrong: "มีบางอย่างผิดพลาด",
      goBack: "กลับ",
      goHome: "ไปหน้าแรก",
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
      done: "เสร็จสิ้น",
    },
    tooltips: {
      searchTip: "ค้นหาเมือง ร้านอาหาร หรือหัวข้อ",
      filterTip: "กรองตามอาหาร คะแนน หรือราคา",
      mapTip: "ดูบนแผนที่",
      favoritesTip: "เพิ่มในรายการโปรด",
      shareTip: "แชร์กับเพื่อน",
    },
    recents: {
      recentlyViewed: "ดูล่าสุด",
      recommended: "แนะนำสำหรับคุณ",
      clearHistory: "ล้างประวัติ",
      forYou: "เพราะคุณเยี่ยมชม {city}",
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
      chinese: "จีน",
    },

    emergencyPage: {
      title: "ติดต่อฉุกเฉินและความช่วยเหลือ",
      subtitle: "หมายเลขโทรศัพท์ วลี และเครื่องมือที่จำเป็นสำหรับความปลอดภัยของคุณในจีน",
      police: "ตำรวจ",
      ambulance: "รถพยาบาล",
      fire: "ดับเพลิง",
      traffic: "อุบัติเหตุจราจร",
      oneTapCalls: "โทรฉุกเฉินด้วยการแตะครั้งเดียว",
      oneTapDesc: "แตะหมายเลขใดก็ได้เพื่อโทรทันที ไม่ต้องใช้แอป ใช้ได้กับโทรศัพท์ทุกเครื่อง",
      phrases: "วลีแปลฉุกเฉิน",
      phrasesDesc: "แตะวลีเพื่อฟังการออกเสียง การ์ดนี้ใช้งานได้แม้ไม่มีอินเทอร์เน็ต",
      gps: "แชร์ตำแหน่ง GPS",
      gpsDesc:
        "รับตำแหน่งปัจจุบันของคุณและแชร์กับบริการฉุกเฉิน ระบบยังช่วยค้นหาโรงพยาบาล ร้านขายยา และสถานีตำรวจใกล้เคียง",
      contacts: "ผู้ติดต่อฉุกเฉิน",
      contactsDesc: "บันทึกข้อมูลโรงแรม ไกด์ หรือครอบครัวเพื่อเข้าถึงได้อย่างรวดเร็วในยามฉุกเฉิน",
      howToSave: "วิธีบันทึกผู้ติดต่อ",
      howToSave1: "มองหาปุ่ม SOS สีแดงที่มุมล่างขวาของทุกหน้า",
      howToSave2: "แตะปุ่มเมนูเพื่อเปิดเมนูฉุกเฉิน",
      howToSave3: "ไปที่แท็บ ผู้ติดต่อ และเพิ่มผู้ติดต่อฉุกเฉิน",
      nearbyHelp: "ค้นหาความช่วยเหลือใกล้เคียง",
      nearbyDesc: "ใช้เคล็ดลับเหล่านี้เพื่อค้นหาความช่วยเหลือทางการแพทย์ ร้านขายยา และตำรวจอย่างรวดเร็ว",
      pageTitle: "ผู้ติดต่อฉุกเฉินและวลี - ChinaConnect",
      pageDescription:
        "ข้อมูลติดต่อฉุกเฉินที่จำเป็นและวลีแปลสำหรับนักท่องเที่ยวในจีน รวมถึงตำรวจ รถพยาบาล ดับเพลิง สถานทูต GPS และวลีฉุกเฉินออฟไลน์",
      heroHeading: "ผู้ติดต่อฉุกเฉินและความช่วยเหลือ",
      hospitalsTitle: "โรงพยาบาล",
      hospitalSearch: "ค้นหา โรงพยาบาล ในแอปแผนที่",
      hospitalInternational: "โรงพยาบาลนานาชาติที่แนะนำสำหรับชาวต่างชาติ",
      hospitalCommon: "ทั่วไป: Peking Union Medical College Hospital, Beijing United Family",
      pharmaciesTitle: "ร้านขายยา",
      pharmacyGreenCross: "มองหาสัญลักษณ์กากบาทสีเขียว",
      pharmacyChains: "เชนใหญ่: Guoji Yiyao, Lianhua, Yixinke",
      pharmacyNoRx: "ยาหลายชนิดจำหน่ายโดยไม่ต้องมีใบสั่งแพทย์",
      policeTitle: "สถานีตำรวจ",
      policeSearch: "ค้นหา สถานีตำรวจ เพื่อหาสถานีตำรวจท้องถิ่น",
      policeEnglish: "เจ้าหน้าที่ที่พูดอังกฤษมีให้บริการตามสถานีหลัก",
      policeForeignAffairs: "ตำรวจกิจการต่างประเทศช่วยเหลือชาวต่างชาติ",
      embassyTitle: "ข้อมูลสถานทูตและสถานกงสุล",
      embassyDesc: "ค้นหาสถานทูตของคุณเพื่อขอหนังสือเดินทางทดแทน ความช่วยเหลือฉุกเฉิน และความช่วยเหลือทางกฎหมาย",
      sosButtonTitle: "ปุ่ม SOS - ใช้ได้ทุกหน้า",
      sosButtonDesc: "ปุ่มฉุกเฉิน SOS มีให้ใช้ที่มุมล่างขวาของทุกหน้าเสมอ",
      howToUseSOSTitle: "วิธีใช้ SOS",
      sosItem1: "แตะปุ่ม SOS สีแดงเพื่อโทรหาตำรวจ (110) ทันที",
      sosItem2: "กดค้าง 3 วินาทีเพื่อโทรหาสถานทูตอัตโนมัติ",
      sosItem3: "แชร์ตำแหน่ง GPS ของคุณด้วยการแตะครั้งเดียว",
      sosItem4: "กดค้างหรือคลิกขวาเพื่อเข้าถึงเมนูด่วน",
      offlineHeading: "ใช้งานได้โดยไม่ต้องมีอินเทอร์เน็ต",
      offlineDesc: "บันทึกหมายเลขฉุกเฉินก่อนเดินทาง - ใช้ได้แม้ออฟไลน์",
      offlineAvailableTitle: "ใช้งานได้ออฟไลน์",
      offlineItem1: "ปุ่ม SOS ทำงานได้โดยไม่ต้องมีอินเทอร์เน็ต",
      offlineItem2: "วลีแปลถูกแคชไว้สำหรับใช้งานออฟไลน์",
      offlineItem3: "หมายเลขฉุกเฉิน (110, 120, 119, 122) เข้าถึงได้ตลอด",
      offlineItem4: "ดาวน์โหลดแผนที่ออฟไลน์เพื่อเตรียมพร้อมที่ดีกว่า",
      safetyTipsTitle: "เคล็ดลับความปลอดภัยสำหรับนักเดินทาง",
      keepDocsTitle: "เก็บเอกสารให้ปลอดภัย",
      keepDocs1: "สแกนหนังสือเดินทางและเก็บสำเนาดิจิทัล",
      keepDocs2: "เก็บสำเนากระดาษแยกจากต้นฉบับ",
      keepDocs3: "จัดเก็บข้อมูลติดต่อสถานทูตในโทรศัพท์",
      keepDocs4: "จดหมายเลขฉุกเฉินท้องถิ่น",
      preparednessTitle: "การเตรียมพร้อมฉุกเฉิน",
      preparedness1: "บันทึกหมายเลขฉุกเฉินในรายชื่อโทรศัพท์",
      preparedness2: "ดาวน์โหลดแผนที่ออฟไลน์ (Google Maps)",
      preparedness3: "ชาร์จพาวเวอร์แบงก์ให้พร้อม",
      preparedness4: "บันทึกที่อยู่โรงแรมเป็นภาษาจีน",
      communicationTitle: "เคล็ดลับการสื่อสาร",
      communication1: "เรียนรู้วลีจีนพื้นฐาน",
      communication2: "ใช้แอปแปลภาษาเมื่อจำเป็น",
      communication3: "ดาวน์โหลดการ์ดวลีฉุกเฉิน",
      communication4: "บันทึกสัญชาติของคุณในบันทึกโทรศัพท์",
      lostPassportTitle: "ทำอย่างไรถ้าหนังสือเดินทางหาย?",
      inChinaTitle: "ในจีน",
      lpStep1Title: "แจ้งตำรวจ",
      lpStep1Desc: "ไปที่สถานีตำรวจที่ใกล้ที่สุดและขอรายงานตำรวจ",
      lpStep2Title: "ติดต่อสถานทูต",
      lpStep2Desc: "โทรหาสถานทูตเพื่อขอเอกสารเดินทางฉุกเฉิน",
      lpStep3Title: "ไปสถานทูต",
      lpStep3Desc: "นำรายงานตำรวจ รูปถ่าย และบัตรประชาชนไปขอหนังสือเดินทางฉุกเฉิน",
      importantTipsTitle: "เคล็ดลับสำคัญ",
      lpTip1: "เก็บสำเนาดิจิทัลของหนังสือเดินทางในคลาวด์",
      lpTip2: "หนังสือเดินทางฉุกเฉินมักมีอายุจำกัด",
      lpTip3: "สถานทูตสามารถติดต่อครอบครัวได้หากจำเป็น",
      lpTip4: "เก็บการ์ดโรงแรมที่มีที่อยู่ภาษาจีน",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "ขับเคลื่อนด้วย AI ขั้นสูง",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "ผู้ช่วยอัจฉริยะด้านการท่องเที่ยวจีน — วางแผน ข้อมูลเชิงลึก และคำแนะนำแบบเรียลไทม์",
      startPlanningCTA: "เริ่มวางแผน",
      promptsTitle: "ลองถาม",
      promptsSubtitle: "เลือกคำถามหรือพิมพ์เองด้านล่าง",
      prompts: [
        {
          icon: "🏯",
          text: "วางแผนเที่ยวปักกิ่ง 5 วัน ชม ประวัติศาสตร์และวัฒนธรรมสมัยใหม่",
        },
        {
          icon: "🍜",
          text: "อาหารริมทางเฉพาะถิ่นในเฉิงตูที่นักท่องเที่ยวมักพลาด",
        },
        {
          icon: "🚄",
          text: "เดินทางจากเซี่ยงไฮ้ไปซีอานด้วยรถไฟความเร็วสูง",
        },
        {
          icon: "💳",
          text: "ใช้ Apple Pay ในจีนได้ไหม? ต้องใช้แอปชำระเงินอะไรบ้าง",
        },
        {
          icon: "🏨",
          text: "แนะนำโรงแรมบูติกในหางโจวใกล้ทะเลสาบซีหู",
        },
        {
          icon: "🤝",
          text: "มารยาททางธุรกิจสำหรับพบคู่ค้าชาวจีน",
        },
      ],
      authGateTitle: "เข้าสู่ระบบเพื่อแชท",
      authGateSignupTitle: "สร้างบัญชี",
      authGateDescription: "AI แชทต้องใช้บัญชีฟรีเพื่อติดตามการใช้งานรายเดือนและบันทึกการสนทนา",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)",
      signInButton: "เข้าสู่ระบบ",
      signUpButton: "สร้างบัญชี",
      orContinueWith: "หรือ",
      noAccountPrompt: "ยังไม่มีบัญชี?",
      haveAccountPrompt: "มีบัญชีอยู่แล้ว?",
      switchToSignUp: "สร้าง",
      switchToSignIn: "เข้าสู่ระบบ",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "การยืนยันตัวตนล้มเหลว",
      conversationsTitle: "การสนทนา",
      showSidebarTitle: "แสดงการสนทนา",
      hideSidebarTitle: "ซ่อนแถบด้านข้าง",
      newChatButton: "+ แชทใหม่",
      noConversationsYet: "ยังไม่มีการสนทนา",
      messageLabel: "ข้อความ",
      messagesLabel: "ข้อความ",
      deleteConfirm: "ลบการสนทนานี้?",
      deleteTitle: "ลบ",
    },
    accountPage: {
      loading: "กำลังโหลดบัญชี...",
      signInRequired: "ต้องเข้าสู่ระบบ",
      signInRequiredDesc: "โปรดเข้าสู่ระบบเพื่อดูบัญชีของคุณ",
      signIn: "เข้าสู่ระบบ",
    },
    profilePage: {
      title: "โปรไฟล์ของฉัน - ChinaConnect",
    },
    userPage: {
      title: "โปรไฟล์ผู้ใช้ - ChinaConnect",
    },
    authPage: {
      callbackTitle: "กำลังเข้าสู่ระบบ...",
      authTitle: "เข้าสู่ระบบ / สมัคร - ChinaConnect",
      loginTitle: "เข้าสู่ระบบ - ChinaConnect",
      signingYouIn: "กำลังดำเนินการเข้าสู่ระบบ...",
    },
    checkoutPage: {
      title: "ชำระเงินสำเร็จ - ChinaConnect",
      description: "เปิดใช้งานการสมัครสมาชิกเรียบร้อยแล้ว",
      successTitle: "ชำระเงินสำเร็จ！",
      successDesc: "เปิดใช้งานการสมัครสมาชิกของคุณแล้ว",
      successAccess: "คุณสามารถเข้าถึงคุณสมบัติทั้งหมดของแผนใหม่ได้แล้ว",
      processingDesc: "กรุณารอขณะที่เรายืนยันการสมัครสมาชิกของคุณ",
      startPlanning: "เริ่มวางแผน",
      viewAccount: "ดูบัญชี",
      backToPricing: "← กลับไปที่ราคา",
      errorTitle: "เกิดข้อผิดพลาด",
      errorDesc: "เราไม่สามารถประมวลผลการชำระเงินของคุณได้ กรุณาลองอีกครั้งหรือติดต่อฝ่ายสนับสนุน",
    },
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
      open: "Mở",
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
      ctaSubtitle: "Bắt đầu lập kế hoạch chuyến đi với đề xuất từ AI.",
      recentlyViewed: "Đã xem gần đây",
      recommendedForYou: "Đề xuất cho bạn",
      heroDesc:
        "Nhà hàng Michelin & Black Pearl, điểm tham quan, mẹo giao thông và thông tin khẩn cấp — tất cả được hỗ trợ bởi AI và tuyển chọn bởi người bản địa.",
      citiesTitle: "Khám phá các thành phố",
      citiesSubtitle:
        "Từ thủ đô cổ đại đến đô thị hiện đại, khám phá những điều tuyệt vời nhất của Trung Quốc với hướng dẫn thành phố toàn diện.",
      featuresSubtitle: "Mọi thứ bạn cần cho một chuyến đi tuyệt vời",
      viewAllCities: "Xem tất cả thành phố",
      chatWithAI: "Trò chuyện với AI",
      exploreBeijing: "Khám phá Bắc Kinh",
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
      openingHours: "Giờ mở cửa",
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
      tags: "Thẻ",
    },
    empty: {
      noResults: "Không tìm thấy kết quả",
      noRestaurants: "Không có nhà hàng phù hợp",
      noAttractions: "Không tìm thấy địa điểm",
      noSearchResults: "Không có kết quả tìm kiếm",
      tryAdjusting: "Thử điều chỉnh bộ lọc hoặc từ khóa",
      noFavorites: "Chưa có mục yêu thích",
      addSome: "Bắt đầu khám phá và lưu mục yêu thích của bạn!",
    },
    errors: {
      loadFailed: "Không thể tải nội dung",
      networkError: "Lỗi mạng. Vui lòng kiểm tra kết nối của bạn.",
      somethingWrong: "Đã xảy ra sự cố",
      goBack: "Quay lại",
      goHome: "Đến Trang chủ",
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
      done: "Xong",
    },
    tooltips: {
      searchTip: "Tìm kiếm thành phố, nhà hàng hoặc chủ đề",
      filterTip: "Lọc theo ẩm thực, đánh giá hoặc giá",
      mapTip: "Xem trên bản đồ",
      favoritesTip: "Thêm vào mục yêu thích",
      shareTip: "Chia sẻ với bạn bè",
    },
    recents: {
      recentlyViewed: "Đã xem gần đây",
      recommended: "Đề xuất cho bạn",
      clearHistory: "Xóa lịch sử",
      forYou: "Vì bạn đã xem {city}",
    },
    // Features section
    features: {
      restaurantGuide: "Hướng dẫn nhà hàng",
      restaurantGuideDesc:
        "Sao Michelin, xếp hạng Black Pearl và các món địa phương yêu thích kèm đánh giá chi tiết",
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
      chinese: "Tiếng Trung",
    },

    emergencyPage: {
      title: "Liên hệ khẩn cấp và trợ giúp",
      subtitle:
        "Số điện thoại, cụm từ và công cụ thiết yếu để đảm bảo an toàn của bạn tại Trung Quốc",
      police: "Cảnh sát",
      ambulance: "Xe cứu thương",
      fire: "Cứu hỏa",
      traffic: "Tai nạn giao thông",
      oneTapCalls: "Gọi khẩn cấp một chạm",
      oneTapDesc:
        "Chạm vào bất kỳ số nào để gọi ngay. Không cần ứng dụng, dùng được với mọi điện thoại.",
      phrases: "Cụm từ dịch khẩn cấp",
      phrasesDesc: "Chạm vào cụm từ để nghe phát âm. Thẻ này hoạt động ngoại tuyến.",
      gps: "Chia sẻ vị trí GPS",
      gpsDesc:
        "Lấy vị trí hiện tại của bạn và chia sẻ với dịch vụ khẩn cấp. Hệ thống cũng giúp bạn tìm bệnh viện, hiệu thuốc và đồn cảnh sát gần đó.",
      contacts: "Liên hệ khẩn cấp",
      contactsDesc: "Lưu khách sạn, hướng dẫn viên hoặc người thân để truy cập nhanh khi khẩn cấp.",
      howToSave: "Cách lưu liên hệ",
      howToSave1: "Tìm nút SOS màu đỏ ở góc dưới bên phải của mọi trang",
      howToSave2: "Chạm nút menu để mở menu khẩn cấp",
      howToSave3: "Vào tab Liên hệ và thêm liên hệ khẩn cấp",
      nearbyHelp: "Tìm trợ giúp gần đó",
      nearbyDesc: "Dùng các mẹo này để nhanh chóng tìm hỗ trợ y tế, hiệu thuốc và cảnh sát.",
      pageTitle: "Liên hệ khẩn cấp và cụm từ - ChinaConnect",
      pageDescription:
        "Liên hệ khẩn cấp và cụm từ dịch thiết yếu cho khách du lịch tại Trung Quốc. Bao gồm cảnh sát, xe cứu thương, cứu hỏa, đại sứ quán, vị trí GPS và cụm từ ngoại tuyến.",
      heroHeading: "Liên hệ khẩn cấp và trợ giúp",
      hospitalsTitle: "Bệnh viện",
      hospitalSearch: "Tìm bệnh viện trong bất kỳ ứng dụng bản đồ nào",
      hospitalInternational: "Bệnh viện quốc tế được khuyến nghị cho người nước ngoài",
      hospitalCommon: "Phổ biến: Bệnh viện Trung Hợp Bắc Kinh, Beijing United Family",
      pharmaciesTitle: "Hiệu thuốc",
      pharmacyGreenCross: "Tìm biểu tượng chữ thập màu xanh lá",
      pharmacyChains: "Chuỗi lớn: Quốc Y Dược, Liên Hoa, Nhất Tâm Đường",
      pharmacyNoRx: "Nhiều loại thuốc bán không cần đơn",
      policeTitle: "Đồn cảnh sát",
      policeSearch: "Tìm đồn cảnh sát địa phương",
      policeEnglish: "Có cảnh sát nói tiếng Anh tại các đồn chính",
      policeForeignAffairs: "Cảnh sát đối ngoại có thể hỗ trợ người nước ngoài",
      embassyTitle: "Thông tin đại sứ quán và lãnh sự",
      embassyDesc: "Liên hệ đại sứ quán để làm lại hộ chiếu, hỗ trợ khẩn cấp và trợ giúp pháp lý.",
      sosButtonTitle: "Nút SOS - Có trên mọi trang",
      sosButtonDesc: "Nút SOS khẩn cấp luôn có sẵn ở góc dưới bên phải của mọi trang.",
      howToUseSOSTitle: "Cách dùng SOS",
      sosItem1: "Chạm nút SOS đỏ để gọi cảnh sát (110) ngay",
      sosItem2: "Nhấn giữ 3 giây để tự động gọi đại sứ quán",
      sosItem3: "Chia sẻ vị trí GPS bằng một cú chạm",
      sosItem4: "Nhấn giữ hoặc nhấp chuột phải để truy cập menu nhanh",
      offlineHeading: "Hoạt động không cần Internet",
      offlineDesc: "Lưu số khẩn cấp trước khi đi - chúng hoạt động ngoại tuyến.",
      offlineAvailableTitle: "Khả dụng ngoại tuyến",
      offlineItem1: "Nút SOS hoạt động không cần internet",
      offlineItem2: "Các cụm từ dịch được lưu để dùng ngoại tuyến",
      offlineItem3: "Số khẩn cấp (110, 120, 119, 122) luôn truy cập được",
      offlineItem4: "Tải bản đồ ngoại tuyến để chuẩn bị tốt hơn",
      safetyTipsTitle: "Mẹo an toàn cho khách du lịch",
      keepDocsTitle: "Giữ tài liệu an toàn",
      keepDocs1: "Quét hộ chiếu và giữ bản sao kỹ thuật số",
      keepDocs2: "Giữ bản sao vật lý tách riêng khỏi bản gốc",
      keepDocs3: "Lưu thông tin liên hệ đại sứ quán trong điện thoại",
      keepDocs4: "Ghi chú các số khẩn cấp địa phương",
      preparednessTitle: "Chuẩn bị khẩn cấp",
      preparedness1: "Lưu số khẩn cấp vào danh bạ điện thoại",
      preparedness2: "Tải bản đồ ngoại tuyến (Google Maps)",
      preparedness3: "Giữ sạc dự phòng đầy pin",
      preparedness4: "Lưu địa chỉ khách sạn bằng tiếng Trung",
      communicationTitle: "Mẹo giao tiếp",
      communication1: "Học các cụm từ tiếng Trung cơ bản",
      communication2: "Dùng ứng dụng dịch khi cần",
      communication3: "Tải thẻ cụm từ khẩn cấp",
      communication4: "Lưu quốc tịch trong ghi chú điện thoại",
      lostPassportTitle: "Mất hộ chiếu? Đây là việc cần làm",
      inChinaTitle: "Tại Trung Quốc",
      lpStep1Title: "Trình báo cảnh sát",
      lpStep1Desc: "Đến đồn cảnh sát gần nhất và lấy biên bản",
      lpStep2Title: "Liên hệ đại sứ quán",
      lpStep2Desc: "Gọi đại sứ quán để xin giấy tờ đi lại khẩn cấp",
      lpStep3Title: "Đến đại sứ quán",
      lpStep3Desc: "Mang theo biên bản, ảnh và CMND để nhận hộ chiếu khẩn cấp",
      importantTipsTitle: "Mẹo quan trọng",
      lpTip1: "Lưu bản sao kỹ thuật số của hộ chiếu trên đám mây",
      lpTip2: "Hộ chiếu khẩn cấp thường có hiệu lực giới hạn",
      lpTip3: "Đại sứ quán có thể liên hệ gia đình nếu cần",
      lpTip4: "Giữ thẻ khách sạn có địa chỉ tiếng Trung",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "Hỗ trợ bởi AI tiên tiến",
      heroTitle: "ChinaGuide AI",
      heroSubtitle:
        "Trợ lý du lịch Trung Quốc cá nhân — lập kế hoạch, hiểu biết địa phương, hướng dẫn thời gian thực",
      startPlanningCTA: "Bắt đầu lập kế hoạch",
      promptsTitle: "Thử hỏi",
      promptsSubtitle: "Chọn một câu hỏi hoặc nhập câu hỏi của bạn bên dưới",
      prompts: [
        {
          icon: "🏯",
          text: "Lên kế hoạch 5 ngày ở Bắc Kinh với lịch sử hoàng gia và văn hóa hiện đại",
        },
        {
          icon: "🍜",
          text: "Đồ ăn đường phố địa phương ở Thành Đô mà khách du lịch thường bỏ lỡ",
        },
        {
          icon: "🚄",
          text: "Đi từ Thượng Hải đến Tây An bằng tàu cao tốc như thế nào?",
        },
        {
          icon: "💳",
          text: "Tôi có thể dùng Apple Pay ở Trung Quốc không? Cần những ứng dụng thanh toán nào?",
        },
        {
          icon: "🏨",
          text: "Gợi ý khách sạn boutique ở Hàng Châu gần Tây Hồ",
        },
        {
          icon: "🤝",
          text: "Mẹo nghi thức kinh doanh khi gặp đối tác Trung Quốc",
        },
      ],
      authGateTitle: "Đăng nhập để trò chuyện",
      authGateSignupTitle: "Tạo tài khoản",
      authGateDescription:
        "AI Chat yêu cầu tài khoản miễn phí để theo dõi mức sử dụng hàng tháng và lưu các cuộc trò chuyện của bạn.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "Mật khẩu (tối thiểu 6 ký tự)",
      signInButton: "Đăng nhập",
      signUpButton: "Tạo tài khoản",
      orContinueWith: "hoặc",
      noAccountPrompt: "Chưa có tài khoản?",
      haveAccountPrompt: "Đã có tài khoản?",
      switchToSignUp: "Tạo",
      switchToSignIn: "Đăng nhập",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "Xác thực thất bại",
      conversationsTitle: "Cuộc trò chuyện",
      showSidebarTitle: "Hiện cuộc trò chuyện",
      hideSidebarTitle: "Ẩn thanh bên",
      newChatButton: "+ Trò chuyện mới",
      noConversationsYet: "Chưa có cuộc trò chuyện",
      messageLabel: "tin nhắn",
      messagesLabel: "tin nhắn",
      deleteConfirm: "Xóa cuộc trò chuyện này?",
      deleteTitle: "Xóa",
    },
    accountPage: {
      loading: "Đang tải tài khoản...",
      signInRequired: "Yêu cầu đăng nhập",
      signInRequiredDesc: "Vui lòng đăng nhập để xem tài khoản của bạn.",
      signIn: "Đăng nhập",
    },
    profilePage: {
      title: "Hồ sơ của tôi - ChinaConnect",
    },
    userPage: {
      title: "Hồ sơ người dùng - ChinaConnect",
    },
    authPage: {
      callbackTitle: "Đang đăng nhập...",
      authTitle: "Đăng nhập / Đăng ký - ChinaConnect",
      loginTitle: "Đăng nhập - ChinaConnect",
      signingYouIn: "Đang đăng nhập bạn vào...",
    },
    checkoutPage: {
      title: "Thanh toán thành công - ChinaConnect",
      description: "Đăng ký của bạn đã được kích hoạt thành công",
      successTitle: "Thanh toán thành công！",
      successDesc: "Đăng ký của bạn đã được kích hoạt.",
      successAccess: "Bạn có quyền truy cập tất cả các tính năng của gói mới.",
      processingDesc: "Vui lòng đợi trong khi chúng tôi xác nhận đăng ký của bạn.",
      startPlanning: "Bắt đầu lập kế hoạch",
      viewAccount: "Xem tài khoản",
      backToPricing: "← Quay lại bảng giá",
      errorTitle: "Đã xảy ra lỗi",
      errorDesc:
        "Chúng tôi không thể xử lý thanh toán của bạn. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.",
    },
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
      open: "Открыть",
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
      ctaSubtitle: "Начните планировать поездку с рекомендациями на основе AI.",
      recentlyViewed: "Недавно просмотренные",
      recommendedForYou: "Рекомендуем для вас",
      heroDesc:
        "Рестораны Michelin и Black Pearl, достопримечательности, советы по транспорту и экстренная информация — на основе ИИ и отобрано местными жителями.",
      citiesTitle: "Исследуйте наши города",
      citiesSubtitle:
        "От древних столиц до современных мегаполисов — откройте для себя лучшее в Китае с нашими подробными гидами.",
      featuresSubtitle: "Всё, что нужно для отличной поездки",
      viewAllCities: "Все города",
      chatWithAI: "Чат с ИИ",
      exploreBeijing: "Исследовать Пекин",
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
      openingHours: "Часы работы",
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
      tags: "Теги",
    },
    empty: {
      noResults: "Результатов не найдено",
      noRestaurants: "Нет ресторанов по вашим критериям",
      noAttractions: "Достопримечательности не найдены",
      noSearchResults: "Нет результатов поиска",
      tryAdjusting: "Попробуйте изменить фильтры или условия поиска",
      noFavorites: "Пока нет избранного",
      addSome: "Начните исследовать и сохраняйте избранное!",
    },
    errors: {
      loadFailed: "Не удалось загрузить контент",
      networkError: "Ошибка сети. Проверьте подключение.",
      somethingWrong: "Что-то пошло не так",
      goBack: "Вернуться",
      goHome: "На главную",
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
      done: "Готово",
    },
    tooltips: {
      searchTip: "Искать города, рестораны или темы",
      filterTip: "Фильтровать по кухне, рейтингу или цене",
      mapTip: "Показать на карте",
      favoritesTip: "Добавить в избранное",
      shareTip: "Поделиться с друзьями",
    },
    recents: {
      recentlyViewed: "Недавно просмотренные",
      recommended: "Рекомендуем",
      clearHistory: "Очистить историю",
      forYou: "Потому что вы посетили {city}",
    },
    // Features section
    features: {
      restaurantGuide: "Гид по ресторанам",
      restaurantGuideDesc:
        "Звезды Мишлен, рейтинг Black Pearl и местные фавориты с подробными обзорами",
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
      aiAssistantDesc:
        "Задавайте вопросы о путешествиях по Китаю на английском, получайте мгновенные ответы",
    },
    language: {
      switchTo: "Переключить на",
      current: "Текущий",
      english: "Английский",
      chinese: "Китайский",
    },

    emergencyPage: {
      title: "Экстренные контакты и помощь",
      subtitle: "Необходимые телефоны, фразы и инструменты для вашей безопасности в Китае",
      police: "Полиция",
      ambulance: "Скорая",
      fire: "Пожарная",
      traffic: "ДТП",
      oneTapCalls: "Экстренный звонок одним касанием",
      oneTapDesc:
        "Нажмите на любой номер, чтобы позвонить. Приложение не требуется, работает с любого телефона.",
      phrases: "Фразы для экстренных ситуаций",
      phrasesDesc: "Нажмите на фразу, чтобы услышать произношение. Эта карточка работает офлайн.",
      gps: "Поделиться местоположением GPS",
      gpsDesc:
        "Получите текущее местоположение и передайте экстренным службам. Система также поможет найти ближайшие больницы, аптеки и полицейские участки.",
      contacts: "Экстренные контакты",
      contactsDesc:
        "Сохраните отель, гида или родственников для быстрого доступа в экстренной ситуации.",
      howToSave: "Как сохранить контакты",
      howToSave1: "Найдите красную кнопку SOS в правом нижнем углу любой страницы",
      howToSave2: "Нажмите кнопку меню, чтобы открыть экстренное меню",
      howToSave3: "Перейдите на вкладку Контакты и добавьте экстренные контакты",
      nearbyHelp: "Поиск помощи поблизости",
      nearbyDesc: "Используйте эти советы, чтобы быстро найти медпомощь, аптеки и полицию.",
      pageTitle: "Экстренные контакты и фразы - ChinaConnect",
      pageDescription:
        "Необходимые экстренные контакты и переводческие фразы для путешественников в Китае. Включая полицию, скорую, пожарных, посольство, GPS и офлайн-фразы.",
      heroHeading: "Экстренные контакты и помощь",
      hospitalsTitle: "Больницы",
      hospitalSearch: "Ищите больница в любом карточном приложении",
      hospitalInternational: "Международные больницы, рекомендованные для иностранцев",
      hospitalCommon: "Часто: Пекинская объединённая больница, Beijing United Family",
      pharmaciesTitle: "Аптеки",
      pharmacyGreenCross: "Ищите зелёный крест",
      pharmacyChains: "Крупные сети: Гоцзи Яояо, Ляньхуа, Исинькэ",
      pharmacyNoRx: "Многие лекарства доступны без рецепта",
      policeTitle: "Полицейские участки",
      policeSearch: "Ищите полицейский участок в приложении карт",
      policeEnglish: "На крупных участках есть англоговорящие сотрудники",
      policeForeignAffairs: "Полиция по делам иностранцев помогает иностранцам",
      embassyTitle: "Посольства и консульства",
      embassyDesc:
        "Обратитесь в посольство для замены паспорта, экстренной помощи и правовой поддержки.",
      sosButtonTitle: "Кнопка SOS - доступна на каждой странице",
      sosButtonDesc: "Кнопка экстренного SOS всегда доступна в правом нижнем углу каждой страницы.",
      howToUseSOSTitle: "Как использовать SOS",
      sosItem1: "Нажмите красную кнопку SOS, чтобы сразу позвонить в полицию (110)",
      sosItem2: "Удерживайте 3 секунды для автодозвона в посольство",
      sosItem3: "Поделитесь местоположением GPS одним касанием",
      sosItem4: "Долгое нажатие или правый клик для быстрого меню",
      offlineHeading: "Работает без интернета",
      offlineDesc: "Сохраните экстренные номера до поездки - они работают офлайн.",
      offlineAvailableTitle: "Доступно офлайн",
      offlineItem1: "Кнопка SOS работает без интернета",
      offlineItem2: "Фразы перевода кешируются для офлайн",
      offlineItem3: "Экстренные номера (110, 120, 119, 122) всегда доступны",
      offlineItem4: "Скачайте офлайн-карты для лучшей готовности",
      safetyTipsTitle: "Советы по безопасности для путешественников",
      keepDocsTitle: "Храните документы в безопасности",
      keepDocs1: "Отсканируйте паспорт и сохраните цифровую копию",
      keepDocs2: "Храните физическую копию отдельно от оригинала",
      keepDocs3: "Сохраните контакт посольства в телефоне",
      keepDocs4: "Запишите местные экстренные номера",
      preparednessTitle: "Экстренная подготовка",
      preparedness1: "Сохраните экстренные номера в контактах",
      preparedness2: "Скачайте офлайн-карты (Google Maps)",
      preparedness3: "Держите power bank заряженным",
      preparedness4: "Сохраните адрес отеля на китайском",
      communicationTitle: "Советы по общению",
      communication1: "Выучите базовые китайские фразы",
      communication2: "Используйте приложения-переводчики при необходимости",
      communication3: "Скачайте карточки экстренных фраз",
      communication4: "Сохраните ваше гражданство в заметках телефона",
      lostPassportTitle: "Потеряли паспорт? Вот что делать",
      inChinaTitle: "В Китае",
      lpStep1Title: "Обратитесь в полицию",
      lpStep1Desc: "Идите в ближайший полицейский участок и получите справку",
      lpStep2Title: "Свяжитесь с посольством",
      lpStep2Desc: "Позвоните в посольство для экстренного проездного документа",
      lpStep3Title: "Посетите посольство",
      lpStep3Desc: "Возьмите справку, фото и удостоверение для получения экстренного паспорта",
      importantTipsTitle: "Важные советы",
      lpTip1: "Храните цифровые копии паспорта в облаке",
      lpTip2: "Экстренный паспорт обычно имеет ограниченный срок",
      lpTip3: "Посольство может связаться с семьёй при необходимости",
      lpTip4: "Храните карточку отеля с адресом на китайском",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "На базе продвинутого ИИ",
      heroTitle: "ChinaGuide AI",
      heroSubtitle:
        "Ваш персональный ИИ для путешествий по Китаю — маршруты, местные знания, подсказки в реальном времени",
      startPlanningCTA: "Начать планирование",
      promptsTitle: "Попробуйте спросить",
      promptsSubtitle: "Выберите подсказку или введите свой вопрос ниже",
      prompts: [
        {
          icon: "🏯",
          text: "5-дневный маршрут по Пекину: имперская история и современная культура",
        },
        {
          icon: "🍜",
          text: "Местный стритфуд в Чэнду, который туристы обычно пропускают",
        },
        {
          icon: "🚄",
          text: "Как добраться из Шанхая в Сиань на высокоскоростном поезде?",
        },
        {
          icon: "💳",
          text: "Работает ли Apple Pay в Китае? Какие платёжные приложения нужны?",
        },
        {
          icon: "🏨",
          text: "Бутик-отели в Ханчжоу рядом с Западным озером",
        },
        {
          icon: "🤝",
          text: "Деловой этикет при встрече с китайскими партнёрами",
        },
      ],
      authGateTitle: "Войдите, чтобы общаться",
      authGateSignupTitle: "Создать аккаунт",
      authGateDescription:
        "Для AI-чата нужен бесплатный аккаунт — мы отслеживаем месячное использование и сохраняем ваши беседы.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "Пароль (минимум 6 символов)",
      signInButton: "Войти",
      signUpButton: "Создать аккаунт",
      orContinueWith: "или",
      noAccountPrompt: "Ещё нет аккаунта?",
      haveAccountPrompt: "Уже есть аккаунт?",
      switchToSignUp: "Создать",
      switchToSignIn: "Войти",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "Ошибка аутентификации",
      conversationsTitle: "Беседы",
      showSidebarTitle: "Показать беседы",
      hideSidebarTitle: "Скрыть боковую панель",
      newChatButton: "+ Новый чат",
      noConversationsYet: "Бесед пока нет",
      messageLabel: "сообщение",
      messagesLabel: "сообщений",
      deleteConfirm: "Удалить эту беседу?",
      deleteTitle: "Удалить",
    },
    accountPage: {
      loading: "Загрузка аккаунта...",
      signInRequired: "Требуется вход",
      signInRequiredDesc: "Войдите, чтобы просмотреть аккаунт.",
      signIn: "Войти",
    },
    profilePage: {
      title: "Мой профиль - ChinaConnect",
    },
    userPage: {
      title: "Профиль пользователя - ChinaConnect",
    },
    authPage: {
      callbackTitle: "Вход...",
      authTitle: "Вход / Регистрация - ChinaConnect",
      loginTitle: "Вход - ChinaConnect",
      signingYouIn: "Выполняется вход...",
    },
    checkoutPage: {
      title: "Оплата успешна - ChinaConnect",
      description: "Подписка успешно активирована",
      successTitle: "Оплата успешна！",
      successDesc: "Ваша подписка активирована.",
      successAccess: "Теперь вам доступны все возможности нового плана.",
      processingDesc: "Пожалуйста, подождите, пока мы подтвердим вашу подписку.",
      startPlanning: "Начать планирование",
      viewAccount: "Посмотреть аккаунт",
      backToPricing: "← Назад к тарифам",
      errorTitle: "Что-то пошло не так",
      errorDesc:
        "Не удалось обработать ваш платёж. Пожалуйста, попробуйте снова или свяжитесь с поддержкой.",
    },
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
      open: "Ouvrir",
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
        "Commencez à planifier votre voyage avec des recommandations alimentées par l'IA.",
      recentlyViewed: "Récemment consultés",
      recommendedForYou: "Recommandé pour vous",
      heroDesc:
        "Restaurants Michelin & Black Pearl, attractions, conseils de transport et infos d'urgence — propulsé par l'IA et sélectionné par des locaux.",
      citiesTitle: "Explorez nos villes",
      citiesSubtitle:
        "Des capitales anciennes aux métropoles modernes, découvrez le meilleur de la Chine avec nos guides complets.",
      featuresSubtitle: "Tout ce dont vous avez besoin pour un excellent voyage",
      viewAllCities: "Toutes les villes",
      chatWithAI: "Discuter avec l'IA",
      exploreBeijing: "Explorer Pékin",
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
      openingHours: "Horaires",
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
      tags: "Tags",
    },
    empty: {
      noResults: "Aucun résultat trouvé",
      noRestaurants: "Aucun restaurant ne correspond à vos critères",
      noAttractions: "Aucune attraction trouvée",
      noSearchResults: "Aucun résultat de recherche",
      tryAdjusting: "Essayez d'ajuster vos filtres ou termes de recherche",
      noFavorites: "Pas encore de favoris",
      addSome: "Commencez à explorer et ajoutez vos favoris!",
    },
    errors: {
      loadFailed: "Échec du chargement du contenu",
      networkError: "Erreur réseau. Veuillez vérifier votre connexion.",
      somethingWrong: "Une erreur s'est produite",
      goBack: "Retour",
      goHome: "Aller à l'accueil",
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
      done: "Terminé",
    },
    tooltips: {
      searchTip: "Rechercher villes, restaurants ou sujets",
      filterTip: "Filtrer par cuisine, note ou prix",
      mapTip: "Voir sur la carte",
      favoritesTip: "Ajouter aux favoris",
      shareTip: "Partager avec des amis",
    },
    recents: {
      recentlyViewed: "Vus récemment",
      recommended: "Recommandé pour vous",
      clearHistory: "Effacer l'historique",
      forYou: "Parce que vous avez visité {city}",
    },
    // Features section
    features: {
      restaurantGuide: "Guide des restaurants",
      restaurantGuideDesc:
        "Étoiles Michelin, classement Black Pearl et favoris locaux avec avis détaillés",
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
      aiAssistantDesc:
        "Posez des questions en anglais sur les voyages en Chine, obtenez des réponses instantanées",
    },
    language: {
      switchTo: "Passer à",
      current: "Actuel",
      english: "Anglais",
      chinese: "Chinois",
    },

    emergencyPage: {
      title: "Contacts d'urgence et aide",
      subtitle: "Numéros de téléphone, phrases et outils essentiels pour votre sécurité en Chine",
      police: "Police",
      ambulance: "Ambulance",
      fire: "Pompiers",
      traffic: "Accident",
      oneTapCalls: "Appels d'urgence en un clic",
      oneTapDesc:
        "Touchez n'importe quel numéro pour appeler immédiatement. Aucune application nécessaire.",
      phrases: "Phrases de traduction d'urgence",
      phrasesDesc:
        "Touchez une phrase pour entendre la prononciation. Cette carte fonctionne hors ligne.",
      gps: "Partage de position GPS",
      gpsDesc:
        "Obtenez votre position actuelle et partagez-la avec les services d'urgence. Le système aide aussi à trouver les hôpitaux, pharmacies et postes de police à proximité.",
      contacts: "Contacts d'urgence",
      contactsDesc:
        "Enregistrez votre hôtel, guide ou famille pour un accès rapide en cas d'urgence.",
      howToSave: "Comment enregistrer les contacts",
      howToSave1: "Cherchez le bouton SOS rouge en bas à droite de chaque page",
      howToSave2: "Touchez le bouton menu pour ouvrir le menu d'urgence",
      howToSave3: "Allez dans l'onglet Contacts et ajoutez vos contacts d'urgence",
      nearbyHelp: "Trouver de l'aide à proximité",
      nearbyDesc:
        "Utilisez ces conseils pour trouver rapidement une aide médicale, des pharmacies et la police.",
      pageTitle: "Contacts d'urgence et phrases - ChinaConnect",
      pageDescription:
        "Contacts d'urgence essentiels et phrases de traduction pour les voyageurs en Chine. Comprend police, ambulance, pompiers, ambassade, GPS et phrases hors ligne.",
      heroHeading: "Contacts d'urgence et aide",
      hospitalsTitle: "Hôpitaux",
      hospitalSearch: "Cherchez hôpital dans n'importe quelle application de carte",
      hospitalInternational: "Hôpitaux internationaux recommandés pour étrangers",
      hospitalCommon: "Courants: Peking Union Medical College Hospital, Beijing United Family",
      pharmaciesTitle: "Pharmacies",
      pharmacyGreenCross: "Cherchez le symbole de la croix verte",
      pharmacyChains: "Grandes chaînes: Guoji Yiyao, Lianhua, Yixinke",
      pharmacyNoRx: "Beaucoup de médicaments disponibles sans ordonnance",
      policeTitle: "Postes de police",
      policeSearch: "Cherchez poste de police pour les postes locaux",
      policeEnglish: "Agents anglophones disponibles dans les grands postes",
      policeForeignAffairs: "La police des affaires étrangères aide les étrangers",
      embassyTitle: "Informations ambassade et consulat",
      embassyDesc:
        "Trouvez votre ambassade pour le remplacement de passeport, l'aide d'urgence et l'aide juridique.",
      sosButtonTitle: "Bouton SOS - Disponible sur chaque page",
      sosButtonDesc:
        "Le bouton SOS d'urgence est toujours disponible en bas à droite de chaque page.",
      howToUseSOSTitle: "Comment utiliser SOS",
      sosItem1: "Touchez le bouton SOS rouge pour appeler immédiatement la police (110)",
      sosItem2: "Appuyez 3 secondes pour appeler automatiquement votre ambassade",
      sosItem3: "Partagez votre position GPS en un clic",
      sosItem4: "Appui long ou clic droit pour le menu rapide",
      offlineHeading: "Fonctionne sans internet",
      offlineDesc:
        "Enregistrez les numéros d'urgence avant de voyager - ils fonctionnent hors ligne.",
      offlineAvailableTitle: "Disponible hors ligne",
      offlineItem1: "Le bouton SOS fonctionne sans internet",
      offlineItem2: "Phrases de traduction mises en cache pour usage hors ligne",
      offlineItem3: "Numéros d'urgence (110, 120, 119, 122) toujours accessibles",
      offlineItem4: "Téléchargez des cartes hors ligne pour mieux vous préparer",
      safetyTipsTitle: "Conseils de sécurité pour les voyageurs",
      keepDocsTitle: "Gardez vos documents en sécurité",
      keepDocs1: "Scannez le passeport et gardez une copie numérique",
      keepDocs2: "Gardez une copie physique séparée de l'original",
      keepDocs3: "Enregistrez les coordonnées de l'ambassade dans le téléphone",
      keepDocs4: "Notez les numéros d'urgence locaux",
      preparednessTitle: "Préparation aux urgences",
      preparedness1: "Enregistrez les numéros d'urgence dans les contacts",
      preparedness2: "Téléchargez des cartes hors ligne (Google Maps)",
      preparedness3: "Gardez la batterie externe chargée",
      preparedness4: "Enregistrez l'adresse de l'hôtel en chinois",
      communicationTitle: "Conseils de communication",
      communication1: "Apprenez les phrases de base en mandarin",
      communication2: "Utilisez des applications de traduction au besoin",
      communication3: "Téléchargez des fiches de phrases d'urgence",
      communication4: "Enregistrez votre nationalité dans les notes du téléphone",
      lostPassportTitle: "Passeport perdu ? Voici quoi faire",
      inChinaTitle: "En Chine",
      lpStep1Title: "Signaler à la police",
      lpStep1Desc: "Allez au poste de police le plus proche et obtenez un rapport",
      lpStep2Title: "Contacter l'ambassade",
      lpStep2Desc: "Appelez votre ambassade pour un document de voyage d'urgence",
      lpStep3Title: "Visiter l'ambassade",
      lpStep3Desc:
        "Apportez le rapport, des photos et une pièce d'identité pour obtenir un passeport d'urgence",
      importantTipsTitle: "Conseils importants",
      lpTip1: "Gardez des copies numériques du passeport dans le cloud",
      lpTip2: "Le passeport d'urgence est généralement valide pour une durée limitée",
      lpTip3: "Votre ambassade peut contacter votre famille si nécessaire",
      lpTip4: "Gardez la carte d'hôtel avec l'adresse en chinois",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "Propulsé par une IA avancée",
      heroTitle: "ChinaGuide AI",
      heroSubtitle:
        "Votre assistant personnel pour voyager en Chine — itinéraires, conseils locaux, guidance en temps réel",
      startPlanningCTA: "Commencer à planifier",
      promptsTitle: "Essayez de demander",
      promptsSubtitle: "Choisissez une suggestion ou tapez votre question ci-dessous",
      prompts: [
        {
          icon: "🏯",
          text: "Planifier un voyage de 5 jours à Pékin : histoire impériale et culture moderne",
        },
        {
          icon: "🍜",
          text: "Street food local à Chengdu que les touristes manquent souvent",
        },
        {
          icon: "🚄",
          text: "Comment aller de Shanghai à Xi'an en train à grande vitesse ?",
        },
        {
          icon: "💳",
          text: "Puis-je utiliser Apple Pay en Chine ? Quelles applis de paiement faut-il ?",
        },
        {
          icon: "🏨",
          text: "Hôtels-boutique à Hangzhou près du lac Ouest",
        },
        {
          icon: "🤝",
          text: "Étiquette d'affaires pour rencontrer des partenaires chinois",
        },
      ],
      authGateTitle: "Connectez-vous pour discuter",
      authGateSignupTitle: "Créer un compte",
      authGateDescription:
        "Le chat IA nécessite un compte gratuit pour suivre votre utilisation mensuelle et sauvegarder vos conversations.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "Mot de passe (6 caractères min.)",
      signInButton: "Se connecter",
      signUpButton: "Créer un compte",
      orContinueWith: "ou",
      noAccountPrompt: "Pas encore de compte ?",
      haveAccountPrompt: "Vous avez déjà un compte ?",
      switchToSignUp: "Créer",
      switchToSignIn: "Se connecter",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "Échec de l'authentification",
      conversationsTitle: "Conversations",
      showSidebarTitle: "Afficher les conversations",
      hideSidebarTitle: "Masquer la barre latérale",
      newChatButton: "+ Nouvelle discussion",
      noConversationsYet: "Aucune conversation pour le moment",
      messageLabel: "message",
      messagesLabel: "messages",
      deleteConfirm: "Supprimer cette conversation ?",
      deleteTitle: "Supprimer",
    },
    accountPage: {
      loading: "Chargement du compte...",
      signInRequired: "Connexion requise",
      signInRequiredDesc: "Veuillez vous connecter pour voir votre compte.",
      signIn: "Se connecter",
    },
    profilePage: {
      title: "Mon profil - ChinaConnect",
    },
    userPage: {
      title: "Profil utilisateur - ChinaConnect",
    },
    authPage: {
      callbackTitle: "Connexion en cours...",
      authTitle: "Connexion / Inscription - ChinaConnect",
      loginTitle: "Connexion - ChinaConnect",
      signingYouIn: "Connexion en cours...",
    },
    checkoutPage: {
      title: "Paiement réussi - ChinaConnect",
      description: "Votre abonnement a été activé avec succès",
      successTitle: "Paiement réussi !",
      successDesc: "Votre abonnement est activé.",
      successAccess: "Vous avez maintenant accès à toutes les fonctionnalités du nouveau plan.",
      processingDesc: "Veuillez patienter pendant que nous confirmons votre abonnement.",
      startPlanning: "Commencer à planifier",
      viewAccount: "Voir le compte",
      backToPricing: "← Retour aux tarifs",
      errorTitle: "Une erreur est survenue",
      errorDesc:
        "Nous n'avons pas pu traiter votre paiement. Veuillez réessayer ou contacter le support.",
    },
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
      open: "Öffnen",
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
      ctaSubtitle: "Beginnen Sie mit KI-gestützten Empfehlungen Ihre Reise zu planen.",
      recentlyViewed: "Zuletzt angesehen",
      recommendedForYou: "Empfohlen für Sie",
      heroDesc:
        "Michelin- & Black Pearl-Restaurants, Sehenswürdigkeiten, Transport-Tipps und Notfallinfos — unterstützt von KI und kuratiert von Einheimischen.",
      citiesTitle: "Entdecken Sie unsere Städte",
      citiesSubtitle:
        "Von alten Hauptstädten bis zu modernen Metropolen — entdecken Sie das Beste Chinas mit unseren umfassenden Städteführern.",
      featuresSubtitle: "Alles, was Sie für eine großartige Reise brauchen",
      viewAllCities: "Alle Städte ansehen",
      chatWithAI: "Mit KI chatten",
      exploreBeijing: "Peking erkunden",
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
      openingHours: "Öffnungszeiten",
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
      tags: "Tags",
    },
    empty: {
      noResults: "Keine Ergebnisse gefunden",
      noRestaurants: "Keine Restaurants entsprechen Ihren Kriterien",
      noAttractions: "Keine Attraktionen gefunden",
      noSearchResults: "Keine Suchergebnisse",
      tryAdjusting: "Versuchen Sie Ihre Filter oder Suchbegriffe anzupassen",
      noFavorites: "Noch keine Favoriten",
      addSome: "Beginnen Sie zu erkunden und speichern Sie Ihre Favoriten!",
    },
    errors: {
      loadFailed: "Inhalt konnte nicht geladen werden",
      networkError: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
      somethingWrong: "Etwas ist schief gelaufen",
      goBack: "Zurück",
      goHome: "Zur Startseite",
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
      done: "Fertig",
    },
    tooltips: {
      searchTip: "Städte, Restaurants oder Themen suchen",
      filterTip: "Nach Küche, Bewertung oder Preis filtern",
      mapTip: "Auf Karte anzeigen",
      favoritesTip: "Zu Favoriten hinzufügen",
      shareTip: "Mit Freunden teilen",
    },
    recents: {
      recentlyViewed: "Kürzlich angesehen",
      recommended: "Für Sie empfohlen",
      clearHistory: "Verlauf löschen",
      forYou: "Weil Sie {city} besucht haben",
    },
    // Features section
    features: {
      restaurantGuide: "Restaurantführer",
      restaurantGuideDesc:
        "Michelin-Sterne, Black-Pearl-Bewertung und lokale Favoriten mit ausführlichen Bewertungen",
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
      aiAssistantDesc:
        "Stellen Sie Fragen auf Englisch zu China-Reisen und erhalten Sie sofort Antworten",
    },
    language: {
      switchTo: "Wechseln zu",
      current: "Aktuell",
      english: "Englisch",
      chinese: "Chinesisch",
    },

    emergencyPage: {
      title: "Notfallkontakte und Hilfe",
      subtitle: "Wichtige Telefonnummern, Sätze und Werkzeuge für Ihre Sicherheit in China",
      police: "Polizei",
      ambulance: "Krankenwagen",
      fire: "Feuerwehr",
      traffic: "Verkehrsunfall",
      oneTapCalls: "Notruf mit einem Tippen",
      oneTapDesc:
        "Tippen Sie auf eine beliebige Nummer, um sofort anzurufen. Keine App nötig, funktioniert mit jedem Telefon.",
      phrases: "Notfall-Übersetzungssätze",
      phrasesDesc:
        "Tippen Sie auf einen Satz, um die Aussprache zu hören. Diese Karte funktioniert offline.",
      gps: "GPS-Standort teilen",
      gpsDesc:
        "Aktuellen Standort abrufen und mit Notdiensten teilen. Das System hilft auch, nahe Krankenhäuser, Apotheken und Polizeistationen zu finden.",
      contacts: "Notfallkontakte",
      contactsDesc:
        "Speichern Sie Hotel, Reiseleiter oder Familie für schnellen Zugriff im Notfall.",
      howToSave: "Kontakte speichern",
      howToSave1: "Suchen Sie den roten SOS-Button unten rechts auf jeder Seite",
      howToSave2: "Tippen Sie auf den Menü-Button, um das Notfallmenü zu öffnen",
      howToSave3: "Gehen Sie zum Kontakte-Tab und fügen Sie Notfallkontakte hinzu",
      nearbyHelp: "Hilfe in der Nähe finden",
      nearbyDesc: "Mit diesen Tipps finden Sie schnell medizinische Hilfe, Apotheken und Polizei.",
      pageTitle: "Notfallkontakte und Sätze - ChinaConnect",
      pageDescription:
        "Wichtige Notfallkontakte und Übersetzungssätze für Reisende in China. Inklusive Polizei, Krankenwagen, Feuerwehr, Botschaft, GPS und Offline-Sätze.",
      heroHeading: "Notfallkontakte und Hilfe",
      hospitalsTitle: "Krankenhäuser",
      hospitalSearch: "Suchen Sie Krankenhaus in einer Karten-App",
      hospitalInternational: "Empfohlene internationale Krankenhäuser für Ausländer",
      hospitalCommon: "Häufig: Peking Union Medical College Hospital, Beijing United Family",
      pharmaciesTitle: "Apotheken",
      pharmacyGreenCross: "Achten Sie auf das grüne Kreuz-Symbol",
      pharmacyChains: "Große Ketten: Guoji Yiyao, Lianhua, Yixinke",
      pharmacyNoRx: "Viele Medikamente ohne Rezept erhältlich",
      policeTitle: "Polizeistationen",
      policeSearch: "Suchen Sie Polizeistation für lokale Stationen",
      policeEnglish: "Englisch sprechende Beamte an großen Stationen verfügbar",
      policeForeignAffairs: "Ausländerpolizei hilft Ausländern",
      embassyTitle: "Botschafts- und Konsulatsinformationen",
      embassyDesc:
        "Wenden Sie sich an Ihre Botschaft für Passersatz, Notfallhilfe und Rechtsbeistand.",
      sosButtonTitle: "SOS-Button - auf jeder Seite verfügbar",
      sosButtonDesc: "Der Notfall-SOS-Button ist unten rechts auf jeder Seite verfügbar.",
      howToUseSOSTitle: "SOS verwenden",
      sosItem1: "Tippen Sie auf den roten SOS-Button, um sofort die Polizei (110) anzurufen",
      sosItem2: "Halten Sie 3 Sekunden gedrückt, um Ihre Botschaft automatisch anzurufen",
      sosItem3: "Teilen Sie Ihren GPS-Standort mit einem Tippen",
      sosItem4: "Langes Drücken oder Rechtsklick für das Schnellmenü",
      offlineHeading: "Funktioniert ohne Internet",
      offlineDesc: "Speichern Sie Notfallnummern vor der Reise - sie funktionieren offline.",
      offlineAvailableTitle: "Offline verfügbar",
      offlineItem1: "SOS-Button funktioniert ohne Internet",
      offlineItem2: "Übersetzungssätze sind offline zwischengespeichert",
      offlineItem3: "Notfallnummern (110, 120, 119, 122) immer erreichbar",
      offlineItem4: "Laden Sie Offline-Karten für bessere Vorbereitung herunter",
      safetyTipsTitle: "Sicherheitstipps für Reisende",
      keepDocsTitle: "Dokumente sicher aufbewahren",
      keepDocs1: "Reisepass scannen und digitale Kopie aufbewahren",
      keepDocs2: "Physische Kopie separat vom Original aufbewahren",
      keepDocs3: "Botschaftskontakt im Telefon speichern",
      keepDocs4: "Lokale Notfallnummern notieren",
      preparednessTitle: "Notfallvorsorge",
      preparedness1: "Notfallnummern in Telefonkontakten speichern",
      preparedness2: "Offline-Karten herunterladen (Google Maps)",
      preparedness3: "Powerbank geladen halten",
      preparedness4: "Hoteladresse auf Chinesisch speichern",
      communicationTitle: "Kommunikationstipps",
      communication1: "Grundlegende Mandarin-Sätze lernen",
      communication2: "Übersetzungs-Apps bei Bedarf verwenden",
      communication3: "Notfall-Satzkarten herunterladen",
      communication4: "Staatsangehörigkeit in Telefonnotizen speichern",
      lostPassportTitle: "Reisepass verloren? Das ist zu tun",
      inChinaTitle: "In China",
      lpStep1Title: "Polizei melden",
      lpStep1Desc: "Zur nächsten Polizeistation gehen und einen Bericht holen",
      lpStep2Title: "Botschaft kontaktieren",
      lpStep2Desc: "Rufen Sie Ihre Botschaft für ein Notfall-Reisedokument an",
      lpStep3Title: "Botschaft besuchen",
      lpStep3Desc: "Bericht, Fotos und Ausweis mitbringen, um Notfall-Reisepass zu erhalten",
      importantTipsTitle: "Wichtige Tipps",
      lpTip1: "Digitale Kopien des Reisepasses in der Cloud speichern",
      lpTip2: "Notfall-Reisepass ist meist nur begrenzt gültig",
      lpTip3: "Ihre Botschaft kann bei Bedarf Familie kontaktieren",
      lpTip4: "Hotelkarte mit chinesischer Adresse aufbewahren",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "Powered by fortschrittliche KI",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "Ihr persönlicher China-Reise-KI — Routen, lokale Einblicke, Echtzeit-Hilfe",
      startPlanningCTA: "Planung starten",
      promptsTitle: "Versuchen Sie zu fragen",
      promptsSubtitle: "Wählen Sie eine Frage oder geben Sie unten Ihre eigene ein",
      prompts: [
        {
          icon: "🏯",
          text: "5-tägige Peking-Reise mit kaiserlicher Geschichte und moderner Kultur",
        },
        {
          icon: "🍜",
          text: "Lokales Street Food in Chengdu, das Touristen oft übersehen",
        },
        {
          icon: "🚄",
          text: "Wie reist man mit dem Hochgeschwindigkeitszug von Shanghai nach Xi'an?",
        },
        {
          icon: "💳",
          text: "Funktioniert Apple Pay in China? Welche Bezahl-Apps brauche ich?",
        },
        {
          icon: "🏨",
          text: "Boutique-Hotels in Hangzhou in der Nähe des Westsees",
        },
        {
          icon: "🤝",
          text: "Business-Knigge für Treffen mit chinesischen Partnern",
        },
      ],
      authGateTitle: "Anmelden zum Chatten",
      authGateSignupTitle: "Konto erstellen",
      authGateDescription:
        "Für den KI-Chat ist ein kostenloses Konto nötig — wir verfolgen die monatliche Nutzung und speichern Ihre Gespräche.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "Passwort (mind. 6 Zeichen)",
      signInButton: "Anmelden",
      signUpButton: "Konto erstellen",
      orContinueWith: "oder",
      noAccountPrompt: "Noch kein Konto?",
      haveAccountPrompt: "Schon ein Konto?",
      switchToSignUp: "Erstellen",
      switchToSignIn: "Anmelden",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "Authentifizierung fehlgeschlagen",
      conversationsTitle: "Gespräche",
      showSidebarTitle: "Gespräche anzeigen",
      hideSidebarTitle: "Seitenleiste ausblenden",
      newChatButton: "+ Neuer Chat",
      noConversationsYet: "Noch keine Gespräche",
      messageLabel: "Nachricht",
      messagesLabel: "Nachrichten",
      deleteConfirm: "Dieses Gespräch löschen?",
      deleteTitle: "Löschen",
    },
    accountPage: {
      loading: "Konto wird geladen...",
      signInRequired: "Anmeldung erforderlich",
      signInRequiredDesc: "Bitte melden Sie sich an, um Ihr Konto zu sehen.",
      signIn: "Anmelden",
    },
    profilePage: {
      title: "Mein Profil - ChinaConnect",
    },
    userPage: {
      title: "Benutzerprofil - ChinaConnect",
    },
    authPage: {
      callbackTitle: "Anmeldung läuft...",
      authTitle: "Anmelden / Registrieren - ChinaConnect",
      loginTitle: "Anmelden - ChinaConnect",
      signingYouIn: "Sie werden angemeldet...",
    },
    checkoutPage: {
      title: "Zahlung erfolgreich - ChinaConnect",
      description: "Ihr Abonnement wurde erfolgreich aktiviert",
      successTitle: "Zahlung erfolgreich！",
      successDesc: "Ihr Abonnement ist aktiviert.",
      successAccess: "Sie haben jetzt Zugriff auf alle Funktionen des neuen Plans.",
      processingDesc: "Bitte warten Sie, während wir Ihr Abonnement bestätigen.",
      startPlanning: "Planung starten",
      viewAccount: "Konto anzeigen",
      backToPricing: "← Zurück zu den Preisen",
      errorTitle: "Etwas ist schiefgelaufen",
      errorDesc:
        "Wir konnten Ihre Zahlung nicht verarbeiten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
    },
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
      open: "فتح",
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
      ctaSubtitle: "ابدأ التخطيط لرحلتك مع توصيات مدعومة بالذكاء الاصطناعي.",
      recentlyViewed: "شوهدت مؤخرًا",
      recommendedForYou: "موصى به لك",
      heroDesc:
        "مطاعم ميشلان وبلاك بيرل، المعالم السياحية، نصائح النقل، ومعلومات الطوارئ — مدعوم بالذكاء الاصطناعي ومنتقى من السكان المحليين.",
      citiesTitle: "استكشف مدننا",
      citiesSubtitle:
        "من العواصم القديمة إلى المدن الحديثة، اكتشف أفضل ما في الصين مع أدلة مدننا الشاملة.",
      featuresSubtitle: "كل ما تحتاجه لرحلة رائعة",
      viewAllCities: "عرض جميع المدن",
      chatWithAI: "الدردشة مع الذكاء الاصطناعي",
      exploreBeijing: "استكشاف بكين",
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
      openingHours: "ساعات العمل",
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
      tags: "الوسوم",
    },
    empty: {
      noResults: "لم يتم العثور على نتائج",
      noRestaurants: "لا توجد مطاعم تطابق معاييرك",
      noAttractions: "لم يتم العثور على معالم",
      noSearchResults: "لا توجد نتائج بحث",
      tryAdjusting: "حاول تعديل عوامل التصفية أو مصطلحات البحث",
      noFavorites: "لا توجد مفضلات بعد",
      addSome: "ابدأ الاستكشاف واحفظ مفضلاتك!",
    },
    errors: {
      loadFailed: "فشل تحميل المحتوى",
      networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
      somethingWrong: "حدث خطأ ما",
      goBack: "رجوع",
      goHome: "الذهاب للرئيسية",
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
      done: "تم",
    },
    tooltips: {
      searchTip: "ابحث عن مدن أو مطاعم أو مواضيع",
      filterTip: "تصفية حسب المطبخ أو التقييم أو السعر",
      mapTip: "عرض على الخريطة",
      favoritesTip: "إضافة إلى المفضلات",
      shareTip: "مشاركة مع الأصدقاء",
    },
    recents: {
      recentlyViewed: "شوهدت مؤخراً",
      recommended: "موصى به لك",
      clearHistory: "مسح السجل",
      forYou: "لأنك زرت {city}",
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
      chinese: "الصينية",
    },

    emergencyPage: {
      title: "جهات الاتصال في حالات الطوارئ والمساعدة",
      subtitle: "أرقام الهواتف والعبارات والأدوات الأساسية لسلامتك في الصين",
      police: "الشرطة",
      ambulance: "الإسعاف",
      fire: "الإطفاء",
      traffic: "حوادث المرور",
      oneTapCalls: "مكالمة طوارئ بنقرة واحدة",
      oneTapDesc: "انقر على أي رقم للاتصال فوراً. لا حاجة إلى تطبيق، يعمل مع أي هاتف.",
      phrases: "عبارات ترجمة الطوارئ",
      phrasesDesc: "انقر على أي عبارة للاستماع إلى النطق. هذه البطاقة تعمل دون اتصال.",
      gps: "مشاركة موقع GPS",
      gpsDesc:
        "احصل على موقعك الحالي وشاركه مع خدمات الطوارئ. يساعدك النظام أيضًا في العثور على المستشفيات والصيدليات ومراكز الشرطة القريبة.",
      contacts: "جهات اتصال الطوارئ",
      contactsDesc:
        "احفظ بيانات الفندق أو المرشد السياحي أو العائلة للوصول السريع في حالات الطوارئ.",
      howToSave: "كيفية حفظ جهات الاتصال",
      howToSave1: "ابحث عن زر SOS الأحمر في الزاوية اليمنى السفلية لأي صفحة",
      howToSave2: "انقر زر القائمة لفتح قائمة الطوارئ",
      howToSave3: "اذهب إلى علامة تبويب جهات الاتصال وأضف جهات اتصال الطوارئ",
      nearbyHelp: "إيجاد المساعدة القريبة",
      nearbyDesc: "استخدم هذه النصائح لإيجاد المساعدة الطبية والصيدليات والشرطة بسرعة.",
      pageTitle: "جهات اتصال الطوارئ والعبارات - ChinaConnect",
      pageDescription:
        "جهات اتصال الطوارئ الأساسية وعبارات الترجمة للمسافرين في الصين. تشمل الشرطة والإسعاف والإطفاء والسفارة وموقع GPS وعبارات دون اتصال.",
      heroHeading: "جهات اتصال الطوارئ والمساعدة",
      hospitalsTitle: "المستشفيات",
      hospitalSearch: "ابحث عن مستشفى في أي تطبيق خرائط",
      hospitalInternational: "مستشفيات دولية موصى بها للأجانب",
      hospitalCommon: "الشائعة: مستشفى بكين يونيون، بكين يونايتد فاميلي",
      pharmaciesTitle: "الصيدليات",
      pharmacyGreenCross: "ابحث عن رمز الصليب الأخضر",
      pharmacyChains: "السلاسل الكبرى: Guoyao Yiyao، Lianhua، Yixinke",
      pharmacyNoRx: "العديد من الأدوية متاحة بدون وصفة طبية",
      policeTitle: "مراكز الشرطة",
      policeSearch: "ابحث عن مركز شرطة للمراكز المحلية",
      policeEnglish: "ضباط يتحدثون الإنجليزية متوفرون في المراكز الكبرى",
      policeForeignAffairs: "شرطة الشؤون الأجنبية تساعد الأجانب",
      embassyTitle: "معلومات السفارة والقنصلية",
      embassyDesc: "تواصل مع سفارتك لاستبدال جواز السفر والمساعدة الطارئة والمساعدة القانونية.",
      sosButtonTitle: "زر SOS - متاح في كل صفحة",
      sosButtonDesc: "زر SOS للطوارئ متاح دائمًا في الزاوية اليمنى السفلية لكل صفحة.",
      howToUseSOSTitle: "كيفية استخدام SOS",
      sosItem1: "انقر زر SOS الأحمر للاتصال بالشرطة (110) فورًا",
      sosItem2: "اضغط مطولاً 3 ثوانٍ للاتصال التلقائي بسفارتك",
      sosItem3: "شارك موقع GPS بنقرة واحدة",
      sosItem4: "اضغط مطولاً أو انقر بزر الفأرة الأيمن للوصول إلى القائمة السريعة",
      offlineHeading: "يعمل دون اتصال",
      offlineDesc: "احفظ أرقام الطوارئ قبل السفر - تعمل دون اتصال.",
      offlineAvailableTitle: "متاح دون اتصال",
      offlineItem1: "يعمل زر SOS دون اتصال بالإنترنت",
      offlineItem2: "يتم تخزين عبارات الترجمة مؤقتًا للاستخدام دون اتصال",
      offlineItem3: "أرقام الطوارئ (110، 120، 119، 122) متاحة دائمًا",
      offlineItem4: "حمّل الخرائط دون اتصال لتكون مستعدًا بشكل أفضل",
      safetyTipsTitle: "نصائح أمان للمسافرين",
      keepDocsTitle: "حافظ على سلامة المستندات",
      keepDocs1: "امسح جواز السفر ضوئيًا واحتفظ بنسخة رقمية",
      keepDocs2: "احتفظ بنسخة ورقية منفصلة عن الأصل",
      keepDocs3: "احفظ معلومات اتصال السفارة في الهاتف",
      keepDocs4: "دوّن أرقام الطوارئ المحلية",
      preparednessTitle: "الاستعداد للطوارئ",
      preparedness1: "احفظ أرقام الطوارئ في جهات اتصال الهاتف",
      preparedness2: "حمّل الخرائط دون اتصال (Google Maps)",
      preparedness3: "حافظ على شحن بطارية احتياطية",
      preparedness4: "احفظ عنوان الفندق بالصينية",
      communicationTitle: "نصائح التواصل",
      communication1: "تعلم عبارات الماندرين الأساسية",
      communication2: "استخدم تطبيقات الترجمة عند الحاجة",
      communication3: "حمّل بطاقات عبارات الطوارئ",
      communication4: "احفظ جنسيتك في ملاحظات الهاتف",
      lostPassportTitle: "هل فقدت جواز السفر؟ إليك ما يجب فعله",
      inChinaTitle: "في الصين",
      lpStep1Title: "الإبلاغ للشرطة",
      lpStep1Desc: "اذهب إلى أقرب مركز شرطة واحصل على تقرير شرطة",
      lpStep2Title: "الاتصال بالسفارة",
      lpStep2Desc: "اتصل بسفارتك للحصول على وثيقة سفر طارئة",
      lpStep3Title: "زيارة السفارة",
      lpStep3Desc: "أحضر تقرير الشرطة والصور والهوية للحصول على جواز سفر طارئ",
      importantTipsTitle: "نصائح مهمة",
      lpTip1: "احفظ نسخًا رقمية من جواز السفر في السحابة",
      lpTip2: "جواز السفر الطارئ عادة ما يكون صالحًا لفترة محدودة",
      lpTip3: "يمكن لسفارتك الاتصال بعائلتك إذا لزم الأمر",
      lpTip4: "احتفظ ببطاقة الفندق مع العنوان بالصينية",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "مدعوم بالذكاء الاصطناعي المتقدم",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "مساعدك الذكي للسفر إلى الصين — خطط الرحلات، رؤى محلية، توجيه فوري",
      startPlanningCTA: "ابدأ التخطيط",
      promptsTitle: "جرب أن تسأل",
      promptsSubtitle: "اختر سؤالا أو اكتب سؤالك أدناه",
      prompts: [
        {
          icon: "🏯",
          text: "خطط لرحلة 5 أيام إلى بكين تجمع التاريخ الإمبراطوري والثقافة الحديثة",
        },
        {
          icon: "🍜",
          text: "أفضل أكل الشوارع المحلي في تشنغدو الذي يفوته السياح عادة",
        },
        {
          icon: "🚄",
          text: "كيفية السفر من شنغهاي إلى شيان بالقطار فائق السرعة؟",
        },
        {
          icon: "💳",
          text: "هل يمكنني استخدام Apple Pay في الصين؟ ما تطبيقات الدفع التي أحتاجها؟",
        },
        {
          icon: "🏨",
          text: "توصية بفنادق بوتيك في هانغتشو بالقرب من البحيرة الغربية",
        },
        {
          icon: "🤝",
          text: "نصائح آداب العمل عند لقاء شركاء صينيين",
        },
      ],
      authGateTitle: "سجّل الدخول للدردشة",
      authGateSignupTitle: "إنشاء حساب",
      authGateDescription:
        "تحتاج الدردشة الذكية إلى حساب مجاني لتتبع استخدامك الشهري وحفظ محادثاتك.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "كلمة المرور (6 أحرف على الأقل)",
      signInButton: "تسجيل الدخول",
      signUpButton: "إنشاء حساب",
      orContinueWith: "أو",
      noAccountPrompt: "ليس لديك حساب؟",
      haveAccountPrompt: "لديك حساب بالفعل؟",
      switchToSignUp: "إنشاء",
      switchToSignIn: "تسجيل الدخول",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "فشل المصادقة",
      conversationsTitle: "المحادثات",
      showSidebarTitle: "إظهار المحادثات",
      hideSidebarTitle: "إخفاء الشريط الجانبي",
      newChatButton: "+ محادثة جديدة",
      noConversationsYet: "لا توجد محادثات بعد",
      messageLabel: "رسالة",
      messagesLabel: "رسائل",
      deleteConfirm: "حذف هذه المحادثة؟",
      deleteTitle: "حذف",
    },
    accountPage: {
      loading: "جارٍ تحميل الحساب...",
      signInRequired: "يلزم تسجيل الدخول",
      signInRequiredDesc: "يرجى تسجيل الدخول لعرض حسابك.",
      signIn: "تسجيل الدخول",
    },
    profilePage: {
      title: "ملفي الشخصي - ChinaConnect",
    },
    userPage: {
      title: "ملف المستخدم - ChinaConnect",
    },
    authPage: {
      callbackTitle: "جارٍ تسجيل الدخول...",
      authTitle: "تسجيل الدخول / التسجيل - ChinaConnect",
      loginTitle: "تسجيل الدخول - ChinaConnect",
      signingYouIn: "جارٍ تسجيل دخولك...",
    },
    checkoutPage: {
      title: "تم الدفع بنجاح - ChinaConnect",
      description: "تم تفعيل اشتراكك بنجاح",
      successTitle: "تم الدفع بنجاح！",
      successDesc: "تم تفعيل اشتراكك.",
      successAccess: "يمكنك الآن الوصول إلى جميع ميزات الخطة الجديدة.",
      processingDesc: "يرجى الانتظار حتى نؤكد اشتراكك.",
      startPlanning: "ابدأ التخطيط",
      viewAccount: "عرض الحساب",
      backToPricing: "← العودة إلى الأسعار",
      errorTitle: "حدث خطأ ما",
      errorDesc: "لم نتمكن من معالجة الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.",
    },
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
      open: "باز کردن",
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
      ctaSubtitle: "سفر خود را با توصیه‌های مبتنی بر AI برنامه‌ریزی کنید.",
      recentlyViewed: "اخیراً مشاهده‌شده",
      recommendedForYou: "پیشنهاد برای شما",
      heroDesc:
        "رستوران‌های میشلن و بلک پرل، جاذبه‌ها، نکات حمل و نقل و اطلاعات اضطراری — با قدرت هوش مصنوعی و گردآوری شده توسط محلی‌ها.",
      citiesTitle: "شهرهای ما را کاوش کنید",
      citiesSubtitle:
        "از پایتخت‌های باستانی تا شهرهای مدرن، بهترین‌های چین را با راهنماهای جامع شهر ما کشف کنید.",
      featuresSubtitle: "هر آنچه برای یک سفر عالی نیاز دارید",
      viewAllCities: "مشاهده همه شهرها",
      chatWithAI: "گفتگو با هوش مصنوعی",
      exploreBeijing: "کاوش پکن",
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
      openingHours: "ساعات کاری",
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
      tags: "برچسب‌ها",
    },
    empty: {
      noResults: "نتیجه‌ای یافت نشد",
      noRestaurants: "هیچ رستورانی با معیارهای شما مطابقت ندارد",
      noAttractions: "جاذبه‌ای یافت نشد",
      noSearchResults: "نتیجه جستجویی وجود ندارد",
      tryAdjusting: "فیلترها یا کلمات جستجو را تنظیم کنید",
      noFavorites: "هنوز علاقه‌مندی ندارید",
      addSome: "کاوش را شروع کنید و علاقه‌مندی‌های خود را ذخیره کنید!",
    },
    errors: {
      loadFailed: "بارگذاری محتوا ناموفق بود",
      networkError: "خطای شبکه. لطفاً اتصال خود را بررسی کنید.",
      somethingWrong: "مشکلی پیش آمد",
      goBack: "بازگشت",
      goHome: "رفتن به صفحه اصلی",
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
      done: "انجام شد",
    },
    tooltips: {
      searchTip: "جستجوی شهرها، رستوران‌ها یا موضوعات",
      filterTip: "فیلتر بر اساس غذا، امتیاز یا قیمت",
      mapTip: "مشاهده روی نقشه",
      favoritesTip: "افزودن به علاقه‌مندی‌ها",
      shareTip: "اشتراک‌گذاری با دوستان",
    },
    recents: {
      recentlyViewed: "اخیراً مشاهده شده",
      recommended: "پیشنهاد شده برای شما",
      clearHistory: "پاک کردن تاریخچه",
      forYou: "چون شما {city} را بازدید کرده‌اید",
    },
    // Features section
    features: {
      restaurantGuide: "راهنمای رستوران",
      restaurantGuideDesc:
        "ستارهای میشلن، رتبه‌بندی بلک پرل و موارد دلخواه محلی با نقد و بررسی دقیق",
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
      chinese: "چینی",
    },

    emergencyPage: {
      title: "تماس‌های اضطراری و کمک",
      subtitle: "شماره تلفن‌ها، عبارات و ابزارهای ضروری برای ایمنی شما در چین",
      police: "پلیس",
      ambulance: "آمبولانس",
      fire: "آتش‌نشانی",
      traffic: "تصادف",
      oneTapCalls: "تماس اضطراری با یک ضربه",
      oneTapDesc:
        "روی هر شماره‌ای بزنید تا فوراً تماس بگیرید. بدون نیاز به اپ، با هر تلفنی کار می‌کند.",
      phrases: "عبارات ترجمه اضطراری",
      phrasesDesc: "روی هر عبارت بزنید تا تلفظ را بشنوید. این کارت آفلاین کار می‌کند.",
      gps: "اشتراک‌گذاری موقعیت GPS",
      gpsDesc:
        "موقعیت فعلی خود را به دست آورید و با خدمات اضطراری به اشتراک بگذارید. این سیستم همچنین به یافتن بیمارستان‌ها، داروخانه‌ها و کلانتری‌های نزدیک کمک می‌کند.",
      contacts: "تماس‌های اضطراری",
      contactsDesc:
        "اطلاعات هتل، راهنما یا خانواده را برای دسترسی سریع در مواقع اضطراری ذخیره کنید.",
      howToSave: "نحوه ذخیره تماس‌ها",
      howToSave1: "دکمه SOS قرمز را در گوشه پایین سمت راست هر صفحه پیدا کنید",
      howToSave2: "دکمه منو را بزنید تا منوی اضطراری باز شود",
      howToSave3: "به تب تماس‌ها بروید و تماس‌های اضطراری را اضافه کنید",
      nearbyHelp: "یافتن کمک در نزدیکی",
      nearbyDesc: "از این نکات برای یافتن سریع کمک پزشکی، داروخانه و پلیس استفاده کنید.",
      pageTitle: "تماس‌های اضطراری و عبارات - ChinaConnect",
      pageDescription:
        "تماس‌های اضطراری ضروری و عبارات ترجمه برای مسافران در چین. شامل پلیس، آمبولانس، آتش‌نشانی، سفارت، موقعیت GPS و عبارات آفلاین.",
      heroHeading: "تماس‌های اضطراری و کمک",
      hospitalsTitle: "بیمارستان‌ها",
      hospitalSearch: "در هر اپ نقشه بیمارستان را جستجو کنید",
      hospitalInternational: "بیمارستان‌های بین‌المللی پیشنهادی برای خارجی‌ها",
      hospitalCommon: "رایج: بیمارستان Peking Union، Beijing United Family",
      pharmaciesTitle: "داروخانه‌ها",
      pharmacyGreenCross: "نماد ضربدر سبز را جستجو کنید",
      pharmacyChains: "زنجیره‌های بزرگ: Guoyao Yiyao، Lianhua، Yixinke",
      pharmacyNoRx: "بسیاری از داروها بدون نسخه موجودند",
      policeTitle: "کلانتری‌ها",
      policeSearch: "کلانتری محلی را جستجو کنید",
      policeEnglish: "افسران انگلیسی‌زبان در کلانتری‌های اصلی موجودند",
      policeForeignAffairs: "پلیس امور خارجی به خارجی‌ها کمک می‌کند",
      embassyTitle: "اطلاعات سفارت و کنسولگری",
      embassyDesc: "برای تعویض گذرنامه، کمک اضطراری و کمک حقوقی با سفارت خود تماس بگیرید.",
      sosButtonTitle: "دکمه SOS - در هر صفحه موجود",
      sosButtonDesc: "دکمه SOS اضطراری همیشه در گوشه پایین سمت راست هر صفحه موجود است.",
      howToUseSOSTitle: "نحوه استفاده از SOS",
      sosItem1: "دکمه SOS قرمز را بزنید تا فوراً با پلیس (110) تماس بگیرید",
      sosItem2: "3 ثانیه نگه دارید تا به طور خودکار با سفارت تماس بگیرید",
      sosItem3: "موقعیت GPS را با یک ضربه به اشتراک بگذارید",
      sosItem4: "نگه داشتن یا کلیک راست برای دسترسی سریع به منو",
      offlineHeading: "بدون اینترنت کار می‌کند",
      offlineDesc: "شماره‌های اضطراری را قبل از سفر ذخیره کنید - آفلاین کار می‌کنند.",
      offlineAvailableTitle: "به‌صورت آفلاین در دسترس",
      offlineItem1: "دکمه SOS بدون اینترنت کار می‌کند",
      offlineItem2: "عبارات ترجمه برای استفاده آفلاین ذخیره می‌شوند",
      offlineItem3: "شماره‌های اضطراری (110، 120، 119، 122) همیشه در دسترس",
      offlineItem4: "نقشه‌های آفلاین را برای آمادگی بهتر دانلود کنید",
      safetyTipsTitle: "نکات ایمنی برای مسافران",
      keepDocsTitle: "اسناد را ایمن نگه دارید",
      keepDocs1: "گذرنامه را اسکن کنید و یک کپی دیجیتال نگه دارید",
      keepDocs2: "کپی فیزیکی را جدا از اصل نگه دارید",
      keepDocs3: "اطلاعات تماس سفارت را در تلفن ذخیره کنید",
      keepDocs4: "شماره‌های اضطراری محلی را یادداشت کنید",
      preparednessTitle: "آمادگی اضطراری",
      preparedness1: "شماره‌های اضطراری را در مخاطبین تلفن ذخیره کنید",
      preparedness2: "نقشه‌های آفلاین (Google Maps) را دانلود کنید",
      preparedness3: "پاوربانک را شارژ نگه دارید",
      preparedness4: "آدرس هتل را به چینی ذخیره کنید",
      communicationTitle: "نکات ارتباطی",
      communication1: "عبارات پایه چینی یاد بگیرید",
      communication2: "در صورت نیاز از اپ‌های ترجمه استفاده کنید",
      communication3: "کارت‌های عبارات اضطراری را دانلود کنید",
      communication4: "ملیت خود را در یادداشت‌های تلفن ذخیره کنید",
      lostPassportTitle: "گذرنامه گم شده؟ این کارها را انجام دهید",
      inChinaTitle: "در چین",
      lpStep1Title: "به پلیس گزارش دهید",
      lpStep1Desc: "به نزدیک‌ترین کلانتری بروید و گزارش پلیس بگیرید",
      lpStep2Title: "تماس با سفارت",
      lpStep2Desc: "برای سند سفر اضطراری با سفارت تماس بگیرید",
      lpStep3Title: "مراجعه به سفارت",
      lpStep3Desc: "گزارش پلیس، عکس و شناسنامه را ببرید تا گذرنامه اضطراری بگیرید",
      importantTipsTitle: "نکات مهم",
      lpTip1: "کپی دیجیتال گذرنامه را در ابر نگه دارید",
      lpTip2: "گذرنامه اضطراری معمولاً مدت محدودی اعتبار دارد",
      lpTip3: "سفارت در صورت لزوم می‌تواند با خانواده تماس بگیرد",
      lpTip4: "کارت هتل با آدرس چینی را نگه دارید",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "پشتیبانی‌شده توسط هوش مصنوعی پیشرفته",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "دستیار شخصی سفر شما به چین — برنامه سفر، شناخت فرهنگ محلی، راهنمایی لحظه‌ای",
      startPlanningCTA: "شروع برنامه‌ریزی",
      promptsTitle: "امتحان کنید بپرسید",
      promptsSubtitle: "یک پیشنهاد انتخاب کنید یا سوال خود را پایین بنویسید",
      prompts: [
        {
          icon: "🏯",
          text: "برنامه ۵ روزه پکن با تاریخ امپراتوری و فرهنگ مدرن",
        },
        {
          icon: "🍜",
          text: "غذای خیابانی محلی چنگدو که گردشگران معمولا از دست می‌دهند",
        },
        {
          icon: "🚄",
          text: "چگونه از شانگهای به شیان با قطار پرسرعت سفر کنیم؟",
        },
        {
          icon: "💳",
          text: "آیا می‌توان در چین از Apple Pay استفاده کرد؟ چه برنامه‌های پرداختی لازم است؟",
        },
        {
          icon: "🏨",
          text: "هتل‌های بوتیک در هانگژو نزدیک دریاچه غربی",
        },
        {
          icon: "🤝",
          text: "نکات آداب کاری برای ملاقات با شرکای چینی",
        },
      ],
      authGateTitle: "برای گفتگو وارد شوید",
      authGateSignupTitle: "ساخت حساب",
      authGateDescription:
        "چت هوش مصنوعی به یک حساب رایگان نیاز دارد تا استفاده ماهانه شما را پیگیری کرده و گفتگوهایتان را ذخیره کند.",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "گذرواژه (حداقل ۶ نویسه)",
      signInButton: "ورود",
      signUpButton: "ساخت حساب",
      orContinueWith: "یا",
      noAccountPrompt: "هنوز حساب ندارید؟",
      haveAccountPrompt: "از قبل حساب دارید؟",
      switchToSignUp: "ساختن",
      switchToSignIn: "ورود",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "احراز هویت ناموفق بود",
      conversationsTitle: "گفتگوها",
      showSidebarTitle: "نمایش گفتگوها",
      hideSidebarTitle: "پنهان کردن نوار کناری",
      newChatButton: "+ گفتگوی جدید",
      noConversationsYet: "هنوز گفتگویی نیست",
      messageLabel: "پیام",
      messagesLabel: "پیام",
      deleteConfirm: "این گفتگو حذف شود؟",
      deleteTitle: "حذف",
    },
    accountPage: {
      loading: "در حال بارگذاری حساب...",
      signInRequired: "نیاز به ورود",
      signInRequiredDesc: "برای مشاهده حساب خود وارد شوید.",
      signIn: "ورود",
    },
    profilePage: {
      title: "پروفایل من - ChinaConnect",
    },
    userPage: {
      title: "پروفایل کاربر - ChinaConnect",
    },
    authPage: {
      callbackTitle: "در حال ورود...",
      authTitle: "ورود / ثبت‌نام - ChinaConnect",
      loginTitle: "ورود - ChinaConnect",
      signingYouIn: "در حال ورود شما...",
    },
    checkoutPage: {
      title: "پرداخت موفق - ChinaConnect",
      description: "اشتراک شما با موفقیت فعال شد",
      successTitle: "پرداخت موفق！",
      successDesc: "اشتراک شما فعال شد.",
      successAccess: "اکنون به همه ویژگی‌های طرح جدید دسترسی دارید.",
      processingDesc: "لطفاً صبر کنید تا اشتراک شما را تأیید کنیم.",
      startPlanning: "شروع برنامه‌ریزی",
      viewAccount: "مشاهده حساب",
      backToPricing: "← بازگشت به قیمت‌ها",
      errorTitle: "خطایی رخ داد",
      errorDesc:
        "ما نتوانستیم پرداخت شما را پردازش کنیم. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.",
    },
  },
  "zh-CN": {
    nav: {
      home: "主页",
      cities: "城市",
      restaurants: "餐厅",
      aiChat: "中国指南 AI",
      guide: "旅行指南",
      business: "商务快递",
      tagline: "使用 AI 探索中国",
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
      open: "打开",
    },
    home: {
      heroTitle: "你的 AI 驱动中国指南",
      heroSubtitle: "你可靠的中国旅行同行",
      heroCTA: "向 AI 询问行程建议",
      exploreCities: "探索城市",
      statsCities: "覆盖城市",
      statsRestaurants: "米其林餐厅",
      statsAttractions: "热门景点",
      statsAI: "AI 助手",
      featuresTitle: "你的中国之行一站式准备",
      ctaTitle: "准备开始探索中国？",
      ctaSubtitle: "使用 AI 推荐快速制定行程。",
      recentlyViewed: "最近浏览",
      recommendedForYou: "为你推荐",
      heroDesc:
        "米其林·黑珍珠餐厅、景点、交通贴士、紧急联系信息 — 由 AI 和本地人精心整理,为您提供所需的一切。",
      citiesTitle: "探索我们的城市",
      citiesSubtitle: "从古都到现代都市,通过全面的城市指南发现中国之美。",
      featuresSubtitle: "精彩旅程所需的一切",
      viewAllCities: "查看所有城市",
      chatWithAI: "与 AI 对话",
      exploreBeijing: "探索北京",
    },
    cities: {
      title: "探索我们的城市",
      subtitle: "从古都到现代都市",
      exploreGuide: "探索指南",
      attractions: "景点",
      restaurants: "餐厅",
      transport: "交通",
      hotels: "酒店",
      payment: "支付",
      culturalTips: "文化提示",
      emergency: "紧急联系",
      recommendedTime: "推荐时间",
      ticketPrice: "门票",
      openingHours: "开放时间",
    },
    restaurants: {
      title: "餐厅指南",
      subtitle: "米其林、黑珍珠和本地人民不错选",
      michelin: "米其林",
      blackPearl: "黑珍珠",
      local: "本地烘",
      avgPrice: "人均价格",
      rating: "评分",
      cuisine: "菜系",
      address: "地址",
      hours: "营业时间",
      dishes: "招牌菜",
      tags: "标签",
    },
    empty: {
      noResults: "未找到结果",
      noRestaurants: "没有符合条件的餐厅",
      noAttractions: "未找到景点",
      noSearchResults: "搜索无结果",
      tryAdjusting: "请调整筛选或关键词",
      noFavorites: "还没有收藏",
      addSome: "开始探索，收藏你喜欢的内容！",
    },
    errors: {
      loadFailed: "加载失败",
      networkError: "网络错误，请检查连接。",
      somethingWrong: "出现了一些问题",
      goBack: "返回",
      goHome: "返回主页",
    },
    onboarding: {
      welcome: "欢迎来到 ChinaConnect！",
      step1Title: "发现美食",
      step1Desc: "在 12 个中国城市中找到米其林和黑珍珠餐厅。",
      step2Title: "AI 驱动推荐",
      step2Desc: "从我们的 AI 助手获取个性化推荐和内行提示。",
      step3Title: "旅行更放心",
      step3Desc: "一站式获取紧急联系、交通信息和文化提示。",
      getStarted: "开始使用",
      skip: "跳过",
      next: "下一步",
      done: "完成",
    },
    tooltips: {
      searchTip: "搜索城市、餐厅或话题",
      filterTip: "按菜系、评分或价格筛选",
      mapTip: "在地图上查看",
      favoritesTip: "添加到收藏",
      shareTip: "分享给朋友",
    },
    recents: {
      recentlyViewed: "最近浏览",
      recommended: "为你推荐",
      clearHistory: "清除历史",
      forYou: "因为你访问了 {city}",
    },
    features: {
      restaurantGuide: "餐厅指南",
      restaurantGuideDesc: "米其林、黑珍珠、本地菜推荐与详细点评",
      attractions: "景点",
      attractionsDesc: "热门景点、开放时间、门票与本地提示",
      transport: "交通",
      transportDesc: "怎么去、怎么走 - 飞机、火车、地铁与本地提示",
      emergency: "紧急联系",
      emergencyDesc: "医院、警察、大使馆以及重要电话",
      payment: "支付指南",
      paymentDesc: "支付宝、微信支付、现金以及信用卡使用提示",
      accommodation: "住宿",
      accommodationDesc: "从豪华到经济型酒店推荐",
      culturalTips: "文化提示",
      culturalTipsDesc: "本地习俗、礼仪与文化要点",
      aiAssistant: "AI 助手",
      aiAssistantDesc: "用英语提问，即时获取中国旅行答案",
    },
    language: {
      switchTo: "切换到",
      current: "当前",
      english: "英语",
      chinese: "中文",
    },
    emergencyPage: {
      title: "紧急联系与帮助",
      subtitle: "在中国保障安全的重要电话、短语与工具",
      police: "报警",
      ambulance: "救护车",
      fire: "火警",
      traffic: "交通事故",
      oneTapCalls: "一键紧急拨号",
      oneTapDesc: "点击任意号码即可立即拨打。无需安装应用,任何手机均可使用。",
      phrases: "紧急翻译短语",
      phrasesDesc: "点击短语即可收听发音。此卡片支持离线使用。",
      gps: "GPS 位置共享",
      gpsDesc: "获取当前位置并与紧急救援共享,同时帮您查找附近医院、药房和派出所。",
      contacts: "紧急联系人",
      contactsDesc: "保存酒店、导游或家人联系方式,紧急情况下快速取用。",
      howToSave: "如何保存联系人",
      howToSave1: "在任意页面右下角找到红色 SOS 按钮",
      howToSave2: "点击菜单按钮打开紧急菜单",
      howToSave3: "进入「联系人」选项卡添加紧急联系人",
      nearbyHelp: "查找附近帮助",
      nearbyDesc: "使用这些提示快速找到医疗、药房和警察。",
      pageTitle: "紧急联系与短语 - ChinaConnect",
      pageDescription:
        "为中国旅行者准备的必备紧急联系与翻译短语,包括报警、救护、消防、大使馆、GPS 定位以及离线短语。",
      heroHeading: "紧急联系与帮助",
      hospitalsTitle: "医院",
      hospitalSearch: "在地图应用中搜索「医院」",
      hospitalInternational: "推荐外国人就医的国际化医院",
      hospitalCommon: "常见：北京协和医院、北京和睦家",
      pharmaciesTitle: "药店",
      pharmacyGreenCross: "认准绿色十字标志",
      pharmacyChains: "大型连锁：国大药房、老百姓、一心堂",
      pharmacyNoRx: "多数常用药品无需处方即可购买",
      policeTitle: "派出所",
      policeSearch: "搜索「派出所」查找附近警局",
      policeEnglish: "主要派出所配有英语民警",
      policeForeignAffairs: "涉外警务可协助外国人士",
      embassyTitle: "大使馆与领事馆信息",
      embassyDesc: "联系所在国大使馆办理护照补发、紧急援助、法律支持。",
      sosButtonTitle: "SOS 按钮 - 全页面随时可用",
      sosButtonDesc: "紧急 SOS 按钮位于所有页面的右下角,随时可用。",
      howToUseSOSTitle: "如何使用 SOS",
      sosItem1: "点击红色 SOS 按钮即可立即拨打 110 报警",
      sosItem2: "长按 3 秒自动拨打所在国大使馆",
      sosItem3: "一键分享您的 GPS 位置",
      sosItem4: "长按或右键打开快捷菜单",
      offlineHeading: "支持离线使用",
      offlineDesc: "出发前保存紧急号码,即使没有网络也能使用。",
      offlineAvailableTitle: "支持离线使用",
      offlineItem1: "SOS 按钮无需联网即可使用",
      offlineItem2: "翻译短语已缓存,离线可用",
      offlineItem3: "紧急号码 (110、120、119、122) 随时可用",
      offlineItem4: "下载离线地图,做好充分准备",
      safetyTipsTitle: "旅客安全提示",
      keepDocsTitle: "妥善保管证件",
      keepDocs1: "扫描护照并保留电子副本",
      keepDocs2: "将纸质副本与原件分开保管",
      keepDocs3: "将大使馆联系方式存入手机",
      keepDocs4: "记下当地紧急号码",
      preparednessTitle: "应急准备",
      preparedness1: "将紧急号码存入手机通讯录",
      preparedness2: "下载离线地图 (Google Maps)",
      preparedness3: "保持充电宝电量充足",
      preparedness4: "用中文保存酒店地址",
      communicationTitle: "沟通技巧",
      communication1: "学习基础中文短语",
      communication2: "必要时使用翻译 App",
      communication3: "下载紧急短语卡",
      communication4: "在手机备忘录中保存国籍",
      lostPassportTitle: "护照丢失怎么办?",
      inChinaTitle: "在中国境内",
      lpStep1Title: "前往报警",
      lpStep1Desc: "前往最近的派出所开具报警证明",
      lpStep2Title: "联系大使馆",
      lpStep2Desc: "致电大使馆办理紧急旅行证件",
      lpStep3Title: "前往大使馆",
      lpStep3Desc: "携带报警证明、照片和身份证领取紧急护照",
      importantTipsTitle: "重要提示",
      lpTip1: "将护照电子副本存至云端",
      lpTip2: "紧急护照通常有效期较短",
      lpTip3: "必要时大使馆可联系您的家人",
      lpTip4: "保留写有中文地址的酒店卡片",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "由先进 AI 驱动",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "你的私人中国旅行智能 — 行程规划、当地洞察、实时指引",
      startPlanningCTA: "开始规划",
      promptsTitle: "可以这样问",
      promptsSubtitle: "选一个问题，或者在下面直接输入",
      prompts: [
        {
          icon: "🏯",
          text: "规划北京 5 日游，结合宫廷历史与现代文化",
        },
        {
          icon: "🍜",
          text: "成都本地人才知道的街头美食",
        },
        {
          icon: "🚄",
          text: "从上海到西安坐高铁怎么走？",
        },
        {
          icon: "💳",
          text: "在中国能用 Apple Pay 吗？需要哪些支付 App？",
        },
        {
          icon: "🏨",
          text: "推荐西湖附近的杭州精品酒店",
        },
        {
          icon: "🤝",
          text: "和中国人谈生意时有哪些礼仪？",
        },
      ],
      authGateTitle: "登录后开始对话",
      authGateSignupTitle: "创建账户",
      authGateDescription: "AI 对话需要免费账户，以便记录你的每月用量并保存对话。",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "密码（至少 6 位）",
      signInButton: "登录",
      signUpButton: "创建账户",
      orContinueWith: "或",
      noAccountPrompt: "还没有账户？",
      haveAccountPrompt: "已经有账户？",
      switchToSignUp: "去注册",
      switchToSignIn: "去登录",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "认证失败",
      conversationsTitle: "对话",
      showSidebarTitle: "显示对话",
      hideSidebarTitle: "隐藏侧栏",
      newChatButton: "+ 新对话",
      noConversationsYet: "暂无对话",
      messageLabel: "条消息",
      messagesLabel: "条消息",
      deleteConfirm: "删除此对话？",
      deleteTitle: "删除",
    },
    accountPage: {
      loading: "正在加载你的账户...",
      signInRequired: "需要登录",
      signInRequiredDesc: "请登录后查看你的账户。",
      signIn: "登录",
    },
    profilePage: {
      title: "我的资料 - ChinaConnect",
    },
    userPage: {
      title: "用户资料 - ChinaConnect",
    },
    authPage: {
      callbackTitle: "正在登录...",
      authTitle: "登录 / 注册 - ChinaConnect",
      loginTitle: "登录 - ChinaConnect",
      signingYouIn: "正在为你登录...",
    },
    checkoutPage: {
      title: "支付成功 - ChinaConnect",
      description: "你的订阅已成功激活",
      successTitle: "支付成功！",
      successDesc: "你的订阅已激活。",
      successAccess: "你现在可以访问新方案的全部功能。",
      processingDesc: "请稍候，我们正在确认你的订阅。",
      startPlanning: "开始规划",
      viewAccount: "查看账户",
      backToPricing: "← 返回定价",
      errorTitle: "出错了",
      errorDesc: "无法处理你的支付，请重试或联系客服。",
    },
  },
  "zh-TW": {
    nav: {
      home: "首頁",
      cities: "城市",
      restaurants: "餐廳",
      aiChat: "中國指南 AI",
      guide: "旅行指南",
      business: "商務快递",
      tagline: "使用 AI 探索中國",
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
      open: "打開",
    },
    home: {
      heroTitle: "你的 AI 驅動中國指南",
      heroSubtitle: "你可靠的中國旅行同行",
      heroCTA: "君 AI 推薦行程",
      exploreCities: "探索城市",
      statsCities: "佔覆城市",
      statsRestaurants: "米其林餐廳",
      statsAttractions: "熱門景點",
      statsAI: "AI 助手",
      featuresTitle: "一站式準備你的中國之行",
      ctaTitle: "準備開始探索中國？",
      ctaSubtitle: "使用 AI 推薦快速製定行程。",
      recentlyViewed: "最近瀋訞",
      recommendedForYou: "為你推薦",
      heroDesc:
        "米其林·黑珍珠餐廳、景點、交通貼士、緊急聯絡資訊 — 由 AI 和本地人精心整理,為您提供所需的一切。",
      citiesTitle: "探索我們的城市",
      citiesSubtitle: "從古都到現代都市,透過全面的城市指南發現中國之美。",
      featuresSubtitle: "精彩旅程所需的一切",
      viewAllCities: "查看所有城市",
      chatWithAI: "與 AI 對話",
      exploreBeijing: "探索北京",
    },
    cities: {
      title: "探索我們的城市",
      subtitle: "從古都到現代都市",
      exploreGuide: "探索指南",
      attractions: "景點",
      restaurants: "餐廳",
      transport: "交通",
      hotels: "酒店",
      payment: "支付",
      culturalTips: "文化提示",
      emergency: "緊急聯繫",
      recommendedTime: "推薦時間",
      ticketPrice: "門票",
      openingHours: "開放時間",
    },
    restaurants: {
      title: "餐廳指南",
      subtitle: "米其林、黑珍珠及本地人氣推薦",
      michelin: "米其林",
      blackPearl: "黑珍珠",
      local: "本地推薦",
      avgPrice: "人均價格",
      rating: "評分",
      cuisine: "菜系",
      address: "地址",
      hours: "營業時間",
      dishes: "招牌菜",
      tags: "標籤",
    },
    empty: {
      noResults: "沒有結果",
      noRestaurants: "沒有符合條件的餐廳",
      noAttractions: "沒有景點",
      noSearchResults: "搜尋無結果",
      tryAdjusting: "請調整篩選或關鍵字",
      noFavorites: "還沒有收藏",
      addSome: "開始探索，收藏你喜欢的內容！",
    },
    errors: {
      loadFailed: "載入失敗",
      networkError: "網路錯誤，請檢查連線。",
      somethingWrong: "出現了一些問題",
      goBack: "返回",
      goHome: "返回首頁",
    },
    onboarding: {
      welcome: "歡迎來到 ChinaConnect！",
      step1Title: "發現美食",
      step1Desc: "在 12 個中國城市中找到米其林及黑珍珠餐廳。",
      step2Title: "AI 驅動推薦",
      step2Desc: "從我們的 AI 助手獲取個性化推薦及內行提示。",
      step3Title: "旅行更放心",
      step3Desc: "一站式獲取緊急聯繫、交通信息及文化提示。",
      getStarted: "開始使用",
      skip: "跳過",
      next: "下一步",
      done: "完成",
    },
    tooltips: {
      searchTip: "搜尋城市、餐廳或話題",
      filterTip: "按菜系、評分或價格篩選",
      mapTip: "在地圖上查看",
      favoritesTip: "加入收藏",
      shareTip: "分享給朋友",
    },
    recents: {
      recentlyViewed: "最近瀋訞",
      recommended: "為你推薦",
      clearHistory: "清除歷史",
      forYou: "因為你訪問了 {city}",
    },
    features: {
      restaurantGuide: "餐廳指南",
      restaurantGuideDesc: "米其林、黑珍珠及本地菜推薦詳細評識",
      attractions: "景點",
      attractionsDesc: "熱門景點、開放時間、門票與本地提示",
      transport: "交通",
      transportDesc: "怎麼去、怎麼走 - 飛機、火車、地鐵與本地提示",
      emergency: "緊急聯繫",
      emergencyDesc: "醫院、警察、大使館及重要電話",
      payment: "支付指南",
      paymentDesc: "支付寶、微信支付、現金及信用卡使用提示",
      accommodation: "住宿",
      accommodationDesc: "從豪華到經濟型酒店推薦",
      culturalTips: "文化提示",
      culturalTipsDesc: "本地習俗、禮僻與文化要點",
      aiAssistant: "AI 助手",
      aiAssistantDesc: "以英語提問，即時獲取中國旅行答案",
    },
    language: {
      switchTo: "切換到",
      current: "當前",
      english: "英語",
      chinese: "中文",
    },
    emergencyPage: {
      title: "緊急聯絡與協助",
      subtitle: "在中國保障安全的重要電話、短語與工具",
      police: "報警",
      ambulance: "救護車",
      fire: "火警",
      traffic: "交通事故",
      oneTapCalls: "一鍵緊急撥號",
      oneTapDesc: "點擊任一號碼即可立即撥打。無需安裝應用,任何手機均可使用。",
      phrases: "緊急翻譯短語",
      phrasesDesc: "點擊短語即可聆聽發音。此卡片支援離線使用。",
      gps: "GPS 位置分享",
      gpsDesc: "取得當前位置並與緊急救援分享,同時協助您查找附近醫院、藥局與派出所。",
      contacts: "緊急聯絡人",
      contactsDesc: "儲存飯店、導遊或家人聯絡方式,緊急情況下快速取用。",
      howToSave: "如何儲存聯絡人",
      howToSave1: "在任一頁面右下角找到紅色 SOS 按鈕",
      howToSave2: "點擊選單按鈕開啟緊急選單",
      howToSave3: "進入「聯絡人」分頁新增緊急聯絡人",
      nearbyHelp: "尋找附近協助",
      nearbyDesc: "使用這些提示快速找到醫療、藥局與警察。",
      pageTitle: "緊急聯絡與短語 - ChinaConnect",
      pageDescription:
        "為赴中國旅客準備的必備緊急聯絡與翻譯短語,涵蓋報警、救護、消防、領務、GPS 定位與離線緊急用語。",
      heroHeading: "緊急聯絡與協助",
      hospitalsTitle: "醫院",
      hospitalSearch: "在地圖應用中搜尋「醫院」",
      hospitalInternational: "推薦外籍人士就醫的國際醫院",
      hospitalCommon: "常見：北京協和醫院、北京和睦家",
      pharmaciesTitle: "藥局",
      pharmacyGreenCross: "認明綠色十字標誌",
      pharmacyChains: "大型連鎖：國大藥局、老百姓、一心堂",
      pharmacyNoRx: "多數常備藥品無需處方即可購買",
      policeTitle: "派出所",
      policeSearch: "搜尋「派出所」查找附近警局",
      policeEnglish: "主要派出所備有英語民警",
      policeForeignAffairs: "涉外警務可協助外籍人士",
      embassyTitle: "大使館與領事館資訊",
      embassyDesc: "聯繫駐華大使館辦理護照補發、緊急援助與法律協助。",
      sosButtonTitle: "SOS 按鈕 - 全頁面隨時可用",
      sosButtonDesc: "緊急 SOS 按鈕位於所有頁面的右下角,隨時可用。",
      howToUseSOSTitle: "如何使用 SOS",
      sosItem1: "點擊紅色 SOS 按鈕即可立即撥打 110 報警",
      sosItem2: "長按 3 秒自動撥打駐華大使館",
      sosItem3: "一鍵分享您的 GPS 位置",
      sosItem4: "長按或右鍵開啟快速選單",
      offlineHeading: "支援離線使用",
      offlineDesc: "出發前儲存緊急號碼,即使沒有網路也能使用。",
      offlineAvailableTitle: "支援離線使用",
      offlineItem1: "SOS 按鈕無需網路即可使用",
      offlineItem2: "翻譯短語已快取,離線可用",
      offlineItem3: "緊急號碼 (110、120、119、122) 隨時可用",
      offlineItem4: "下載離線地圖,做好充分準備",
      safetyTipsTitle: "旅客安全提示",
      keepDocsTitle: "妥善保管證件",
      keepDocs1: "掃描護照並保留電子副本",
      keepDocs2: "將紙本副本與正本分開保管",
      keepDocs3: "將大使館聯絡方式存入手機",
      keepDocs4: "記下當地緊急號碼",
      preparednessTitle: "應急準備",
      preparedness1: "將緊急號碼存入手機通訊錄",
      preparedness2: "下載離線地圖 (Google Maps)",
      preparedness3: "保持行動電源電量充足",
      preparedness4: "用中文保存飯店地址",
      communicationTitle: "溝通技巧",
      communication1: "學習基礎中文短語",
      communication2: "必要時使用翻譯 App",
      communication3: "下載緊急短語卡",
      communication4: "在手機備忘錄中保存國籍",
      lostPassportTitle: "護照遺失怎麼辦?",
      inChinaTitle: "在中國境內",
      lpStep1Title: "前往報案",
      lpStep1Desc: "前往最近的派出所開立報案證明",
      lpStep2Title: "聯絡大使館",
      lpStep2Desc: "致電大使館辦理緊急旅行證件",
      lpStep3Title: "前往大使館",
      lpStep3Desc: "攜帶報案證明、相片和身分證領取緊急護照",
      importantTipsTitle: "重要提示",
      lpTip1: "將護照電子副本存至雲端",
      lpTip2: "緊急護照通常效期較短",
      lpTip3: "必要時大使館可聯絡您的家人",
      lpTip4: "保留寫有中文地址的飯店卡片",
    },
    aiPage: {
      title: "ChinaGuide AI",
      description: "Your personal China travel intelligence.",
      heroBadge: "由先進 AI 驅動",
      heroTitle: "ChinaGuide AI",
      heroSubtitle: "你的私人中國旅行智慧 — 行程規劃、當地洞察、即時指引",
      startPlanningCTA: "開始規劃",
      promptsTitle: "可以這樣問",
      promptsSubtitle: "選一個問題，或在下方直接輸入",
      prompts: [
        {
          icon: "🏯",
          text: "規劃北京 5 日遊，融合宮廷歷史與現代文化",
        },
        {
          icon: "🍜",
          text: "成都本地人才知道的街頭小吃",
        },
        {
          icon: "🚄",
          text: "從上海搭高鐵到西安怎麼走？",
        },
        {
          icon: "💳",
          text: "在中國能用 Apple Pay 嗎？需要哪些支付 App？",
        },
        {
          icon: "🏨",
          text: "推薦西湖附近的杭州精品飯店",
        },
        {
          icon: "🤝",
          text: "與中國合作夥伴見面的商務禮儀",
        },
      ],
      authGateTitle: "登入後開始對話",
      authGateSignupTitle: "建立帳戶",
      authGateDescription: "AI 對話需要免費帳戶，以便記錄你的每月用量並保存對話。",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "密碼（至少 6 字元）",
      signInButton: "登入",
      signUpButton: "建立帳戶",
      orContinueWith: "或",
      noAccountPrompt: "還沒有帳戶？",
      haveAccountPrompt: "已經有帳戶？",
      switchToSignUp: "建立",
      switchToSignIn: "登入",
      googleButton: "Google",
      githubButton: "GitHub",
      authFailed: "驗證失敗",
      conversationsTitle: "對話",
      showSidebarTitle: "顯示對話",
      hideSidebarTitle: "隱藏側邊欄",
      newChatButton: "+ 新對話",
      noConversationsYet: "暫無對話",
      messageLabel: "則訊息",
      messagesLabel: "則訊息",
      deleteConfirm: "刪除此對話？",
      deleteTitle: "刪除",
    },
    accountPage: {
      loading: "正在載入你的帳戶...",
      signInRequired: "需要登入",
      signInRequiredDesc: "請登入後查看你的帳戶。",
      signIn: "登入",
    },
    profilePage: {
      title: "我的資料 - ChinaConnect",
    },
    userPage: {
      title: "使用者資料 - ChinaConnect",
    },
    authPage: {
      callbackTitle: "正在登入...",
      authTitle: "登入 / 註冊 - ChinaConnect",
      loginTitle: "登入 - ChinaConnect",
      signingYouIn: "正在為你登入...",
    },
    checkoutPage: {
      title: "付款成功 - ChinaConnect",
      description: "你的訂閱已成功啟用",
      successTitle: "付款成功！",
      successDesc: "你的訂閱已啟用。",
      successAccess: "你現在可以存取新方案的全部功能。",
      processingDesc: "請稍候，我們正在確認你的訂閱。",
      startPlanning: "開始規劃",
      viewAccount: "查看帳戶",
      backToPricing: "← 返回定價",
      errorTitle: "發生錯誤",
      errorDesc: "無法處理你的付款，請重試或聯絡客服。",
    },
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
