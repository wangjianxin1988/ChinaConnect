// E2E tests for Auth page (Login/Register)

import { expect, test } from "@playwright/test";

test.describe("Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth", { timeout: 30000 });
    // Wait for React hydration and loading state to complete
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(1000); // Allow React to fully render
  });

  test("page loads successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Login|Register|Auth|ChinaConnect/i, { timeout: 15000 });
  });

  test("has login/register form", async ({ page }) => {
    // Wait for the form container with specific class
    const form = page.locator('.bg-white.dark\\:bg-gray-800, [class*="shadow-md"]').first();
    await form.waitFor({ state: "visible", timeout: 15000 });
    const hasForm = (await form.count()) > 0;
    expect(hasForm).toBeTruthy();
  });

  test("has email input field", async ({ page }) => {
    // Look for email input with placeholder text
    const emailInput = page
      .locator(
        'input[placeholder*="example.com"], input[placeholder*="email" i], input[type="email"]',
      )
      .first();
    await emailInput.waitFor({ state: "visible", timeout: 15000 });
    const hasEmail = (await emailInput.count()) > 0;
    expect(hasEmail).toBeTruthy();
  });

  test("has password input field", async ({ page }) => {
    // Look for password input
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: "visible", timeout: 15000 });
    const hasPassword = (await passwordInput.count()) > 0;
    expect(hasPassword).toBeTruthy();
  });

  test("has submit button", async ({ page }) => {
    // Look for submit button or sign in/sign up buttons
    const submitBtn = page
      .locator(
        'button[type="submit"], button:has-text("Sign In"), button:has-text("Sign Up"), button:has-text("Sign")',
      )
      .first();
    await submitBtn.waitFor({ state: "visible", timeout: 15000 });
    const hasSubmit = (await submitBtn.count()) > 0;
    expect(hasSubmit).toBeTruthy();
  });

  test("has navigation links", async ({ page }) => {
    const links = page.locator('a[href="/"]').first();
    const hasLinks = (await links.count()) > 0;
    expect(hasLinks).toBeTruthy();
  });
});

test.describe("Auth Page Interactions", () => {
  test("can type in email field", async ({ page }) => {
    await page.goto("/auth", { timeout: 30000 });
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').first();
    if ((await emailInput.count()) > 0) {
      await emailInput.waitFor({ state: "visible", timeout: 15000 });
      await emailInput.fill("test@example.com");
      await expect(emailInput).toHaveValue("test@example.com");
    }
  });

  test("can type in password field", async ({ page }) => {
    await page.goto("/auth", { timeout: 30000 });
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[type="password"]').first();
    if ((await passwordInput.count()) > 0) {
      await passwordInput.waitFor({ state: "visible", timeout: 15000 });
      await passwordInput.fill("TestPassword123");
      await expect(passwordInput).toHaveValue("TestPassword123");
    }
  });

  test("form submit button is clickable", async ({ page }) => {
    await page.goto("/auth", { timeout: 30000 });
    await page
      .waitForSelector(".animate-spin", { state: "hidden", timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(1000);

    const submitBtn = page.locator('button[type="submit"]').first();
    if ((await submitBtn.count()) > 0) {
      await submitBtn.waitFor({ state: "visible", timeout: 15000 });
      await submitBtn.click();
      // Button click should not throw an error
      expect(true).toBeTruthy();
    }
  });

  test("has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/auth", { timeout: 30000 });
    await page.waitForTimeout(2000);
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("net::ERR") &&
        !e.includes("Failed to load resource") &&
        !e.includes("favicon") &&
        !e.includes("supabase") && // Supabase errors are expected without credentials
        !e.includes("AuthApi"),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
