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
    const valMatch = /^([A-Za-z0-9_]+)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      const quote = valMatch[3] !== undefined ? '"' : "'";
      const rawVal = valMatch[3] !== undefined ? valMatch[3] : valMatch[4];
      values.set(key, { line: baseLine + li, raw: rawVal, quote, value: rawVal.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n") });
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
for (const lang of ["en", "ja", "ko"]) {
  const d = dicts[lang];
  console.log(lang, "scenicSpots.title:", JSON.stringify(d.get("scenicSpots.title")));
  console.log(lang, "scenicSpots.spotsCount:", JSON.stringify(d.get("scenicSpots.spotsCount")));
}
console.log("ko keys starting scenicSpots:", [...dicts.ko.keys()].filter((k) => k.startsWith("scenicSpots")).slice(0, 12));
console.log("en keys starting scenicSpots:", [...dicts.en.keys()].filter((k) => k.startsWith("scenicSpots")).slice(0, 12));
