/**
 * Subscription Tier Definitions
 * Defines limits and pricing for each subscription tier
 */

export type SubscriptionTier = "free" | "explorer" | "traveler" | "business";

export type AccountLang =
  | "en"
  | "ja"
  | "ko"
  | "zh-CN"
  | "zh-TW"
  | "th"
  | "vi"
  | "ru"
  | "fr"
  | "de"
  | "ar"
  | "fa";

export interface SubscriptionLimits {
  aiRequestsPerMonth: number; // -1 means unlimited
  saveItineraries: boolean;
  exportPDF: boolean;
  premiumCustomization: boolean;
  businessTemplates: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    aiRequestsPerMonth: 5,
    saveItineraries: false,
    exportPDF: false,
    premiumCustomization: false,
    businessTemplates: false,
  },
  explorer: {
    aiRequestsPerMonth: 20,
    saveItineraries: true,
    exportPDF: false,
    premiumCustomization: false,
    businessTemplates: false,
  },
  traveler: {
    aiRequestsPerMonth: 40,
    saveItineraries: true,
    exportPDF: true,
    premiumCustomization: true,
    businessTemplates: false,
  },
  business: {
    aiRequestsPerMonth: -1, // unlimited
    saveItineraries: true,
    exportPDF: true,
    premiumCustomization: true,
    businessTemplates: true,
  },
};

export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  explorer: { monthly: 4.99, annual: 47.99 },
  traveler: { monthly: 9.99, annual: 95.99 },
  business: { monthly: 29.99, annual: 287.99 },
};

