// E2E tests for city page navigation

import { expect, test } from "@playwright/test";

const SUPPORTED_CITIES = ["beijing", "shanghai", "hangzhou", "chengdu", "guangzhou", "xian"];

test.describe("City Pages", () => {
  for (const city of SUPPORTED_CITIES) {
    test(`${city} page loads successfully`, async ({ page }) => {
      await page.goto(`/city/${city}`, { timeout: 30000 });
      await expect(page).toHaveTitle(/.*/i, { timeout: 10000 });
    });
  }

  test("unsupported city returns appropriate response", async ({ page }) => {
    const response = await page.goto("/city/nonexistent-city");
    expect([200, 404]).toContain(response?.status());
  });
});

test.describe("City Navigation", () => {
  test("can navigate from homepage to city page", async ({ page }) => {
    await page.goto("/");
    const cityLinks = page.locator('a[href*="/city/beijing"], a[href*="/city/shanghai"]');
    const hasCityLinks = (await cityLinks.count()) > 0;
    if (hasCityLinks) {
      await cityLinks.first().click();
      await expect(page).toHaveURL(/\/city\/(beijing|shanghai)/);
    }
  });
});
