// @ts-nocheck
// Sitemap generator for ChinaConnect
// Supports categorization by city and function, includes Baidu SEO optimization

import type { CityInfo } from "@/types/seo";

const SITE_URL = "https://chinaconnect.xyz";

export interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number; // 0.0 - 1.0
}

export interface SitemapSection {
  name: string;
  entries: SitemapEntry[];
}

// City slugs for sitemap generation
export const SUPPORTED_CITIES: CityInfo[] = [
  {
    slug: "beijing",
    name: "北京",
    nameEn: "Beijing",
    lat: 39.9042,
    lng: 116.4074,
    country: "China",
    countryCode: "CN",
  },
  {
    slug: "shanghai",
    name: "上海",
    nameEn: "Shanghai",
    lat: 31.2304,
    lng: 121.4737,
    country: "China",
    countryCode: "CN",
  },
  {
    slug: "hangzhou",
    name: "杭州",
    nameEn: "Hangzhou",
    lat: 30.2741,
    lng: 120.1551,
    country: "China",
    countryCode: "CN",
  },
  {
    slug: "chengdu",
    name: "成都",
    nameEn: "Chengdu",
    lat: 30.5728,
    lng: 104.0668,
    country: "China",
    countryCode: "CN",
  },
  {
    slug: "guangzhou",
    name: "广州",
    nameEn: "Guangzhou",
    lat: 23.1291,
    lng: 113.2644,
    country: "China",
    countryCode: "CN",
  },
  {
    slug: "xian",
    name: "西安",
    nameEn: "Xi'an",
    lat: 34.3416,
    lng: 108.9398,
    country: "China",
    countryCode: "CN",
  },
];

// Static pages
const STATIC_PAGES: SitemapEntry[] = [
  { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
  { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
  { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/emergency`, changeFrequency: "monthly", priority: 0.7 },
];

// City pages (high priority for local SEO)
const CITY_PAGES: SitemapEntry[] = SUPPORTED_CITIES.map((city) => ({
  url: `${SITE_URL}/${city.slug}`,
  changeFrequency: "daily",
  priority: 0.9,
}));

// Cuisine category pages
const CUISINE_CATEGORIES = ["chinese", "western", "japanese", "southeast-asian", "other"];
const CUISINE_PAGES: SitemapEntry[] = CUISINE_CATEGORIES.map((cuisine) => ({
  url: `${SITE_URL}/cuisine/${cuisine}`,
  changeFrequency: "weekly",
  priority: 0.7,
}));

// Generate sitemap sections
export function buildSitemapSections(): SitemapSection[] {
  return [
    { name: "static", entries: STATIC_PAGES },
    { name: "cities", entries: CITY_PAGES },
    { name: "cuisines", entries: CUISINE_PAGES },
  ];
}

// XML sitemap generator
export function generateSitemapXml(sections: SitemapSection[]): string {
  const now = new Date().toISOString();

  const urlEntries = sections.flatMap((section) => section.entries);

  const urls = urlEntries
    .map((entry) => {
      const lastMod = entry.lastModified
        ? entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified
        : now;

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastMod.split("T")[0]}</lastmod>
    <changefreq>${entry.changeFrequency || "weekly"}</changefreq>
    <priority>${(entry.priority || 0.5).toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

// Baidu-specific sitemap (alternative format)
export function generateBaiduSitemapXml(sections: SitemapSection[]): string {
  const now = new Date().toISOString();

  const urlEntries = sections.flatMap((section) => section.entries);

  const urls = urlEntries
    .map((entry) => {
      const lastMod = entry.lastModified
        ? entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified
        : now;

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastMod.split("T")[0]}</lastmod>
    <changefreq>${entry.changeFrequency || "weekly"}</changefreq>
    <priority>${(entry.priority || 0.5).toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  // Baidu-compatible sitemap (same format, different encoding declaration)
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: ChinaConnect SEO Module -->
<!-- Baidu SEO Sitemap -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Sitemap index for sitemap splitting (future use)
export function generateSitemapIndexXml(
  sitemaps: Array<{ name: string; lastMod: string }>,
): string {
  const entries = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${s.name}.xml</loc>
    <lastmod>${s.lastMod}</lastmod>
  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

// Utility: escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Restaurant sitemap entry builder
export function createRestaurantSitemapEntry(
  restaurantId: string,
  _citySlug: string,
  lastModified?: Date,
): SitemapEntry {
  return {
    url: `${SITE_URL}/food/${restaurantId}`,
    lastModified: lastModified || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  };
}

// Generate all sitemap data
export function generateFullSitemap(): string {
  const sections = buildSitemapSections();
  return generateSitemapXml(sections);
}
