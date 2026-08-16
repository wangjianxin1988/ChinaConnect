import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
const blocks = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = /^  (["']?)([a-zA-Z-]{2,10})\1: \{/.exec(lines[i]);
  if (m && ["ko", "en", "ja"].includes(m[2])) blocks.push({ lang: m[2], startLine: i });
}
function parseBlock(ls) {
  const values = new Map();
  const stack = [];
  for (let li = 0; li < ls.length; li += 1) {
    const trim = ls[li].trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) { if (stack.length) stack.pop(); continue; }
    const valMatch = /^([A-Za-z0-9_]+)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      values.set(key, valMatch[3] !== undefined ? valMatch[3] : valMatch[4]);
    }
  }
  return { values, stack };
}
for (let b = 0; b < blocks.length; b += 1) {
  const start = blocks[b].startLine;
  const end = b + 1 < blocks.length ? blocks[b + 1].startLine : lines.length;
  const { values, stack } = parseBlock(lines.slice(start, end - 1));
  console.log(blocks[b].lang, "scenicSpots.title:", JSON.stringify(values.get("scenicSpots.title")), "| stack depth:", stack.length, stack.slice(-3));
}
