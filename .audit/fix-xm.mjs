import fs from "node:fs";
const fp = "src/data/cities-i18n/ja/xiamen.json";
const j = JSON.parse(fs.readFileSync(fp,"utf8"));
j.restaurants[2].dishHighlights[2] = "シーフード粥";
fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n", "utf8");
console.log("ok");
