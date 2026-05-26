// E2E tests for Guide pages

import { expect, test } from "@playwright/test";

test.describe("Scam Prevention Guide Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/scam-prevention", { timeout: 30000 });
  });

  test("page loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Scam|Scam Prevention/i, { timeout: 15000 });
  });

  test("has main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("has guide content", async ({ page }) => {
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible({ timeout: 10000 });
  });

  test("has navigation to homepage", async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    const hasHomeLink = (await homeLink.count()) > 0;
    expect(hasHomeLink).toBeTruthy();
  });
});

test.describe("Price Transparency Guide Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/transparency", { timeout: 30000 });
  });

  test("page loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Price|Price Transparency/i, { timeout: 15000 });
  });

  test("has main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible({ timeout: 10000 });
  });

  test("has price comparison content", async ({ page }) => {
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Cultural Warnings Guide Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guide/cultural-warnings", { timeout: 30000 });
  });

  test("page loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Cultural|Cultural Warnings/i, { timeout: 15000 });
  });

  test("has main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible({ timeout: 10000 });
  });

  test("has guide content section", async ({ page }) => {
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });
});
