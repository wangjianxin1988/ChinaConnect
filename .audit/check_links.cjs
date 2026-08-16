const fs = require("fs");
const path = require("path");
function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".astro")) out.push(p);
  }
  return out;
}
const pages = walk("src/pages");
const pageSet = new Set();
for (const p of pages) {
  let rel = p.replace(/\\/g, "/").replace("src/pages/", "").replace(/\.astro$/, "");
  if (rel.endsWith("/index")) rel = rel.slice(0, -6);
  if (rel === "index") rel = "";
  pageSet.add("/" + rel);
}
// collect hrefs from BaseLayout nav/footer + index pages
const files = ["src/layouts/BaseLayout.astro", "src/pages/index.astro", "src/pages/[lang]/index.astro", "src/pages/cities/index.astro", "src/pages/[lang]/cities/index.astro"];
const hrefs = new Set();
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.matchAll(/href=\{?`?\$\{?(?:lp|p)\}?([^`"}]*)`?/g) || []) { /* skip */ }
  for (const m of txt.matchAll(/href="(\/[^"]*)"/g)) {
    hrefs.add(m[1].replace(/\$\{[^}]*\}/g, "").split("?")[0]);
  }
  for (const m of txt.matchAll(/href=\{`\$\{lp\}([^`]*)`\}/g)) {
    hrefs.add(m[1]);
  }
}
console.log("--- hrefs that may 404 (static part only) ---");
for (const h of [...hrefs].sort()) {
  if (h.includes("{")) continue;
  const clean = h.replace(/\/$/, "") || "/";
  if (!pageSet.has(clean) && !pageSet.has(clean + "/")) {
    console.log("  MISSING?", h);
  }
}
