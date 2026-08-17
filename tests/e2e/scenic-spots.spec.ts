// E2E tests for the scenic-spots hub page (SSR first screen + lazy load + filters)

import { expect, test } from "@playwright/test";

test.describe("Scenic Spots Hub", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/scenic-spots", { timeout: 30000 });
  });

  test("server-renders the first screen and exposes lazy-load controls", async ({ page }) => {
    const cards = page.locator("#scenic-grid .scenic-card");
    // SSR cards are present in the initial HTML; poll until the grid has
    // settled so transient page transitions never race the assertion.
    await expect.poll(async () => cards.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(20);

    await expect(page.locator("#scenic-load-more")).toBeVisible();
    await expect(page.locator("#scenic-city-filter")).toBeVisible();
    const cityOptions = await page.locator("#scenic-city-filter option").count();
    expect(cityOptions).toBeGreaterThan(2);
  });

  test("load more appends additional cards", async ({ page }) => {
    const cards = page.locator("#scenic-grid .scenic-card");
    const before = await cards.count();
    await page.locator("#scenic-load-more").click();
    await expect
      .poll(async () => cards.count())
      .toBeGreaterThan(before);
    await expect(page.locator("#scenic-status")).not.toHaveClass(/hidden/);
  });

  test("category filter narrows visible cards and All restores them", async ({ page }) => {
    const cards = page.locator("#scenic-grid .scenic-card");
    const visibleAttr = (attr: string) =>
      cards.evaluateAll(
        (els, attrName) => {
          const visible = els.filter((e) => (e as HTMLElement).style.display !== "none");
          if (visible.length === 0) return "";
          const values = new Set(visible.map((e) => e.getAttribute(attrName)));
          return values.size === 1 ? (values.values().next().value as string) : "mixed";
        },
        attr,
      );

    await page.locator('.scenic-category-filter[data-category="historical"]').click();
    // Wait for the async JSON load + client-side filter to fully apply.
    await expect.poll(() => visibleAttr("data-category")).toBe("historical");

    await page.locator('.scenic-category-filter[data-category="all"]').click();
    await expect
      .poll(async () => cards.evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.display !== "none").length))
      .toBeGreaterThan(0);
  });

  test("city filter narrows cards to the selected city", async ({ page }) => {
    const cards = page.locator("#scenic-grid .scenic-card");
    const visibleCity = () =>
      cards.evaluateAll((els) => {
        const visible = els.filter((e) => (e as HTMLElement).style.display !== "none");
        if (visible.length === 0) return "";
        const values = new Set(visible.map((e) => e.getAttribute("data-city")));
        return values.size === 1 ? (values.values().next().value as string) : "mixed";
      });

    await page.locator("#scenic-city-filter").selectOption("beijing");
    await expect.poll(visibleCity).toBe("beijing");
  });

  test("cards link to the city attractions anchor", async ({ page }) => {
    const firstCard = page.locator("#scenic-grid .scenic-card").first();
    await expect(firstCard).toHaveAttribute("href", /^\/city\/.+#attractions$/);
  });
});
