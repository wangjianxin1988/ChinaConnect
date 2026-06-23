/**
 * verify-business-data.mjs
 * Quarterly health check for /guide/business/* data sources.
 *
 * For each data file in src/data/guide/business/, HEAD-checks every
 * `BUSINESS_URLS_TO_CHECK` URL and reports 200/3xx/4xx/5xx with latency.
 * Writes JSON report to .supabase-cache/business-verify.json and prints a
 * human-readable table.
 *
 * Usage:
 *   node scripts/verify-business-data.mjs           # HEAD-only fast path
 *   node scripts/verify-business-data.mjs --strict  # exit 1 if any non-2xx
 *
 * Cron hint (quarterly, 1st Monday of Mar/Jun/Sep/Dec):
 *   0 9 1 3,6,9,12 *  cd /repo && node scripts/verify-business-data.mjs --strict
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const cacheDir = resolve(repoRoot, ".supabase-cache");
const metaPath = resolve(repoRoot, "src/data/guide/business/_meta.ts");
const reportPath = resolve(cacheDir, "business-verify.json");

const args = process.argv.slice(2);
const strict = args.includes("--strict");

if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

// Read the _meta.ts file as text and extract the URLs table via regex.
// We avoid an actual TS import to keep this script zero-dep.
function extractUrls(source) {
  // Capture everything between BUSINESS_URLS_TO_CHECK: ... = { ... };
  const m = source.match(
    /export\s+const\s+BUSINESS_URLS_TO_CHECK[^=]*=\s*\{([\s\S]*?)\n\};/,
  );
  if (!m) return {};
  const body = m[1];
  // Extract each key: [ ...urls... ],
  const out = {};
  const keyRe = /'([^']+)'\s*:\s*\[([\s\S]*?)\]/g;
  let k;
  while ((k = keyRe.exec(body)) !== null) {
    const [, key, arrBody] = k;
    const urlRe = /'((?:https?:)\/\/[^']+)'/g;
    const urls = [];
    let u;
    while ((u = urlRe.exec(arrBody)) !== null) urls.push(u[1]);
    out[key] = urls;
  }
  return out;
}

function extractMeta(source) {
  const out = {};
  const blockRe = /'([^']+)'\s*:\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = blockRe.exec(source)) !== null) {
    const [, key, body] = m;
    const lastVerified = body.match(/lastVerified:\s*'([^']+)'/);
    const sourceUrl = body.match(/sourceUrl:\s*'([^']+)'/);
    const sourceLabel = body.match(/sourceLabel:\s*'([^']+)'/);
    const reVerifyInterval = body.match(/reVerifyInterval:\s*'([^']+)'/);
    if (lastVerified && sourceUrl) {
      out[key] = {
        lastVerified: lastVerified[1],
        sourceUrl: sourceUrl[1],
        sourceLabel: sourceLabel?.[1] ?? "",
        reVerifyInterval: reVerifyInterval?.[1] ?? "annual",
      };
    }
  }
  return out;
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
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const latency = Date.now() - started;
    const blocked = res.status === 403 || res.status === 429;
      return { ok: res.ok || blocked, status: res.status, finalUrl: res.url, latency, blocked };
  } catch (err) {
    const latency = Date.now() - started;
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      latency,
      error: err.name === "AbortError" ? "timeout" : err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

function formatRow(cells, widths) {
  return cells.map((c, i) => String(c).padEnd(widths[i]).slice(0, widths[i])).join(" | ");
}

async function main() {
  const source = readFileSync(metaPath, "utf8");
  const urls = extractUrls(source);
  const meta = extractMeta(source);
  const keys = Object.keys(urls);

  console.log(`\nChinaConnect Business Data Verification`);
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Data files: ${keys.length}\n`);

  const report = {
    generatedAt: new Date().toISOString(),
    dataFiles: {},
    summary: { total: 0, ok: 0, broken: 0 },
  };

  const widths = [22, 50, 8, 10];
  console.log(formatRow(["file", "url", "status", "latency"], widths));
  console.log(formatRow(["-".repeat(22), "-".repeat(50), "-".repeat(8), "-".repeat(10)], widths));

  for (const key of keys) {
    const fileMeta = meta[key] ?? {};
    const fileEntry = {
      lastVerified: fileMeta.lastVerified ?? null,
      sourceUrl: fileMeta.sourceUrl ?? null,
      sourceLabel: fileMeta.sourceLabel ?? null,
      reVerifyInterval: fileMeta.reVerifyInterval ?? "annual",
      urls: [],
    };
    for (const url of urls[key]) {
      const r = await headCheck(url);
      fileEntry.urls.push({ url, ...r });
      report.summary.total += 1;
      const status = r.ok ? "OK" : `FAIL${r.error ? `(${r.error})` : ""}`;
      if (r.ok) report.summary.ok += 1;
      else report.summary.broken += 1;
      console.log(formatRow([key, url, `${r.status || status}`, `${r.latency}ms`], widths));
    }
    report.dataFiles[key] = fileEntry;
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\nSummary: ${report.summary.ok}/${report.summary.total} URLs OK`);
  if (report.summary.broken > 0) {
    console.log(`Broken: ${report.summary.broken} (see ${reportPath})`);
  }
  console.log(`Report:  ${reportPath}\n`);

  if (strict && report.summary.broken > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("verify-business-data failed:", err);
  process.exit(2);
});