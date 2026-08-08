// Validate i18n coverage across all 12 languages.
// Run via `pnpm check:i18n` and in CI.
import fs from "fs";
import path from "path";

const TS_FILE = "src/i18n/translations.ts";
const SUPPORTED = ["en", "ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];

function extractBlock(src, lang) {
  const lines = src.split("\n");
  let startLine = -1;
  const re = new RegExp("^  (\"?" + lang.replace("-", "\\-") + "\"?):\\s*\\{?$");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i]) && (lines[i].endsWith("{") || (lines[i+1] && lines[i+1].trim() === "{"))) {
      startLine = i; break;
    }
  }
  if (startLine === -1) throw new Error("Block not found: " + lang);
  const flat = {};
  const stack = [];
  let d = 0; let inBlock = false;
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    const km = line.match(/^(\s+)([a-zA-Z][a-zA-Z0-9]*):/);
    if (km) {
      const indent = km[1].length;
      const name = km[2];
      const curDepth = Math.floor((indent - 2) / 2);
      if (curDepth >= 1 && curDepth <= stack.length + 1) {
        stack.length = curDepth - 1;
        const key = [...stack, name].join(".");
        if (!/\{$/.test(line.trim())) {
          const v = line.match(/:\s*"((?:[^"\\]|\\.)*)"/);
          if (v) flat[key] = v[1];
        }
        if (/\{$/.test(line.trim())) stack.push(name);
      }
    }
    for (const ch of line) {
      if (ch === "{") { d++; if (!inBlock) inBlock = true; }
      else if (ch === "}") { d--; if (inBlock && d === 0) return flat; }
    }
  }
  return flat;
}

const src = fs.readFileSync(TS_FILE, "utf8");
const blocks = {};
for (const lang of SUPPORTED) blocks[lang] = extractBlock(src, lang);

const enKeys = new Set(Object.keys(blocks.en));
let totalMissing = 0;
let badLang = 0;
for (const lang of SUPPORTED) {
  const present = new Set(Object.keys(blocks[lang]));
  const missing = [...enKeys].filter(k => !present.has(k));
  const extra = [...present].filter(k => !enKeys.has(k));
  if (missing.length || extra.length) badLang++;
  totalMissing += missing.length;
  if (missing.length) {
    console.log("\n" + lang + " missing " + missing.length + ":");
    for (const k of missing.slice(0, 12)) console.log("  - " + k);
    if (missing.length > 12) console.log("  ...");
  }
  if (extra.length) {
    console.log(lang + " extra (not in en): " + extra.length);
  }
}

console.log("\nSummary:");
console.log("  en baseline keys: " + enKeys.size);
console.log("  languages checked: " + SUPPORTED.length);
console.log("  languages with gaps: " + badLang + " / " + SUPPORTED.length);
console.log("  total missing keys: " + totalMissing);

// Also scan src/ for used keys to flag ones still in code but missing in ALL langs
function walk(d) {
  const r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "dist" || e.name === ".astro" || e.name === ".wrangler") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) r.push(...walk(p));
    else if (/\.(astro|tsx|ts|jsx|js|mjs|cjs|html|mdx|md)$/.test(e.name)) r.push(p);
  }
  return r;
}
const used = new Set();
for (const f of walk("src")) {
  const c = fs.readFileSync(f, "utf8");
  const re1 = /data-i18n=["'\'']([\w.\-]+)["'\'']/g;
  const re2 = /\bt\(\s*["'\'']([\w.\-]+)["'\'']\s*\)/g;
  const re3 = /\bt\(["'\'']([\w.\-]+)["'\'']\)/g;
  const re4 = /\bi18nKey[\s]*=[\s]*["'\'']([\w.\-]+)["'\'']/g;
  const re5 = /lookup\(\s*t,\s*["'\'']([\w.\-]+)["'\'']/g;
  const re6 = /\bt\(\s*t,\s*["'\'']([\w.\-]+)["'\'']/g;
  let m;
  while ((m = re1.exec(c))) used.add(m[1]);
  while ((m = re2.exec(c))) used.add(m[1]);
  while ((m = re3.exec(c))) used.add(m[1]);
  while ((m = re4.exec(c))) used.add(m[1]);
  while ((m = re5.exec(c))) used.add(m[1]);
  while ((m = re6.exec(c))) used.add(m[1]);
}
console.log("  used keys in src: " + used.size);
const usedMissingInEn = [...used].filter(k => !enKeys.has(k) && !/^[a-z]+$/.test(k));
if (usedMissingInEn.length) {
  console.log("\n  USED keys missing in en baseline (BUG):");
  for (const k of usedMissingInEn.slice(0, 20)) console.log("  - " + k);
}

// Pass/fail
if (badLang > 0 || usedMissingInEn.length > 0) {
  console.log("\nFAIL: i18n coverage gaps detected.");
  process.exit(1);
} else {
  console.log("\nOK: all languages have full coverage.");
}