// SEO Meta Tags Component
// Handles Open Graph, Twitter Card, and meta tags for all pages

import type { Language } from "@/i18n/translations";
import { SUPPORTED_LANGUAGES } from "@/i18n/translations";

export interface SEOMetaProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article" | "product" | "restaurant" | "city";
  ogSiteName?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  twitterCreator?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  keywords?: string[];
  schema?: Record<string, unknown> | Record<string, unknown>[];
  currentLanguage?: Language;
  alternateUrls?: Array<{ hreflang: string; href: string }>;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SITE_URL = "https://chinaconnect.com";
const DEFAULT_SITE_NAME = "ChinaConnect";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_TWITTER_SITE = "@chinaconnect";

export function SEOMeta({
  title,
  description,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  ogType = "website",
  ogSiteName = DEFAULT_SITE_NAME,
  twitterCard = "summary_large_image",
  twitterSite = DEFAULT_TWITTER_SITE,
  twitterCreator,
  noIndex = false,
  noFollow = false,
  keywords = [],
  schema,
  currentLanguage = "en",
  alternateUrls = [],
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOMetaProps) {
  // Build robots directive
  const robotsDirectives: string[] = [];
  if (noIndex) {
    robotsDirectives.push("noindex");
  } else {
    robotsDirectives.push("index");
  }
  if (noFollow) {
    robotsDirectives.push("nofollow");
  } else {
    robotsDirectives.push("follow");
  }

  // Generate all hreflang URLs
  const hreflangTags = generateHreflangTags(canonicalUrl, currentLanguage, alternateUrls);

  // Generate JSON-LD script
  const schemaScript = schema ? generateSchemaScript(schema) : null;

  return {
    // Basic meta tags
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    canonical: canonicalUrl,
    robots: robotsDirectives.join(", "),

    // Open Graph
    og: {
      type: ogType,
      url: canonicalUrl,
      title,
      description,
      image: ogImage,
      imageAlt: ogImageAlt || title,
      siteName: ogSiteName,
      locale: mapLanguageToOpenGraphLocale(currentLanguage),
      localeAlternate: SUPPORTED_LANGUAGES.filter((l) => l.code !== currentLanguage)
        .slice(0, 5)
        .map((l) => mapLanguageToOpenGraphLocale(l.code)),
    },

    // Twitter Card
    twitter: {
      card: twitterCard,
      site: twitterSite,
      creator: twitterCreator,
      title,
      description,
      image: ogImage,
      imageAlt: ogImageAlt || title,
      url: canonicalUrl,
    },

    // Article-specific meta
    article:
      ogType === "article"
        ? {
            publishedTime,
            modifiedTime,
            author,
            section,
            tags,
          }
        : undefined,

    // Hreflang tags
    hreflangs: hreflangTags,

    // Schema.org JSON-LD
    schema: schemaScript,
  };
}

/**
 * Generate hreflang tags for all supported languages
 */
function generateHreflangTags(
  currentUrl: string,
  currentLang: Language,
  explicitAlternates: Array<{ hreflang: string; href: string }>,
): Array<{ hreflang: string; href: string; isXDefault: boolean }> {
  // If explicit alternates provided, use those
  if (explicitAlternates.length > 0) {
    return explicitAlternates.map((alt) => ({
      ...alt,
      isXDefault: alt.hreflang === "x-default",
    }));
  }

  // Generate hreflangs based on current URL
  const pathname = new URL(currentUrl).pathname;

  // Get language code from URL path or default to currentLang
  const pathLangMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\//);
  const pathLang = pathLangMatch ? (pathLangMatch[1] as Language) : currentLang;

  // Remove existing language prefix from path
  const cleanPath = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?\//, "/");

  const hreflangs: Array<{ hreflang: string; href: string; isXDefault: boolean }> = [];

  // Generate for all supported languages
  for (const lang of SUPPORTED_LANGUAGES) {
    const _isCurrentLang = lang.code === pathLang;
    const isXDefault = lang.code === "en";

    // Build URL for this language
    let href: string;
    if (lang.code === "en") {
      // English is default (no prefix)
      href = `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
    } else {
      href = `${SITE_URL}/${lang.code}${cleanPath === "/" ? "" : cleanPath}`;
    }

    hreflangs.push({
      hreflang: lang.code,
      href,
      isXDefault,
    });
  }

  // Add x-default pointing to English version
  hreflangs.push({
    hreflang: "x-default",
    href: `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`,
    isXDefault: true,
  });

  return hreflangs;
}

/**
 * Map our language code to Open Graph locale
 */
function mapLanguageToOpenGraphLocale(lang: Language): string {
  const localeMap: Record<Language, string> = {
    en: "en_US",
    ja: "ja_JP",
    ko: "ko_KR",
    "zh-CN": "zh_CN",
    "zh-TW": "zh_TW",
    th: "th_TH",
    vi: "vi_VN",
    ru: "ru_RU",
    fr: "fr_FR",
    de: "de_DE",
    ar: "ar_AR",
    fa: "fa_IR",
  };
  return localeMap[lang] || "en_US";
}

/**
 * Generate JSON-LD script tag
 */
function generateSchemaScript(schema: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(schema);
}

/**
 * Generate complete SEO head tags as HTML string
 */
export function generateSEOHeadHtml(props: SEOMetaProps): string {
  const seo = SEOMeta(props);

  const lines: string[] = [];

  // Basic meta
  lines.push(`<title>${escapeHtml(seo.title)}</title>`);
  lines.push(`<meta name="description" content="${escapeHtml(seo.description)}">`);
  if (seo.keywords) {
    lines.push(`<meta name="keywords" content="${escapeHtml(seo.keywords)}">`);
  }
  lines.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}">`);
  lines.push(`<meta name="robots" content="${seo.robots}">`);

  // Open Graph
  lines.push(`<meta property="og:type" content="${seo.og.type}">`);
  lines.push(`<meta property="og:url" content="${escapeHtml(seo.og.url)}">`);
  lines.push(`<meta property="og:title" content="${escapeHtml(seo.og.title)}">`);
  lines.push(`<meta property="og:description" content="${escapeHtml(seo.og.description)}">`);
  lines.push(`<meta property="og:image" content="${escapeHtml(seo.og.image)}">`);
  lines.push(`<meta property="og:image:alt" content="${escapeHtml(seo.og.imageAlt)}">`);
  lines.push(`<meta property="og:image:width" content="1200">`);
  lines.push(`<meta property="og:image:height" content="630">`);
  lines.push(`<meta property="og:site_name" content="${escapeHtml(seo.og.siteName)}">`);
  lines.push(`<meta property="og:locale" content="${seo.og.locale}">`);

  for (const altLocale of seo.og.localeAlternate) {
    lines.push(`<meta property="og:locale:alternate" content="${altLocale}">`);
  }

  // Twitter Card
  lines.push(`<meta name="twitter:card" content="${seo.twitter.card}">`);
  lines.push(`<meta name="twitter:site" content="${escapeHtml(seo.twitter.site)}">`);
  if (seo.twitter.creator) {
    lines.push(`<meta name="twitter:creator" content="${escapeHtml(seo.twitter.creator)}">`);
  }
  lines.push(`<meta name="twitter:title" content="${escapeHtml(seo.twitter.title)}">`);
  lines.push(`<meta name="twitter:description" content="${escapeHtml(seo.twitter.description)}">`);
  lines.push(`<meta name="twitter:image" content="${escapeHtml(seo.twitter.image)}">`);
  lines.push(`<meta name="twitter:image:alt" content="${escapeHtml(seo.twitter.imageAlt)}">`);

  // Article meta
  if (seo.article) {
    if (seo.article.publishedTime) {
      lines.push(`<meta property="article:published_time" content="${seo.article.publishedTime}">`);
    }
    if (seo.article.modifiedTime) {
      lines.push(`<meta property="article:modified_time" content="${seo.article.modifiedTime}">`);
    }
    if (seo.article.author) {
      lines.push(`<meta property="article:author" content="${escapeHtml(seo.article.author)}">`);
    }
    if (seo.article.section) {
      lines.push(`<meta property="article:section" content="${escapeHtml(seo.article.section)}">`);
    }
    for (const tag of seo.article.tags) {
      lines.push(`<meta property="article:tag" content="${escapeHtml(tag)}">`);
    }
  }

  // Hreflang tags
  for (const hreflang of seo.hreflangs) {
    lines.push(
      `<link rel="alternate" hreflang="${hreflang.hreflang}" href="${escapeHtml(hreflang.href)}">`,
    );
  }

  // JSON-LD Schema
  if (seo.schema) {
    lines.push(`<script type="application/ld+json">${seo.schema}</script>`);
  }

  return lines.join("\n");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate hreflang for a specific page in all languages
 */
export function generatePageHreflangs(
  path: string,
  siteUrl: string = SITE_URL,
): Array<{ hreflang: string; href: string }> {
  const cleanPath = path.replace(/^\//, "").replace(/\/$/, "");
  const normalizedPath = cleanPath ? `/${cleanPath}` : "";

  return SUPPORTED_LANGUAGES.map((lang) => {
    const href =
      lang.code === "en"
        ? `${siteUrl}${normalizedPath}`
        : `${siteUrl}/${lang.code}${normalizedPath}`;

    return {
      hreflang: lang.code,
      href,
    };
  });
}
