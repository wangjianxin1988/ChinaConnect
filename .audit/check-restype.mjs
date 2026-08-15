import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const resType = {};
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const r of d.restaurants || []) resType[r.type] = (resType[r.type] || 0) + 1;
}
console.log("restaurant.type:", JSON.stringify(resType));
