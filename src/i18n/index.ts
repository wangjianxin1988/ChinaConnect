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
      // Replace template variables like {city}, {count}, {price} etc.
      // Read from data-i18n-vars JSON attribute first, then fall back to data-city-* attrs, then any text.
      let vars: Record<string, string | number> = {};
      const varsAttr = el.getAttribute("data-i18n-vars");
      if (varsAttr) {
        try { vars = JSON.parse(varsAttr); } catch {}
      }
      if (!("city" in vars)) {
        const cn = el.getAttribute("data-city-name") || el.closest("[data-city-name]")?.getAttribute("data-city-name");
        if (cn) vars.city = cn;
      }
      if (!("count" in vars)) {
        const cn = el.getAttribute("data-count");
        if (cn) vars.count = cn;
      }
      const html = el.innerHTML;
      if (html.includes("{")) {
        // The element already renders its own variable values via SSR (Astro JSX), so do not overwrite.
        return;
      }
      // If value contains unresolved placeholders (e.g. {count} with no count in vars),
      // do not overwrite the SSR-rendered text — the page would otherwise show literal {count}.
      const placeholderMatch = value.match(/\{(\w+)\}/);
      if (placeholderMatch && !(placeholderMatch[1] in vars)) {
        return;
      }
      const replaced = value.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : ""));
      el.textContent = replaced;
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
