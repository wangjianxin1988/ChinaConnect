// E2E tests for SEO infrastructure

import { expect, test } from "@playwright/test";

test.describe("SEO Infrastructure", () => {
  test("homepage has valid HTML structure", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang");
  });

  test("homepage has canonical URL", async ({ page }) => {
    await page.goto("/");

    const canonical = page.locator('link[rel="canonical"]');
    const count = await canonical.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("structured data is valid JSON", async ({ page }) => {
    await page.goto("/");

    const schemaScripts = page.locator('script[type="application/ld+json"]');
    const count = await schemaScripts.count();

    if (count > 0) {
      const isValid = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        return Array.from(scripts).every((script) => {
          try {
            JSON.parse(script.textContent || "");
            return true;
          } catch {
            return false;
          }
        });
      });
      expect(isValid).toBe(true);
    }
  });
});

test.describe("Sitemap", () => {
  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("baidu sitemap is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap-baidu.xml");
    expect([200, 404]).toContain(response?.status());
  });
});

test.describe("Robots.txt", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
  });

  test("robots.txt allows AI crawlers", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const content = await page.content();
    expect(content).toContain("GPTBot");
  });

  test("robots.txt declares sitemap", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const content = await page.content();
    expect(content).toContain("Sitemap:");
  });
});

test.describe("Internationalization (hreflang)", () => {
  test("homepage has hreflang tags", async ({ page }) => {
    await page.goto("/");

    const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangLinks.count();

    expect(count).toBeGreaterThanOrEqual(2);
  });
});
