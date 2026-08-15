import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/lijiang.json","utf8"));
j.emergencyContacts.slice(0,8).forEach(c=>console.log(JSON.stringify({type:c.type,name:c.name,nameEn:c.nameEn,nameJa:c.nameJa,address:c.address})));
