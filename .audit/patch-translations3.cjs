const fs = require("fs");
const p = "src/i18n/translations.ts";
let src = fs.readFileSync(p, "utf8");
function replaceAll(src, pattern, replacement) {
  const re = new RegExp(pattern, "g");
  const count = (src.match(re) || []).length;
  return { out: src.replace(re, replacement), count };
}
let r;

// guidePage full titles — insert after existing StageTitle keys within ja guidePage block
// anchor: accommodationStageTitle line in ja
r = replaceAll(src, '      accommodationStageTitle: "ステージ1：ホテル選びと予約",', '      accommodationStageTitle: "ステージ1：ホテル選びと予約",\n      accommodationTitle: "宿泊ガイド - ChinaConnect",');
console.log("accommodationTitle:", r.count); src = r.out;
r = replaceAll(src, '      communicationStageTitle: "ステージ4：コミュニケーション",', '      communicationStageTitle: "ステージ4：コミュニケーション",\n      communicationTitle: "コミュニケーションガイド - ChinaConnect",');
console.log("communicationTitle:", r.count); src = r.out;
r = replaceAll(src, '      culturalWarningsStageTitle:', '      culturalWarningsTitle: "文化的タブーと注意点 - ChinaConnect",\n      culturalWarningsStageTitle:');
console.log("culturalWarningsTitle:", r.count); src = r.out;
r = replaceAll(src, '      departureStageTitle:', '      departureTitle: "出国ガイド - ChinaConnect",\n      departureStageTitle:');
console.log("departureTitle:", r.count); src = r.out;
r = replaceAll(src, '      diningStageTitle:', '      diningTitle: "食事ガイド - ChinaConnect",\n      diningStageTitle:');
console.log("diningTitle:", r.count); src = r.out;
r = replaceAll(src, '      emergencyStageTitle:', '      emergencyTitle: "緊急時対応ガイド - ChinaConnect",\n      emergencyStageTitle:');
console.log("emergencyTitle:", r.count); src = r.out;
r = replaceAll(src, '      indexStagesTitle:', '      indexTitle: "中国完全旅行ガイド - ChinaConnect",\n      indexStagesTitle:');
console.log("indexTitle:", r.count); src = r.out;
r = replaceAll(src, '      scamPreventionStageTitle:', '      scamPreventionTitle: "詐欺防止ガイド - ChinaConnect",\n      scamPreventionStageTitle:');
console.log("scamPreventionTitle:", r.count); src = r.out;
r = replaceAll(src, '      transparencySubtitle:', '      transparencyTitle: "価格の透明性 - ChinaConnect",\n      transparencySubtitle:');
console.log("transparencyTitle:", r.count); src = r.out;

// weather keys in ja cityPage — insert after weatherForecast line
r = replaceAll(src, '      weatherForecast: "3日間の天気予報",', '      weatherForecast: "3日間の天気予報",\n      weatherHumidity: "湿度",\n      weatherWind: "風",\n      weatherFeels: "体感",\n      weatherDemo: "デモデータ - PUBLIC_OWM_API_KEYを設定するとライブの天気が表示されます",');
console.log("weather keys:", r.count); src = r.out;

// ja weather top-level block — insert after cityPage block end. Find ja cityPage end anchor.
// Insert a weather block right before "climatePage" or another top-level ja key. Use "cityGuide:" as anchor if exists? Let's anchor on a known ja top-level key after cityPage.
const jaCityEnd = '      weatherNotAvailable: ';
if (src.includes(jaCityEnd)) {
  console.log("weatherNotAvailable found in ja cityPage");
}

fs.writeFileSync(p, src);
console.log("saved");
