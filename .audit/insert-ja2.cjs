const fs = require("fs");
const p = "src/i18n/translations.ts";
let lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
let koStart = 8607;
function insertAfterLine(idx, newLines) {
  lines.splice(idx, 0, ...newLines);
  koStart += newLines.length;
}
function insertAfterPrefix(prefix, newLines) {
  for (let i = 4326; i < koStart; i++) {
    if (lines[i].startsWith(prefix)) { insertAfterLine(i + 1, newLines); return true; }
  }
  console.log("NOT FOUND:", prefix); return false;
}

insertAfterPrefix('      accommodationStageTitle: ', ['      accommodationTitle: "宿泊ガイド - ChinaConnect",']);
insertAfterPrefix('      communicationStageTitle: ', ['      communicationTitle: "コミュニケーションガイド - ChinaConnect",']);
insertAfterPrefix('      culturalWarningsSubtitle: ', ['      culturalWarningsTitle: "文化的タブーと注意点 - ChinaConnect",']);
insertAfterPrefix('      departureStageTitle: ', ['      departureTitle: "出国ガイド - ChinaConnect",']);
insertAfterPrefix('      diningStageTitle: ', ['      diningTitle: "食事ガイド - ChinaConnect",']);
insertAfterPrefix('      emergencyStageTitle: ', ['      emergencyTitle: "緊急時対応ガイド - ChinaConnect",']);
insertAfterPrefix('      indexStagesTitle: ', ['      indexTitle: "中国完全旅行ガイド - ChinaConnect",']);
insertAfterPrefix('      scamPreventionSubtitle: ', ['      scamPreventionTitle: "詐欺防止ガイド - ChinaConnect",']);
insertAfterPrefix('      transparencySubtitle: ', ['      transparencyTitle: "価格の透明性 - ChinaConnect",']);
insertAfterPrefix('      weatherForecast: ', [
  '      weatherHumidity: "湿度",',
  '      weatherWind: "風",',
  '      weatherFeels: "体感",',
  '      weatherDemo: "デモデータ - PUBLIC_OWM_API_KEYを設定するとライブの天気が表示されます",',
]);

fs.writeFileSync(p, lines.join("\n"));
console.log("done. new koStart:", koStart);
