// @ts-nocheck
// Dynamic XML Sitemap Generator
// Generates sitemaps for all pages with hreflang support

import { SUPPORTED_LANGUAGES } from "@/i18n/translations";
import type { APIRoute } from "astro";

const SITE_URL = "https://chinaconnect.com";

// ============================================================================
// City Data (inline to avoid import issues in static generation)
// ============================================================================

interface CityData {
  slug: string;
  name: string;
  nameEn: string;
}

const CITIES: CityData[] = [
  { slug: "beijing", name: "鍖椾含", nameEn: "Beijing" },
  { slug: "shanghai", name: "涓婃捣", nameEn: "Shanghai" },
  { slug: "hangzhou", name: "鏉窞", nameEn: "Hangzhou" },
  { slug: "chengdu", name: "鎴愰兘", nameEn: "Chengdu" },
  { slug: "guangzhou", name: "骞垮窞", nameEn: "Guangzhou" },
  { slug: "xian", name: "瑗垮畨", nameEn: "Xi'an" },
  { slug: "shenzhen", name: "娣卞湷", nameEn: "Shenzhen" },
  { slug: "nanjing", name: "鍗椾含", nameEn: "Nanjing" },
  { slug: "suzhou", name: "鑻忓窞", nameEn: "Suzhou" },
  { slug: "chongqing", name: "閲嶅簡", nameEn: "Chongqing" },
  { slug: "tianjin", name: "澶╂触", nameEn: "Tianjin" },
  { slug: "wuhan", name: "姝︽眽", nameEn: "Wuhan" },
];

// ============================================================================
// Sitemap Entry Types
// ============================================================================

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  hreflangs?: Array<{ hreflang: string; href: string }>;
}

interface SitemapImage {
  loc: string;
  caption?: string;
  title?: string;
}

// ============================================================================
// Static Pages
// ============================================================================

const STATIC_PAGES: Array<{
  url: string;
  priority: number;
  changefreq: string;
  lastmod?: string;
}> = [
  { url: "/", priority: 1.0, changefreq: "daily", lastmod: getTodayDate() },
  { url: "/ai", priority: 0.9, changefreq: "daily" },
  { url: "/food", priority: 0.9, changefreq: "daily" },
  { url: "/cities", priority: 0.9, changefreq: "weekly" },
  { url: "/emergency", priority: 0.8, changefreq: "monthly" },
  { url: "/guide", priority: 0.8, changefreq: "weekly" },
  { url: "/guide/attractions", priority: 0.7, changefreq: "weekly" },
  { url: "/guide/accommodation", priority: 0.7, changefreq: "weekly" },
  { url: "/guide/translation", priority: 0.6, changefreq: "monthly" },
  { url: "/guide/transport", priority: 0.7, changefreq: "weekly" },
  { url: "/guide/payment", priority: 0.7, changefreq: "monthly" },
  { url: "/guide/dining", priority: 0.7, changefreq: "weekly" },
  { url: "/guide/departure", priority: 0.6, changefreq: "monthly" },
  { url: "/guide/emergency-procedures", priority: 0.6, changefreq: "monthly" },
  { url: "/guide/visa", priority: 0.6, changefreq: "monthly" },
  { url: "/guide/business", priority: 0.5, changefreq: "monthly" },
  { url: "/guide/cultural-warnings", priority: 0.6, changefreq: "monthly" },
  { url: "/guide/scam-prevention", priority: 0.6, changefreq: "monthly" },
  { url: "/guide/transparency", priority: 0.5, changefreq: "monthly" },
  { url: "/guide/communication", priority: 0.5, changefreq: "monthly" },
  { url: "/auth", priority: 0.5, changefreq: "monthly" },
];

// ============================================================================
// Cuisine Categories
// ============================================================================

const CUISINE_CATEGORIES = ["chinese", "western", "japanese", "korean", "southeast-asian", "other"];

// ============================================================================
// Helper Functions
// ============================================================================

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
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
 * Generate hreflang URLs for a path (using query parameters)
 * English: https://chinaconnect.com/city/beijing
 * Japanese: https://chinaconnect.com/city/beijing?lang=ja
 */
function generateHreflangUrls(path: string): Array<{ hreflang: string; href: string }> {
  const cleanPath = path.replace(/^\/+|\/+$/g, "").split("?")[0].split("#")[0];
  const urlBase = cleanPath ? `${SITE_URL}/${cleanPath}` : SITE_URL;

  return SUPPORTED_LANGUAGES.map((lang) => ({
    hreflang: lang.code,
    href: lang.code === "en" ? urlBase : `${urlBase}?lang=${lang.code}`,
  }));
}

/**
 * Build a sitemap URL entry with all hreflangs
 */
function buildSitemapUrl(
  path: string,
  options: {
    priority?: number;
    changefreq?: string;
    lastmod?: string;
    images?: SitemapImage[];
  } = {},
): SitemapUrl {
  const { priority = 0.5, changefreq = "weekly", lastmod } = options;

  const cleanPath = path.replace(/^\/|\/$/g, "");
  const loc = `${SITE_URL}/${cleanPath}`;
  const hreflangs = generateHreflangUrls(path);

  return {
    loc,
    lastmod,
    changefreq,
    priority,
    hreflangs,
  };
}

