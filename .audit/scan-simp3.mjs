import fs from "node:fs";
const SIMP = new Set(JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8")));
const kanaRe = /[\u3040-\u30ff]/;
const hanRe = /[\u4e00-\u9fff]/;
function simpCount(s) { let n = 0; for (const ch of s) if (SIMP.has(ch)) n++; return n; }
const dir = "src/data/cities-i18n/ja";
const byFile = {};
let total = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8").replace(/\r\n/g, "\n"));
  const hits = [];
  (function walk(obj, path) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, path + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) walk(obj[k], path ? path + "." + k : k); return; }
    if (typeof obj === "string" && obj.length >= 2 && obj.length < 300 && hanRe.test(obj)) {
      const n = simpCount(obj);
      const kana = kanaRe.test(obj);
      const han = (obj.match(hanRe) || []).length;
      if (n >= 2 || (n >= 1 && !kana && han >= 2)) hits.push({ path, value: obj, n });
    }
  })(data, "");
  if (hits.length) { byFile[f] = hits; total += hits.length; }
}
console.log("files with simplified residue:", Object.keys(byFile).length, "strings:", total);
for (const [f, hits] of Object.entries(byFile)) {
  console.log("=== " + f + " (" + hits.length + ")");
  for (const h of hits) console.log("  [" + h.n + "] " + h.path + " => " + JSON.stringify(h.value).slice(0, 130));
}
