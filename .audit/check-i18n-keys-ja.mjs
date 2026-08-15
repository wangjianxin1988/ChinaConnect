import fs from "node:fs";
import path from "node:path";
// collect all data-i18n keys from astro files
const roots = ["src/pages", "src/layouts", "src/components"];
const keys = new Set();
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".astro") || e.name.endsWith(".tsx") || e.name.endsWith(".ts")) {
      const s = fs.readFileSync(p, "utf8");
      for (const m of s.matchAll(/data-i18n="([^"]+)"/g)) keys.add(m[1]);
      for (const m of s.matchAll(/data-i18n-title="([^"]+)"/g)) keys.add(m[1]);
      // also _lookup("key") and t("key") style?
      for (const m of s.matchAll(/\{?_lookup\("([^"]+)"\)/g)) keys.add(m[1]);
      for (const m of s.matchAll(/ct\(lang,\s*"([^"]+)"/g)) keys.add(m[1]);
    }
  }
};
roots.forEach(walk);
console.log("total data-i18n keys:", keys.size);

// parse translations.ts
const t = fs.readFileSync("src/i18n/translations.ts", "utf8");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
const blocks = [];
let m;
while ((m = langRe.exec(t))) {
  const rest = t.slice(m.index);
  const close = rest.search(/\n  \},/m);
  blocks.push({ name: m[1].replace(/"/g, ""), body: rest.slice(0, close) });
}
const getVal = (block, key) => {
  const [ns, k] = key.split(".");
  const nsStart = block.body.indexOf(ns + ": {");
  if (nsStart < 0) return undefined;
  const sub = block.body.slice(nsStart);
  const subClose = sub.indexOf("\n    },");
  const nsBlock = sub.slice(0, subClose);
  const re = new RegExp("^\\s{6}" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ': ("(?:[^"\\\\]|\\\\.)*"|\\{.*\\})', "m");
  const mv = nsBlock.match(re);
  return mv ? mv[1] : undefined;
};
const enBlock = blocks.find((b) => b.name === "en");
const jaBlock = blocks.find((b) => b.name === "ja");
const missing = [];
const sameAsEn = [];
for (const k of [...keys].sort()) {
  const enV = getVal(enBlock, k);
  const jaV = getVal(jaBlock, k);
  if (jaV === undefined) missing.push(k);
  else if (enV !== undefined && jaV === enV && !/^[\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u0590-\u05ff]/.test(jaV.replace(/^"|"$/g, ""))) sameAsEn.push(k + " = " + jaV);
}
console.log("missing in ja:", missing.length);
missing.forEach((k) => console.log("  ", k));
console.log("same-as-en in ja (may be legit):", sameAsEn.length);
sameAsEn.slice(0, 40).forEach((k) => console.log("  ", k));