export const TIER_NAMES: Record<SubscriptionTier, Record<AccountLang, string>> = {
  free: {
    en: "Free",
    ja: "無料",
    ko: "무료",
    "zh-CN": "免费版",
    "zh-TW": "免費版",
    th: "ฟรี",
    vi: "Miễn phí",
    ru: "Бесплатный",
    fr: "Gratuit",
    de: "Kostenlos",
    ar: "مجاني",
    fa: "رایگان",
  },
  explorer: {
    en: "Explorer",
    ja: "エクスプローラー",
    ko: "익스플로러",
    "zh-CN": "探索版",
    "zh-TW": "探索版",
    th: "นักสำรวจ",
    vi: "Nhà thám hiểm",
    ru: "Исследователь",
    fr: "Explorateur",
    de: "Entdecker",
    ar: "مستكشف",
    fa: "کاشف",
  },
  traveler: {
    en: "Traveler",
    ja: "トラベラー",
    ko: "트래블러",
    "zh-CN": "旅行版",
    "zh-TW": "旅行版",
    th: "นักเดินทาง",
    vi: "Du khách",
    ru: "Путешественник",
    fr: "Voyageur",
    de: "Reisender",
    ar: "مسافر",
    fa: "مسافر",
  },
  business: {
    en: "Business",
    ja: "ビジネス",
    ko: "비즈니스",
    "zh-CN": "商务版",
    "zh-TW": "商務版",
    th: "ธุรกิจ",
    vi: "Doanh nghiệp",
    ru: "Бизнес",
    fr: "Business",
    de: "Business",
    ar: "أعمال",
    fa: "تجاری",
  },
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, Record<AccountLang, string>> = {
  free: {
    en: "Get started with basic AI travel planning",
    ja: "基本的なAI旅行プランニングから始めましょう",
    ko: "기본 AI 여행 계획으로 시작하세요",
    "zh-CN": "开始体验基础AI旅行规划",
    "zh-TW": "開始體驗基礎AI旅行規劃",
    th: "เริ่มต้นด้วยการวางแผนท่องเที่ยวด้วย AI พื้นฐาน",
    vi: "Bắt đầu với lập kế hoạch du lịch AI cơ bản",
    ru: "Начните с базового AI-планирования",
    fr: "Commencez avec la planification IA de base",
    de: "Starten Sie mit grundlegender KI-Reiseplanung",
    ar: "ابدأ بتخطيط سفر أساسي بالذكاء الاصطناعي",
    fa: "با برنامه‌ریزی پایه سفر با هوش مصنوعی شروع کنید",
  },
  explorer: {
    en: "More requests and save your itineraries",
    ja: "より多くのリクエストと旅程の保存",
    ko: "더 많은 요청과 일정 저장",
    "zh-CN": "更多请求次数并保存行程",
    "zh-TW": "更多請求次數並保存行程",
    th: "คำขอเพิ่มขึ้นและบันทึกแผนการเดินทาง",
    vi: "Nhiều yêu cầu hơn và lưu hành trình",
    ru: "Больше запросов и сохранение маршрутов",
    fr: "Plus de requêtes et enregistrez vos itinéraires",
    de: "Mehr Anfragen und Reisepläne speichern",
    ar: "مزيد من الطلبات واحفظ مساراتك",
    fa: "درخواست‌های بیشتر و ذخیره برنامه سفر",
  },
  traveler: {
    en: "40 AI requests with premium features",
    ja: "プレミアム機能付き月40回のAIリクエスト",
    ko: "프리미엄 기능 포함 월 40회 AI 요청",
    "zh-CN": "每月40次AI请求及高级功能",
    "zh-TW": "每月40次AI請求及進階功能",
    th: "คำขอ AI 40 ครั้งพร้อมฟีเจอร์พรีเมียม",
    vi: "40 yêu cầu AI với tính năng cao cấp",
    ru: "40 AI-запросов с премиум-функциями",
    fr: "40 requêtes IA avec fonctions premium",
    de: "40 KI-Anfragen mit Premium-Funktionen",
    ar: "40 طلب ذكاء اصطناعي مع ميزات متميزة",
    fa: "۴۰ درخواست هوش مصنوعی با امکانات ویژه",
  },
  business: {
    en: "Full access for travel professionals",
    ja: "旅行プロフェッショナル向けフルアクセス",
    ko: "여행 전문가를 위한 전체 액세스",
    "zh-CN": "旅行专业人士的完整功能",
    "zh-TW": "旅遊專業人士的完整功能",
    th: "เข้าถึงเต็มรูปแบบสำหรับมืออาชีพด้านการเดินทาง",
    vi: "Toàn quyền truy cập cho chuyên gia du lịch",
    ru: "Полный доступ для профессионалов",
    fr: "Accès complet pour les professionnels",
    de: "Voller Zugriff für Reiseprofis",
    ar: "وصول كامل لمحترفي السفر",
    fa: "دسترسی کامل برای حرفه‌ای‌های سفر",
  },
};

export const TIER_FEATURES: Record<SubscriptionTier, Record<AccountLang, string[]>> = {
  free: {
    en: ["5 AI requests per month", "Basic travel planning", "View itineraries"],
    ja: ["月5回のAIリクエスト", "基本的な旅行プランニング", "旅程の閲覧"],
    ko: ["월 5회 AI 요청", "기본 여행 계획", "일정 보기"],
    "zh-CN": ["每月5次AI请求", "基础旅行规划", "查看行程"],
    "zh-TW": ["每月5次AI請求", "基礎旅行規劃", "查看行程"],
    th: ["คำขอ AI 5 ครั้งต่อเดือน", "การวางแผนท่องเที่ยวพื้นฐาน", "ดูแผนการเดินทาง"],
    vi: ["5 yêu cầu AI mỗi tháng", "Lập kế hoạch du lịch cơ bản", "Xem hành trình"],
    ru: ["5 AI-запросов в месяц", "Базовое планирование", "Просмотр маршрутов"],
    fr: ["5 requêtes IA par mois", "Planification de base", "Voir les itinéraires"],
    de: ["5 KI-Anfragen pro Monat", "Grundlegende Reiseplanung", "Reisepläne ansehen"],
    ar: ["5 طلبات ذكاء اصطناعي شهريًا", "تخطيط سفر أساسي", "عرض المسارات"],
    fa: ["۵ درخواست هوش مصنوعی در ماه", "برنامه‌ریزی پایه سفر", "مشاهده برنامه‌های سفر"],
  },
  explorer: {
    en: [
      "20 AI requests per month",
      "Save itineraries",
      "Conversation history",
      "Priority support",
    ],
    ja: ["月20回のAIリクエスト", "旅程を保存", "会話履歴", "優先サポート"],
    ko: ["월 20회 AI 요청", "일정 저장", "대화 기록", "우선 지원"],
    "zh-CN": ["每月20次AI请求", "保存行程", "对话历史", "优先支持"],
    "zh-TW": ["每月20次AI請求", "保存行程", "對話歷史", "優先支援"],
    th: ["คำขอ AI 20 ครั้งต่อเดือน", "บันทึกแผนการเดินทาง", "ประวัติการสนทนา", "การสนับสนุนลำดับแรก"],
    vi: ["20 yêu cầu AI mỗi tháng", "Lưu hành trình", "Lịch sử hội thoại", "Hỗ trợ ưu tiên"],
    ru: [
      "20 AI-запросов в месяц",
      "Сохранение маршрутов",
      "История диалогов",
      "Приоритетная поддержка",
    ],
    fr: [
      "20 requêtes IA par mois",
      "Enregistrer les itinéraires",
      "Historique des conversations",
      "Support prioritaire",
    ],
    de: [
      "20 KI-Anfragen pro Monat",
      "Reisepläne speichern",
      "Konversationsverlauf",
      "Prioritäts-Support",
    ],
    ar: ["20 طلب ذكاء اصطناعي شهريًا", "حفظ مسارات الرحلة", "سجل المحادثات", "دعم ذو أولوية"],
    fa: [
      "۲۰ درخواست هوش مصنوعی در ماه",
      "ذخیره برنامه سفر",
      "تاریخچه گفتگوها",
      "پشتیبانی اولویت‌دار",
    ],
  },
  traveler: {
    en: [
      "40 AI requests per month",
      "Save & export itineraries",
      "PDF export",
      "Premium customization",
      "Advanced travel tools",
    ],
    ja: [
      "月40回のAIリクエスト",
      "旅程の保存と書き出し",
      "PDF書き出し",
      "プレミアムカスタマイズ",
      "高度な旅行ツール",
    ],
    ko: [
      "월 40회 AI 요청",
      "일정 저장 및 내보내기",
      "PDF 내보내기",
      "프리미엄 맞춤 설정",
      "고급 여행 도구",
    ],
    "zh-CN": ["每月40次AI请求", "保存和导出行程", "PDF导出", "高级自定义", "高级旅行工具"],
    "zh-TW": ["每月40次AI請求", "保存和匯出行程", "PDF匯出", "進階自訂", "進階旅行工具"],
    th: [
      "คำขอ AI 40 ครั้งต่อเดือน",
      "บันทึกและส่งออกแผนการเดินทาง",
      "ส่งออก PDF",
      "ปรับแต่งพรีเมียม",
      "เครื่องมือท่องเที่ยวขั้นสูง",
    ],
    vi: [
      "40 yêu cầu AI mỗi tháng",
      "Lưu và xuất hành trình",
      "Xuất PDF",
      "Tùy chỉnh cao cấp",
      "Công cụ du lịch nâng cao",
    ],
    ru: [
      "40 AI-запросов в месяц",
      "Сохранение и экспорт маршрутов",
      "Экспорт PDF",
      "Премиум-настройка",
      "Продвинутые инструменты",
    ],
    fr: [
      "40 requêtes IA par mois",
      "Enregistrer et exporter les itinéraires",
      "Export PDF",
      "Personnalisation premium",
      "Outils de voyage avancés",
    ],
    de: [
      "40 KI-Anfragen pro Monat",
      "Reisepläne speichern und exportieren",
      "PDF-Export",
      "Premium-Anpassung",
      "Erweiterte Reisetools",
    ],
    ar: [
      "40 طلب ذكاء اصطناعي شهريًا",
      "حفظ وتصدير المسارات",
      "تصدير PDF",
      "تخصيص متميز",
      "أدوات سفر متقدمة",
    ],
    fa: [
      "۴۰ درخواست هوش مصنوعی در ماه",
      "ذخیره و خروجی برنامه سفر",
      "خروجی PDF",
      "شخصی‌سازی پیشرفته",
      "ابزارهای پیشرفته سفر",
    ],
  },
  business: {
    en: [
      "Unlimited AI requests",
      "All Traveler features",
      "Business templates",
      "Team collaboration",
      "API access",
      "Dedicated support",
    ],
    ja: [
      "AIリクエスト無制限",
      "トラベラー全機能",
      "ビジネステンプレート",
      "チームコラボレーション",
      "APIアクセス",
      "専任サポート",
    ],
    ko: [
      "무제한 AI 요청",
      "트래블러 모든 기능",
      "비즈니스 템플릿",
      "팀 협업",
      "API 액세스",
      "전담 지원",
    ],
    "zh-CN": ["无限AI请求", "所有旅行版功能", "商务模板", "团队协作", "API访问", "专属支持"],
    "zh-TW": ["無限AI請求", "所有旅行版功能", "商務範本", "團隊協作", "API存取", "專屬支援"],
    th: [
      "คำขอ AI ไม่จำกัด",
      "ฟีเจอร์ทั้งหมดของ Traveler",
      "เทมเพลตธุรกิจ",
      "ทำงานร่วมกันเป็นทีม",
      "เข้าถึง API",
      "การสนับสนุนเฉพาะ",
    ],
    vi: [
      "Yêu cầu AI không giới hạn",
      "Tất cả tính năng Du khách",
      "Mẫu doanh nghiệp",
      "Cộng tác nhóm",
      "Truy cập API",
      "Hỗ trợ riêng",
    ],
    ru: [
      "Безлимитные AI-запросы",
      "Все функции Traveler",
      "Бизнес-шаблоны",
      "Командная работа",
      "Доступ к API",
      "Персональная поддержка",
    ],
    fr: [
      "Requêtes IA illimitées",
      "Toutes les fonctions Voyageur",
      "Modèles professionnels",
      "Collaboration d'équipe",
      "Accès API",
      "Support dédié",
    ],
    de: [
      "Unbegrenzte KI-Anfragen",
      "Alle Traveler-Funktionen",
      "Geschäftsvorlagen",
      "Team-Zusammenarbeit",
      "API-Zugriff",
      "Dedizierter Support",
    ],
    ar: [
      "طلبات ذكاء اصطناعي غير محدودة",
      "جميع ميزات المسافر",
      "قوالب الأعمال",
      "تعاون الفريق",
      "الوصول إلى API",
      "دعم مخصص",
    ],
    fa: [
      "درخواست‌های نامحدود هوش مصنوعی",
      "تمام امکانات پلن مسافر",
      "قالب‌های تجاری",
      "همکاری تیمی",
      "دسترسی API",
      "پشتیبانی اختصاصی",
    ],
  },
};

/**
 * Get the current subscription tier from localStorage
 */
export function getCurrentTier(): SubscriptionTier {
  if (typeof window === "undefined") return "free";
  const tier = localStorage.getItem("subscription_tier") as SubscriptionTier;
  return tier && tier in TIER_LIMITS ? tier : "free";
}

/**
 * Set the current subscription tier in localStorage
 */
export function setCurrentTier(tier: SubscriptionTier): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("subscription_tier", tier);
}

/**
 * Get limits for the current tier
 */
export function getCurrentLimits(): SubscriptionLimits {
  return TIER_LIMITS[getCurrentTier()];
}
