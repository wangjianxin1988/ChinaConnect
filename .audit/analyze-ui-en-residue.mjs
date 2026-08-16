import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";

const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const BLOCK_RE = /\n(\s*)(["']?)([a-zA-Z-]{2,10})\2\s*:\s*\{/g;
const blocks = [];
for (const m of text.matchAll(BLOCK_RE)) {
  if (LANGS.includes(m[3])) blocks.push({ lang: m[3], start: m.index, indent: m[1].length });
}
blocks.sort((a, b) => a.start - b.start);
const blockEnd = (i) => (i + 1 < blocks.length ? blocks[i + 1].start : text.length);

function parseObject(src) {
  // crude brace matcher returning {values: Map<keyPath, string>, keys: Map<keyPath, fullLineStart>}
  const values = new Map();
  const lines = src.split(/\r?\n/);
  const stack = [];
  for (const line of lines) {
    const trim = line.trim();
    const objMatch = /^([A-Za-z0-9_]+)\s*:\s*\{/.exec(trim);
    if (objMatch) { stack.push(objMatch[1]); continue; }
    if (trim.startsWith("}")) { stack.pop(); continue; }
    const valMatch = /^([A-Za-z0-9_]+)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      const raw = valMatch[3] !== undefined ? valMatch[3] : valMatch[4];
      values.set(key, raw.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n"));
    }
  }
  return values;
}

const dicts = {};
for (let i = 0; i < blocks.length; i += 1) {
  const src = text.slice(blocks[i].start, blockEnd(i));
  dicts[blocks[i].lang] = parseObject(src);
}
const en = dicts.en;
const ja = dicts.ja;
for (const lang of LANGS.slice(1)) {
  const d = dicts[lang];
  const sameAsEn = [], sameAsJa = [];
  for (const [k, v] of d) {
    if (!v || v.trim().length === 0) continue;
    const enV = en.get(k);
    const jaV = ja.get(k);
    const isProse = (s) => s.includes(" ") || s.length > 12;
    if (enV && v === enV && isProse(enV) && !isKeepableToken(enV)) sameAsEn.push(k);
    else if (jaV && v === jaV && isProse(jaV) && !isKeepableToken(jaV)) sameAsJa.push(k);
  }
  console.log(`[${lang}] same-as-en: ${sameAsEn.length}, same-as-ja: ${sameAsJa.length}`);
  if (sameAsEn.length) console.log("   sample en:", sameAsEn.slice(0, 8).map((k) => `${k}=${en.get(k).slice(0, 40)}`).join(" | "));
  if (sameAsJa.length) console.log("   sample ja:", sameAsJa.slice(0, 5).map((k) => `${k}=${ja.get(k).slice(0, 30)}`).join(" | "));
}
