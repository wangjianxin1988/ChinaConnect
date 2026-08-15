const fs = require("fs");
const lines = fs.readFileSync("src/i18n/translations.ts", "utf8").split(/\r?\n/);
const jaStart = 4326, koStart = 8607;
// find anchors in ja block
const anchors = [
  '      accommodationStageTitle: ',
  '      communicationStageTitle: ',
  '      culturalWarningsSubtitle: ',
  '      departureStageTitle: ',
  '      diningStageTitle: ',
  '      emergencyStageTitle: ',
  '      indexStagesTitle: ',
  '      scamPreventionSubtitle: ',
  '      transparencySubtitle: ',
  '      weatherForecast: ',
];
for (const a of anchors) {
  const found = [];
  for (let i = jaStart; i < koStart; i++) if (lines[i].startsWith(a)) found.push(i + 1);
  console.log(JSON.stringify(a.trim()), "->", found.join(","));
}
