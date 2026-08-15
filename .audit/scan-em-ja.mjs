import fs from "node:fs";
let missing = [];
for (const f of fs.readdirSync("src/data/cities-i18n/ja").filter(x=>x.endsWith(".json")).sort()) {
  const j = JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${f}`,"utf8"));
  for (const c of j.emergencyContacts || []) {
    const hasJa = c.nameJa && c.nameJa.trim();
    if (!hasJa) missing.push({file:f, type:c.type, name:c.name, nameEn:c.nameEn});
  }
}
console.log("missing nameJa:", missing.length);
for (const m of missing) console.log(JSON.stringify(m));
