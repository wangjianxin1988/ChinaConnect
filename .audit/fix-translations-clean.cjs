const fs = require("fs");
const p = "src/i18n/translations.ts";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);

// Find top-level language blocks (2-space indent)
const topIdx = {};
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^(  [a-zA-Z-]+): \{$/);
  if (m) topIdx[m[1]] = i;
}
console.log("top blocks:", JSON.stringify(topIdx));
const jaStart = topIdx["ja"];
const koStart = topIdx["ko"];
console.log("ja block lines:", jaStart, "-", koStart);

// Lines to strip from everywhere (wrongly-inserted Japanese text) — remove globally first
const STRIP = [
  '      accommodationTitle: "宿泊ガイド - ChinaConnect",',
  '      communicationTitle: "コミュニケーションガイド - ChinaConnect",',
  '      culturalWarningsTitle: "文化的タブーと注意点 - ChinaConnect",',
  '      departureTitle: "出国ガイド - ChinaConnect",',
  '      diningTitle: "食事ガイド - ChinaConnect",',
  '      emergencyTitle: "緊急時対応ガイド - ChinaConnect",',
  '      indexTitle: "中国完全旅行ガイド - ChinaConnect",',
  '      scamPreventionTitle: "詐欺防止ガイド - ChinaConnect",',
  '      transparencyTitle: "価格の透明性 - ChinaConnect",',
  '      weatherHumidity: "湿度",',
  '      weatherWind: "風",',
  '      weatherFeels: "体感",',
  '      weatherDemo: "デモデータ - PUBLIC_OWM_API_KEYを設定するとライブの天気が表示されます",',
];
let removed = 0;
const out = [];
for (const ln of lines) {
  if (STRIP.includes(ln)) { removed++; continue; }
  out.push(ln);
}
console.log("stripped lines:", removed);
fs.writeFileSync(p, out.join("\n"));
