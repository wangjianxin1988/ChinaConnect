/**
 * Lighthouse CI Configuration
 * Runs performance audits on key pages
 */

module.exports = {
  ci: {
    collect: {
      // Static build output location
      url: [
        "http://localhost:4321/",
        "http://localhost:4321/city/beijing",
        "http://localhost:4321/city/shanghai",
        "http://localhost:4321/ai",
        "http://localhost:4321/emergency",
        "http://localhost:4321/auth",
      ],
      startServerCommand: "pnpm preview",
      startServerReadyPattern: "localhost:4321",
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        throttling: {
          // Simulate 4G connection
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        // Performance
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.85 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // PWA specific (critical for PWA score)
        "categories:pwa": ["error", { minScore: 0.9 }],
        "installable-manifest": ["error", { minScore: 1 }],
        "service-worker": ["error", { minScore: 1 }],
        "redirects-http": ["error", { minScore: 1 }],
        "apple-touch-icon": ["error", { minScore: 1 }],
        "without-javascript": ["error", { minScore: 1 }],
        "maskable-icon": ["error", { minScore: 1 }],
        "icons": ["error", { minScore: 1 }],
        "has-manifest": ["error", { minScore: 1 }],
        "manifest-start-url": ["error", { minScore: 1 }],
        "manifest-short-name": ["error", { minScore: 1 }],
        "theme-color": ["error", { minScore: 1 }],

        // Specific audits
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 500 }],
        "speed-index": ["warn", { maxNumericValue: 4000 }],
        interactive: ["error", { maxNumericValue: 5000 }],

        // Core Web Vitals
        "server-response-time": ["warn", { maxNumericValue: 800 }],
        "render-blocking-resources": ["error", { maxLength: 0 }],
        "unused-javascript": ["warn", { maxLength: 0 }],
        "unused-css-rules": ["warn", { maxLength: 0 }],

        // Accessibility
        "color-contrast": ["error", { minScore: 1 }],
        "image-alt": ["error", { minScore: 1 }],
        "document-title": ["error", { minScore: 1 }],
        "html-has-lang": ["error", { minScore: 1 }],
        "link-name": ["error", { minScore: 1 }],
        "button-name": ["error", { minScore: 1 }],
        "contrast-enhanced": ["error", { minScore: 1 }],
      },
    },
    upload: {
      // Target: Cloudflare Pages or GitHub Actions artifact
      target: "lhci",
      serverBaseUrl: process.env.LHCI_SERVER_URL || "http://localhost:9001",
      token: process.env.LHCI_BUILD_TOKEN,
      ignoreDuplicateBuildFailure: true,
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: "fileSystem",
        path: "./.lighthouse-ci",
      },
    },
  },
};
