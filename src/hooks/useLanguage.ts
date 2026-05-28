import type { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES } from "@/i18n/translations";
// Language hook for React components
// Works with localStorage, SSR-safe
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "chinaconnect_language";

export function useLanguage() {
  const [lang, setLangState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // SSR-safe: only runs in browser
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      setLangState(stored);
    }
    setIsInitialized(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
    // Dispatch event for other components to update
    window.dispatchEvent(new CustomEvent("languagechange", { detail: newLang }));
  }, []);

  const toggleLang = useCallback(() => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === lang);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    setLang(SUPPORTED_LANGUAGES[nextIndex].code);
  }, [lang, setLang]);

  return {
    lang,
    setLang,
    toggleLang,
    isInitialized,
    isZh: lang === "zh-CN" || lang === "zh-TW",
    isEn: lang === "en",
    isRTL: lang === "ar" || lang === "fa",
    isCJK: ["ja", "ko", "zh-CN", "zh-TW"].includes(lang),
  };
}

// Get initial language from browser
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
    return stored;
  }

  const browserLang = navigator.language;

  // Check for exact match first
  if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
    return browserLang as Language;
  }

  // Check for language prefix match
  const langPrefix = browserLang.split("-")[0].toLowerCase();
  const match = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().startsWith(langPrefix));
  if (match) return match.code;

  return "en";
}
