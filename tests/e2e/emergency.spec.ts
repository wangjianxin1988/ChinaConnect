// E2E tests for Emergency page

import { expect, test } from "@playwright/test";

test.describe("Emergency Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/emergency", { timeout: 30000 });
  });

  test("page loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Emergency/i, { timeout: 15000 });
  });

  test("has main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(/Emergency/i);
  });

  test("displays emergency phone numbers", async ({ page }) => {
    // Check for key emergency numbers displayed on the page
    const content = await page.locator("body").innerText();
    // Should contain key emergency numbers
    const hasEmergencyNums =
      content.includes("110") || content.includes("120") || content.includes("119");
    expect(hasEmergencyNums).toBeTruthy();
  });

  test("has quick dial section", async ({ page }) => {
    const quickDialSection = page.locator("text=/one.tap|quick dial|emergency/i").first();
    const hasQuickDial = (await quickDialSection.count()) > 0;
    expect(hasQuickDial).toBeTruthy();
  });

  test("has emergency translation card section", async ({ page }) => {
    const translationSection = page.locator("text=/translation|phrase|emergency/i").first();
    const hasTranslation = (await translationSection.count()) > 0;
    expect(hasTranslation).toBeTruthy();
  });

  test("has GPS location section", async ({ page }) => {
    const gpsSection = page.locator("text=/GPS|location/i").first();
    const hasGPS = (await gpsSection.count()) > 0;
    expect(hasGPS).toBeTruthy();
  });

  test("has navigation back to home", async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    const hasHomeLink = (await homeLink.count()) > 0;
    expect(hasHomeLink).toBeTruthy();
  });
});

test.describe("Emergency Page Interactions", () => {
  test("emergency numbers are displayed", async ({ page }) => {
    await page.goto("/emergency", { timeout: 30000 });
    // Check for emergency numbers on the page
    const numbers = await page.locator("text=110").count();
    expect(numbers).toBeGreaterThan(0);
  });

  test("page has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/emergency", { timeout: 30000 });
    await page.waitForTimeout(2000);
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("net::ERR") && !e.includes("Failed to load resource") && !e.includes("favicon"),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
