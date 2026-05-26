// Unit tests for robots.txt generator

import { generateRobotsHeaders, generateRobotsTxt } from "@/lib/robots";
import { describe, expect, it } from "vitest";

describe("generateRobotsTxt", () => {
  it("allows all AI crawlers", () => {
    const content = generateRobotsTxt();

    expect(content).toContain("User-agent: GPTBot");
    expect(content).toContain("Allow: /");
    expect(content).toContain("User-agent: ClaudeBot");
    expect(content).toContain("User-agent: PerplexityBot");
    expect(content).toContain("User-agent: CCBot");
    expect(content).toContain("User-agent: Google-Extended");
  });

  it("disallows admin and API routes", () => {
    const content = generateRobotsTxt();

    expect(content).toContain("Disallow: /api/");
    expect(content).toContain("Disallow: /admin/");
  });

  it("includes sitemap declaration", () => {
    const content = generateRobotsTxt();
    expect(content).toContain("Sitemap: https://chinaconnect.com/sitemap.xml");
  });

  it("uses custom sitemap URL when provided", () => {
    const customSitemap = "https://example.com/custom-sitemap.xml";
    const content = generateRobotsTxt(customSitemap);

    expect(content).toContain(`Sitemap: ${customSitemap}`);
    expect(content).not.toContain("Sitemap: https://chinaconnect.com/sitemap.xml");
  });

  it("allows all user agents by default", () => {
    const content = generateRobotsTxt();

    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
  });
});

describe("generateRobotsHeaders", () => {
  it("returns correct X-Robots-Tag header", () => {
    const headers = generateRobotsHeaders();

    expect(headers["X-Robots-Tag"]).toBe("index, follow");
  });
});
