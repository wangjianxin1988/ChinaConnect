import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/xiamen.json","utf8"));
console.log(JSON.stringify(j.restaurants[2].dishHighlights));
