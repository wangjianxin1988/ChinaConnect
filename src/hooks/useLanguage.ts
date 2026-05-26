// Language hook for React components
// Works with localStorage, SSR-safe
import { useState, useEffect, useCallback } from 'react';
import type { Language } from '@/i18n/translations';

const STORAGE_KEY = 'chinaconnect_language';

export function useLanguage() {
  const [lang, setLangState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // SSR-safe: only runs in browser
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'en' || stored === 'zh') {
      setLangState(stored);
    }
    setIsInitialized(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'zh' : 'en';
    setLang(next);
  }, [lang, setLang]);

  return {
    lang,
    setLang,
    toggleLang,
    isInitialized,
    isZh: lang === 'zh',
    isEn: lang === 'en',
  };
}