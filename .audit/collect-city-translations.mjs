// Collect translatable strings from ja city JSONs: English + simplified-Chinese + hotel-name issues
import fs from "node:fs";
import path from "node:path";

const SIMP = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
const simpRe = new RegExp("[" + SIMP.join("") + "]");
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const EN_G = /[A-Za-z]{2,}/g;
const SKIP_LEAF = /^(id|image|imageUrl|coverImage|nameEn|icon|slug|type|budget|rating|lat|lng|category|coordinates|method|phone|url)$/;

const files = [];
function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith(".json")) files.push(p); } }
walk("src/data/cities-i18n/ja");

const locations = {}; // string -> [{file,path}]
function add(str, file, keyPath) {
  if (!str || typeof str !== "string" || str.length < 2) return;
  if (!locations[str]) locations[str] = [];
  locations[str].push({ file, path: keyPath });
}

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  const base = path.basename(f);
  (function rec(node, keyPath) {
    if (typeof node === "string") {
      // English residue
      if (node.length >= 3 && !CJK.test(node)) {
        EN_G.lastIndex = 0;
        if ((node.match(EN_G) || []).length >= 2) add(node, base, keyPath);
      }
      // Simplified Chinese residue
      else if (node.length >= 2 && simpRe.test(node)) {
        add(node, base, keyPath);
      }
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => rec(v, keyPath + "[" + i + "]"));
    } else if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        if (SKIP_LEAF.test(k)) continue;
        rec(node[k], keyPath ? keyPath + "." + k : k);
      }
    }
  })(data, "");
}

// Also collect hotel priceRange with 円 (should be 元) — special handling
const priceRanges = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  if (Array.isArray(data.hotels)) {
    data.hotels.forEach((h, i) => {
      if (typeof h.priceRange === "string" && h.priceRange.includes("円")) {
        priceRanges.push({ file: path.basename(f), idx: i, val: h.priceRange });
      }
    });
  }
}

console.log("unique strings:", Object.keys(locations).length);
fs.writeFileSync(".audit/ja-city-translate-locations.json", JSON.stringify(locations, null, 1));
fs.writeFileSync(".audit/ja-city-price-range.json", JSON.stringify(priceRanges, null, 1));
const en = Object.keys(locations).filter((s) => !simpRe.test(s));
const cn = Object.keys(locations).filter((s) => simpRe.test(s));
console.log("english-like:", en.length, "| chinese-like:", cn.length);
console.log("priceRange 円 issues:", priceRanges.length);
