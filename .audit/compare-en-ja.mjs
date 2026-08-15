import fs from "node:fs";
const want = [
  ["beijing", "restaurants[1].tags", "restaurants[3].description", "restaurants[29].description", "restaurants[30].dishHighlights", "attractions[44].openingHours", "attractions[44].ticketPrice", "attractions[44].highlights", "attractions[25].description", "attractions[15].tips", "attractions[45].tips"],
  ["changsha", "culturalTips[22].content", "restaurants[17].description", "attractions[24].highlights", "attractions[24].tips", "restaurants[23].tags", "attractions[13].description"],
  ["chengde", "restaurants[9].description", "attractions[1].highlights", "attractions[4].description"],
  ["chengdu", "description", "attractions[4].description", "transport.arrival[0].tips", "restaurants[13].description", "attractions[15].tips"],
  ["dalian", "restaurants[15].description", "restaurants[16].description", "restaurants[16].dishHighlights", "restaurants[5].tags", "attractions[8].description"],
  ["fuzhou", "restaurants[1].dishHighlights", "hotels[4].address", "attractions[11].tips"],
  ["guangzhou", "highlights", "attractions[9].tips", "attractions[18].description", "attractions[19].description", "restaurants[13].name", "restaurants[13].description", "culturalTips[1].content", "culturalTips[11].content", "culturalTips[15].content", "culturalTips[19].content", "culturalTips[20].content", "attractions[1].tips"],
  ["guilin", "attractions[1].tips", "culturalTips[0].content", "culturalTips[11].content", "culturalTips[13].content", "culturalTips[26].content", "attractions[5].address", "attractions[6].address", "restaurants[0].address", "restaurants[1].address"],
  ["hangzhou", "attractions[1].tips", "attractions[5].highlights", "attractions[8].tips", "attractions[9].tips", "attractions[11].description", "attractions[14].openingHours", "attractions[16].highlights", "attractions[16].tips", "attractions[17].tips", "attractions[17].ticketPrice", "attractions[17].highlights", "attractions[28].description", "restaurants[18].dishHighlights"],
  ["harbin", "attractions[3].tips", "attractions[17].tips", "culturalTips[2].content"],
  ["hulunbuir", "attractions[0].tips", "attractions[5].description", "attractions[5].tips", "attractions[10].description", "attractions[10].tips", "attractions[13].tips", "attractions[19].description", "attractions[19].highlights", "attractions[20].tips", "restaurants[24].description", "culturalTips[0].content"],
  ["jinan", "restaurants[8].description", "attractions[41].name"],
  ["kunming", "restaurants[4].dishHighlights", "restaurants[6].address", "restaurants[7].highlights", "restaurants[8].highlights", "restaurants[9].dishHighlights", "restaurants[14].description", "hotels[3].tips", "attractions[18].highlights", "attractions[27].description"],
  ["lanzhou", "attractions[0].tips", "attractions[2].tips", "restaurants[5].description", "restaurants[7].dishHighlights", "restaurants[8].description", "culturalTips[7].content", "culturalTips[13].content"],
  ["lijiang", "restaurants[0].highlights", "restaurants[4].highlights", "restaurants[6].highlights", "restaurants[14].description", "attractions[2].tips", "attractions[3].openingHours", "attractions[3].ticketPrice", "attractions[3].highlights", "attractions[6].tips", "attractions[8].highlights", "attractions[8].tips", "attractions[9].description", "attractions[10].description", "attractions[11].tips", "attractions[14].tips"],
  ["nanjing", "attractions[10].highlights", "attractions[20].highlights", "attractions[25].description", "restaurants[0].description", "restaurants[1].description", "restaurants[24].description", "hotels[8].bookingTips", "culturalTips[11].content"],
  ["ningbo", "attractions[14].address", "culturalTips[0].content", "culturalTips[2].content", "culturalTips[10].content"],
  ["qingdao", "description", "restaurants[15].cuisine", "restaurants[17].tips"],
  ["sanya", "attractions[5].highlights", "attractions[7].ticketPrice", "attractions[10].tips", "attractions[11].highlights", "attractions[15].description", "attractions[16].name", "attractions[18].tips", "attractions[22].highlights", "attractions[24].description", "attractions[24].highlights", "attractions[24].tips", "attractions[27].highlights", "attractions[27].tips", "restaurants[3].dishHighlights", "restaurants[9].dishHighlights", "restaurants[14].dishHighlights", "payment[0].howToUse", "payment[1].howToUse", "culturalTips[13].content", "culturalTips[21].content"],
  ["shanghai", "attractions[1].tips", "attractions[2].tips", "attractions[20].description", "attractions[20].highlights", "attractions[30].highlights", "attractions[46].description", "attractions[48].description", "restaurants[2].description", "restaurants[3].description", "restaurants[6].dishHighlights", "restaurants[7].description", "restaurants[7].dishHighlights", "restaurants[9].description", "restaurants[24].dishHighlights", "restaurants[31].description", "restaurants[32].description", "restaurants[32].dishHighlights", "hotels[7].bookingTips", "hotels[15].bookingTips", "payment[2].howToUse", "payment[3].howToUse", "payment[5].howToUse"],
  ["shenzhen", "description", "attractions[0].highlights", "attractions[1].address", "attractions[3].description", "attractions[4].address", "restaurants[0].address", "restaurants[0].description", "restaurants[0].dishHighlights", "restaurants[1].address", "restaurants[2].description", "restaurants[5].address", "restaurants[7].address", "restaurants[9].address", "restaurants[18].description", "restaurants[19].address", "hotels[0].bookingTips", "hotels[5].bookingTips", "culturalTips[1].content", "culturalTips[15].content", "culturalTips[16].content"],
  ["suzhou", "attractions[3].address", "attractions[3].tips", "attractions[6].description", "restaurants[0].dishHighlights", "restaurants[19].description", "hotels[3].bookingTips"],
  ["tianjin", "culturalTips[1].content"],
  ["weihai", "attractions[14].tips", "restaurants[12].address", "hotels[10].address", "hotels[10].highlights", "culturalTips[11].content"],
  ["wuhan", "attractions[4].description", "attractions[7].description", "attractions[8].description", "restaurants[2].dishHighlights", "restaurants[6].description", "restaurants[6].dishHighlights", "restaurants[20].dishHighlights", "hotels[1].bookingTips", "culturalTips[2].content", "culturalTips[3].title", "culturalTips[3].content"],
  ["xiamen", "attractions[2].tips", "attractions[7].tips", "attractions[14].description", "restaurants[1].name", "restaurants[3].address", "restaurants[3].dishHighlights", "restaurants[11].description", "restaurants[17].dishHighlights", "restaurants[21].description", "hotels[16].bookingTips", "culturalTips[0].content", "culturalTips[16].content", "emergencyContacts[0].notes", "emergencyContacts[9].notes"],
  ["xian", "restaurants[8].dishHighlights", "restaurants[9].description", "restaurants[9].dishHighlights", "restaurants[30].description", "restaurants[45].cuisine", "culturalTips[1].content", "culturalTips[3].content", "culturalTips[13].content"],
  ["xining", "attractions[6].description", "attractions[7].description", "attractions[14].tips", "restaurants[11].description", "restaurants[12].description", "restaurants[14].dishHighlights", "restaurants[20].description"],
  ["yantai", "attractions[23].tips", "restaurants[1].description", "restaurants[2].description", "restaurants[2].dishHighlights", "restaurants[7].cuisine", "restaurants[7].description", "restaurants[7].dishHighlights", "restaurants[23].description", "hotels[9].address", "culturalTips[0].content"],
  ["zhangjiajie", "attractions[0].description", "attractions[3].highlights", "attractions[4].highlights", "attractions[4].tips", "attractions[8].address", "attractions[16].address", "restaurants[17].address", "restaurants[23].address", "restaurants[29].dishHighlights", "transport.local.bus", "transport.local.taxi", "hotels[1].address", "culturalTips[3].content", "culturalTips[6].content", "culturalTips[10].content"],
];
function get(obj, p) {
  const parts = p.replace(/\[(\d+)\]/g, ".$1").split(".");
  let v = obj;
  for (const k of parts) { if (v == null) return undefined; v = v[k]; }
  return v;
}
let n = 0;
for (const [city, ...paths] of want) {
  const en = JSON.parse(fs.readFileSync(`src/data/cities/${city}.json`, "utf8"));
  const ja = JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${city}.json`, "utf8"));
  console.log("========== " + city + " ==========");
  for (const p of paths) {
    const ev = get(en, p), jv = get(ja, p);
    const es = JSON.stringify(ev), js = JSON.stringify(jv);
    if (es !== js) {
      console.log("### " + p);
      console.log("  EN: " + (es || "").slice(0, 240));
      console.log("  JA: " + (js || "").slice(0, 240));
      n++;
    }
  }
}
console.log("\nDIFF COUNT:", n);
