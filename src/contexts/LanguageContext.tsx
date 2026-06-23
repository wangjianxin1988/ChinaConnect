// @ts-nocheck
import type { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES } from "@/i18n/translations";
// Language Context for React components
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "chinaconnect_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      setLangState(stored);
    }
    setIsInitialized(true);
  }, []);

  const setLang = (newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
    window.dispatchEvent(new CustomEvent("languagechange", { detail: newLang }));
  };

  const isRTL = lang === "ar" || lang === "fa";

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL, isInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
