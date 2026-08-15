const fs = require("fs");
const p = "src/i18n/translations.ts";
let src = fs.readFileSync(p, "utf8");

// Remove the wrongly-inserted Japanese title lines everywhere
const lines = [
  '      departureTitle: "出国ガイド - ChinaConnect",\n',
  '      diningTitle: "食事ガイド - ChinaConnect",\n',
  '      emergencyTitle: "緊急時対応ガイド - ChinaConnect",\n',
  '      indexTitle: "中国完全旅行ガイド - ChinaConnect",\n',
  '      transparencyTitle: "価格の透明性 - ChinaConnect",\n',
];
for (const l of lines) {
  const before = (src.match(new RegExp(l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  src = src.split(l).join("");
  console.log("removed", before, "of", JSON.stringify(l.trim()));
}

// Insert into ja block only. Find the ja guidePage StageTitle anchors with Japanese values.
// ja accommodationStageTitle value:
let r;
const j = (pat, rep) => {
  const re = new RegExp(pat, "g");
  const count = (src.match(re) || []).length;
  src = src.replace(re, rep);
  return count;
};

// Locate ja block start and operate within a slice to be safe
const jaStart = src.indexOf("ja: {");
const jaEndMarker = "    ko: {";
const jaEnd = src.indexOf(jaEndMarker);
const jaBlock = src.slice(jaStart, jaEnd);

const jRep = (pat, rep) => {
  const re = new RegExp(pat, "g");
  const count = (jaBlock.match(re) || []).length;
  return { block: jaBlock.replace(re, rep), count };
};

let b = jaBlock;
let res;
res = jRep('      accommodationStageTitle: ', '      accommodationTitle: "宿泊ガイド - ChinaConnect",\n      accommodationStageTitle: '); console.log("acc:", res.count); b = res.block;
res = jRep('      communicationStageTitle: ', '      communicationTitle: "コミュニケーションガイド - ChinaConnect",\n      communicationStageTitle: '); console.log("comm:", res.count); b = res.block;
res = jRep('      culturalWarningsStageTitle: ', '      culturalWarningsTitle: "文化的タブーと注意点 - ChinaConnect",\n      culturalWarningsStageTitle: '); console.log("cultural:", res.count); b = res.block;
res = jRep('      departureStageTitle: ', '      departureTitle: "出国ガイド - ChinaConnect",\n      departureStageTitle: '); console.log("depart:", res.count); b = res.block;
res = jRep('      diningStageTitle: ', '      diningTitle: "食事ガイド - ChinaConnect",\n      diningStageTitle: '); console.log("dining:", res.count); b = res.block;
res = jRep('      emergencyStageTitle: ', '      emergencyTitle: "緊急時対応ガイド - ChinaConnect",\n      emergencyStageTitle: '); console.log("emerg:", res.count); b = res.block;
res = jRep('      indexStagesTitle: ', '      indexTitle: "中国完全旅行ガイド - ChinaConnect",\n      indexStagesTitle: '); console.log("index:", res.count); b = res.block;
res = jRep('      scamPreventionStageTitle: ', '      scamPreventionTitle: "詐欺防止ガイド - ChinaConnect",\n      scamPreventionStageTitle: '); console.log("scam:", res.count); b = res.block;
res = jRep('      transparencySubtitle: ', '      transparencyTitle: "価格の透明性 - ChinaConnect",\n      transparencySubtitle: '); console.log("trans:", res.count); b = res.block;

src = src.slice(0, jaStart) + b + src.slice(jaEnd);

// weather keys in ja cityPage
{
  const wStart = src.indexOf("ja: {");
  const wEndMarker = "    ko: {";
  const wEnd = src.indexOf(wEndMarker);
  const wb = src.slice(wStart, wEnd);
  const wRep = (pat, rep) => { const re = new RegExp(pat, "g"); const count = (wb.match(re) || []).length; return { block: wb.replace(re, rep), count }; };
  let w = wb;
  let r2 = wRep('      weatherForecast: ', '      weatherForecast: "3日間の天気予報",\n      weatherHumidity: "湿度",\n      weatherWind: "風",\n      weatherFeels: "体感",\n      weatherDemo: "デモデータ - PUBLIC_OWM_API_KEYを設定するとライブの天気が表示されます",\n      weatherForecast: ');
  console.log("weather keys:", r2.count);
  w = r2.block;
  src = src.slice(0, wStart) + w + src.slice(wEnd);
}

fs.writeFileSync(p, src);
console.log("done");
