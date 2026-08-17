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
    ja: "\\u7121\\u6599",
    ko: "\\ubb34\\ub8cc",
    "zh-CN": "\\u514d\\u8d39\\u7248",
    "zh-TW": "\\u514d\\u8cbb\\u7248",
    th: "\\u0e1f\\u0e23\\u0e35",
    vi: "Mi\\u1ec5n ph\\u00ed",
    ru: "\\u0411\\u0435\\u0441\\u043f\\u043b\\u0430\\u0442\\u043d\\u044b\\u0439",
    fr: "Gratuit",
    de: "Kostenlos",
    ar: "\\u0645\\u062c\\u0627\\u0646\\u064a",
    fa: "\\u0631\\u0627\\u06cc\\u06af\\u0627\\u0646",
  },
  explorer: {
    en: "Explorer",
    ja: "\\u30a8\\u30af\\u30b9\\u30d7\\u30ed\\u30fc\\u30e9\\u30fc",
    ko: "\\uc775\\uc2a4\\ud50c\\ub85c\\ub7ec",
    "zh-CN": "\\u63a2\\u7d22\\u7248",
    "zh-TW": "\\u63a2\\u7d22\\u7248",
    th: "\\u0e19\\u0e31\\u0e01\\u0e2a\\u0e33\\u0e23\\u0e27\\u0e08",
    vi: "Nh\\u00e0 th\\u00e1m hi\\u1ec3m",
    ru: "\\u0418\\u0441\\u0441\\u043b\\u0435\\u0434\\u043e\\u0432\\u0430\\u0442\\u0435\\u043b\\u044c",
    fr: "Explorateur",
    de: "Entdecker",
    ar: "\\u0645\\u0633\\u062a\\u0643\\u0634\\u0641",
    fa: "\\u06a9\\u0627\\u0634\\u0641",
  },
  traveler: {
    en: "Traveler",
    ja: "\\u30c8\\u30e9\\u30d9\\u30e9\\u30fc",
    ko: "\\ud2b8\\ub798\\ube14\\ub7ec",
    "zh-CN": "\\u65c5\\u884c\\u7248",
    "zh-TW": "\\u65c5\\u884c\\u7248",
    th: "\\u0e19\\u0e31\\u0e01\\u0e40\\u0e14\\u0e34\\u0e19\\u0e17\\u0e32\\u0e07",
    vi: "Du kh\\u00e1ch",
    ru: "\\u041f\\u0443\\u0442\\u0435\\u0448\\u0435\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u0438\\u043a",
    fr: "Voyageur",
    de: "Reisender",
    ar: "\\u0645\\u0633\\u0627\\u0641\\u0631",
    fa: "\\u0645\\u0633\\u0627\\u0641\\u0631",
  },
  business: {
    en: "Business",
    ja: "\\u30d3\\u30b8\\u30cd\\u30b9",
    ko: "\\ube44\\uc988\\ub2c8\\uc2a4",
    "zh-CN": "\\u5546\\u52a1\\u7248",
    "zh-TW": "\\u5546\\u52d9\\u7248",
    th: "\\u0e18\\u0e38\\u0e23\\u0e01\\u0e34\\u0e08",
    vi: "Doanh nghi\\u1ec7p",
    ru: "\\u0411\\u0438\\u0437\\u043d\\u0435\\u0441",
    fr: "Business",
    de: "Business",
    ar: "\\u0623\\u0639\\u0645\\u0627\\u0644",
    fa: "\\u062a\\u062c\\u0627\\u0631\\u06cc",
  },
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, Record<AccountLang, string>> = {
  free: {
    en: "Get started with basic AI travel planning",
    ja: "\\u57fa\\u672c\\u7684\\u306aAI\\u65c5\\u884c\\u30d7\\u30e9\\u30f3\\u30cb\\u30f3\\u30b0\\u304b\\u3089\\u59cb\\u3081\\u307e\\u3057\\u3087\\u3046",
    ko: "\\uae30\\ubcf8 AI \\uc5ec\\ud589 \\uacc4\\ud68d\\uc73c\\ub85c \\uc2dc\\uc791\\ud558\\uc138\\uc694",
    "zh-CN": "\\u5f00\\u59cb\\u4f53\\u9a8c\\u57fa\\u7840AI\\u65c5\\u884c\\u89c4\\u5212",
    "zh-TW": "\\u958b\\u59cb\\u9ad4\\u9a57\\u57fa\\u790eAI\\u65c5\\u884c\\u898f\\u5283",
    th: "\\u0e40\\u0e23\\u0e34\\u0e48\\u0e21\\u0e15\\u0e49\\u0e19\\u0e14\\u0e49\\u0e27\\u0e22\\u0e01\\u0e32\\u0e23\\u0e27\\u0e32\\u0e07\\u0e41\\u0e1c\\u0e19\\u0e17\\u0e48\\u0e2d\\u0e07\\u0e40\\u0e17\\u0e35\\u0e48\\u0e22\\u0e27\\u0e14\\u0e49\\u0e27\\u0e22 AI \\u0e1e\\u0e37\\u0e49\\u0e19\\u0e10\\u0e32\\u0e19",
    vi: "B\\u1eaft \\u0111\\u1ea7u v\\u1edbi l\\u1eadp k\\u1ebf ho\\u1ea1ch du l\\u1ecbch AI c\\u01a1 b\\u1ea3n",
    ru: "\\u041d\\u0430\\u0447\\u043d\\u0438\\u0442\\u0435 \\u0441 \\u0431\\u0430\\u0437\\u043e\\u0432\\u043e\\u0433\\u043e AI-\\u043f\\u043b\\u0430\\u043d\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u0438\\u044f",
    fr: "Commencez avec la planification IA de base",
    de: "Starten Sie mit grundlegender KI-Reiseplanung",
    ar: "\\u0627\\u0628\\u062f\\u0623 \\u0628\\u062a\\u062e\\u0637\\u064a\\u0637 \\u0633\\u0641\\u0631 \\u0623\\u0633\\u0627\\u0633\\u064a \\u0628\\u0627\\u0644\\u0630\\u0643\\u0627\\u0621 \\u0627\\u0644\\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a",
    fa: "\\u0628\\u0627 \\u0628\\u0631\\u0646\\u0627\\u0645\\u0647\\u200c\\u0631\\u06cc\\u0632\\u06cc \\u067e\\u0627\\u06cc\\u0647 \\u0633\\u0641\\u0631 \\u0628\\u0627 \\u0647\\u0648\\u0634 \\u0645\\u0635\\u0646\\u0648\\u0639\\u06cc \\u0634\\u0631\\u0648\\u0639 \\u06a9\\u0646\\u06cc\\u062f",
  },
  explorer: {
    en: "More requests and save your itineraries",
    ja: "\\u3088\\u308a\\u591a\\u304f\\u306e\\u30ea\\u30af\\u30a8\\u30b9\\u30c8\\u3068\\u65c5\\u7a0b\\u306e\\u4fdd\\u5b58",
    ko: "\\ub354 \\ub9ce\\uc740 \\uc694\\uccad\\uacfc \\uc77c\\uc815 \\uc800\\uc7a5",
    "zh-CN": "\\u66f4\\u591a\\u8bf7\\u6c42\\u6b21\\u6570\\u5e76\\u4fdd\\u5b58\\u884c\\u7a0b",
    "zh-TW": "\\u66f4\\u591a\\u8acb\\u6c42\\u6b21\\u6578\\u4e26\\u4fdd\\u5b58\\u884c\\u7a0b",
    th: "\\u0e04\\u0e33\\u0e02\\u0e2d\\u0e40\\u0e1e\\u0e34\\u0e48\\u0e21\\u0e02\\u0e36\\u0e49\\u0e19\\u0e41\\u0e25\\u0e30\\u0e1a\\u0e31\\u0e19\\u0e17\\u0e36\\u0e01\\u0e41\\u0e1c\\u0e19\\u0e01\\u0e32\\u0e23\\u0e40\\u0e14\\u0e34\\u0e19\\u0e17\\u0e32\\u0e07",
    vi: "Nhi\\u1ec1u y\\u00eau c\\u1ea7u h\\u01a1n v\\u00e0 l\\u01b0u h\\u00e0nh tr\\u00ecnh",
    ru: "\\u0411\\u043e\\u043b\\u044c\\u0448\\u0435 \\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0438 \\u0441\\u043e\\u0445\\u0440\\u0430\\u043d\\u0435\\u043d\\u0438\\u0435 \\u043c\\u0430\\u0440\\u0448\\u0440\\u0443\\u0442\\u043e\\u0432",
    fr: "Plus de requ\\u00eates et enregistrez vos itin\\u00e9raires",
    de: "Mehr Anfragen und Reisepl\\u00e4ne speichern",
    ar: "\\u0645\\u0632\\u064a\\u062f \\u0645\\u0646 \\u0627\\u0644\\u0637\\u0644\\u0628\\u0627\\u062a \\u0648\\u0627\\u062d\\u0641\\u0638 \\u0645\\u0633\\u0627\\u0631\\u0627\\u062a\\u0643",
    fa: "\\u062f\\u0631\\u062e\\u0648\\u0627\\u0633\\u062a\\u200c\\u0647\\u0627\\u06cc \\u0628\\u06cc\\u0634\\u062a\\u0631 \\u0648 \\u0630\\u062e\\u06cc\\u0631\\u0647 \\u0628\\u0631\\u0646\\u0627\\u0645\\u0647 \\u0633\\u0641\\u0631",
  },
  traveler: {
    en: "40 AI requests with premium features",
    ja: "\\u30d7\\u30ec\\u30df\\u30a2\\u30e0\\u6a5f\\u80fd\\u4ed8\\u304d\\u670840\\u56de\\u306eAI\\u30ea\\u30af\\u30a8\\u30b9\\u30c8",
    ko: "\\ud504\\ub9ac\\ubbf8\\uc5c4 \\uae30\\ub2a5 \\ud3ec\\ud568 \\uc6d4 40\\ud68c AI \\uc694\\uccad",
    "zh-CN": "\\u6bcf\\u670840\\u6b21AI\\u8bf7\\u6c42\\u53ca\\u9ad8\\u7ea7\\u529f\\u80fd",
    "zh-TW": "\\u6bcf\\u670840\\u6b21AI\\u8acb\\u6c42\\u53ca\\u9032\\u968e\\u529f\\u80fd",
    th: "\\u0e04\\u0e33\\u0e02\\u0e2d AI 40 \\u0e04\\u0e23\\u0e31\\u0e49\\u0e07\\u0e1e\\u0e23\\u0e49\\u0e2d\\u0e21\\u0e1f\\u0e35\\u0e40\\u0e08\\u0e2d\\u0e23\\u0e4c\\u0e1e\\u0e23\\u0e35\\u0e40\\u0e21\\u0e35\\u0e22\\u0e21",
    vi: "40 y\\u00eau c\\u1ea7u AI v\\u1edbi t\\u00ednh n\\u0103ng cao c\\u1ea5p",
    ru: "40 AI-\\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0441 \\u043f\\u0440\\u0435\\u043c\\u0438\\u0443\\u043c-\\u0444\\u0443\\u043d\\u043a\\u0446\\u0438\\u044f\\u043c\\u0438",
    fr: "40 requ\\u00eates IA avec fonctions premium",
    de: "40 KI-Anfragen mit Premium-Funktionen",
    ar: "40 \\u0637\\u0644\\u0628 \\u0630\\u0643\\u0627\\u0621 \\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a \\u0645\\u0639 \\u0645\\u064a\\u0632\\u0627\\u062a \\u0645\\u062a\\u0645\\u064a\\u0632\\u0629",
    fa: "\\u06f4\\u06f0 \\u062f\\u0631\\u062e\\u0648\\u0627\\u0633\\u062a \\u0647\\u0648\\u0634 \\u0645\\u0635\\u0646\\u0648\\u0639\\u06cc \\u0628\\u0627 \\u0627\\u0645\\u06a9\\u0627\\u0646\\u0627\\u062a \\u0648\\u06cc\\u0698\\u0647",
  },
  business: {
    en: "Full access for travel professionals",
    ja: "\\u65c5\\u884c\\u30d7\\u30ed\\u30d5\\u30a7\\u30c3\\u30b7\\u30e7\\u30ca\\u30eb\\u5411\\u3051\\u30d5\\u30eb\\u30a2\\u30af\\u30bb\\u30b9",
    ko: "\\uc5ec\\ud589 \\uc804\\ubb38\\uac00\\ub97c \\uc704\\ud55c \\uc804\\uccb4 \\uc561\\uc138\\uc2a4",
    "zh-CN": "\\u65c5\\u884c\\u4e13\\u4e1a\\u4eba\\u58eb\\u7684\\u5b8c\\u6574\\u529f\\u80fd",
    "zh-TW": "\\u65c5\\u904a\\u5c08\\u696d\\u4eba\\u58eb\\u7684\\u5b8c\\u6574\\u529f\\u80fd",
    th: "\\u0e40\\u0e02\\u0e49\\u0e32\\u0e16\\u0e36\\u0e07\\u0e40\\u0e15\\u0e47\\u0e21\\u0e23\\u0e39\\u0e1b\\u0e41\\u0e1a\\u0e1a\\u0e2a\\u0e33\\u0e2b\\u0e23\\u0e31\\u0e1a\\u0e21\\u0e37\\u0e2d\\u0e2d\\u0e32\\u0e0a\\u0e35\\u0e1e\\u0e14\\u0e49\\u0e32\\u0e19\\u0e01\\u0e32\\u0e23\\u0e40\\u0e14\\u0e34\\u0e19\\u0e17\\u0e32\\u0e07",
    vi: "To\\u00e0n quy\\u1ec1n truy c\\u1eadp cho chuy\\u00ean gia du l\\u1ecbch",
    ru: "\\u041f\\u043e\\u043b\\u043d\\u044b\\u0439 \\u0434\\u043e\\u0441\\u0442\\u0443\\u043f \\u0434\\u043b\\u044f \\u043f\\u0440\\u043e\\u0444\\u0435\\u0441\\u0441\\u0438\\u043e\\u043d\\u0430\\u043b\\u043e\\u0432",
    fr: "Acc\\u00e8s complet pour les professionnels",
    de: "Voller Zugriff f\\u00fcr Reiseprofis",
    ar: "\\u0648\\u0635\\u0648\\u0644 \\u0643\\u0627\\u0645\\u0644 \\u0644\\u0645\\u062d\\u062a\\u0631\\u0641\\u064a \\u0627\\u0644\\u0633\\u0641\\u0631",
    fa: "\\u062f\\u0633\\u062a\\u0631\\u0633\\u06cc \\u06a9\\u0627\\u0645\\u0644 \\u0628\\u0631\\u0627\\u06cc \\u062d\\u0631\\u0641\\u0647\\u200c\\u0627\\u06cc\\u200c\\u0647\\u0627\\u06cc \\u0633\\u0641\\u0631",
  },
};

