// After compress-images.mjs converts jpg->webp, src/ still references .jpg.
// This script updates all .jpg references in /img/ext/ to .webp.
import fs from "node:fs";
import path from "node:path";
const SRC = path.join(process.cwd(), "src");
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const re = /\/img\/ext\/([a-z0-9_-]+)\.jpg\b/g;
let filesChanged = 0,
  refsUpdated = 0;
for (const f of walk(SRC)) {
  if (!/\.(json|ts|tsx|astro|mdx?|html)$/.test(f)) continue;
  const s = fs.readFileSync(f, "utf8");
  let n = 0;
  const updated = s.replace(re, (m, hash) => {
    n++;
    return "/img/ext/" + hash + ".webp";
  });
  if (n) {
    fs.writeFileSync(f, updated, "utf8");
    filesChanged++;
    refsUpdated += n;
  }
}
console.log("[fix] files=" + filesChanged + " refs=" + refsUpdated);

// Verify
let left = 0;
for (const f of walk(SRC)) {
  if (!/\.(json|ts|tsx|astro|mdx?)$/.test(f)) continue;
  const s = fs.readFileSync(f, "utf8");
  const m = s.match(re);
  if (m) {
    left++;
    console.log("  still .jpg:", f);
  }
}
console.log("[verify] files still with .jpg refs: " + left);
