/**
 * Itinerary i18n helpers — localized route titles/summaries/names.
 * Keeps saved itineraries in the user's own language everywhere
 * (chat sidebar, account page, detail page, PDF/text exports).
 */

export type ItineraryLang =
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

export const ITINERARY_LANGS: ItineraryLang[] = [
  "en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa",
];

/** Normalize any app language string (i18n Language / AiChatLang) to ItineraryLang. */
export function normalizeItineraryLang(lang?: string | null): ItineraryLang {
  if (!lang) return "en";
  const l = lang.toLowerCase();
  if (l === "zh" || l === "zh-cn" || l.startsWith("zh-cn")) return "zh-CN";
  if (l === "zh-tw" || l === "zh-hk" || l.startsWith("zh-tw") || l === "zh-hant") return "zh-TW";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("th")) return "th";
  if (l.startsWith("vi")) return "vi";
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("ar")) return "ar";
  if (l.startsWith("fa")) return "fa";
  return "en";
}

const TITLE_FN: Record<ItineraryLang, (dest: string, days?: number) => string> = {
  en: (d, n) => (n ? d + " " + n + "-Day Trip" : "Trip to " + d),
  ja: (d, n) => (n ? d + " " + n + "日間の旅" : d + "への旅"),
  ko: (d, n) => (n ? d + " " + n + "일 여행" : d + " 여행"),
  "zh-CN": (d, n) => (n ? d + n + "日游" : d + "之旅"),
  "zh-TW": (d, n) => (n ? d + n + "日遊" : d + "之旅"),
  th: (d, n) => (n ? d + " " + n + "วันทริป" : "ทริปที่ " + d),
  vi: (d, n) => (n ? "Chuyến đi " + d + " " + n + " ngày" : "Du lịch " + d),
  ru: (d, n) => (n ? d + ": путешествие на " + n + " дн." : "Поездка в " + d),
  fr: (d, n) => (n ? "Séjour de " + n + " jours à " + d : "Voyage à " + d),
  de: (d, n) => (n ? n + "-Tage-Reise nach " + d : "Reise nach " + d),
  ar: (d, n) => (n ? "رحلة إلى " + d + " لمدة " + n + " أيام" : "رحلة إلى " + d),
  fa: (d, n) => (n ? "سفر " + n + " روزه به " + d : "سفر به " + d),
};

const SUMMARY_FN: Record<
  ItineraryLang,
  (dest: string, days?: number, highlights?: string[]) => string
> = {
  en: (d, n, h) =>
    "A " + (n ? n + "-day " : "") + "travel itinerary for " + d + "." +
    (h && h.length ? " Highlights include " + h.slice(0, 3).join(", ") + "." : ""),
  ja: (d, n, h) =>
    d + (n ? " " + n + "日間" : "") + "の旅行プラン。" +
    (h && h.length ? "ハイライト：" + h.slice(0, 3).join("、") + "。" : ""),
  ko: (d, n, h) =>
    d + (n ? " " + n + "일" : "") + " 여행 일정입니다." +
    (h && h.length ? " 하이라이트: " + h.slice(0, 3).join(", ") + "." : ""),
  "zh-CN": (d, n, h) =>
    d + (n ? n + "天" : "") + "旅行行程。" +
    (h && h.length ? "亮点包括" + h.slice(0, 3).join("、") + "。" : ""),
  "zh-TW": (d, n, h) =>
    d + (n ? n + "天" : "") + "旅行行程。" +
    (h && h.length ? "亮點包括" + h.slice(0, 3).join("、") + "。" : ""),
  th: (d, n, h) =>
    "แผนการเดินทาง" + (n ? " " + n + " วัน" : "") + " ที่ " + d + "." +
    (h && h.length ? " ไฮไลต์: " + h.slice(0, 3).join(", ") : ""),
  vi: (d, n, h) =>
    "Lịch trình du lịch " + d + (n ? " " + n + " ngày" : "") + "." +
    (h && h.length ? " Điểm nổi bật: " + h.slice(0, 3).join(", ") : ""),
  ru: (d, n, h) =>
    "Маршрут путешествия " + (n ? "на " + n + " дн. " : "") + "в " + d + "." +
    (h && h.length ? " Основные моменты: " + h.slice(0, 3).join(", ") : ""),
  fr: (d, n, h) =>
    "Itinéraire de voyage " + (n ? "de " + n + " jours " : "") + "à " + d + "." +
    (h && h.length ? " Points forts : " + h.slice(0, 3).join(", ") : ""),
  de: (d, n, h) =>
    "Reiseplan für " + d + (n ? " (" + n + " Tage)" : "") + "." +
    (h && h.length ? " Highlights: " + h.slice(0, 3).join(", ") : ""),
  ar: (d, n, h) =>
    "خطة سفر إلى " + d + (n ? " لمدة " + n + " أيام" : "") + "." +
    (h && h.length ? " أبرز المعالم: " + h.slice(0, 3).join("، ") : ""),
  fa: (d, n, h) =>
    "برنامه سفر به " + d + (n ? " به مدت " + n + " روز" : "") + "." +
    (h && h.length ? " نکات برجسته: " + h.slice(0, 3).join("، ") : ""),
};

export function localizeTitle(
  lang: ItineraryLang,
  destination: string,
  days?: number,
): string {
  const fn = TITLE_FN[lang] || TITLE_FN.en;
  return fn(destination || "China", days || 1);
}

export function localizeSummary(
  lang: ItineraryLang,
  destination: string,
  days?: number,
  highlights?: string[],
): string {
  const fn = SUMMARY_FN[lang] || SUMMARY_FN.en;
  return fn(destination || "China", days || 1, highlights || []);
}

/**
 * Pick the best stored name for a saved itinerary in the current UI language.
 * Prefers the per-language title (title_i18n), then zh for zh users, else title.
 */
export function pickItineraryName(
  title?: string | null,
  titleZh?: string | null,
  titleI18n?: Record<string, string> | null,
  lang?: string | null,
): string {
  const l = normalizeItineraryLang(lang);
  if (titleI18n && titleI18n[l]) return titleI18n[l];
  if (l === "zh-CN" || l === "zh-TW") {
    if (titleZh) return titleZh;
    if (titleI18n && titleI18n["zh-CN"]) return titleI18n["zh-CN"];
  }
  if (titleI18n && titleI18n.en) return titleI18n.en;
  return title || titleZh || "Saved itinerary";
}

/** Pick the best stored summary for the current UI language. */
export function pickItinerarySummary(
  summary?: string | null,
  summaryZh?: string | null,
  summaryI18n?: Record<string, string> | null,
  lang?: string | null,
): string {
  const l = normalizeItineraryLang(lang);
  if (summaryI18n && summaryI18n[l]) return summaryI18n[l];
  if ((l === "zh-CN" || l === "zh-TW") && summaryZh) return summaryZh;
  if (summaryI18n && summaryI18n.en) return summaryI18n.en;
  return summary || summaryZh || "";
}

export function localizeGenericName(lang?: string | null): string {
  const l = normalizeItineraryLang(lang);
  const names: Record<ItineraryLang, string> = {
    en: "Travel Plan",
    ja: "旅行プラン",
    ko: "여행 계획",
    "zh-CN": "旅行计划",
    "zh-TW": "旅行計畫",
    th: "แผนการเดินทาง",
    vi: "Kế hoạch du lịch",
    ru: "План путешествия",
    fr: "Plan de voyage",
    de: "Reiseplan",
    ar: "خطة السفر",
    fa: "برنامه سفر",
  };
  return names[l] || names.en;
}
