/**
 * useTranslation Hook for React Components
 * Provides translation function and language state management
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getCurrentLanguage,
  setCurrentLanguage,
} from "./i18n";
import type { Language, Translations } from "./translations";
import { translations as allTranslations } from "./translations";

export interface UseTranslationReturn {
  /** Current language code */
  lang: Language;
  /** Current translations object */
  t: Translations;
  /** Translation function - get translation by key path */
  tFunc: (key: string, params?: Record<string, string | number>) => string;
  /** Whether current language is RTL */
  isRTL: boolean;
  /** Text direction */
  dir: "ltr" | "rtl";
  /** Change current language */
  setLanguage: (lang: Language) => void;
  /** Format number according to locale */
  formatNum: (num: number) => string;
  /** Format currency according to locale */
  formatCurr: (amount: number, currency?: string) => string;
  /** Format date according to locale */
  formatDat: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  /** Get translation with interpolation */
  interpolate: (key: string, values?: Record<string, string | number>) => string;
}

export interface UseTranslationOptions {
  /** Initial language (defaults to detected or stored) */
  initialLang?: Language;
  /** Callback when language changes */
  onLanguageChange?: (lang: Language) => void;
  /** Enable URL-based language prefix */
  useUrlPrefix?: boolean;
}

/**
 * Hook for accessing translations in React components
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, lang, setLanguage, isRTL } = useTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t.nav.home}</h1>
 *       <button onClick={() => setLanguage('zh-CN')}>中文</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(options: UseTranslationOptions = {}): UseTranslationReturn {
  const { initialLang, onLanguageChange } = options;

  // Initialize language from storage, detection, or explicit initial value
  const [lang, setLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    return typeof window !== "undefined" ? getCurrentLanguage() : "en";
  });

  // Get translations object for current language
  const t = useMemo((): Translations => {
    return allTranslations[lang] || allTranslations.en;
  }, [lang]);

  // Translation function with key path support and interpolation
  const tFunc = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split(".");
      let value: unknown = t;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key; // Return key if not found
        }
      }

      if (typeof value !== "string") return key;

      // Interpolate parameters
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
          return params[paramKey]?.toString() ?? `{${paramKey}}`;
        });
      }

      return value;
    },
    [t],
  );

  // Alias for tFunc (more intuitive name)
  const interpolate = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      return tFunc(key, values);
    },
    [tFunc],
  );

  // Set language and persist
  const setLanguage = useCallback(
    (newLang: Language) => {
      setLangState(newLang);
      setCurrentLanguage(newLang);
      onLanguageChange?.(newLang);
    },
    [onLanguageChange],
  );

  // Check if current language is RTL
  const isRTL = useMemo((): boolean => {
    const rtlLangs: Language[] = ["ar", "fa"];
    return rtlLangs.includes(lang);
  }, [lang]);

  const dir = isRTL ? "rtl" : "ltr";

  // Format helpers
  const formatNum = useCallback((num: number) => formatNumber(num, lang), [lang]);
  const formatCurr = useCallback(
    (amount: number, currency?: string) => formatCurrency(amount, lang, currency),
    [lang],
  );
  const formatDat = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions) => formatDate(date, lang, options),
    [lang],
  );

  // Listen for language changes from other components
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLangState(event.detail);
    };

    window.addEventListener("languagechange", handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener("languagechange", handleLanguageChange as EventListener);
    };
  }, []);

  // Initialize language on mount (client-side only)
  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current) return;
    if (typeof window === "undefined") return;

    isInitialized.current = true;
    const storedLang = getCurrentLanguage();
    if (storedLang !== lang) {
      setLangState(storedLang);
    }
  }, [lang]);

  return {
    lang,
    t,
    tFunc,
    isRTL,
    dir,
    setLanguage,
    formatNum,
    formatCurr,
    formatDat,
    interpolate,
  };
}

/**
 * Hook for accessing a single translation key
 * More performant when you only need one key
 *
 * @example
 * ```tsx
 * function Badge() {
 *   const t = useTranslationKey('common.close');
 *   return <span>{t}</span>;
 * }
 * ```
 */
export function useTranslationKey(key: string): string {
  const { tFunc } = useTranslation();
  return tFunc(key);
}

/**
 * Hook for language direction
 * Useful for components that need to adjust layout based on direction
 *
 * @example
 * ```tsx
 * function TextContent() {
 *   const dir = useDirection();
 *   return <div dir={dir}>Content...</div>;
 * }
 * ```
 */
export function useDirection(): "ltr" | "rtl" {
  const { dir } = useTranslation();
  return dir;
}

/**
 * Hook for current language
 * Lightweight hook when you only need the language code
 *
 * @example
 * ```tsx
 * function LanguageDisplay() {
 *   const lang = useCurrentLanguage();
 *   return <span>Current: {lang}</span>;
 * }
 * ```
 */
export function useCurrentLanguage(): Language {
  const { lang } = useTranslation();
  return lang;
}
