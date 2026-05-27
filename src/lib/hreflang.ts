// Hreflang utilities for multi-language SEO
// Generates alternate URL links for different language versions
// Supports all 12 languages: en, ja, ko, zh-CN, zh-TW, th, vi, ru, fr, de, ar, fa

import type { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from "@/i18n/translations";
import type { HreflangUrl } from "@/types/seo";

const SITE_URL = "https://chinaconnect.com";

// Default locale
export const DEFAULT_LOCALE: Language = "en";

/**
 * Get all supported locale codes
 */
export function getSupportedLocales(): Language[] {
  return SUPPORTED_LANGUAGES.map((l) => l.code);
}

/**
 * Check if a locale code is RTL
 */
export function isRTL(locale: Language): boolean {
  return RTL_LANGUAGES.includes(locale);
}

/**
 * Get hreflang code for a locale
 */
export function getHreflangCode(locale: Language): string {
  // The code property IS the hreflang value
  return locale;
}

/**
 * Normalize path for hreflang generation
 */
function normalizePath(path: string): string {
  // Remove leading/trailing slashes and locale prefix if present
  let normalized = path.replace(/^\/+|\/+$/g, "");

  // Remove existing locale prefix
  normalized = normalized.replace(/^(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)\//, "");

  return normalized;
}

/**
 * Generate hreflang URLs for a given path
 */
export function generateHreflangUrls(
  path: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  const normalizedPath = normalizePath(path);

  return SUPPORTED_LANGUAGES.map((locale) => {
    const href = buildLocaleUrl(normalizedPath, locale.code, baseUrl);
    return {
      hreflang: locale.code,
      href,
    };
  });
}

/**
 * Build URL for a specific locale
 */
function buildLocaleUrl(
  path: string,
  locale: Language,
  baseUrl: string = SITE_URL,
): string {
  const normalizedPath = path.replace(/^\/|\/$/g, "");
  const cleanPath = normalizedPath ? `/${normalizedPath}` : "";

  if (locale === DEFAULT_LOCALE) {
    // Default locale (English) - no prefix
    return `${baseUrl}${cleanPath}`;
  }

  return `${baseUrl}/${locale}${cleanPath}`;
}

/**
 * Generate self-referencing hreflang (x-default)
 */
export function generateHreflangUrlsWithDefault(
  path: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  const normalizedPath = normalizePath(path);

  const hreflangs: HreflangUrl[] = SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: buildLocaleUrl(normalizedPath, locale.code, baseUrl),
  }));

  // Add x-default (English as default)
  hreflangs.push({
    hreflang: "x-default",
    href: buildLocaleUrl(normalizedPath, DEFAULT_LOCALE, baseUrl),
  });

  return hreflangs;
}

/**
 * Generate hreflang for city pages
 */
export function generateCityHreflangUrls(
  citySlug: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  return SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: `${baseUrl}/${locale.code === DEFAULT_LOCALE ? "" : `${locale.code}/`}city/${citySlug}`,
  }));
}

/**
 * Generate hreflang for restaurant pages
 */
export function generateRestaurantHreflangUrls(
  restaurantId: string,
  citySlug: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  return SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: `${baseUrl}/${locale.code === DEFAULT_LOCALE ? "" : `${locale.code}/`}food/${restaurantId}`,
  }));
}

/**
 * Get canonical URL based on current locale
 */
export function getCanonicalUrl(
  path: string,
  locale: Language = DEFAULT_LOCALE,
): string {
  const normalizedPath = normalizePath(path);
  return buildLocaleUrl(normalizedPath, locale);
}

/**
 * Check if a URL is the canonical version
 */
export function isCanonicalUrl(url: string): boolean {
  // Check if URL contains any of our supported locale prefixes
  const localePattern =
    /\/en\/|\/ja\/|\/ko\/|\/zh-CN\/|\/zh-TW\/|\/th\/|\/vi\/|\/ru\/|\/fr\/|\/de\/|\/ar\/|\/fa\//;
  return !localePattern.test(url);
}

/**
 * Generate alternate link tags for HTML head
 */
export function generateAlternateLinkTags(
  path: string,
  baseUrl: string = SITE_URL,
): string {
  const hreflangs = generateHreflangUrlsWithDefault(path, baseUrl);

  return hreflangs
    .map(({ hreflang, href }) => {
      const escapedHref = href.replace(/"/g, "&quot;");
      return `  <link rel="alternate" hreflang="${hreflang}" href="${escapedHref}" />`;
    })
    .join("\n");
}

/**
 * Get locale from URL path
 */
export function getLocaleFromPath(path: string): Language {
  const match = path.match(
    /^\/(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)(?:\/|$)/,
  );
  return (match?.[1] as Language) || DEFAULT_LOCALE;
}

/**
 * Get path without locale prefix
 */
export function getPathWithoutLocale(path: string): string {
  return path.replace(
    /^\/(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)\//,
    "/",
  );
}

/**
 * Generate hreflang XML for sitemap
 */
export function generateHreflangSitemapXml(
  entries: Array<{
    url: string;
    hreflangs: HreflangUrl[];
  }>,
): string {
  const urlEntries = entries
    .map((entry) => {
      const links = entry.hreflangs
        .map(
          ({ hreflang, href }) =>
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`,
        )
        .join("\n");

      return `  <url>
    <loc>${entry.url}</loc>
${links}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

/**
 * Generate hreflang for a specific page in all languages
 */
export function generatePageHreflangs(
  path: string,
  siteUrl: string = SITE_URL,
): Array<{ hreflang: string; href: string }> {
  const normalizedPath = normalizePath(path);

  return SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: buildLocaleUrl(normalizedPath, locale.code, siteUrl),
  }));
}

/**
 * Get locale metadata
 */
export function getLocaleMetadata(locale: Language): {
  name: string;
  nativeName: string;
  hreflang: string;
  dir: "ltr" | "rtl";
} | undefined {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === locale);
  if (!meta) return undefined;
  return {
    name: meta.name,
    nativeName: meta.nativeName,
    hreflang: meta.code, // code is the hreflang value
    dir: meta.dir,
  };
}

/**
 * Build canonical URL considering current path and locale
 */
export function buildCanonicalUrl(
  pathname: string,
  siteUrl: string = SITE_URL,
): string {
  // Remove any existing locale prefix
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return `${siteUrl}${pathWithoutLocale || "/"}`;
}
