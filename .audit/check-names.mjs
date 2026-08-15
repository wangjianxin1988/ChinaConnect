import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const hits = [];
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const sections = { attractions: d.attractions, restaurants: d.restaurants, hotels: d.hotels, emergency: d.emergencyContacts };
  for (const [sec, list] of Object.entries(sections)) {
    for (const item of list || []) {
      if (typeof item.name === "string" && item.name.length >= 2 && !CJK.test(item.name) && /[A-Za-z]{3}/.test(item.name)) {
        hits.push({ file: f, sec, id: item.id, name: item.name, nameEn: item.nameEn });
      }
    }
  }
}
console.log("English names:", hits.length);
for (const h of hits.slice(0, 40)) console.log(h.file, h.sec, h.id, "| name:", JSON.stringify(h.name).slice(0, 60), "| nameEn:", JSON.stringify(h.nameEn).slice(0, 60));
