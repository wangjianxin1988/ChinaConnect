import fs from "node:fs";

const p = "src/pages/[lang]/city/[slug].astro";
let s = fs.readFileSync(p, "utf8");
const a = '<span class="text-sm font-semibold text-gray-800">{cat.labelEn || cat.label}</span>';
const b = '<span class="text-[10px] text-gray-400 uppercase tracking-wide">{cat.labelEn}</span>';
const a2 = '<span class="text-sm font-semibold text-gray-800">{lang === "ja" ? cat.label : cat.labelEn || cat.label}</span>';
const b2 = '<span class="text-[10px] text-gray-400 uppercase tracking-wide">{lang === "ja" ? cat.label : cat.labelEn}</span>';
let n = 0;
if (s.includes(a)) { s = s.split(a).join(a2); n++; }
if (s.includes(b)) { s = s.split(b).join(b2); n++; }
fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("replaced", n);
