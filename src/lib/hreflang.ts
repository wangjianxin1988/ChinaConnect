// Hreflang utilities for multi-language SEO
// Generates alternate URL links for different language versions

import type { HreflangUrl } from "@/types/seo";

const SITE_URL = "https://chinaconnect.com";

// Supported locales
export const SUPPORTED_LOCALES = ["en", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// Default locale
export const DEFAULT_LOCALE: Locale = "en";

// Locale metadata
export const LOCALE_META: Record<
  Locale,
  { name: string; hreflang: string; alternateName: string }
> = {
  en: { name: "English", hreflang: "en", alternateName: "英文" },
  zh: { name: "中文", hreflang: "zh-CN", alternateName: "中文" },
};

// Generate hreflang URLs for a given path
export function generateHreflangUrls(path: string, baseUrl: string = SITE_URL): HreflangUrl[] {
  // Normalize path (remove leading/trailing slashes)
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  return SUPPORTED_LOCALES.map((locale) => {
    // For English (default locale), use path without locale prefix
    const href =
      locale === DEFAULT_LOCALE
        ? `${baseUrl}/${normalizedPath}`
        : `${baseUrl}/${locale}/${normalizedPath}`;

    return {
      hreflang: LOCALE_META[locale].hreflang,
      href,
    };
  });
}

// Generate self-referencing hreflang (x-default)
export function generateHreflangUrlsWithDefault(
  path: string,
  baseUrl: string = SITE_URL,
): HreflangUrl[] {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  const hreflangs: HreflangUrl[] = SUPPORTED_LOCALES.map((locale) => {
    const href =
      locale === DEFAULT_LOCALE
        ? `${baseUrl}/${normalizedPath}`
        : `${baseUrl}/${locale}/${normalizedPath}`;

    return {
      hreflang: LOCALE_META[locale].hreflang,
      href,
    };
  });

  // Add x-default (English as default)
  hreflangs.push({
    hreflang: "x-default",
    href: `${baseUrl}/${normalizedPath}`,
  });

  return hreflangs;
}

// Generate hreflang for city pages
export function generateCityHreflangUrls(citySlug: string): HreflangUrl[] {
  return SUPPORTED_LOCALES.map((locale) => ({
    hreflang: LOCALE_META[locale].hreflang,
    href: `${SITE_URL}/${locale}/city/${citySlug}`,
  }));
}

// Generate hreflang for restaurant pages
export function generateRestaurantHreflangUrls(
  restaurantId: string,
  citySlug: string,
): HreflangUrl[] {
  return SUPPORTED_LOCALES.map((locale) => ({
    hreflang: LOCALE_META[locale].hreflang,
    href: `${SITE_URL}/${locale}/food/${restaurantId}`,
  }));
}

// Get canonical URL based on current locale
export function getCanonicalUrl(path: string, locale: Locale = DEFAULT_LOCALE): string {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  if (locale === DEFAULT_LOCALE) {
    return `${SITE_URL}/${normalizedPath}`;
  }

  return `${SITE_URL}/${locale}/${normalizedPath}`;
}

// Check if a URL is the canonical version
export function isCanonicalUrl(url: string): boolean {
  // Canonical URLs don't include language prefix (for default locale)
  return !url.match(/\/(en|zh)\//);
}

// Generate alternate link tags for HTML head
export function generateAlternateLinkTags(path: string, baseUrl: string = SITE_URL): string {
  const hreflangs = generateHreflangUrlsWithDefault(path, baseUrl);

  return hreflangs
    .map(({ hreflang, href }) => `  <link rel="alternate" hreflang="${hreflang}" href="${href}" />`)
    .join("\n");
}

// Get locale from URL path
export function getLocaleFromPath(path: string): Locale {
  const match = path.match(/^\/(en|zh)\//);
  return (match?.[1] as Locale) || DEFAULT_LOCALE;
}

// Get path without locale prefix
export function getPathWithoutLocale(path: string): string {
  return path.replace(/^\/(en|zh)\//, "/").replace(/^\/(en|zh)$/, "");
}

// Generate hreflang XML for sitemap
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
