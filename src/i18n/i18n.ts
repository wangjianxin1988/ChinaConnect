/**
 * i18n Configuration for ChinaConnect
 * 12 Language Internationalization System
 *
 * Languages: English, Japanese, Korean, Simplified Chinese (zh-CN),
 * Traditional Chinese (zh-TW), Thai, Vietnamese, Russian, French,
 * German, Arabic, Persian
 */

import type { Language } from "./translations";
import {
  RTL_LANGUAGES,
  SUPPORTED_LANGUAGES,
  translations as allTranslations,
  isRTL,
} from "./translations";

// Locale file mapping for dynamic imports
export const LOCALE_FILES: Record<Language, () => Promise<Record<string, unknown>>> = {
  en: () => import("./locales/en.json"),
  "zh-CN": () => import("./locales/zh.json"),
  ja: () => import("./locales/ja.json"),
  ko: () => import("./locales/ko.json"),
  "zh-TW": () => import("./locales/zh.json"), // Fallback to zh since we don't have separate TW file
  fr: () => import("./locales/fr.json"),
  de: () => import("./locales/de.json"),
  es: () => import("./locales/es.json"),
  pt: () => import("./locales/pt.json"),
  ru: () => import("./locales/ru.json"),
  ar: () => import("./locales/ar.json"),
  th: () => import("./locales/th.json"),
  vi: () => import("./locales/vi.json"),
  fa: () => import("./locales/ar.json"), // Fallback to Arabic RTL handling
};

const STORAGE_KEY = "chinaconnect_language";

/**
 * Detect user's preferred language from browser
 */
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language;

  // Exact matches
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("th")) return "th";
  if (browserLang.startsWith("vi")) return "vi";
  if (browserLang.startsWith("ru")) return "ru";
  if (browserLang.startsWith("ar")) return "ar";
  if (browserLang.startsWith("fa")) return "fa";
  if (browserLang.startsWith("de")) return "de";
  if (browserLang.startsWith("fr")) return "fr";
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("pt")) return "pt";

  // Chinese variants
  if (browserLang.startsWith("zh")) {
    return browserLang.includes("TW") || browserLang.includes("HK") ? "zh-TW" : "zh-CN";
  }

  // English default
  if (browserLang.startsWith("en")) return "en";

  return "en";
}

/**
 * Get current language from storage or detection
 */
export function getCurrentLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && isValidLanguage(stored)) {
    return stored;
  }

  return detectBrowserLanguage();
}

/**
 * Set and persist language choice
 */
export function setCurrentLanguage(lang: Language): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";

  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
}

/**
 * Check if language code is valid
 */
function isValidLanguage(lang: string): lang is Language {
  return [
    "en",
    "ja",
    "ko",
    "zh-CN",
    "zh-TW",
    "th",
    "vi",
    "ru",
    "fr",
    "de",
    "es",
    "pt",
    "ar",
    "fa",
  ].includes(lang);
}

/**
 * Get translations for a specific language
 */
export function getTranslations(lang: Language) {
  return allTranslations[lang] || allTranslations.en;
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, lang: Language): string {
  const localeMap: Record<Language, string> = {
    en: "en-US",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    ja: "ja-JP",
    ko: "ko-KR",
    th: "th-TH",
    vi: "vi-VN",
    ru: "ru-RU",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
    pt: "pt-BR",
    ar: "ar-SA",
    fa: "fa-IR",
  };

  return new Intl.NumberFormat(localeMap[lang] || "en-US").format(num);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, lang: Language, currency = "CNY"): string {
  const localeMap: Record<Language, string> = {
    en: "en-US",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    ja: "ja-JP",
    ko: "ko-KR",
    th: "th-TH",
    vi: "vi-VN",
    ru: "ru-RU",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
    pt: "pt-BR",
    ar: "ar-SA",
    fa: "fa-IR",
  };

  return new Intl.NumberFormat(localeMap[lang] || "en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string,
  lang: Language,
  options?: Intl.DateTimeFormatOptions,
): string {
  const localeMap: Record<Language, string> = {
    en: "en-US",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    ja: "ja-JP",
    ko: "ko-KR",
    th: "th-TH",
    vi: "vi-VN",
    ru: "ru-RU",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
    pt: "pt-BR",
    ar: "ar-SA",
    fa: "fa-IR",
  };

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(localeMap[lang] || "en-US", options).format(dateObj);
}

/**
 * Get text direction for language
 */
export function getDirection(lang: Language): "ltr" | "rtl" {
  return isRTL(lang) ? "rtl" : "ltr";
}

/**
 * Get language display info
 */
export function getLanguageInfo(lang: Language) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === lang);
}

/**
 * Initialize i18n on page load
 */
export function initI18n(): Language {
  if (typeof window === "undefined") return "en";

  const lang = getCurrentLanguage();

  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";

  return lang;
}

/**
 * Change language and optionally reload/navigate
 */
export function changeLanguage(
  lang: Language,
  options: { reload?: boolean; navigate?: boolean } = {},
): void {
  setCurrentLanguage(lang);

  if (options.reload) {
    window.location.reload();
  }
}

// Re-export types and utilities
export { SUPPORTED_LANGUAGES, RTL_LANGUAGES, isRTL };
export type { Language } from "./translations";
