import fs from "fs";
const TS_FILE = "src/i18n/translations.ts";
const SUPPORTED = ["en","ja","ko","th","vi","ru","fr","de","ar","fa","zh-CN","zh-TW"];
function extractBlock(src, lang) {
  const lines = src.split("\n").map((l) => l.replace(/\r$/, ""));
  let startLine = -1;
  const re = new RegExp("^  (\"?" + lang.replace("-", "\\-") + "\"?):\\s*\\{?\\r?$");
  for (let i = 0; i < lines.length; i++) { if (re.test(lines[i])) { startLine = i; break; } }
  if (startLine === -1) throw new Error("Block not found: " + lang);
  const flat = {}; let depth = 0; let inBlock = false; const stack = [];
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{") { depth++; if (depth === 2 && !inBlock) inBlock = true; }
      if (ch === "}") { depth--; if (inBlock && depth === 0) return flat; }
    }
    if (!inBlock) continue;
    const km = line.match(/^(\s+)([a-zA-Z][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!km) continue;
    const indent = km[1].length; const name = km[2]; const rhs = km[3].trim();
    const curDepth = Math.floor((indent - 2) / 2);
    while (stack.length > curDepth - 1) stack.pop();
    stack.push(name);
    if (rhs.startsWith('"')) {
      const m = rhs.match(/^"((?:[^"\\]|\\.)*)"/);
      if (m) flat[stack.join(".")] = m[1].replace(/\\\\/g, "\\").replace(/\\"/g, '"');
    }
  }
  return flat;
}
const src = fs.readFileSync(TS_FILE, "utf8");
const blocks = {};
for (const lang of SUPPORTED) blocks[lang] = extractBlock(src, lang);
const en = blocks.en;
for (const lang of SUPPORTED.slice(1)) {
  const b = blocks[lang];
  let same = 0; const examples = [];
  for (const k of Object.keys(en)) {
    const ev = en[k].trim(); const lv = (b[k]||"").trim();
    if (ev && lv && ev.toLowerCase() === lv.toLowerCase()) { same++; if (examples.length < 6) examples.push(k + " = " + ev.slice(0,60)); }
  }
  console.log(lang, "identical-to-EN:", same, "/", Object.keys(en).length);
  for (const e of examples) console.log("   ", e);
}
