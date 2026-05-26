// Language utilities for ChinaConnect
import type { Language } from './translations';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES, isRTL } from './translations';

/**
 * Get language from URL path
 * e.g., /en/cities -> en, /zh-CN/food -> zh-CN
 */
export function getLangFromUrl(url: URL): Language {
  const segments = url.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (!firstSegment) return 'en';

  // Map common variants
  if (firstSegment === 'zhcn') return 'zh-CN';
  if (firstSegment === 'zhtw') return 'zh-TW';

  // Check if it's a supported language
  const supported = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === firstSegment);
  return supported?.code || 'en';
}

/**
 * Add language prefix to path
 * e.g., addLangPrefix('/cities', 'zh-CN') -> '/zh-CN/cities'
 */
export function addLangPrefix(path: string, lang: Language): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return `/${lang}`;
  return `/${lang}${cleanPath}`;
}

/**
 * Remove language prefix from path
 * e.g., removeLangPrefix('/en/cities') -> '/cities'
 */
export function removeLangPrefix(path: string): { lang: Language; path: string } {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Map variants
  let lang: Language = 'en';
  if (firstSegment === 'zhcn') {
    lang = 'zh-CN';
  } else if (firstSegment === 'zhtw') {
    lang = 'zh-TW';
  } else {
    const supported = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === firstSegment);
    if (supported) lang = supported.code;
  }

  const remainingPath = '/' + segments.slice(1).join('/');
  return { lang, path: remainingPath || '/' };
}

/**
 * Get text direction for a language
 */
export function getDir(lang: Language): 'ltr' | 'rtl' {
  return isRTL(lang) ? 'rtl' : 'ltr';
}

/**
 * Get all language options for language switcher
 */
export function getLanguageOptions(currentLang: Language) {
  return SUPPORTED_LANGUAGES.map(l => ({
    code: l.code,
    name: l.name,
    nativeName: l.nativeName,
    isCurrent: l.code === currentLang,
    isRTL: l.dir === 'rtl',
  }));
}

/**
 * Detect user language from Accept-Language header (for SSR)
 */
export function detectLanguageFromHeaders(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return 'en';

  // Parse Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8
  const languages = acceptLanguage
    .split(',')
    .map(part => {
      const [lang, qValue] = part.trim().split(';q=');
      return {
        lang: lang.trim(),
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    // Try exact match
    const exact = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === lang.toLowerCase());
    if (exact) return exact.code;

    // Try language-only match (e.g., 'en' matches 'en', 'zh' matches 'zh-CN')
    const langOnly = lang.split('-')[0].toLowerCase();
    const prefix = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase().startsWith(langOnly));
    if (prefix) return prefix.code;
  }

  return 'en';
}

/**
 * Format number for locale
 */
export function formatNumber(num: number, lang: Language): string {
  const localeMap: Record<Language, string> = {
    en: 'en-US',
    ja: 'ja-JP',
    ko: 'ko-KR',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    th: 'th-TH',
    vi: 'vi-VN',
    ru: 'ru-RU',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-SA',
    fa: 'fa-IR',
  };

  return new Intl.NumberFormat(localeMap[lang] || 'en-US').format(num);
}

/**
 * Format currency for locale
 */
export function formatCurrency(amount: number, lang: Language, currency: string = 'CNY'): string {
  const localeMap: Record<Language, string> = {
    en: 'en-US',
    ja: 'ja-JP',
    ko: 'ko-KR',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    th: 'th-TH',
    vi: 'vi-VN',
    ru: 'ru-RU',
    fr: 'fr-FR',
    de: 'de-DE',
    ar: 'ar-SA',
    fa: 'fa-IR',
  };

  return new Intl.NumberFormat(localeMap[lang] || 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
