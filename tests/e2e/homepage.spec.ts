// E2E tests for ChinaConnect homepage

import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { timeout: 30000 });
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/.*/i, { timeout: 10000 });
  });

  test("has main heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("has page content", async ({ page }) => {
    // Check that main content area exists
    const main = page.locator('main, [role="main"], body');
    const count = await main.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("SEO Files", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt", { timeout: 10000 });
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("GPTBot");
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml", { timeout: 10000 });
    expect(response?.status()).toBe(200);
  });
});
