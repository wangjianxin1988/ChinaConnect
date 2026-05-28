// Unit tests for hreflang library functions

import {
  DEFAULT_LOCALE,
  generateAlternateLinkTags,
  generateCityHreflangUrls,
  generateHreflangSitemapXml,
  generateHreflangUrls,
  generateHreflangUrlsWithDefault,
  generateRestaurantHreflangUrls,
  getCanonicalUrl,
  getLocaleFromPath,
  getPathWithoutLocale,
  isCanonicalUrl,
  getSupportedLocales,
} from "@/lib/hreflang";
import { describe, expect, it } from "vitest";

describe("DEFAULT_LOCALE", () => {
  it("is set to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("getSupportedLocales", () => {
  it("returns array of supported locales", () => {
    const locales = getSupportedLocales();
    expect(Array.isArray(locales)).toBe(true);
    expect(locales.length).toBeGreaterThan(0);
    expect(locales).toContain("en");
    expect(locales).toContain("zh-CN");
  });
});

describe("generateHreflangUrls", () => {
  it("generates hreflang URLs for all supported locales", () => {
    const urls = generateHreflangUrls("/beijing");

    expect(urls.length).toBeGreaterThan(0);
    expect(urls.some((u) => u.hreflang === "en")).toBe(true);
    expect(urls.some((u) => u.hreflang === "zh-CN")).toBe(true);
  });

  it("uses correct URL format - no prefix for default locale", () => {
    const urls = generateHreflangUrls("/beijing");

    const enUrl = urls.find((u) => u.hreflang === "en");
    // Default locale (en) has no prefix
    expect(enUrl?.href).toBe("https://chinaconnect.com/beijing");

    const zhUrl = urls.find((u) => u.hreflang === "zh-CN");
    expect(zhUrl?.href).toBe("https://chinaconnect.com/zh-CN/beijing");
  });

  it("handles paths with leading/trailing slashes", () => {
    const urls = generateHreflangUrls("///beijing///");

    const enUrl = urls.find((u) => u.hreflang === "en");
    expect(enUrl?.href).toBe("https://chinaconnect.com/beijing");
  });
});

describe("generateHreflangUrlsWithDefault", () => {
  it("adds x-default hreflang", () => {
    const urls = generateHreflangUrlsWithDefault("/beijing");
    const xDefault = urls.find((u) => u.hreflang === "x-default");

    expect(xDefault).toBeDefined();
    expect(xDefault?.href).toBe("https://chinaconnect.com/beijing");
  });
});

describe("generateCityHreflangUrls", () => {
  it("generates correct URLs for city pages", () => {
    const urls = generateCityHreflangUrls("beijing");

    const enUrl = urls.find((u) => u.hreflang === "en");
    // English (default locale) has no /en/ prefix
    expect(enUrl?.href).toBe("https://chinaconnect.com/city/beijing");

    const zhUrl = urls.find((u) => u.hreflang === "zh-CN");
    expect(zhUrl?.href).toBe("https://chinaconnect.com/zh-CN/city/beijing");
  });
});

describe("generateRestaurantHreflangUrls", () => {
  it("generates correct URLs for restaurant pages", () => {
    const urls = generateRestaurantHreflangUrls("rest-123", "beijing");

    const enUrl = urls.find((u) => u.hreflang === "en");
    // English (default locale) has no /en/ prefix
    expect(enUrl?.href).toBe("https://chinaconnect.com/food/rest-123");

    const zhUrl = urls.find((u) => u.hreflang === "zh-CN");
    expect(zhUrl?.href).toBe("https://chinaconnect.com/zh-CN/food/rest-123");
  });
});

describe("getCanonicalUrl", () => {
  it("returns URL without locale prefix for default locale", () => {
    const canonical = getCanonicalUrl("/beijing", "en");
    expect(canonical).toBe("https://chinaconnect.com/beijing");
  });

  it("includes locale in URL for non-default locale", () => {
    const canonical = getCanonicalUrl("/beijing", "zh-CN");
    expect(canonical).toBe("https://chinaconnect.com/zh-CN/beijing");
  });
});

describe("isCanonicalUrl", () => {
  it("identifies canonical URLs", () => {
    expect(isCanonicalUrl("https://chinaconnect.com/beijing")).toBe(true);
    expect(isCanonicalUrl("https://chinaconnect.com/")).toBe(true);
  });

  it("identifies non-canonical URLs", () => {
    expect(isCanonicalUrl("https://chinaconnect.com/en/beijing")).toBe(false);
    expect(isCanonicalUrl("https://chinaconnect.com/zh-CN/beijing")).toBe(false);
  });
});

describe("getLocaleFromPath", () => {
  it("extracts locale from path", () => {
    expect(getLocaleFromPath("/en/beijing")).toBe("en");
    expect(getLocaleFromPath("/zh-CN/beijing")).toBe("zh-CN");
  });

  it("returns default locale for paths without locale prefix", () => {
    expect(getLocaleFromPath("/beijing")).toBe("en");
    expect(getLocaleFromPath("/")).toBe("en");
  });
});

describe("getPathWithoutLocale", () => {
  it("removes locale prefix from path", () => {
    expect(getPathWithoutLocale("/en/beijing")).toBe("/beijing");
    expect(getPathWithoutLocale("/zh-CN/shanghai")).toBe("/shanghai");
  });

  it("returns path unchanged if no locale prefix", () => {
    expect(getPathWithoutLocale("/beijing")).toBe("/beijing");
  });
});

describe("generateAlternateLinkTags", () => {
  it("generates valid HTML link tags", () => {
    const tags = generateAlternateLinkTags("/beijing");

    expect(tags).toContain('<link rel="alternate"');
    expect(tags).toContain('hreflang="en"');
    expect(tags).toContain('hreflang="zh-CN"');
    expect(tags).toContain('hreflang="x-default"');
  });
});

describe("generateHreflangSitemapXml", () => {
  it("generates valid XML with xhtml links", () => {
    const entries = [
      {
        url: "https://chinaconnect.com/beijing",
        hreflangs: generateHreflangUrls("/beijing"),
      },
    ];
    const xml = generateHreflangSitemapXml(entries);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("xhtml:link");
  });
});
