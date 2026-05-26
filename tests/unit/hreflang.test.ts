// Unit tests for hreflang library functions

import {
  DEFAULT_LOCALE,
  LOCALE_META,
  SUPPORTED_LOCALES,
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
} from "@/lib/hreflang";
import { describe, expect, it } from "vitest";

describe("SUPPORTED_LOCALES", () => {
  it("contains en and zh locales", () => {
    expect(SUPPORTED_LOCALES).toContain("en");
    expect(SUPPORTED_LOCALES).toContain("zh");
  });
});

describe("LOCALE_META", () => {
  it("has correct hreflang values", () => {
    expect(LOCALE_META.en.hreflang).toBe("en");
    expect(LOCALE_META.zh.hreflang).toBe("zh-CN");
  });

  it("has display names for both locales", () => {
    expect(LOCALE_META.en.name).toBe("English");
    expect(LOCALE_META.zh.name).toBe("中文");
  });
});

describe("DEFAULT_LOCALE", () => {
  it("is set to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("generateHreflangUrls", () => {
  it("generates hreflang URLs for all supported locales", () => {
    const urls = generateHreflangUrls("/beijing");

    expect(urls).toHaveLength(SUPPORTED_LOCALES.length);
    expect(urls.some((u) => u.hreflang === "en")).toBe(true);
    expect(urls.some((u) => u.hreflang === "zh-CN")).toBe(true);
  });

  it("uses correct URL format", () => {
    const urls = generateHreflangUrls("/beijing");

    const enUrl = urls.find((u) => u.hreflang === "en");
    expect(enUrl?.href).toBe("https://chinaconnect.com/beijing");

    const zhUrl = urls.find((u) => u.hreflang === "zh-CN");
    expect(zhUrl?.href).toBe("https://chinaconnect.com/zh/beijing");
  });

  it("handles paths with leading/trailing slashes", () => {
    const urls = generateHreflangUrls("///beijing///");

    expect(urls).toHaveLength(2);
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

  it("includes all locales plus x-default", () => {
    const urls = generateHreflangUrlsWithDefault("/shanghai");

    expect(urls).toHaveLength(SUPPORTED_LOCALES.length + 1); // +1 for x-default
  });
});

describe("generateCityHreflangUrls", () => {
  it("generates correct URLs for city pages", () => {
    const urls = generateCityHreflangUrls("beijing");

    const enUrl = urls.find((u) => u.hreflang === "en");
    expect(enUrl?.href).toBe("https://chinaconnect.com/en/city/beijing");

    const zhUrl = urls.find((u) => u.hreflang === "zh-CN");
    expect(zhUrl?.href).toBe("https://chinaconnect.com/zh/city/beijing");
  });
});

describe("generateRestaurantHreflangUrls", () => {
  it("generates correct URLs for restaurant pages", () => {
    const urls = generateRestaurantHreflangUrls("rest-123", "beijing");

    const enUrl = urls.find((u) => u.hreflang === "en");
    expect(enUrl?.href).toBe("https://chinaconnect.com/en/food/rest-123");

    const zhUrl = urls.find((u) => u.hreflang === "zh-CN");
    expect(zhUrl?.href).toBe("https://chinaconnect.com/zh/food/rest-123");
  });
});

describe("getCanonicalUrl", () => {
  it("returns URL without locale prefix for default locale", () => {
    const canonical = getCanonicalUrl("/beijing", "en");
    expect(canonical).toBe("https://chinaconnect.com/beijing");
  });

  it("includes locale in URL for non-default locale", () => {
    const canonical = getCanonicalUrl("/beijing", "zh");
    expect(canonical).toBe("https://chinaconnect.com/zh/beijing");
  });
});

describe("isCanonicalUrl", () => {
  it("identifies canonical URLs", () => {
    expect(isCanonicalUrl("https://chinaconnect.com/beijing")).toBe(true);
    expect(isCanonicalUrl("https://chinaconnect.com/")).toBe(true);
  });

  it("identifies non-canonical URLs", () => {
    expect(isCanonicalUrl("https://chinaconnect.com/en/beijing")).toBe(false);
    expect(isCanonicalUrl("https://chinaconnect.com/zh/beijing")).toBe(false);
  });
});

describe("getLocaleFromPath", () => {
  it("extracts locale from path", () => {
    expect(getLocaleFromPath("/en/beijing")).toBe("en");
    expect(getLocaleFromPath("/zh/beijing")).toBe("zh");
  });

  it("returns default locale for paths without locale prefix", () => {
    expect(getLocaleFromPath("/beijing")).toBe("en");
    expect(getLocaleFromPath("/")).toBe("en");
  });
});

describe("getPathWithoutLocale", () => {
  it("removes locale prefix from path", () => {
    expect(getPathWithoutLocale("/en/beijing")).toBe("/beijing");
    expect(getPathWithoutLocale("/zh/shanghai")).toBe("/shanghai");
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
        hreflangs: [
          { hreflang: "en", href: "https://chinaconnect.com/beijing" },
          { hreflang: "zh-CN", href: "https://chinaconnect.com/zh/beijing" },
        ],
      },
    ];

    const xml = generateHreflangSitemapXml(entries);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<xhtml:link rel="alternate"');
  });
});
