# ChinaConnect Testing Guide

## Overview

This document describes the testing infrastructure for ChinaConnect, including SEO/GEO verification and application testing.

## Test Structure

```
tests/
├── unit/                    # Unit tests (Vitest)
│   ├── schema.test.ts       # Schema.org JSON-LD generator tests
│   ├── sitemap.test.ts     # Sitemap generator tests
│   ├── hreflang.test.ts    # Hreflang utilities tests
│   ├── robots.test.ts      # robots.txt generator tests
│   └── utils.test.ts       # Utility function tests
├── integration/             # Integration tests (Vitest)
│   └── supabase.test.ts    # Supabase API integration tests
├── e2e/                    # End-to-end tests (Playwright)
│   ├── homepage.spec.ts    # Homepage tests
│   ├── city-pages.spec.ts  # City page navigation tests
│   ├── restaurant-pages.spec.ts  # Restaurant page tests
│   └── seo-infrastructure.spec.ts  # SEO infrastructure tests
└── setup.ts               # Test setup and mocks
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all unit and integration tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
pnpm playwright:install

# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run E2E tests in headed mode
pnpm test:e2e:headed

# Update snapshots
pnpm test:e2e:update

# View test report
pnpm test:e2e:report
```

## Test Coverage

Current test coverage for SEO/GEO infrastructure:

| Component | Coverage |
|-----------|----------|
| Schema generators | 100% |
| Sitemap generator | 100% |
| Hreflang utilities | 100% |
| robots.txt generator | 100% |
| Utils | 100% |

## SEO Testing

### Schema.org JSON-LD

Tests verify the following schema types are generated correctly:
- LocalBusiness
- Restaurant
- TouristAttraction
- FAQPage
- Event
- BreadcrumbList
- WebSite
- Organization

### Sitemap

Tests verify:
- XML validity
- Correct URL inclusion (homepage, cities, cuisines)
- Special character escaping
- Baidu-compatible format

### Robots.txt

Tests verify:
- AI crawler access (GPTBot, ClaudeBot, PerplexityBot, etc.)
- Admin/API route blocking
- Sitemap declaration

### Meta Tags & Hreflang

Tests verify:
- Canonical URL generation
- Hreflang tag generation for en/zh locales
- Open Graph and Twitter Card tags

## E2E Testing

### Homepage Tests
- Page loads without errors
- SEO meta tags present
- Hreflang tags for i18n
- robots.txt accessibility
- sitemap.xml accessibility

### City Pages Tests
- All supported cities load correctly
- LocalBusiness schema present
- Hreflang tags correct

### SEO Infrastructure Tests
- Valid HTML structure
- Canonical URLs
- JSON-LD schema validity
- Sitemap XML format
- Robots.txt configuration

## Known Issues

1. **Build Adapter**: The Cloudflare adapter has compatibility issues with the current Astro version. The config uses static output mode without an adapter for local development.

2. **Component Placeholders**: Some pages (auth, community) have placeholder content because their React components are not yet implemented.

3. **Dynamic Sitemap**: Sitemap pages are commented out because they require server-side rendering. For production, use a Cloudflare Pages function or add an adapter.

## Continuous Integration

The test scripts are configured for CI:
- Playwright tests run with `--retries 2` in CI
- Screenshots captured on failure
- Video recorded on failure
- HTML report generated at `playwright-report/index.html`

## Writing New Tests

### Unit Tests

```typescript
// tests/unit/my-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedResult);
  });
});
```

### Integration Tests

```typescript
// tests/integration/my-api.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('My API', () => {
  it('should fetch data', async () => {
    const result = await myApi.fetch();
    expect(result).toBeDefined();
  });
});
```

### E2E Tests

```typescript
// tests/e2e/my-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Page', () => {
  test('should load', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page).toHaveTitle(/.*My Page.*/);
  });
});
```

## Debugging

### Playwright Debug Mode

```bash
# Debug with Playwright UI
pnpm test:e2e:debug

# Debug with headed browser
pnpm test:e2e:headed
```

### Vitest Debug Mode

```bash
# Run tests in watch mode
pnpm test:watch

# Run specific test file
node ./node_modules/vitest/vitest.mjs run tests/unit/schema.test.ts
```

## Test Data

Test fixtures are located in:
- `src/data/food/restaurants.ts` - Restaurant data for E2E tests
- `src/data/food/cities.ts` - City data for sitemap tests

## Coverage Reports

After running `pnpm test:coverage`, reports are generated in:
- `coverage/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools