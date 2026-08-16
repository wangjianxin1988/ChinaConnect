import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const blocks = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = /^  (["']?)([a-zA-Z-]{2,10})\1: \{/.exec(lines[i]);
  if (m && LANGS.includes(m[2])) blocks.push({ lang: m[2], startLine: i });
}
function parseBlock(ls, baseLine) {
  const values = new Map();
  const stack = [];
  for (let li = 0; li < ls.length; li += 1) {
    const trim = ls[li].trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) { if (stack.length) stack.pop(); continue; }
    const valMatch = /^([A-Za-z0-9_]+\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$)/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      const rawVal = valMatch[3] !== undefined ? valMatch[3] : valMatch[4];
      values.set(key, { line: baseLine + li, raw: rawVal, value: rawVal.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n") });
    }
  }
  return values;
}
const dicts = {};
for (let b = 0; b < blocks.length; b += 1) {
  const start = blocks[b].startLine;
  const end = b + 1 < blocks.length ? blocks[b + 1].startLine : lines.length;
  dicts[blocks[b].lang] = parseBlock(lines.slice(start + 1, end - 1), start + 1);
}
const { isKeepableToken } = await import("./../scripts/lib/translation-accept.mjs");
const en = dicts.en, ja = dicts.ja;
const d = dicts.ko;
for (const [k, info] of d) {
  const v = info.value;
  if (!v || v.trim().length === 0) continue;
  const enV = en.get(k)?.value;
  const jaV = ja.get(k)?.value;
  const isProse = (s) => s.includes(" ") || s.length > 12;
  if (jaV && jaV === v) continue;
  if (enV && v === enV && isProse(enV) && !isKeepableToken(enV)) {
    console.log(k, "=>", enV.slice(0, 60));
  }
}
