import fs from "node:fs";
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
for (const f of fs.readdirSync("src/data/cities-i18n/ja").filter(x=>x.endsWith(".json")).sort()) {
  const j = JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${f}`,"utf8"));
  for (const c of j.emergencyContacts || []) {
    if (c.address && !CJK.test(c.address) && c.address.trim()) {
      console.log(`${f} :: ${c.type} :: ${c.nameJa||c.name} :: ${JSON.stringify(c.address)}`);
    }
  }
}
