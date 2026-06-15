// Dynamic robots.txt Generator
// Configures crawling directives for search engines and AI crawlers

import type { APIRoute } from "astro";

const SITE_URL = "https://chinaconnect.xyz";

// ============================================================================
// AI Crawler User Agents
// ============================================================================

const AI_CRAWLERS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "claude-web",
  // Google
  "Google-Extended",
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Googlebot-Mobile",
  "AdsBot-Google",
  "AdsBot-Google-Mobile",
  // Bing
  "BingBot",
  "BingPreview",
  "msnbot",
  // Yahoo
  "Slurp",
  // Baidu
  "Baiduspider",
  "Baiduspider-image",
  "Baiduspider-video",
  // Yandex
  "YandexBot",
  "YandexImages",
  "YandexVideo",
  // Other search engines
  "DuckDuckBot",
  "Sogou",
  "Exabot",
  // Social media crawlers
  "Twitterbot",
  "FacebookBot",
  "MetaAgent",
  "LinkedInBot",
  // AI-specific crawlers
  "PerplexityBot",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  // Common AI crawlers
  "AI2Bot",
  "Anthropic Claude",
  "Cohere",
  "AI21",
  "StableBot",
  "ISIASBot",
  // Additional crawlers
  "Applebot",
  "Omgilibot",
  "YouBot",
];

// ============================================================================
// Sitemap URLs
// ============================================================================

const SITEMAP_URLS = [
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/sitemap-cities.xml`,
  `${SITE_URL}/sitemap-food.xml`,
];

// ============================================================================
// Disallowed Paths
// ============================================================================

const DISALLOWED_PATHS = [
  "/api/",
  "/admin/",
  "/auth/",
  "/private/",
  "/internal/",
  "/v1/chat/",
  "/v1/completions/",
  "/v1/embeddings/",
  "/.netlify/",
  "/.vercel/",
  "/__/",
  "/_/",
  "/.well-known/",
];

// ============================================================================
// Allowed Paths for AI Crawlers
// ============================================================================

const _AI_CRAWLER_ALLOWED_PATHS = [
  "/",
  "/ai",
  "/food",
  "/cities",
  "/city/",
  "/emergency",
  "/guide",
  "/search",
];

// ============================================================================
// Generation Functions
// ============================================================================

function generateRobotsTxt(): string {
  const lines: string[] = [];

  // Header
  lines.push("# ChinaConnect robots.txt");
  lines.push("# Generated for SEO/GEO optimization");
  lines.push(`# Last updated: ${new Date().toISOString()}`);
  lines.push("");

  // Default User-agent (allow all)
  lines.push("User-agent: *");
  lines.push("Allow: /");

  // Disallow certain paths for all crawlers
  for (const path of DISALLOWED_PATHS) {
    lines.push(`Disallow: ${path}`);
  }

  lines.push("");

  // AI-specific crawlers
  lines.push("# AI and LLM Crawlers");
  lines.push("# These are allowed to crawl the entire site for AI training and search");

  for (const bot of AI_CRAWLERS) {
    lines.push(`User-agent: ${bot}`);
    lines.push("Allow: /");
    lines.push("");
  }

  // Specific AI crawler rules with specific paths
  lines.push("# Claude - allow all");
  lines.push("User-agent: ClaudeBot");
  lines.push("Allow: /");
  lines.push("");

  lines.push("# GPTBot - allow all");
  lines.push("User-agent: GPTBot");
  lines.push("Allow: /");
  lines.push("");

  lines.push("# PerplexityBot - allow all");
  lines.push("User-agent: PerplexityBot");
  lines.push("Allow: /");
  lines.push("");

  // Google-specific rules
  lines.push("# Google Special Bots");
  lines.push("User-agent: Google-Extended");
  lines.push("Allow: /");
  lines.push("");

  lines.push("User-agent: Googlebot-Image");
  lines.push("Allow: /");
  lines.push("");

  lines.push("User-agent: Googlebot-News");
  lines.push("Allow: /news/");
  lines.push("Allow: /blog/");
  lines.push("");

  // Baidu rules
  lines.push("# Baidu");
  lines.push("User-agent: Baiduspider");
  lines.push("Allow: /");
  lines.push("");

  // Sitemaps
  lines.push("# Sitemaps");
  for (const sitemap of SITEMAP_URLS) {
    lines.push(`Sitemap: ${sitemap}`);
  }

  lines.push("");

  // Crawl delay (optional, for polite crawling)
  lines.push("# Crawl delay for general bots (optional)");
  lines.push("# Crawl-delay: 1");

  return lines.join("\n");
}

// ============================================================================
// API Route
// ============================================================================

export const GET: APIRoute = () => {
  const content = generateRobotsTxt();

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Robots-Tag": "index, follow",
    },
  });
};

// ============================================================================
// Helper for testing
// ============================================================================

export { generateRobotsTxt };
