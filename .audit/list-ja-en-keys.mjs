import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
// extract ja block and list same-as-en keys (from previous logic)
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
    const valMatch = /^([A-Za-z0-9_]+\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*)$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[2]].join(".");
      values.set(key, (valMatch[3] !== undefined ? valMatch[3] : valMatch[4]).replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n"));
    }
  }
  return values;
}
const dicts = {};
for (let b = 0; b < blocks.length; b += 1) {
  const start = blocks[b].startLine;
  const end = b + 1 < blocks.length ? blocks[b + 1].startLine : lines.length;
  dicts[blocks[b].lang] = parseBlock(lines.slice(start + 1, end - 1));
}
const en = dicts.en;
for (const [k, v] of dicts.ja) {
  const enV = en.get(k);
  if (enV && v === enV && (v.includes(" ") || v.length > 12)) {
    console.log(k, "=", v.slice(0, 70));
  }
}
