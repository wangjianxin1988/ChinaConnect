import { SUPPORTED_LANGUAGES } from "@/i18n/translations";
import type { Language } from "@/i18n/translations";
// Language Switcher Component
import { useEffect, useRef, useState } from "react";

interface LanguageSwitcherProps {
  currentLang: Language;
  className?: string;
}

export default function LanguageSwitcher({ currentLang, className = "" }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (lang: Language) => {
    localStorage.setItem("chinaconnect_language", lang);

    // Get current path and replace/remove language prefix
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(
      /^\/(en|zh-CN|zh-TW|ja|ko|th|vi|ru|fr|de|ar|fa)\//,
      "/",
    );

    // Navigate to new language path
    const newPath = `/${lang}${pathWithoutLang}`;
    window.location.href = newPath;
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLanguage?.nativeName || currentLang.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            Select Language / 选择语言
          </div>
          <ul>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleSwitch(lang.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2 ${
                    lang.code === currentLang ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`}
                  role="option"
                  aria-selected={lang.code === currentLang}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">
                      {lang.code === "zh-CN"
                        ? "简"
                        : lang.code === "zh-TW"
                          ? "繁"
                          : lang.code === "en"
                            ? "EN"
                            : lang.code.toUpperCase()}
                    </span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {lang.code === currentLang && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
