import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const idx = s.indexOf("    guidePage: {", s.indexOf("ja: {"));
const block = s.slice(idx, idx + 4500);
for (const k of ["visaTitleShort","visaSubtitle","paymentTitleShort","paymentSubtitle","communicationTitleShort","transportTitleShort","accommodationTitleShort","emergencyTitleShort","businessTitleShort","translationTitleShort","expoTitleShort","visaStageDescription","paymentStageDescription","transportStageDescription","accommodationStageDescription","emergencyStageDescription","businessStageDescription","businessDesc","scamTitleShort","culturalWarningsTitleShort","diningTitleShort","departureTitleShort"]) {
  const re = new RegExp("\\b" + k + ': "([^"]*)"');
  const m = block.match(re);
  if (m) console.log(k + " = " + m[1]);
}
