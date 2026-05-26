// Unit tests for sitemap library functions

import {
  SUPPORTED_CITIES,
  buildSitemapSections,
  createRestaurantSitemapEntry,
  generateBaiduSitemapXml,
  generateFullSitemap,
  generateSitemapIndexXml,
  generateSitemapXml,
} from "@/lib/sitemap";
import { describe, expect, it } from "vitest";

describe("SITE_URL constant", () => {
  it("uses correct site URL", () => {
    // The sitemap should use https://chinaconnect.com
    const sitemap = generateFullSitemap();
    expect(sitemap).toContain("https://chinaconnect.com");
  });
});

describe("SUPPORTED_CITIES", () => {
  it("contains all required cities", () => {
    const expectedCities = ["beijing", "shanghai", "hangzhou", "chengdu", "guangzhou", "xian"];
    const slugs = SUPPORTED_CITIES.map((c) => c.slug);

    expectedCities.forEach((city) => {
      expect(slugs).toContain(city);
    });
  });

  it("has valid coordinates for each city", () => {
    SUPPORTED_CITIES.forEach((city) => {
      expect(city.lat).toBeGreaterThan(0);
      expect(city.lng).toBeGreaterThan(0);
      expect(city.countryCode).toBe("CN");
    });
  });
});

describe("buildSitemapSections", () => {
  it("returns all required sections", () => {
    const sections = buildSitemapSections();
    const sectionNames = sections.map((s) => s.name);

    expect(sectionNames).toContain("static");
    expect(sectionNames).toContain("cities");
    expect(sectionNames).toContain("cuisines");
  });

  it("has correct number of entries per section", () => {
    const sections = buildSitemapSections();

    const staticSection = sections.find((s) => s.name === "static");
    expect(staticSection?.entries.length).toBeGreaterThan(0);

    const citySection = sections.find((s) => s.name === "cities");
    expect(citySection?.entries.length).toBe(SUPPORTED_CITIES.length);
  });
});

describe("generateSitemapXml", () => {
  it("generates valid XML with urlset namespace", () => {
    const sections = buildSitemapSections();
    const xml = generateSitemapXml(sections);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain("<loc>");
    expect(xml).toContain("</loc>");
  });

  it("includes changefreq and priority tags", () => {
    const sections = buildSitemapSections();
    const xml = generateSitemapXml(sections);

    expect(xml).toContain("<changefreq>");
    expect(xml).toContain("<priority>");
  });

  it("escapes special XML characters", () => {
    const sections = [
      {
        name: "test",
        entries: [{ url: "https://chinaconnect.com/food/1?param=test&value=1", priority: 0.8 }],
      },
    ];
    const xml = generateSitemapXml(sections);

    expect(xml).toContain("&amp;");
    expect(xml).not.toContain("&param=");
  });
});

describe("generateBaiduSitemapXml", () => {
  it("generates valid XML for Baidu", () => {
    const sections = buildSitemapSections();
    const xml = generateBaiduSitemapXml(sections);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<!-- Baidu SEO Sitemap -->");
  });
});

describe("createRestaurantSitemapEntry", () => {
  it("generates correct sitemap entry", () => {
    const entry = createRestaurantSitemapEntry("rest-123", "beijing");

    expect(entry.url).toBe("https://chinaconnect.com/food/rest-123");
    expect(entry.changeFrequency).toBe("weekly");
    expect(entry.priority).toBe(0.8);
  });

  it("respects custom lastModified date", () => {
    const customDate = new Date("2026-01-01");
    const entry = createRestaurantSitemapEntry("rest-456", "shanghai", customDate);

    expect(entry.lastModified).toEqual(customDate);
  });
});

describe("generateSitemapIndexXml", () => {
  it("generates valid sitemap index", () => {
    const sitemaps = [
      { name: "static", lastMod: "2026-01-01" },
      { name: "cities", lastMod: "2026-01-02" },
    ];

    const xml = generateSitemapIndexXml(sitemaps);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<sitemap>");
  });

  it("includes all sitemap URLs", () => {
    const sitemaps = [
      { name: "static", lastMod: "2026-01-01" },
      { name: "restaurants", lastMod: "2026-01-02" },
    ];

    const xml = generateSitemapIndexXml(sitemaps);

    expect(xml).toContain("sitemap-static.xml");
    expect(xml).toContain("sitemap-restaurants.xml");
  });
});

describe("generateFullSitemap", () => {
  it("generates complete sitemap with all sections", () => {
    const sitemap = generateFullSitemap();

    // Should contain entries from all sections
    expect(sitemap).toContain("chinaconnect.com");
    expect(sitemap).toContain("<url>");
    expect(sitemap).toContain("</url>");
  });
});
