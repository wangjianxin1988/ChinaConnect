// @ts-nocheck
const SITE_URL = "https://chinaconnect.xyz";

// AI crawler user agents to allow
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "claude-web",
  "PerplexityBot",
  "CCBot",
  "Google-Extended",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
];

export function generateRobotsTxt(sitemapUrl?: string): string {
  const lines = [
    "# ChinaConnect robots.txt",
    "# Generated for SEO/GEO optimization",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    ...AI_CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ""]),
    "# Disallow admin and private routes",
    "Disallow: /api/",
    "Disallow: /admin/",
    "Disallow: /*.json$",
    "",
  ];

  if (sitemapUrl) {
    lines.push(`Sitemap: ${sitemapUrl}`);
  } else {
    lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
  }

  return lines.join("\n");
}

export function generateRobotsHeaders(): Record<string, string> {
  return {
    "X-Robots-Tag": "index, follow",
  };
}
