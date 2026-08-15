import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/shenzhen.json","utf8"));
j.attractions[4].address = "深セン市南山区蛇口、水木広場（ミズキ・ピアッツァ）";
fs.writeFileSync("src/data/cities-i18n/ja/shenzhen.json", JSON.stringify(j, null, 2) + "\n", "utf8");
console.log("fixed");
