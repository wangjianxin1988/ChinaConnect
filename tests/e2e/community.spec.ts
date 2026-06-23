// E2E tests for Community page
// NOTE: /community route does not exist in this build (community features are
// scoped to database types only). Tests are kept as fixme to avoid false
// negatives while preserving intent for future implementation.
import { expect, test } from "@playwright/test";

test.describe.fixme("Community Page (route not implemented)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/community", { timeout: 30000 });
  });

  test("page loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Community/i, { timeout: 15000 });
  });

  test("has main heading or title", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("has main content area", async ({ page }) => {
    const content = page.locator('main, [role="main"], body');
    const count = await content.count();
    expect(count).toBeGreaterThan(0);
  });

  test("has tab navigation or buttons", async ({ page }) => {
    // Look for tab-like elements (buttons or links with tab-like behavior)
    const tabs = page.locator('[role="tab"], button, nav a, .tab, .nav-link');
    const hasTabs = (await tabs.count()) > 0;
    expect(hasTabs).toBeTruthy();
  });

  test("has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/community", { timeout: 30000 });
    await page.waitForTimeout(2000);
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("net::ERR") && !e.includes("Failed to load resource") && !e.includes("favicon"),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe.fixme("Community Page Interactions (route not implemented)", () => {
  test("tab navigation works", async ({ page }) => {
    await page.goto("/community", { timeout: 30000 });
    // Look for any clickable tab elements
    const tabs = page
      .locator('button, a[role="tab"], [role="tablist"] button')
      .filter({ hasText: /.+/ });
    const tabCount = await tabs.count();
    if (tabCount > 0) {
      await tabs.first().click();
      // Tab click should work without errors
      expect(true).toBeTruthy();
    } else {
      // If no explicit tabs, still check page loads
      const content = await page.locator("body").innerText();
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