// ============================================================================
// Sitemap Generation
// ============================================================================

function generateSitemapUrls(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    urls.push(
      buildSitemapUrl(page.url, {
        priority: page.priority,
        changefreq: page.changefreq,
        lastmod: page.lastmod,
      }),
    );
  }

  // City pages (high priority)
  for (const city of CITIES) {
    urls.push(
      buildSitemapUrl(`/city/${city.slug}`, {
        priority: 0.9,
        changefreq: "daily",
      }),
    );

    // City-specific guide pages
    urls.push(
      buildSitemapUrl(`/city/${city.slug}#food`, {
        priority: 0.8,
        changefreq: "daily",
      }),
    );
    urls.push(
      buildSitemapUrl(`/city/${city.slug}#attractions`, {
        priority: 0.8,
        changefreq: "weekly",
      }),
    );
    urls.push(
      buildSitemapUrl(`/city/${city.slug}#transport`, {
        priority: 0.7,
        changefreq: "weekly",
      }),
    );
    urls.push(
      buildSitemapUrl(`/city/${city.slug}#accommodation`, {
        priority: 0.7,
        changefreq: "weekly",
      }),
    );
    urls.push(
      buildSitemapUrl(`/city/${city.slug}#emergency`, {
        priority: 0.8,
        changefreq: "monthly",
      }),
    );
  }

  // Cuisine category pages
  for (const cuisine of CUISINE_CATEGORIES) {
    urls.push(
      buildSitemapUrl(`/food?cuisine=${cuisine}`, {
        priority: 0.7,
        changefreq: "weekly",
      }),
    );
  }

  return urls;
}

/**
 * Generate XML for a single URL entry with hreflangs
 */
function urlToXml(url: SitemapUrl): string {
  const lines: string[] = ["  <url>"];
  lines.push(`    <loc>${escapeXml(url.loc)}</loc>`);

  if (url.lastmod) {
    lines.push(`    <lastmod>${url.lastmod}</lastmod>`);
  }

  if (url.changefreq) {
    lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
  }

  if (url.priority !== undefined) {
    lines.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
  }

  // Add hreflang alternatives
  if (url.hreflangs) {
    for (const hl of url.hreflangs) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${hl.hreflang}" href="${escapeXml(hl.href)}" />`,
      );
    }
  }

  lines.push("  </url>");

  return lines.join("\n");
}

/**
 * Generate the complete sitemap XML
 */
function generateSitemapXml(): string {
  const urls = generateSitemapUrls();

  const urlEntries = urls.map(urlToXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:geo="http://www.google.com/geo/鎺ㄧ壒"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap index for multiple sitemaps
 * Note: This function is available for future sitemap index implementation
 */
function _generateSitemapIndexXml(): string {
  const today = getTodayDate();

  const sitemaps = [
    { name: "sitemap.xml", lastmod: today },
    { name: "sitemap-cities.xml", lastmod: today },
    { name: "sitemap-food.xml", lastmod: today },
  ];

  const entries = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${SITE_URL}/${s.name}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

/**
 * Generate city-specific sitemap
 */
function generateCitySitemapXml(): string {
  const urls = CITIES.map((city) =>
    buildSitemapUrl(`/city/${city.slug}`, {
      priority: 0.9,
      changefreq: "daily",
    }),
  );

  const urlEntries = urls.map(urlToXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries}
</urlset>`;
}

/**
 * Generate food-specific sitemap
 */
function generateFoodSitemapXml(): string {
  const urls: SitemapUrl[] = [];

  // Food listing pages
  urls.push(
    buildSitemapUrl("/food", {
      priority: 0.9,
      changefreq: "daily",
    }),
  );

  // Cuisine categories
  for (const cuisine of CUISINE_CATEGORIES) {
    urls.push(
      buildSitemapUrl(`/food?cuisine=${cuisine}`, {
        priority: 0.7,
        changefreq: "weekly",
      }),
    );
  }

  const urlEntries = urls.map(urlToXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlEntries}
</urlset>`;
}

// ============================================================================
// API Routes
// ============================================================================

export const GET: APIRoute = ({ url }) => {
  const path = url.pathname;

  let xml: string;
  const contentType = "application/xml";

  if (path === "/sitemap.xml" || path === "/sitemap-index.xml") {
    xml = generateSitemapXml();
  } else if (path === "/sitemap-cities.xml") {
    xml = generateCitySitemapXml();
  } else if (path === "/sitemap-food.xml") {
    xml = generateFoodSitemapXml();
  } else {
    // Return 404 for unknown sitemaps
    return new Response("Not Found", { status: 404 });
  }

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
};

// ============================================================================
// Robots.txt Helper
// ============================================================================

export function getSitemapUrl(): string {
  return `${SITE_URL}/sitemap.xml`;
}

