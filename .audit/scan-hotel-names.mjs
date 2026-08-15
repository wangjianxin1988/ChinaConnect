import fs from "node:fs";
const KANA = /[\u3040-\u30ff]/;
let total = 0, chineseOnly = 0;
const samples = [];
for (const f of fs.readdirSync("src/data/cities-i18n/ja").filter(x=>x.endsWith(".json")).sort()) {
  const j = JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${f}`,"utf8"));
  for (const h of j.hotels || []) {
    total++;
    const n = h.name || "";
    if (!KANA.test(n) && /[\u3400-\u4dbf\u4e00-\u9fff]/.test(n)) { chineseOnly++; if (samples.length < 120) samples.push(`${f} :: ${n} | ${h.nameEn}`); }
  }
}
console.log("hotels total:", total, "| no-kana names:", chineseOnly);
for (const s of samples) console.log(s);
