// Rewrite all external image URLs in src/**/*.{json,ts,tsx,astro} to local /img/ext/ paths.
// Uses src/.image-map.json produced by localize-images.mjs.
// For URLs not in mapping (18 fail cases), rewrite to a 1px transparent PNG (placeholder).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const MAP_FILE = path.join(SRC, ".image-map.json");
const FALLBACK = "/img/ext/__missing.svg";

const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const re = /https:\/\/images\.(?:unsplash|pexels)\.com\/[^"\s<>)]+/g;

let filesScanned = 0,
  urlsRewritten = 0,
  missingFallbacks = 0;
for (const f of walk(SRC)) {
  if (!/\.(json|ts|tsx|astro|mdx?)$/.test(f)) continue;
  filesScanned++;
  const before = fs.readFileSync(f, "utf8");
  const after = before.replace(re, (u) => {
    if (map[u]) {
      urlsRewritten++;
      return map[u];
    }
    missingFallbacks++;
    return FALLBACK;
  });
  if (before !== after) fs.writeFileSync(f, after, "utf8");
}
console.log(
  `[rewrite] files=${filesScanned}, rewritten=${urlsRewritten}, fallback=${missingFallbacks}`,
);

// Verify
let leftOver = 0;
for (const f of walk(SRC)) {
  if (!/\.(json|ts|tsx|astro|mdx?)$/.test(f)) continue;
  const s = fs.readFileSync(f, "utf8");
  const m = s.match(re);
  if (m) {
    leftOver++;
    console.log("  still has ext URL:", f, "->", m[0].slice(0, 80));
  }
}
console.log(`[verify] files still containing ext URL: ${leftOver}`);
