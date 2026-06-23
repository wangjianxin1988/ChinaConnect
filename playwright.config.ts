import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4321";

// Performance budgets for key pages (in ms)
const PAGE_TIMEOUT = parseInt(process.env.PLAYWRIGHT_TIMEOUT || "30000");

import { chromium } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",

  // Parallel execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retry settings
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    // List reporter for CI output
    ["list", { printSteps: true }],
    // HTML reporter for local development and CI artifacts
    [
      "html",
      {
        outputFolder: "./playwright-report",
        open: process.env.CI ? "never" : "on-failure",
        host: "0.0.0.0",
        port: 9323,
      },
    ],
    // JSON reporter for test result analysis
    [
      "json",
      {
        outputFile: "./test-results/results.json",
      },
    ],
  ],

  // Global test settings
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Navigation and action timeouts
    navigationTimeout: PAGE_TIMEOUT,
    actionTimeout: 15000,

    // Ignore HTTPS errors for development
    ignoreHTTPSErrors: true,

    // Browser launch options
    launchOptions: {
      args: ["--disable-web-security", "--disable-dev-shm-usage"],
    },

    // Viewport for consistent screenshots
    viewport: { width: 1280, height: 720 },

    // Locale settings
    locale: "en-US",
    timezoneId: "Asia/Shanghai",

    // Extra HTTP headers for testing
    extraHTTPHeaders: {

    // Pre-set localStorage to skip onboarding modal in e2e tests
    storageState: "./playwright-storage.json",
      "X-Playwright-Test": "true",
    },
  },

  // Project configurations
  projects: [
    // Chromium - Primary browser for all tests
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    // Additional browsers for local testing (not in CI)
    ...(process.env.CI
      ? []
      : [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
          {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
          },
          {
            name: "iPhone 13",
            use: { ...devices["iPhone 13"] },
          },
        ]),
  ],

  // Web server configuration for local dev
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        stdout: "ignore",
        stderr: "pipe",
      },

  // Global timeout settings
  timeout: PAGE_TIMEOUT,
  expect: {
    timeout: 10000,
  },

  // Output directories
  outputDir: "./test-results",

  // Global setup: write storage state JSON for onboarding dismissal
  globalSetup: "./e2e-global-setup.ts",

  // Shadow mode for DOM snapshots
  snapshotDir: "./snapshots",
});
