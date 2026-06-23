// @ts-nocheck
// Language Switcher Component
// Provides language selection UI with proper hreflang support

import type { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES, isRTL } from "@/i18n/translations";

export interface LanguageSwitcherProps {
  currentLanguage: Language;
  currentPath: string;
  /** Show native language names */
  showNativeNames?: boolean;
  /** Show flag icons (reserved for future use) */
  showFlags?: boolean;
  /** Custom className */
  className?: string;
  /** Dropdown or inline layout */
  variant?: "dropdown" | "inline" | "flags";
  /** Include x-default option */
  includeXDefault?: boolean;
}

const SITE_URL = "https://chinaconnect.com";

/**
 * Generate the URL for a specific language
 */
function generateLanguageUrl(path: string, targetLang: Language | "x-default"): string {
  // Remove leading/trailing slashes
  const cleanPath = path.replace(/^\/|\/$/g, "");

  // Generate new path with target language
  if (targetLang === "en" || targetLang === "x-default") {
    // English is default - no prefix
    return `${SITE_URL}${cleanPath || "/"}`;
  }

  return `${SITE_URL}/${targetLang}${cleanPath || "/"}`;
}

/**
 * Get flag emoji for a language code
 */
function getFlagEmoji(langCode: Language | "x-default"): string {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    ja: "🇯🇵",
    ko: "🇰🇷",
    "zh-CN": "🇨🇳",
    "zh-TW": "🇹🇼",
    th: "🇹🇭",
    vi: "🇻🇳",
    ru: "🇷🇺",
    fr: "🇫🇷",
    de: "🇩🇪",
    ar: "🇸🇦",
    fa: "🇮🇷",
    "x-default": "🌐",
  };

  return flags[langCode] || "🌐";
}

interface DisplayLang {
  code: Language | "x-default";
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

/**
 * Language switcher component
 */
export function LanguageSwitcher({
  currentLanguage,
  currentPath,
  showNativeNames = true,
  showFlags: _showFlags = false,
  className = "",
  variant = "dropdown",
  includeXDefault = false,
}: LanguageSwitcherProps) {
  const languages: DisplayLang[] = SUPPORTED_LANGUAGES.filter(
    (l) => l.code !== currentLanguage,
  ) as DisplayLang[];

  if (includeXDefault) {
    languages.push({
      code: "x-default",
      name: "Default",
      nativeName: "Default (English)",
      dir: "ltr",
    });
  }

  if (variant === "flags") {
    return (
      <div className={`language-switcher flags ${className}`}>
        <div className="flex items-center gap-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const url = generateLanguageUrl(currentPath, lang.code);
            const isActive = lang.code === currentLanguage;

            return (
              <a
                key={lang.code}
                href={url}
                hrefLang={lang.code}
                className={`
                  inline-flex items-center justify-center
                  w-8 h-8 rounded text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
                title={lang.name}
                aria-current={isActive ? "true" : undefined}
                lang={lang.code}
              >
                {getFlagEmoji(lang.code)}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`language-switcher inline ${className}`}>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => {
            const url = generateLanguageUrl(currentPath, lang.code);
            const isActive = lang.code === currentLanguage;

            return (
              <a
                key={lang.code}
                href={url}
                hrefLang={lang.code}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
                aria-current={isActive ? "true" : undefined}
                lang={lang.code}
              >
                {showNativeNames ? lang.nativeName : lang.name}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`language-switcher dropdown ${className}`}>
      <label className="sr-only" htmlFor="language-select">
        Select language
      </label>
      <select
        id="language-select"
        className={`
          px-3 py-2 pr-8 rounded-lg text-sm font-medium
          bg-white border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer
          appearance-none
          bg-no-repeat
          bg-[right_0.5rem_center]
          bg-[length:1rem]
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
        }}
        onChange={(e) => {
          const targetLang = e.target.value as Language;
          const url = generateLanguageUrl(currentPath, targetLang);
          window.location.href = url;
        }}
        defaultValue={currentLanguage}
      >
        <option value="" disabled>
          -- Language / 语言 --
        </option>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const url = generateLanguageUrl(currentPath, lang.code);
          return (
            <option key={lang.code} value={lang.code} data-url={url}>
              {showNativeNames ? `${lang.nativeName} (${lang.name})` : lang.name}
            </option>
          );
        })}
      </select>

      {/* Hidden form for noscript fallback */}
      <noscript>
        <form action="" method="get">
          <select name="lang">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {showNativeNames ? lang.nativeName : lang.name}
              </option>
            ))}
          </select>
          <button type="submit">Change</button>
        </form>
      </noscript>
    </div>
  );
}

/**
 * Generate hreflang HTML for head section
 */
export function generateHreflangHtml(currentPath: string): string {
  const links: string[] = [];
  const xDefaultUrl = generateLanguageUrl(currentPath, "x-default");

  for (const lang of SUPPORTED_LANGUAGES) {
    const href = generateLanguageUrl(currentPath, lang.code);
    links.push(`  <link rel="alternate" hreflang="${lang.code}" href="${href}" />`);
  }

  links.push(`  <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`);

  return links.join("\n");
}

/**
 * Check if text direction should be RTL
 */
export function getDirection(lang: Language): "ltr" | "rtl" {
  return isRTL(lang) ? "rtl" : "ltr";
}

/**
 * Generate language alternatives for structured data
 */
export function generateLanguageAlternatives(currentPath: string) {
  const languages: Array<{
    languageCode: string;
    languageName: string;
    href: string;
    isDefault: boolean;
  }> = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    languages.push({
      languageCode: lang.code,
      languageName: lang.name,
      href: generateLanguageUrl(currentPath, lang.code),
      isDefault: lang.code === "en",
    });
  }

  return languages;
}
