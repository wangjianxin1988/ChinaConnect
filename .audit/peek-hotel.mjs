import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/sanya.json","utf8"));
j.hotels.slice(0,8).forEach(h=>console.log(JSON.stringify({name:h.name, nameEn:h.nameEn, nameJa:h.nameJa})));
