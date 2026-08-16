const fs = require("fs");
const p = ".audit/scan_full_pages.mjs";
let src = fs.readFileSync(p, "utf8");
// 1) Add Latin-script diacritics heuristic after ADDR_OK definition
const anchor = "const ADDR_OK = /\\b(Beijing|Shanghai";
const diacritics = `
const LATIN_LANGS = new Set(["vi", "fr", "de"]);
const DIACRITIC_RE = /[\\u00C0-\\u017F\\u1E00-\\u1EFF\\u0300-\\u036F]/; // Latin-1/Extended-A/B + combining marks`;
if (src.includes("LATIN_LANGS")) {
  console.log("already patched");
  process.exit(0);
}
src = src.replace("const ADDR_OK = /\\b(Beijing|Shanghai", diacritics + "\nconst ADDR_OK = /\\b(Beijing|Shanghai");
// 2) In analyzeText, for Latin langs require ASCII-only to flag EN
const oldCheck = "if (lang !== \"en\" && foreign.length >= 4 && t.replace(/[^A-Za-z]/g, \"\").length >= 25) {";
const newCheck = `if (lang !== "en" && foreign.length >= 4 && t.replace(/[^A-Za-z]/g, "").length >= 25) {
      // For Latin-script languages, only flag lines that are essentially pure ASCII
      if (LATIN_LANGS.has(lang) && DIACRITIC_RE.test(t)) continue;`;
if (!src.includes(newCheck.trim().split("\n")[1])) {
  src = src.replace(oldCheck, newCheck);
}
// 3) EN: also flag pure-CJK-heavy lines (English page containing Chinese prose) - keep existing CJK check but add for en any length
const cjkOld = "if (lang !== \"zh-CN\" && lang !== \"zh-TW\" && lang !== \"ja\") {\n      const cjk = t.match(CJK_RE);";
const cjkNew = "if (lang !== \"zh-CN\" && lang !== \"zh-TW\" && lang !== \"ja\") {\n      const cjk = t.match(CJK_RE);\n      if (cjk && lang === \"en\" && t.length > 12) issues.push(\"CJK-EN: \\\"\" + t.slice(0, 110) + \"\\\"\");";
if (!src.includes("CJK-EN:")) {
  src = src.replace(cjkOld, cjkNew);
}
fs.writeFileSync(p, src, "utf8");
console.log("patched scan_full_pages.mjs");
