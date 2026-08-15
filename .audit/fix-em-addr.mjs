import fs from "node:fs";
const ADDR = {
  "Guangzhou": "広州", "Shanghai": "上海", "Chongqing": "重慶", "Chengdu": "成都",
  "Kunming": "昆明", "Urumqi": "ウルムチ", "Beijing": "北京", "Qingdao": "青島",
  "Suzhou": "蘇州", "Lanzhou": "蘭州", "Shenyang": "瀋陽", "Hohhot": "フフホト",
  "Citywide": "市内全域", "Nationwide": "全国", "Provincewide": "全省", "Provincial": "省内",
};
let n = 0;
for (const f of fs.readdirSync("src/data/cities-i18n/ja").filter(x=>x.endsWith(".json")).sort()) {
  const fp = `src/data/cities-i18n/ja/${f}`;
  const j = JSON.parse(fs.readFileSync(fp,"utf8"));
  let changed = false;
  for (const c of j.emergencyContacts || []) {
    if (c.address && ADDR[c.address.trim()]) {
      c.address = ADDR[c.address.trim()];
      changed = true; n++;
    }
  }
  if (changed) fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("address fixed:", n);
