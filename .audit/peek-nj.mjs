import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/nanjing.json","utf8"));
console.log(JSON.stringify(j.attractions[10].highopts));
const en = JSON.parse(fs.readFileSync("src/data/cities/nanjing.json","utf8"));
console.log("EN:", JSON.stringify(en.attractions[10].highlights));
