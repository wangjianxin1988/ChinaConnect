import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const BLOCK_RE = /\n(\s*)(["']?)([a-zA-Z-]{2,10})\2\s*:\s*\{/g;
const blocks = [];
for (const m of text.matchAll(BLOCK_RE)) {
  if (LANGS.includes(m[3])) blocks.push({ lang: m[3], start: m.index });
}
blocks.sort((a, b) => a.start - b.start);
const blockEnd = (i) => (i + 1 < blocks.length ? blocks[i + 1].start : text.length);
function parseObject(src) {
  const values = new Map();
  const lines = src.split(/\r?\n/);
  const stack = [];
  for (const line of lines) {
    const trim = line.trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) { stack.pop(); continue; }
    const valMatch = /^([A-Za-z0-9_]+)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      const raw = valMatch[3] !== undefined ? valMatch[3] : valMatch[4];
      values.set(key, raw);
    }
  }
  return values;
}
const dicts = {};
for (let i = 0; i < blocks.length; i += 1) dicts[blocks[i].lang] = parseObject(text.slice(blocks[i].start, blockEnd(i)));
for (const lang of ["en", "ko", "ja"]) {
  const d = dicts[lang];
  console.log(lang, "scenicSpots.title =", JSON.stringify(d.get("scenicSpots.title")));
  console.log(lang, "scenicSpots.allSpots =", JSON.stringify(d.get("scenicSpots.allSpots")));
}
console.log("ko total keys:", dicts.ko.size, "en:", dicts.en.size, "ja:", dicts.ja.size);
