// Hreflang utilities for multi-language SEO
// Uses query parameter approach: ?lang=XX
// This works with static hosting (CF Pages) without server-side routing

import type { Language } from "@/i18n/translations";
import { RTL_LANGUAGES, SUPPORTED_LANGUAGES } from "@/i18n/translations";
import type { HreflangUrl } from "@/types/seo";

const SITE_URL = "https://chinaconnect.pages.dev";

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
  return locale;
}

/**
 * Normalize path — strip query params and trailing slashes
 */
function normalizePath(path: string): string {
  // Remove query string
  const withoutQuery = path.split("?")[0];
  // Remove trailing slashes
  return withoutQuery.replace(/^\/+|\/+$/g, "");
}

/**
 * Build URL for a specific locale using query parameter
 * English (default): https://chinaconnect.pages.dev/city/beijing
 * Other languages: https://chinaconnect.pages.dev/city/beijing?lang=ja
 */
function buildLocaleUrl(path: string, locale: Language, baseUrl: string = SITE_URL): string {
  const cleanPath = normalizePath(path);
  const urlPath = cleanPath ? `/${cleanPath}` : "";

  if (locale === DEFAULT_LOCALE) {
    return `${baseUrl}${urlPath}`;
  }

  return `${baseUrl}${urlPath}?lang=${locale}`;
}

/**
 * Generate hreflang URLs for a given path
 */
export function generateHreflangUrls(path: string, baseUrl: string = SITE_URL): HreflangUrl[] {
  return SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: buildLocaleUrl(path, locale.code, baseUrl),
  }));
}

/**
 * Generate hreflang URLs with x-default
 */
export function generateHreflangUrlsWithDefault(
  path: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  const hreflangs: HreflangUrl[] = SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: buildLocaleUrl(path, locale.code, baseUrl),
  }));

  // Add x-default (English as default)
  hreflangs.push({
    hreflang: "x-default",
    href: buildLocaleUrl(path, DEFAULT_LOCALE, baseUrl),
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
  return generateHreflangUrls(`/city/${citySlug}`, baseUrl);
}

/**
 * Generate hreflang for restaurant pages
 */
export function generateRestaurantHreflangUrls(
  restaurantId: string,
  _citySlug: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  return generateHreflangUrls(`/food/${restaurantId}`, baseUrl);
}

/**
 * Get canonical URL (always without lang param)
 */
export function getCanonicalUrl(path: string, locale: Language = DEFAULT_LOCALE): string {
  const cleanPath = normalizePath(path);
  return `${SITE_URL}${cleanPath ? `/${cleanPath}` : ""}`;
}

/**
 * Check if a URL is the canonical version
 */
export function isCanonicalUrl(url: string): boolean {
  return !url.includes("lang=");
}

/**
 * Generate alternate link tags for HTML head
 */
export function generateAlternateLinkTags(path: string, baseUrl: string = SITE_URL): string {
  const hreflangs = generateHreflangUrlsWithDefault(path, baseUrl);

  return hreflangs
    .map(({ hreflang, href }) => {
      const escapedHref = href.replace(/"/g, "&quot;");
      return `  <link rel="alternate" hreflang="${hreflang}" href="${escapedHref}" />`;
    })
    .join("\n");
}

/**
 * Get locale from URL search params
 */
export function getLocaleFromParams(url: URL): Language {
  const lang = url.searchParams.get("lang");
  if (lang && SUPPORTED_LANGUAGES.some((l) => l.code === lang)) {
    return lang as Language;
  }
  return DEFAULT_LOCALE;
}

/**
 * Get path without locale query param
 */
export function getPathWithoutLocale(path: string): string {
  return path.split("?")[0];
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
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`,
        )
        .join("\n");

      return `  <url>\n    <loc>${entry.url}</loc>\n${links}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate hreflang for a specific page in all languages
 */
export function generatePageHreflangs(
  path: string,
  siteUrl: string = SITE_URL,
): Array<{ hreflang: string; href: string }> {
  return SUPPORTED_LANGUAGES.map((locale) => ({
    hreflang: locale.code,
    href: buildLocaleUrl(path, locale.code, siteUrl),
  }));
}

/**
 * Get locale metadata
 */
export function getLocaleMetadata(locale: Language):
  | {
      name: string;
      nativeName: string;
      hreflang: string;
      dir: "ltr" | "rtl";
    }
  | undefined {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === locale);
  if (!meta) return undefined;
  return {
    name: meta.name,
    nativeName: meta.nativeName,
    hreflang: meta.code,
    dir: meta.dir,
  };
}

/**
 * Build canonical URL considering current path
 */
export function buildCanonicalUrl(pathname: string, siteUrl: string = SITE_URL): string {
  const cleanPath = pathname.split("?")[0].replace(/^\/+|\/+$/g, "");
  return `${siteUrl}${cleanPath ? `/${cleanPath}` : "/"}`;
}
