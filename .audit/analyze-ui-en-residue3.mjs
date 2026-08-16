import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";

const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const blocks = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = /^  (["']?)([a-zA-Z-]{2,10})\1: \{/.exec(lines[i]);
  if (m && LANGS.includes(m[2])) blocks.push({ lang: m[2], startLine: i });
}
function parseBlock(ls) {
  const values = new Map();
  const stack = [];
  for (const line of ls) {
    const trim = line.trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) { if (stack.length) stack.pop(); continue; }
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
for (let b = 0; b < blocks.length; b += 1) {
  const start = blocks[b].startLine;
  const end = b + 1 < blocks.length ? blocks[b + 1].startLine : lines.length;
  dicts[blocks[b].lang] = parseBlock(lines.slice(start, end - 1));
}
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
    if (enV && v === enV && isProse(enV) && !isKeepableToken(enV)) sameAsEn.push(k);
    if (jaV && v === jaV && isProse(jaV) && !isKeepableToken(jaV) && /[\u3040-\u30ff]/.test(jaV)) sameAsJa.push(k);
  }
  console.log(`[${lang}] same-as-en: ${sameAsEn.length}, same-as-ja-kana: ${sameAsJa.length}`);
  if (sameAsEn.length) console.log("   en:", sameAsEn.slice(0, 4).map((k) => `${k} = ${en.get(k).slice(0, 40)}`).join(" | "));
  if (sameAsJa.length) console.log("   ja:", sameAsJa.slice(0, 3).map((k) => `${k} = ${ja.get(k).slice(0, 30)}`).join(" | "));
}
