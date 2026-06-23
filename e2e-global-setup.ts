import { type FullConfig } from "@playwright/test";

// Global setup: write a storage state JSON that all test contexts will load.
// This pre-populates localStorage so the onboarding modal does not block clicks.
export default async function globalSetup(_config: FullConfig) {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4321";
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [
          { name: "chinaconnect_onboarding_complete", value: "true" },
        ],
      },
    ],
  };
  const fs = await import("fs");
  fs.writeFileSync("playwright-storage.json", JSON.stringify(storageState, null, 2));
}

