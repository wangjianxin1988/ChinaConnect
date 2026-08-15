const fs = require("fs");
const p = "src/i18n/translations.ts";
let lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
let removed = 0;
const out = [];
for (let i = 0; i < lines.length; i++) {
  const ln = lines[i];
  if (ln === '      weatherForecast: "3日間の天気予報",') {
    // keep in ja block (lines 4326..8620 area), remove elsewhere
    if (i >= 4326 && i < 8600) { out.push(ln); continue; }
    removed++; continue;
  }
  if (ln === '      weatherForecast: "天気予報",') {
    removed++; continue;
  }
  out.push(ln);
}
console.log("removed duplicate weatherForecast lines:", removed);
fs.writeFileSync(p, out.join("\n"));
