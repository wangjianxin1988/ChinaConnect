import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
// ko block: line 12828 scenicSpots, block starts before. Find "  ko: {" start.
let koStart = -1;
for (let i = 12828 - 1; i >= 0; i -= 1) {
  if (/^  ko: \{/.test(lines[i])) { koStart = i; break; }
}
// find next top-level lang block after koStart
let koEnd = text.length;
for (let i = koStart + 1; i < lines.length; i += 1) {
  if (/^  (["']?)(en|ja|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)\1: \{/.test(lines[i])) { koEnd = i; break; }
}
const src = lines.slice(koStart, koEnd).join("\n");
const parseObject = (s) => {
  const values = new Map();
  const ls = s.split(/\r?\n/);
  const stack = [];
  for (const line of ls) {
    const trim = line.trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) { stack.pop(); continue; }
    const valMatch = /^([A-Za-z0-9_]+)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      values.set(key, valMatch[3] !== undefined ? valMatch[3] : valMatch[4]);
    }
  }
  return values;
};
const d = parseObject(src);
console.log("ko block lines:", koStart + 1, "-", koEnd + 1, "keys:", d.size);
console.log("scenicSpots.title:", JSON.stringify(d.get("scenicSpots.title")));
console.log("has scenicSpots.*:", [...d.keys()].filter((k) => k.startsWith("scenicSpots")).slice(0, 5));
