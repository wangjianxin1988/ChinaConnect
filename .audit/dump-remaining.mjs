import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-city-english-precise.json", "utf8"));
const keys = new Set([
  "dali.json|description","dali.json|restaurants[7].dishHighlights[3]","dali.json|restaurants[8].cuisine","dali.json|restaurants[23].description","dali.json|transport.local.bus[3]","dali.json|culturalTips[1].content","dali.json|culturalTips[8].content","dali.json|culturalTips[17].content","dali.json|culturalTips[20].content","dali.json|culturalTips[21].content","dali.json|culturalTips[22].content","dali.json|culturalTips[24].content","dali.json|attractions[2].description","dali.json|attractions[2].tips","dali.json|attractions[7].description","dali.json|attractions[15].tips","dali.json|attractions[8].tips",
  "qingdao.json|restaurants[18].cuisine","qingdao.json|restaurants[17].highlights[3]",
  "sanya.json|culturalTips[18].title",
  "shenzhen.json|restaurants[3].dishHighlights[0]","shenzhen.json|restaurants[18].tags[0]","shenzhen.json|restaurants[11].dishHighlights[2]",
  "tianjin.json|restaurants[21].dishHighlights[0]","tianjin.json|restaurants[20].address","tianjin.json|description","tianjin.json|attractions[47].description",
  "quanzhou.json|attractions[4].highlights[0]","quanzhou.json|attractions[4].tips","quanzhou.json|restaurants[23].dishHighlights[3]","quanzhou.json|restaurants[24].dishHighlights[2]","quanzhou.json|hotels[8].address",
  "guangzhou.json|attractions[6].highlights[0]","guangzhou.json|hotels[0].address",
  "suzhou.json|culturalTips[7].content",
  "chongqing.json|attractions[22].highlights[1]","chongqing.json|attractions[22].highlights[3]",
  "beijing.json|attractions[44].recommendedVisitTime",
  "nanjing.json|attractions[20].highlights[3]",
  "xiamen.json|restaurants[1].name"
]);
for (const r of d) {
  const k = r.file + "|" + r.path;
  if (keys.has(k)) console.log(k + " = " + JSON.stringify(r.text));
}
