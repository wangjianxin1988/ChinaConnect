import fs from "node:fs";
const p = "src/pages/[lang]/guide/business/index.astro";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
s = s.replace('"営業時間"', '"開く"');
const tmp = p + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, p);
console.log("fixed open label");
