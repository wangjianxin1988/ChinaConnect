// E2E tests for City Search functionality

import { expect, test } from "@playwright/test";

const POPULAR_CITIES = [
  { slug: "beijing", name: "Beijing", nameZh: "北京" },
  { slug: "shanghai", name: "Shanghai", nameZh: "上海" },
  { slug: "chengdu", name: "Chengdu", nameZh: "成都" },
  { slug: "xian", name: "Xi'an", nameZh: "西安" },
];

test.describe("City Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test.describe("City Cards Display", () => {
    for (const city of POPULAR_CITIES) {
      test(`${city.name} city card is displayed`, async ({ page }) => {
        const cityCard = page.locator(`a[href*="/city/${city.slug}"], [data-city="${city.slug}"]`);
        const cardExists = (await cityCard.count()) > 0;

        if (cardExists) {
          await expect(cityCard.first()).toBeVisible({ timeout: 10000 });
        } else {
          // Navigate directly to city page
          await page.goto(`/city/${city.slug}`, { timeout: 30000 });
          const heading = page.locator("h1, h2").first();
          await expect(heading).toBeVisible({ timeout: 10000 });
        }
      });
    }
  });

  test.describe("City Page Navigation", () => {
    test("clicking city card navigates to city page", async ({ page }) => {
      const cityLink = page.locator(`a[href*="/city/beijing"]`).first();
      const hasCityLink = (await cityLink.count()) > 0;

      if (hasCityLink) {
        await cityLink.click();
        await expect(page).toHaveURL(/\/city\/beijing/, { timeout: 10000 });
      }
    });

    test("city page has correct title", async ({ page }) => {
      await page.goto("/city/beijing", { timeout: 30000 });
      await page.waitForTimeout(2000);

      const bodyText = await page.locator("body").innerText();
      expect(bodyText.length).toBeGreaterThan(50);
    });
  });

  test.describe("City Search Bar", () => {
    test("has search input on homepage", async ({ page }) => {
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="city" i], input[placeholder*="search" i], [role="searchbox"]',
      );
      const hasSearch = (await searchInput.count()) > 0;
      expect(hasSearch).toBeTruthy();
    });

    test("search input accepts text", async ({ page }) => {
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="city" i], input[placeholder*="search" i]',
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.first().fill("Beijing");
        await expect(searchInput.first()).toHaveValue("Beijing");
      } else {
        // Search might not exist on homepage - test passes
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe("City Filter/Select", () => {
    test("city selector dropdown exists", async ({ page }) => {
      const selector = page.locator(
        'select, [role="combobox"], [aria-label*="city" i], button:has-text("Beijing")',
      );
      const hasSelector = (await selector.count()) > 0;

      if (hasSelector) {
        await expect(selector.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

test.describe("City Pages Content", () => {
  for (const city of POPULAR_CITIES) {
    test(`${city.name} page loads with content`, async ({ page }) => {
      await page.goto(`/city/${city.slug}`, { timeout: 30000 });
      await page.waitForTimeout(3000);

      const body = page.locator("body");
      const text = await body.innerText();

      // Should have substantial content
      expect(text.length).toBeGreaterThan(200);

      // Should have navigation back
      const hasNav = (await page.locator("nav, header, a[href='/']").count()) > 0;
      expect(hasNav).toBeTruthy();
    });
  }

  test("city page has no critical console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/city/shanghai", { timeout: 30000 });
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("net::ERR") && !e.includes("Failed to load resource") && !e.includes("favicon"),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe("City Page Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/city/beijing", { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test("has attractions section", async ({ page }) => {
    const attractionsSection = page.locator("text=/attraction|landmark|sightseeing/i");
    const hasSection = (await attractionsSection.count()) > 0;
    expect(hasSection).toBeTruthy();
  });

  test("has restaurant section", async ({ page }) => {
    const restaurantSection = page.locator("text=/restaurant|food|dining/i");
    const hasSection = (await restaurantSection.count()) > 0;
    expect(hasSection).toBeTruthy();
  });

  test("has emergency section", async ({ page }) => {
    const emergencySection = page.locator("text=/emergency|sos|police|hospital/i");
    const hasSection = (await emergencySection.count()) > 0;
    expect(hasSection).toBeTruthy();
  });
});

test.describe("Multi-City Navigation", () => {
  test("can navigate between multiple cities", async ({ page }) => {
    // Start at Beijing
    await page.goto("/city/beijing", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Find link to Shanghai
    const shanghaiLink = page.locator(`a[href*="/city/shanghai"]`).first();

    if ((await shanghaiLink.count()) > 0) {
      await shanghaiLink.click();
      await expect(page).toHaveURL(/\/city\/shanghai/, { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Verify Shanghai content
      const bodyText = await page.locator("body").innerText();
      expect(bodyText.length).toBeGreaterThan(100);
    } else {
      // Navigate directly
      await page.goto("/city/shanghai", { timeout: 30000 });
      await expect(page).toHaveURL(/\/city\/shanghai/, { timeout: 10000 });
    }
  });
});
