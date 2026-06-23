/**
 * verify-guide.mjs
 * Scans all built /guide/* pages in dist/ and HEAD-checks every external link.
 * Run after `pnpm build` to confirm guide pages have no dead links.
 *
 * Usage:
 *   # Terminal A
 *   pnpm build
 *   # Terminal B
 *   node scripts/verify-guide.mjs
 *   node scripts/verify-guide.mjs --strict  # exit 1 if any dead link
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const distGuide = resolve(repoRoot, "dist/guide");
const businessDataDir = resolve(repoRoot, "src/data/guide/business");
const cacheDir = resolve(repoRoot, ".supabase-cache");
const reportPath = resolve(cacheDir, "guide-verify.json");

const args = process.argv.slice(2);
const strict = args.includes("--strict");

if (!existsSync(distGuide)) {
  console.error("dist/guide not found. Run `pnpm build` first.");
  process.exit(2);
}
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

function findHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...findHtml(p));
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}


function extractFromDataSources(dir) {
  const out = new Map();
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith(".ts")) continue;
    const p = join(dir, entry);
    const src = readFileSync(p, "utf8");
    const fields = ["website", "sourceUrl", "official", "homepage"];
    for (const field of fields) {
      const re2 = new RegExp(field + "\\s*:\\s*[\"'](https?://[^\"']+)[\"']", "g");
      let m2;
      while ((m2 = re2.exec(src)) !== null) {
        if (!out.has(m2[1])) out.set(m2[1], []);
        out.get(m2[1]).push(entry);
      }
    }
  }
  return out;
}

function extractLinks(html) {
  // Capture href, src, action, cite, data-href
  const out = new Set();
  const re = /(?:href|src|action|cite|data-href)\s*=\s*["\\']([^"\\'<>\\s]+)["\\']/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    if (/^https?:\/\//i.test(url)) out.add(url);
  }
  return [...out];
}

async function headCheck(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const latency = Date.now() - started;
    const blocked = res.status === 403 || res.status === 429;
    return { ok: res.ok || blocked, status: res.status, finalUrl: res.url, latency, blocked };
  } catch (err) {
    const latency = Date.now() - started;
    return { ok: false, status: 0, finalUrl: url, latency, error: err.name === "AbortError" ? "timeout" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

function formatRow(cells, widths) {
  return cells.map((c, i) => String(c).padEnd(widths[i]).slice(0, widths[i])).join(" | ");
}

async function main() {
  const htmlFiles = findHtml(distGuide);
  console.log(`\nChinaConnect Guide Pages Verification`);
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Pages found: ${htmlFiles.length}\n`);

  // Aggregate unique URLs across all pages
  const pageLinks = new Map(); // url -> [pagePath]
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const links = extractLinks(html);
    for (const link of links) {
      if (!pageLinks.has(link)) pageLinks.set(link, []);
      pageLinks.get(link).push(file.replace(repoRoot, "").replace(/\\\\/g, "/"));
    }
  }

  // Also pull URLs from business data sources (these are inside React islands,
  // so they only render at runtime; checking the source is the authoritative path).
  const dataLinks = extractFromDataSources(businessDataDir);
  for (const [url, files] of dataLinks) {
    if (!pageLinks.has(url)) pageLinks.set(url, []);
    for (const f of files) {
      const tag = "src/data/guide/business/" + f;
      if (!pageLinks.get(url).includes(tag)) pageLinks.get(url).push(tag);
    }
  }

  console.log(`Unique external URLs: ${pageLinks.size}\n`);
  const widths = [70, 8, 10];
  console.log(formatRow(["url", "status", "latency"], widths));
  console.log(formatRow(["-".repeat(70), "-".repeat(8), "-".repeat(10)], widths));

  const report = {
    generatedAt: new Date().toISOString(),
    pagesScanned: htmlFiles.length,
    uniqueUrls: pageLinks.size,
    urls: {},
    summary: { total: 0, ok: 0, broken: 0 },
  };

  for (const [url, pages] of pageLinks) {
    const r = await headCheck(url);
    report.urls[url] = { ...r, pages };
    report.summary.total += 1;
    if (r.ok) report.summary.ok += 1;
    else report.summary.broken += 1;
    const status = r.ok ? (r.blocked ? `${r.status}*` : `${r.status}`) : `FAIL${r.error ? `(${r.error.slice(0,8)})` : ""}`;
    console.log(formatRow([url, status, `${r.latency}ms`], widths));
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nSummary: ${report.summary.ok}/${report.summary.total} URLs OK`);
  if (report.summary.broken > 0) {
    console.log(`Broken: ${report.summary.broken} (see ${reportPath})`);
  }
  console.log(`Report: ${reportPath}\n`);

  if (strict && report.summary.broken > 0) process.exit(1);
}

main().catch((err) => {
  console.error("verify-guide failed:", err);
  process.exit(2);
});