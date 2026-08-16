import fs from "node:fs";
import path from "node:path";
import { isTranslated, maskSensitiveTerms } from "../scripts/lib/translation-keys.mjs";

const lang = process.argv[2] || "de";
const SOURCE_DIR = "src/data/cities";
const OUTPUT_DIR = "src/data/cities-i18n";
const langDir = path.join(OUTPUT_DIR, lang);

function getTranslatableFields(city) {
  const fields = {};
  const add = (dataPath, value) => { if (typeof value === "string") fields[dataPath] = value; };
  for (const [index, payment] of (city.payment || []).entries()) {
    add(`payment.${index}.description`, payment?.description);
    for (const [i, v] of (payment?.howToUse || []).entries()) add(`payment.${index}.howToUse.${i}`, v);
    for (const [i, v] of (payment?.tips || []).entries()) add(`payment.${index}.tips.${i}`, v);
  }
  for (const section of ["arrival", "departure"]) {
    for (const [index, t] of (city.transport?.[section] || []).entries()) {
      for (const field of ["from", "to", "duration", "price", "tips"]) add(`transport.${section}.${index}.${field}`, t?.[field]);
    }
  }
  for (const [index, hotel] of (city.hotels || []).entries()) {
    for (const field of ["description", "address", "name"]) add(`hotels.${index}.${field}`, hotel?.[field]);
    for (const [i, v] of (hotel?.highlights || []).entries()) add(`hotels.${index}.highlights.${i}`, v);
  }
  for (const [index, contact] of (city.emergencyContacts || []).entries()) {
    for (const field of ["name", "description"]) add(`emergencyContacts.${index}.${field}`, contact?.[field]);
  }
  for (const [index, attraction] of (city.attractions || []).entries()) {
    for (const field of ["description", "address", "openingHours", "tips", "recommendedVisitTime"]) add(`attractions.${index}.${field}`, attraction?.[field]);
    for (const [i, v] of (attraction?.highlights || []).entries()) add(`attractions.${index}.highlights.${i}`, v);
  }
  for (const [index, restaurant] of (city.restaurants || []).entries()) {
    for (const field of ["description", "address", "cuisine"]) add(`restaurants.${index}.${field}`, restaurant?.[field]);
    for (const [i, v] of (restaurant?.dishHighlights || []).entries()) add(`restaurants.${index}.dishHighlights.${i}`, v);
    for (const [i, v] of (restaurant?.tags || []).entries()) add(`restaurants.${index}.tags.${i}`, v);
  }
  return fields;
}

const rows = [];
for (const sourceFile of fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".json"))) {
  const city = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, sourceFile), "utf8"));
  const targetPath = path.join(langDir, sourceFile);
  if (!fs.existsSync(targetPath)) { rows.push({ city: city.slug, path: "(file)", source: "(missing file)", target: "" }); continue; }
  const target = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  for (const [dataPath, sourceValue] of Object.entries(getTranslatableFields(city))) {
    const parts = dataPath.split(".");
    let targetValue = target;
    for (const p of parts) targetValue = targetValue?.[p];
    const sourceWasMasked = maskSensitiveTerms(sourceValue).replacements.size > 0;
    if (typeof targetValue !== "string" || !isTranslated(targetValue, lang, sourceValue, sourceWasMasked)) {
      rows.push({ city: city.slug, path: dataPath, source: sourceValue, target: targetValue });
    }
  }
}
console.log(`TOTAL ${lang} residue: ${rows.length}`);
for (const r of rows) console.log(`${r.city}.${r.path} ||| ${r.source} ||| ${r.target}`);

