import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/sanya.json","utf8"));
j.emergencyContacts.filter(c=>c.type==="embassy").forEach(c=>console.log(JSON.stringify(c)));
