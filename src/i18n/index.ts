// @ts-nocheck
// i18n client-side translation system
// Loads translations and provides switching without page reload
import type { Language, Translations } from "./translations";
import { translations as allTranslations } from "./translations";

const STORAGE_KEY = "chinaconnect_language";

// Get current language from storage or browser
export function getCurrentLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && isValidLanguage(stored)) {
    return stored;
  }

  // Detect from browser
  const browserLang = navigator.language;
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("zh"))
    return browserLang.startsWith("zh-TW") || browserLang.startsWith("zh-HK") ? "zh-TW" : "zh-CN";
  if (browserLang.startsWith("th")) return "th";
  if (browserLang.startsWith("vi")) return "vi";
  if (browserLang.startsWith("ru")) return "ru";
  if (browserLang.startsWith("ar")) return "ar";
  if (browserLang.startsWith("fa")) return "fa";
  if (browserLang.startsWith("de")) return "de";
  if (browserLang.startsWith("fr")) return "fr";

  return "en";
}

function isValidLanguage(lang: string): lang is Language {
  return ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"].includes(
    lang,
  );
}

// Set language and persist
export function setLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" || lang === "fa" ? "rtl" : "ltr";
  applyTranslations(lang);
  window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
}

// Get translations for a language
export function t(lang: Language): Translations {
  return allTranslations[lang] || allTranslations.en;
}

// Apply translations to all [data-i18n] elements
export function applyTranslations(lang: Language): void {
  const translations = t(lang);
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;

    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value === "string") {
      // Handle template variables like {city}
      const html = el.innerHTML;
      if (html.includes("{")) {
        // Preserve HTML structure but update text
        el.textContent = value;
      } else {
        el.textContent = value;
      }
    }
  });

  // Update text direction
  document.documentElement.dir = lang === "ar" || lang === "fa" ? "rtl" : "ltr";
}

// Initialize i18n on page load
export function initI18n(): void {
  const lang = getCurrentLanguage();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" || lang === "fa" ? "rtl" : "ltr";

  // Apply translations after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyTranslations(lang));
  } else {
    applyTranslations(lang);
  }
}
