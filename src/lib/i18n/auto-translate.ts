/**
 * Auto-Translation Layer
 * 
 * Automatically translates page content based on user's language preference.
 * - UI labels: from translations.ts (static, pre-translated)
 * - Page content: via /api/translate (dynamic, AI-translated)
 * - Caches translations in localStorage to avoid repeated API calls
 */

import type { Language } from "@/i18n/translations";

const CACHE_KEY = "chinaconnect_translations";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedTranslation {
  text: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: CachedTranslation;
}

/**
 * Get cached translations from localStorage
 */
function getCache(): TranslationCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw) as TranslationCache;
    // Clean expired entries
    const now = Date.now();
    const cleaned: TranslationCache = {};
    for (const [key, val] of Object.entries(cache)) {
      if (now - val.timestamp < CACHE_EXPIRY) {
        cleaned[key] = val;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

/**
 * Save translation to cache
 */
function saveToCache(key: string, translated: string): void {
  try {
    const cache = getCache();
    cache[key] = { text: translated, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Generate cache key for a text+lang pair
 */
function makeCacheKey(text: string, lang: string): string {
  // Use first 80 chars as key (to keep localStorage small)
  return `${lang}:${text.substring(0, 80)}`;
}

/**
 * Translate a single text string via API
 */
async function translateText(text: string, targetLang: string, sourceLang = "en"): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  if (targetLang === sourceLang) return text;
  if (targetLang === "en") return text;

  // Check cache first
  const cacheKey = makeCacheKey(text, targetLang);
  const cache = getCache();
  if (cache[cacheKey]) {
    return cache[cacheKey].text;
  }

  try {
    const resp = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang, sourceLang }),
    });

    if (!resp.ok) {
      console.warn(`Translation API error: ${resp.status}`);
      return text;
    }

    const data = await resp.json();
    const translated = data.translated || text;

    // Cache the result
    saveToCache(cacheKey, translated);

    return translated;
  } catch (err) {
    console.warn("Translation failed:", err);
    return text;
  }
}

/**
 * Translate all elements with [data-i18n-content] attribute
 * These are content elements (not UI labels) that need AI translation
 */
export async function translatePageContent(targetLang: Language): Promise<void> {
  if (targetLang === "en") return; // English is the default

  // Find all elements that should be translated
  const elements = document.querySelectorAll("[data-translate]");
  
  if (elements.length === 0) return;

  // Batch translate (up to 5 at a time to avoid rate limiting)
  const batchSize = 5;
  const elementArray = Array.from(elements);

  for (let i = 0; i < elementArray.length; i += batchSize) {
    const batch = elementArray.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (el) => {
        const originalText = el.getAttribute("data-translate") || el.textContent || "";
        if (!originalText.trim()) return;

        const translated = await translateText(originalText, targetLang);
        if (translated !== originalText) {
          // Only update text content, preserve HTML structure
          if (el.children.length === 0) {
            el.textContent = translated;
          } else {
            // For elements with children, only translate text nodes
            for (const node of Array.from(el.childNodes)) {
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                const nodeTranslated = await translateText(node.textContent.trim(), targetLang);
                node.textContent = nodeTranslated;
              }
            }
          }
        }
      })
    );
  }
}

/**
 * Auto-detect user's preferred language
 */
export function detectLanguage(): Language {
  // 1. Check URL path (/ja/, /ko/, etc.)
  const pathLang = getLanguageFromPath();
  if (pathLang) return pathLang;

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem("chinaconnect_language");
    if (stored && isValidLanguage(stored)) return stored as Language;
  } catch {}

  // 3. Check browser language
  const browserLang = navigator.language;
  if (browserLang) {
    // Try exact match first (e.g., "ja" → "ja")
    if (isValidLanguage(browserLang)) return browserLang as Language;
    // Try prefix match (e.g., "ja-JP" → "ja")
    const prefix = browserLang.split("-")[0];
    if (isValidLanguage(prefix)) return prefix as Language;
    // Special: "zh" → "zh-CN"
    if (prefix === "zh") {
      if (browserLang.includes("TW") || browserLang.includes("Hant")) return "zh-TW";
      return "zh-CN";
    }
  }

  return "en";
}

function getLanguageFromPath(): Language | null {
  const match = window.location.pathname.match(/^\/(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)(?:\/|$)/);
  return match ? (match[1] as Language) : null;
}

function isValidLanguage(code: string): boolean {
  const valid = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
  return valid.includes(code);
}

/**
 * Initialize auto-translation
 * Call this once on page load
 */
export async function initAutoTranslation(): Promise<Language> {
  const lang = detectLanguage();
  
  if (lang !== "en") {
    // Translate page content (async, non-blocking)
    translatePageContent(lang).catch(console.warn);
  }

  return lang;
}
