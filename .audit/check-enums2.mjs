import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const emType = {}, emCat = {}, resCat = {}, payIcon = {};
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const e of d.emergencyContacts || []) { emType[e.type] = (emType[e.type] || 0) + 1; emCat[e.category] = (emCat[e.category] || 0) + 1; }
  for (const r of d.restaurants || []) resCat[r.category] = (resCat[r.category] || 0) + 1;
  for (const p of d.payment || []) payIcon[p.icon] = (payIcon[p.icon] || 0) + 1;
}
console.log("emergency.type:", JSON.stringify(emType));
console.log("emergency.category:", JSON.stringify(emCat));
console.log("restaurant.category:", JSON.stringify(resCat));
console.log("payment.icon:", JSON.stringify(payIcon));
