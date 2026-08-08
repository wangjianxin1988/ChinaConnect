import fs from "fs";
import path from "path";

const TS_FILE = "src/i18n/translations.ts";
const BLOG_FILE = "src/i18n/blog.ts";
const SUPPORTED = ["en", "ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];

function extractBlock(src, lang) {
  const lines = src.split("\n");
  let startLine = -1;
  const re = new RegExp("^  (\"?" + lang.replace("-", "\\-") + "\"?):\\s*\\{?$");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) { startLine = i; break; }
  }
  if (startLine === -1) throw new Error("Block not found: " + lang);
  const flat = {};
  // Recursive parser using stack-based indent depth
  let depth = 0;
  let inBlock = false;
  const stack = [];
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{") {
        depth++;
        if (depth === 2 && !inBlock) inBlock = true;
      }
      if (ch === "}") {
        depth--;
        if (inBlock && depth === 1) {
          stack.pop();
        }
        if (inBlock && depth === 0) return flat;
      }
    }
    // Skip if not in inner block
    if (!inBlock) continue;
    // Trim leading whitespace
    const km = line.match(/^(\s+)([a-zA-Z][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!km) continue;
    const indent = km[1].length;
    const name = km[2];
    const rhs = km[3].trim();
    // Depth: 4 = first inner level (2 spaces from block start)
    const curDepth = Math.floor((indent - 2) / 2);
    while (stack.length > curDepth - 1) stack.pop();
    stack.push(name);
    if (rhs.startsWith('"')) {
      const m = rhs.match(/^"((?:[^"\\]|\\.)*)"/);
      if (m) flat[stack.join(".")] = m[1].replace(/\\\\/g, "\\").replace(/\\"/g, '"');
    }
    // { opens namespace -> do nothing here; } handled above
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
  if (missing.length) {
    badLang++;
    totalMissing += missing.length;
    console.log("\n" + lang + " missing " + missing.length + ":");
    for (const k of missing.slice(0, 12)) console.log("  - " + k);
    if (missing.length > 12) console.log("  ...");
  }
}

console.log("\nTranslation summary:");
console.log("  en baseline keys: " + enKeys.size);
console.log("  languages checked: " + SUPPORTED.length);
console.log("  languages with gaps: " + badLang + " / " + SUPPORTED.length);
console.log("  total missing keys: " + totalMissing);

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
  const re1 = /data-i18n=["\']([\w.\-]+)["\']/g;
  const re2 = /\bt\(\s*["\']([\w.\-]+)["\']\s*\)/g;
  const re3 = /\bt\(["\']([\w.\-]+)["\']\)/g;
  const re4 = /\bi18nKey[\s]*=[\s]*["\']([\w.\-]+)["\']/g;
  const re5 = /lookup\(\s*t,\s*["\']([\w.\-]+)["\']/g;
  const re6 = /\bt\(\s*t,\s*["\']([\w.\-]+)["\']/g;
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

let blogOk = true;
if (fs.existsSync(BLOG_FILE)) {
  const blogSrc = fs.readFileSync(BLOG_FILE, "utf8");
  const slugSets = {};
  for (const lang of SUPPORTED) {
    const re = new RegExp('"' + lang.replace("-", "\\-") + '":\\s*\\[([^\\]]*)\\]', "s");
    const m = blogSrc.match(re);
    const slugs = [];
    if (m && m[1]) {
      const slugRe = /slug:\s*"([^"]+)"/g;
      let s;
      while ((s = slugRe.exec(m[1]))) slugs.push(s[1]);
    }
    slugSets[lang] = slugs.sort();
  }
  const ref = slugSets.en.join(",");
  let blogBad = 0;
  for (const lang of SUPPORTED) {
    if (slugSets[lang].join(",") !== ref) {
      blogBad++;
      console.log("  BLOG: " + lang + " slugs mismatch");
    }
  }
  if (blogBad > 0) blogOk = false;
  else console.log("  blog slug coverage: all 12 languages aligned");
}

if (badLang > 0 || usedMissingInEn.length > 0 || !blogOk) {
  console.log("\nFAIL: i18n coverage gaps detected.");
  process.exit(1);
} else {
  console.log("\nOK: all languages have full coverage.");
}