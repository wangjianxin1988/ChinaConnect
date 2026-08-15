import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const budgetVals = {}, catVals = {}, ttypeVals = {};
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const h of d.hotels || []) budgetVals[h.budget] = (budgetVals[h.budget] || 0) + 1;
  for (const a of d.attractions || []) catVals[a.category] = (catVals[a.category] || 0) + 1;
  for (const arr of (d.transport?.arrival || [])) ttypeVals[arr.type] = (ttypeVals[arr.type] || 0) + 1;
}
console.log("hotel.budget:", JSON.stringify(budgetVals));
console.log("attraction.category:", JSON.stringify(catVals));
console.log("transport.type:", JSON.stringify(ttypeVals));
