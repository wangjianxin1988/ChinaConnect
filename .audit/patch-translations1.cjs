const fs = require("fs");
const p = "src/i18n/translations.ts";
let src = fs.readFileSync(p, "utf8");
function replaceAll(src, pattern, replacement) {
  const re = new RegExp(pattern, "g");
  const count = (src.match(re) || []).length;
  return { out: src.replace(re, replacement), count };
}

let r;

// 1) ja aiPage.description
r = replaceAll(src, '(ja: \\{\\s*accommodationGuide)', 'ja: {\n    aiPage: { description: "中国旅行のパーソナルアシスタント — 旅程、現地情報、リアルタイムガイダンス。", },\n    accommodationGuide');
console.log("aiPage.description (skip if 0 — done elsewhere):", r.count);
src = r.out;

fs.writeFileSync(p, src);
console.log("ok");