export const TIER_FEATURES: Record<SubscriptionTier, Record<AccountLang, string[]>> = {
  free: {
    en: ["5 AI requests per month", "Basic travel planning", "View itineraries"],
    ja: [
      "\\u67085\\u56de\\u306eAI\\u30ea\\u30af\\u30a8\\u30b9\\u30c8",
      "\\u57fa\\u672c\\u7684\\u306a\\u65c5\\u884c\\u30d7\\u30e9\\u30f3\\u30cb\\u30f3\\u30b0",
      "\\u65c5\\u7a0b\\u306e\\u95b2\\u89a7",
    ],
    ko: [
      "\\uc6d4 5\\ud68c AI \\uc694\\uccad",
      "\\uae30\\ubcf8 \\uc5ec\\ud589 \\uacc4\\ud68d",
      "\\uc77c\\uc815 \\ubcf4\\uae30",
    ],
    "zh-CN": [
      "\\u6bcf\\u67085\\u6b21AI\\u8bf7\\u6c42",
      "\\u57fa\\u7840\\u65c5\\u884c\\u89c4\\u5212",
      "\\u67e5\\u770b\\u884c\\u7a0b",
    ],
    "zh-TW": [
      "\\u6bcf\\u67085\\u6b21AI\\u8acb\\u6c42",
      "\\u57fa\\u790e\\u65c5\\u884c\\u898f\\u5283",
      "\\u67e5\\u770b\\u884c\\u7a0b",
    ],
    th: [
      "\\u0e04\\u0e33\\u0e02\\u0e2d AI 5 \\u0e04\\u0e23\\u0e31\\u0e49\\u0e07\\u0e15\\u0e48\\u0e2d\\u0e40\\u0e14\\u0e37\\u0e2d\\u0e19",
      "\\u0e01\\u0e32\\u0e23\\u0e27\\u0e32\\u0e07\\u0e41\\u0e1c\\u0e19\\u0e17\\u0e48\\u0e2d\\u0e07\\u0e40\\u0e17\\u0e35\\u0e48\\u0e22\\u0e27\\u0e1e\\u0e37\\u0e49\\u0e19\\u0e10\\u0e32\\u0e19",
      "\\u0e14\\u0e39\\u0e41\\u0e1c\\u0e19\\u0e01\\u0e32\\u0e23\\u0e40\\u0e14\\u0e34\\u0e19\\u0e17\\u0e32\\u0e07",
    ],
    vi: [
      "5 y\\u00eau c\\u1ea7u AI m\\u1ed7i th\\u00e1ng",
      "L\\u1eadp k\\u1ebf ho\\u1ea1ch du l\\u1ecbch c\\u01a1 b\\u1ea3n",
      "Xem h\\u00e0nh tr\\u00ecnh",
    ],
    ru: [
      "5 AI-\\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0432 \\u043c\\u0435\\u0441\\u044f\\u0446",
      "\\u0411\\u0430\\u0437\\u043e\\u0432\\u043e\\u0435 \\u043f\\u043b\\u0430\\u043d\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u0438\\u0435",
      "\\u041f\\u0440\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440 \\u043c\\u0430\\u0440\\u0448\\u0440\\u0443\\u0442\\u043e\\u0432",
    ],
    fr: ["5 requ\\u00eates IA par mois", "Planification de base", "Voir les itin\\u00e9raires"],
    de: ["5 KI-Anfragen pro Monat", "Grundlegende Reiseplanung", "Reisepl\\u00e4ne ansehen"],
    ar: [
      "5 \\u0637\\u0644\\u0628\\u0627\\u062a \\u0630\\u0643\\u0627\\u0621 \\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a \\u0634\\u0647\\u0631\\u064a\\u064b\\u0627",
      "\\u062a\\u062e\\u0637\\u064a\\u0637 \\u0633\\u0641\\u0631 \\u0623\\u0633\\u0627\\u0633\\u064a",
      "\\u0639\\u0631\\u0636 \\u0627\\u0644\\u0645\\u0633\\u0627\\u0631\\u0627\\u062a",
    ],
    fa: [
      "\\u06f5 \\u062f\\u0631\\u062e\\u0648\\u0627\\u0633\\u062a \\u0647\\u0648\\u0634 \\u0645\\u0635\\u0646\\u0648\\u0639\\u06cc \\u062f\\u0631 \\u0645\\u0627\\u0647",
      "\\u0628\\u0631\\u0646\\u0627\\u0645\\u0647\\u200c\\u0631\\u06cc\\u0632\\u06cc \\u067e\\u0627\\u06cc\\u0647 \\u0633\\u0641\\u0631",
      "\\u0645\\u0634\\u0627\\u0647\\u062f\\u0647 \\u0628\\u0631\\u0646\\u0627\\u0645\\u0647\\u200c\\u0647\\u0627\\u06cc \\u0633\\u0641\\u0631",
    ],
  },
  explorer: {
    en: [
      "20 AI requests per month",
      "Save itineraries",
      "Conversation history",
      "Priority support",
    ],
    ja: [
      "\\u670820\\u56de\\u306eAI\\u30ea\\u30af\\u30a8\\u30b9\\u30c8",
      "\\u65c5\\u7a0b\\u3092\\u4fdd\\u5b58",
      "\\u4f1a\\u8a71\\u5c65\\u6b74",
      "\\u512a\\u5148\\u30b5\\u30dd\\u30fc\\u30c8",
    ],
    ko: [
      "\\uc6d4 20\\ud68c AI \\uc694\\uccad",
      "\\uc77c\\uc815 \\uc800\\uc7a5",
      "\\ub300\\ud654 \\uae30\\ub85d",
      "\\uc6b0\\uc120 \\uc9c0\\uc6d0",
    ],
    "zh-CN": [
      "\\u6bcf\\u670820\\u6b21AI\\u8bf7\\u6c42",
      "\\u4fdd\\u5b58\\u884c\\u7a0b",
      "\\u5bf9\\u8bdd\\u5386\\u53f2",
      "\\u4f18\\u5148\\u652f\\u6301",
    ],
    "zh-TW": [
      "\\u6bcf\\u670820\\u6b21AI\\u8acb\\u6c42",
      "\\u4fdd\\u5b58\\u884c\\u7a0b",
      "\\u5c0d\\u8a71\\u6b77\\u53f2",
      "\\u512a\\u5148\\u652f\\u63f4",
    ],
    th: [
      "\\u0e04\\u0e33\\u0e02\\u0e2d AI 20 \\u0e04\\u0e23\\u0e31\\u0e49\\u0e07\\u0e15\\u0e48\\u0e2d\\u0e40\\u0e14\\u0e37\\u0e2d\\u0e19",
      "\\u0e1a\\u0e31\\u0e19\\u0e17\\u0e36\\u0e01\\u0e41\\u0e1c\\u0e19\\u0e01\\u0e32\\u0e23\\u0e40\\u0e14\\u0e34\\u0e19\\u0e17\\u0e32\\u0e07",
      "\\u0e1b\\u0e23\\u0e30\\u0e27\\u0e31\\u0e15\\u0e34\\u0e01\\u0e32\\u0e23\\u0e2a\\u0e19\\u0e17\\u0e19\\u0e32",
      "\\u0e01\\u0e32\\u0e23\\u0e2a\\u0e19\\u0e31\\u0e1a\\u0e2a\\u0e19\\u0e38\\u0e19\\u0e25\\u0e33\\u0e14\\u0e31\\u0e1a\\u0e41\\u0e23\\u0e01",
    ],
    vi: [
      "20 y\\u00eau c\\u1ea7u AI m\\u1ed7i th\\u00e1ng",
      "L\\u01b0u h\\u00e0nh tr\\u00ecnh",
      "L\\u1ecbch s\\u1eed h\\u1ed9i tho\\u1ea1i",
      "H\\u1ed7 tr\\u1ee3 \\u01b0u ti\\u00ean",
    ],
    ru: [
      "20 AI-\\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0432 \\u043c\\u0435\\u0441\\u044f\\u0446",
      "\\u0421\\u043e\\u0445\\u0440\\u0430\\u043d\\u0435\\u043d\\u0438\\u0435 \\u043c\\u0430\\u0440\\u0448\\u0440\\u0443\\u0442\\u043e\\u0432",
      "\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f \\u0434\\u0438\\u0430\\u043b\\u043e\\u0433\\u043e\\u0432",
      "\\u041f\\u0440\\u0438\\u043e\\u0440\\u0438\\u0442\\u0435\\u0442\\u043d\\u0430\\u044f \\u043f\\u043e\\u0434\\u0434\\u0435\\u0440\\u0436\\u043a\\u0430",
    ],
    fr: [
      "20 requ\\u00eates IA par mois",
      "Enregistrer les itin\\u00e9raires",
      "Historique des conversations",
      "Support prioritaire",
    ],
    de: [
      "20 KI-Anfragen pro Monat",
      "Reisepl\\u00e4ne speichern",
      "Konversationsverlauf",
      "Priorit\\u00e4ts-Support",
    ],
    ar: [
      "20 \\u0637\\u0644\\u0628 \\u0630\\u0643\\u0627\\u0621 \\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a \\u0634\\u0647\\u0631\\u064a\\u064b\\u0627",
      "\\u062d\\u0641\\u0638 \\u0645\\u0633\\u0627\\u0631\\u0627\\u062a \\u0627\\u0644\\u0631\\u062d\\u0644\\u0629",
      "\\u0633\\u062c\\u0644 \\u0627\\u0644\\u0645\\u062d\\u0627\\u062f\\u062b\\u0627\\u062a",
      "\\u062f\\u0639\\u0645 \\u0630\\u0648 \\u0623\\u0648\\u0644\\u0648\\u064a\\u0629",
    ],
    fa: [
      "\\u06f2\\u06f0 \\u062f\\u0631\\u062e\\u0648\\u0627\\u0633\\u062a \\u0647\\u0648\\u0634 \\u0645\\u0635\\u0646\\u0648\\u0639\\u06cc \\u062f\\u0631 \\u0645\\u0627\\u0647",
      "\\u0630\\u062e\\u06cc\\u0631\\u0647 \\u0628\\u0631\\u0646\\u0627\\u0645\\u0647 \\u0633\\u0641\\u0631",
      "\\u062a\\u0627\\u0631\\u06cc\\u062e\\u0686\\u0647 \\u06af\\u0641\\u062a\\u06af\\u0648\\u0647\\u0627",
      "\\u067e\\u0634\\u062a\\u06cc\\u0628\\u0627\\u0646\\u06cc \\u0627\\u0648\\u0644\\u0648\\u06cc\\u062a\\u200c\\u062f\\u0627\\u0631",
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
      "\\u670840\\u56de\\u306eAI\\u30ea\\u30af\\u30a8\\u30b9\\u30c8",
      "\\u65c5\\u7a0b\\u306e\\u4fdd\\u5b58\\u3068\\u66f8\\u304d\\u51fa\\u3057",
      "PDF\\u66f8\\u304d\\u51fa\\u3057",
      "\\u30d7\\u30ec\\u30df\\u30a2\\u30e0\\u30ab\\u30b9\\u30bf\\u30de\\u30a4\\u30ba",
      "\\u9ad8\\u5ea6\\u306a\\u65c5\\u884c\\u30c4\\u30fc\\u30eb",
    ],
    ko: [
      "\\uc6d4 40\\ud68c AI \\uc694\\uccad",
      "\\uc77c\\uc815 \\uc800\\uc7a5 \\ubc0f \\ub0b4\\ubcf4\\ub0b4\\uae30",
      "PDF \\ub0b4\\ubcf4\\ub0b4\\uae30",
      "\\ud504\\ub9ac\\ubbf8\\uc5c4 \\ub9de\\ucda4 \\uc124\\uc815",
      "\\uace0\\uae09 \\uc5ec\\ud589 \\ub3c4\\uad6c",
    ],
    "zh-CN": [
      "\\u6bcf\\u670840\\u6b21AI\\u8bf7\\u6c42",
      "\\u4fdd\\u5b58\\u548c\\u5bfc\\u51fa\\u884c\\u7a0b",
      "PDF\\u5bfc\\u51fa",
      "\\u9ad8\\u7ea7\\u81ea\\u5b9a\\u4e49",
      "\\u9ad8\\u7ea7\\u65c5\\u884c\\u5de5\\u5177",
    ],
    "zh-TW": [
      "\\u6bcf\\u670840\\u6b21AI\\u8acb\\u6c42",
      "\\u4fdd\\u5b58\\u548c\\u532f\\u51fa\\u884c\\u7a0b",
      "PDF\\u532f\\u51fa",
      "\\u9032\\u968e\\u81ea\\u8a02",
      "\\u9032\\u968e\\u65c5\\u884c\\u5de5\\u5177",
    ],
    th: [
      "\\u0e04\\u0e33\\u0e02\\u0e2d AI 40 \\u0e04\\u0e23\\u0e31\\u0e49\\u0e07\\u0e15\\u0e48\\u0e2d\\u0e40\\u0e14\\u0e37\\u0e2d\\u0e19",
      "\\u0e1a\\u0e31\\u0e19\\u0e17\\u0e36\\u0e01\\u0e41\\u0e25\\u0e30\\u0e2a\\u0e48\\u0e07\\u0e2d\\u0e2d\\u0e01\\u0e41\\u0e1c\\u0e19\\u0e01\\u0e32\\u0e23\\u0e40\\u0e14\\u0e34\\u0e19\\u0e17\\u0e32\\u0e07",
      "\\u0e2a\\u0e48\\u0e07\\u0e2d\\u0e2d\\u0e01 PDF",
      "\\u0e1b\\u0e23\\u0e31\\u0e1a\\u0e41\\u0e15\\u0e48\\u0e07\\u0e1e\\u0e23\\u0e35\\u0e40\\u0e21\\u0e35\\u0e22\\u0e21",
      "\\u0e40\\u0e04\\u0e23\\u0e37\\u0e48\\u0e2d\\u0e07\\u0e21\\u0e37\\u0e2d\\u0e17\\u0e48\\u0e2d\\u0e07\\u0e40\\u0e17\\u0e35\\u0e48\\u0e22\\u0e27\\u0e02\\u0e31\\u0e49\\u0e19\\u0e2a\\u0e39\\u0e07",
    ],
    vi: [
      "40 y\\u00eau c\\u1ea7u AI m\\u1ed7i th\\u00e1ng",
      "L\\u01b0u v\\u00e0 xu\\u1ea5t h\\u00e0nh tr\\u00ecnh",
      "Xu\\u1ea5t PDF",
      "T\\u00f9y ch\\u1ec9nh cao c\\u1ea5p",
      "C\\u00f4ng c\\u1ee5 du l\\u1ecbch n\\u00e2ng cao",
    ],
    ru: [
      "40 AI-\\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0432 \\u043c\\u0435\\u0441\\u044f\\u0446",
      "\\u0421\\u043e\\u0445\\u0440\\u0430\\u043d\\u0435\\u043d\\u0438\\u0435 \\u0438 \\u044d\\u043a\\u0441\\u043f\\u043e\\u0440\\u0442 \\u043c\\u0430\\u0440\\u0448\\u0440\\u0443\\u0442\\u043e\\u0432",
      "\\u042d\\u043a\\u0441\\u043f\\u043e\\u0440\\u0442 PDF",
      "\\u041f\\u0440\\u0435\\u043c\\u0438\\u0443\\u043c-\\u043d\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0430",
      "\\u041f\\u0440\\u043e\\u0434\\u0432\\u0438\\u043d\\u0443\\u0442\\u044b\\u0435 \\u0438\\u043d\\u0441\\u0442\\u0440\\u0443\\u043c\\u0435\\u043d\\u0442\\u044b",
    ],
    fr: [
      "40 requ\\u00eates IA par mois",
      "Enregistrer et exporter les itin\\u00e9raires",
      "Export PDF",
      "Personnalisation premium",
      "Outils de voyage avanc\\u00e9s",
    ],
    de: [
      "40 KI-Anfragen pro Monat",
      "Reisepl\\u00e4ne speichern und exportieren",
      "PDF-Export",
      "Premium-Anpassung",
      "Erweiterte Reisetools",
    ],
    ar: [
      "40 \\u0637\\u0644\\u0628 \\u0630\\u0643\\u0627\\u0621 \\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a \\u0634\\u0647\\u0631\\u064a\\u064b\\u0627",
      "\\u062d\\u0641\\u0638 \\u0648\\u062a\\u0635\\u062f\\u064a\\u0631 \\u0627\\u0644\\u0645\\u0633\\u0627\\u0631\\u0627\\u062a",
      "\\u062a\\u0635\\u062f\\u064a\\u0631 PDF",
      "\\u062a\\u062e\\u0635\\u064a\\u0635 \\u0645\\u062a\\u0645\\u064a\\u0632",
      "\\u0623\\u062f\\u0648\\u0627\\u062a \\u0633\\u0641\\u0631 \\u0645\\u062a\\u0642\\u062f\\u0645\\u0629",
    ],
    fa: [
      "\\u06f4\\u06f0 \\u062f\\u0631\\u062e\\u0648\\u0627\\u0633\\u062a \\u0647\\u0648\\u0634 \\u0645\\u0635\\u0646\\u0648\\u0639\\u06cc \\u062f\\u0631 \\u0645\\u0627\\u0647",
      "\\u0630\\u062e\\u06cc\\u0631\\u0647 \\u0648 \\u062e\\u0631\\u0648\\u062c\\u06cc \\u0628\\u0631\\u0646\\u0627\\u0645\\u0647 \\u0633\\u0641\\u0631",
      "\\u062e\\u0631\\u0648\\u062c\\u06cc PDF",
      "\\u0634\\u062e\\u0635\\u06cc\\u200c\\u0633\\u0627\\u0632\\u06cc \\u067e\\u06cc\\u0634\\u0631\\u0641\\u062a\\u0647",
      "\\u0627\\u0628\\u0632\\u0627\\u0631\\u0647\\u0627\\u06cc \\u067e\\u06cc\\u0634\\u0631\\u0641\\u062a\\u0647 \\u0633\\u0641\\u0631",
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
      "AI\\u30ea\\u30af\\u30a8\\u30b9\\u30c8\\u7121\\u5236\\u9650",
      "\\u30c8\\u30e9\\u30d9\\u30e9\\u30fc\\u5168\\u6a5f\\u80fd",
      "\\u30d3\\u30b8\\u30cd\\u30b9\\u30c6\\u30f3\\u30d7\\u30ec\\u30fc\\u30c8",
      "\\u30c1\\u30fc\\u30e0\\u30b3\\u30e9\\u30dc\\u30ec\\u30fc\\u30b7\\u30e7\\u30f3",
      "API\\u30a2\\u30af\\u30bb\\u30b9",
      "\\u5c02\\u4efb\\u30b5\\u30dd\\u30fc\\u30c8",
    ],
    ko: [
      "\\ubb34\\uc81c\\ud55c AI \\uc694\\uccad",
      "\\ud2b8\\ub798\\ube14\\ub7ec \\ubaa8\\ub4e0 \\uae30\\ub2a5",
      "\\ube44\\uc988\\ub2c8\\uc2a4 \\ud15c\\ud50c\\ub9bf",
      "\\ud300 \\ud611\\uc5c5",
      "API \\uc561\\uc138\\uc2a4",
      "\\uc804\\ub2f4 \\uc9c0\\uc6d0",
    ],
    "zh-CN": [
      "\\u65e0\\u9650AI\\u8bf7\\u6c42",
      "\\u6240\\u6709\\u65c5\\u884c\\u7248\\u529f\\u80fd",
      "\\u5546\\u52a1\\u6a21\\u677f",
      "\\u56e2\\u961f\\u534f\\u4f5c",
      "API\\u8bbf\\u95ee",
      "\\u4e13\\u5c5e\\u652f\\u6301",
    ],
    "zh-TW": [
      "\\u7121\\u9650AI\\u8acb\\u6c42",
      "\\u6240\\u6709\\u65c5\\u884c\\u7248\\u529f\\u80fd",
      "\\u5546\\u52d9\\u7bc4\\u672c",
      "\\u5718\\u968a\\u5354\\u4f5c",
      "API\\u5b58\\u53d6",
      "\\u5c08\\u5c6c\\u652f\\u63f4",
    ],
    th: [
      "\\u0e04\\u0e33\\u0e02\\u0e2d AI \\u0e44\\u0e21\\u0e48\\u0e08\\u0e33\\u0e01\\u0e31\\u0e14",
      "\\u0e1f\\u0e35\\u0e40\\u0e08\\u0e2d\\u0e23\\u0e4c\\u0e17\\u0e31\\u0e49\\u0e07\\u0e2b\\u0e21\\u0e14\\u0e02\\u0e2d\\u0e07 Traveler",
      "\\u0e40\\u0e17\\u0e21\\u0e40\\u0e1e\\u0e25\\u0e15\\u0e18\\u0e38\\u0e23\\u0e01\\u0e34\\u0e08",
      "\\u0e17\\u0e33\\u0e07\\u0e32\\u0e19\\u0e23\\u0e48\\u0e27\\u0e21\\u0e01\\u0e31\\u0e19\\u0e40\\u0e1b\\u0e47\\u0e19\\u0e17\\u0e35\\u0e21",
      "\\u0e40\\u0e02\\u0e49\\u0e32\\u0e16\\u0e36\\u0e07 API",
      "\\u0e01\\u0e32\\u0e23\\u0e2a\\u0e19\\u0e31\\u0e1a\\u0e2a\\u0e19\\u0e38\\u0e19\\u0e40\\u0e09\\u0e1e\\u0e32\\u0e30",
    ],
    vi: [
      "Y\\u00eau c\\u1ea7u AI kh\\u00f4ng gi\\u1edbi h\\u1ea1n",
      "T\\u1ea5t c\\u1ea3 t\\u00ednh n\\u0103ng Du kh\\u00e1ch",
      "M\\u1eabu doanh nghi\\u1ec7p",
      "C\\u1ed9ng t\\u00e1c nh\\u00f3m",
      "Truy c\\u1eadp API",
      "H\\u1ed7 tr\\u1ee3 ri\\u00eang",
    ],
    ru: [
      "\\u0411\\u0435\\u0437\\u043b\\u0438\\u043c\\u0438\\u0442\\u043d\\u044b\\u0435 AI-\\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u044b",
      "\\u0412\\u0441\\u0435 \\u0444\\u0443\\u043d\\u043a\\u0446\\u0438\\u0438 Traveler",
      "\\u0411\\u0438\\u0437\\u043d\\u0435\\u0441-\\u0448\\u0430\\u0431\\u043b\\u043e\\u043d\\u044b",
      "\\u041a\\u043e\\u043c\\u0430\\u043d\\u0434\\u043d\\u0430\\u044f \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430",
      "\\u0414\\u043e\\u0441\\u0442\\u0443\\u043f \\u043a API",
      "\\u041f\\u0435\\u0440\\u0441\\u043e\\u043d\\u0430\\u043b\\u044c\\u043d\\u0430\\u044f \\u043f\\u043e\\u0434\\u0434\\u0435\\u0440\\u0436\\u043a\\u0430",
    ],
    fr: [
      "Requ\\u00eates IA illimit\\u00e9es",
      "Toutes les fonctions Voyageur",
      "Mod\\u00e8les professionnels",
      "Collaboration d'\\u00e9quipe",
      "Acc\\u00e8s API",
      "Support d\\u00e9di\\u00e9",
    ],
    de: [
      "Unbegrenzte KI-Anfragen",
      "Alle Traveler-Funktionen",
      "Gesch\\u00e4ftsvorlagen",
      "Team-Zusammenarbeit",
      "API-Zugriff",
      "Dedizierter Support",
    ],
    ar: [
      "\\u0637\\u0644\\u0628\\u0627\\u062a \\u0630\\u0643\\u0627\\u0621 \\u0627\\u0635\\u0637\\u0646\\u0627\\u0639\\u064a \\u063a\\u064a\\u0631 \\u0645\\u062d\\u062f\\u0648\\u062f\\u0629",
      "\\u062c\\u0645\\u064a\\u0639 \\u0645\\u064a\\u0632\\u0627\\u062a \\u0627\\u0644\\u0645\\u0633\\u0627\\u0641\\u0631",
      "\\u0642\\u0648\\u0627\\u0644\\u0628 \\u0627\\u0644\\u0623\\u0639\\u0645\\u0627\\u0644",
      "\\u062a\\u0639\\u0627\\u0648\\u0646 \\u0627\\u0644\\u0641\\u0631\\u064a\\u0642",
      "\\u0627\\u0644\\u0648\\u0635\\u0648\\u0644 \\u0625\\u0644\\u0649 API",
      "\\u062f\\u0639\\u0645 \\u0645\\u062e\\u0635\\u0635",
    ],
    fa: [
      "\\u062f\\u0631\\u062e\\u0648\\u0627\\u0633\\u062a\\u200c\\u0647\\u0627\\u06cc \\u0646\\u0627\\u0645\\u062d\\u062f\\u0648\\u062f \\u0647\\u0648\\u0634 \\u0645\\u0635\\u0646\\u0648\\u0639\\u06cc",
      "\\u062a\\u0645\\u0627\\u0645 \\u0627\\u0645\\u06a9\\u0627\\u0646\\u0627\\u062a \\u067e\\u0644\\u0646 \\u0645\\u0633\\u0627\\u0641\\u0631",
      "\\u0642\\u0627\\u0644\\u0628\\u200c\\u0647\\u0627\\u06cc \\u062a\\u062c\\u0627\\u0631\\u06cc",
      "\\u0647\\u0645\\u06a9\\u0627\\u0631\\u06cc \\u062a\\u06cc\\u0645\\u06cc",
      "\\u062f\\u0633\\u062a\\u0631\\u0633\\u06cc API",
      "\\u067e\\u0634\\u062a\\u06cc\\u0628\\u0627\\u0646\\u06cc \\u0627\\u062e\\u062a\\u0635\\u0627\\u0635\\u06cc",
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
