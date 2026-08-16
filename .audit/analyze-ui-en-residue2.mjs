import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";

const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];

// Char-level scanner: find top-level lang blocks and extract key->value pairs with paths.
function scanLangBlocks(text) {
  const blocks = [];
  const re = /\n {2}(["']?)([a-zA-Z-]{2,10})\1: \{/g;
  let m;
  while ((m = re.exec(text))) {
    const lang = m[2];
    if (LANGS.includes(lang)) blocks.push({ lang, start: m.index + 1 });
  }
  blocks.sort((a, b) => a.start - b.start);
  for (let i = 0; i < blocks.length; i += 1) {
    blocks[i].end = i + 1 < blocks.length ? blocks[i + 1].start : text.length;
  }
  return blocks;
}

function parseBlock(src) {
  // Extract path->value using char scan honoring strings and braces.
  const values = new Map();
  const pathStack = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      let str = "";
      while (j < n) {
        if (src[j] === "\\") { str += src[j] + (src[j + 1] || ""); j += 2; continue; }
        if (src[j] === quote) break;
        str += src[j]; j += 1;
      }
      // Determine context: this string is a key (followed by :) or a value.
      let k = j + 1;
      while (k < n && /\s/.test(src[k])) k += 1;
      if (src[k] === ":") {
        // key
        const key = str;
        pathStack.push(key);
        // find value after colon
        k += 1;
        while (k < n && /\s/.test(src[k])) k += 1;
        if (src[k] === "{") { i = k; continue; } // object value, keep path
        // scalar value
        const vq = src[k];
        if (vq === '"' || vq === "'" || vq === "`") {
          let v = k + 1, val = "";
          while (v < n) {
            if (src[v] === "\\") { val += src[v] + (src[v + 1] || ""); v += 2; continue; }
            if (src[v] === vq) break;
            val += src[v]; v += 1;
          }
          values.set(pathStack.join("."), val);
          pathStack.pop();
          i = v + 1;
          continue;
        }
        pathStack.pop();
        i = k;
        continue;
      }
      // bare string (value in an object without explicit key parsing)
      i = j + 1;
      continue;
    }
    if (ch === "{") { i += 1; continue; }
    if (ch === "}") { pathStack.pop(); i += 1; continue; }
    i += 1;
  }
  return values;
}

const blocks = scanLangBlocks(text);
const dicts = {};
for (const b of blocks) dicts[b.lang] = parseBlock(text.slice(b.start, b.end));
const en = dicts.en, ja = dicts.ja;
console.log("key counts:", Object.fromEntries(Object.entries(dicts).map(([l, d]) => [l, d.size])));
for (const lang of LANGS.slice(1)) {
  const d = dicts[lang];
  const sameAsEn = [], sameAsJa = [];
  for (const [k, v] of d) {
    if (!v || v.trim().length === 0) continue;
    const enV = en.get(k);
    const jaV = ja.get(k);
    const isProse = (s) => s.includes(" ") || s.length > 12;
    if (lang !== "ja" && enV && v === enV && isProse(enV) && !isKeepableToken(enV)) sameAsEn.push(k);
    if (lang === "ja") { /* skip */ }
    else if (jaV && v === jaV && isProse(jaV) && !isKeepableToken(jaV) && /[\u3040-\u30ff]/.test(jaV)) sameAsJa.push(k);
  }
  console.log(`[${lang}] same-as-en: ${sameAsEn.length}, same-as-ja(kana): ${sameAsJa.length}`);
  if (sameAsEn.length) console.log("   en sample:", sameAsEn.slice(0, 5).map((k) => `${k} = ${en.get(k).slice(0, 45)}`).join(" | "));
  if (sameAsJa.length) console.log("   ja sample:", sameAsJa.slice(0, 3).map((k) => `${k}`).join(" | "));
}
