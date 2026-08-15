const fs = require("fs");
const p = "src/pages/[lang]/city/[slug].astro";
let src = fs.readFileSync(p, "utf8");
function replaceAll(src, pattern, replacement) {
  const re = new RegExp(pattern, "g");
  const count = (src.match(re) || []).length;
  return { out: src.replace(re, replacement), count };
}
// Main label: for ja show Japanese label
let r = replaceAll(src, '<span class="text-sm font-semibold text-gray-800">{cat.labelEn || cat.label}</span>', '<span class="text-sm font-semibold text-gray-800">{lang === "ja" ? cat.label : cat.labelEn || cat.label}</span>');
console.log("main label:", r.count);
src = r.out;
// Bottom small label
r = replaceAll(src, '<span class="text-[10px] text-gray-400 uppercase tracking-wide">{cat.labelEn}</span>', '<span class="text-[10px] text-gray-400 uppercase tracking-wide">{lang === "ja" ? cat.label : cat.labelEn}</span>');
console.log("bottom label:", r.count);
src = r.out;
fs.writeFileSync(p, src);
