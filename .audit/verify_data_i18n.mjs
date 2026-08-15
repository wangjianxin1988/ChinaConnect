import fs from "node:fs";
import path from "node:path";
import { isTranslated, maskSensitiveTerms } from "../scripts/lib/translation-keys.mjs";

const LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const SOURCE_DIR = "src/data/cities";
const OUTPUT_DIR = "src/data/cities-i18n";
const DETAIL_LIMIT = 8;

function getTranslatableFields(city) {
  const fields = {};
  const add = (dataPath, value) => {
    if (typeof value === "string") fields[dataPath] = value;
  };
  for (const [index, payment] of (city.payment || []).entries()) {
    add(`payment.${index}.description`, payment?.description);
    for (const [itemIndex, value] of (payment?.howToUse || []).entries()) {
      add(`payment.${index}.howToUse.${itemIndex}`, value);
    }
    for (const [itemIndex, value] of (payment?.tips || []).entries()) {
      add(`payment.${index}.tips.${itemIndex}`, value);
    }
  }
  for (const section of ["arrival", "departure"]) {
    for (const [index, transport] of (city.transport?.[section] || []).entries()) {
      for (const field of ["from", "to", "duration", "price", "tips"]) {
        add(`transport.${section}.${index}.${field}`, transport?.[field]);
      }
    }
  }
  for (const [index, hotel] of (city.hotels || []).entries()) {
    for (const field of ["description", "address", "name"]) {
      add(`hotels.${index}.${field}`, hotel?.[field]);
    }
    for (const [itemIndex, value] of (hotel?.highlights || []).entries()) {
      add(`hotels.${index}.highlights.${itemIndex}`, value);
    }
  }
  for (const [index, contact] of (city.emergencyContacts || []).entries()) {
    for (const field of ["name", "description"]) {
      add(`emergencyContacts.${index}.${field}`, contact?.[field]);
    }
  }
  for (const [index, attraction] of (city.attractions || []).entries()) {
    for (const field of [
      "description",
      "address",
      "openingHours",
      "tips",
      "recommendedVisitTime",
    ]) {
      add(`attractions.${index}.${field}`, attraction?.[field]);
    }
    for (const [itemIndex, value] of (attraction?.highlights || []).entries()) {
      add(`attractions.${index}.highlights.${itemIndex}`, value);
    }
  }
  for (const [index, restaurant] of (city.restaurants || []).entries()) {
    for (const field of ["description", "address", "cuisine"]) {
      add(`restaurants.${index}.${field}`, restaurant?.[field]);
    }
    for (const [itemIndex, value] of (restaurant?.dishHighlights || []).entries()) {
      add(`restaurants.${index}.dishHighlights.${itemIndex}`, value);
    }
    for (const [itemIndex, value] of (restaurant?.tags || []).entries()) {
      add(`restaurants.${index}.tags.${itemIndex}`, value);
    }
  }
  return fields;
}

function getValue(data, dataPath) {
  return dataPath.split(".").reduce((value, part) => value?.[part], data);
}

function parseArgs(args) {
  const lang = args.find((arg) => arg.startsWith("--lang="))?.split("=")[1];
  return lang ? [lang] : LANGS;
}

const targetLangs = parseArgs(process.argv.slice(2));
let totalMissing = 0;
for (const lang of targetLangs) {
  const langDir = path.join(OUTPUT_DIR, lang);
  const counts = {
    payment: 0,
    transport: 0,
    hotels: 0,
    emergencyContacts: 0,
    attractions: 0,
    restaurants: 0,
  };
  const examples = [];
  if (!fs.existsSync(langDir)) {
    console.log(`[${lang}] no directory`);
    totalMissing += 1;
    continue;
  }
  for (const sourceFile of fs.readdirSync(SOURCE_DIR).filter((file) => file.endsWith(".json"))) {
    const sourcePath = path.join(SOURCE_DIR, sourceFile);
    const targetPath = path.join(langDir, sourceFile);
    const city = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    if (!fs.existsSync(targetPath)) {
      totalMissing += 1;
      if (examples.length < DETAIL_LIMIT) examples.push(`${city.slug}: missing file`);
      continue;
    }
    const target = JSON.parse(fs.readFileSync(targetPath, "utf8"));
    for (const [dataPath, sourceValue] of Object.entries(getTranslatableFields(city))) {
      const targetValue = getValue(target, dataPath);
      const sourceWasMasked = maskSensitiveTerms(sourceValue).replacements.size > 0;
      if (
        typeof targetValue !== "string" ||
        !isTranslated(targetValue, lang, sourceValue, sourceWasMasked)
      ) {
        const section = dataPath.split(".")[0];
        counts[section] += 1;
        totalMissing += 1;
        if (examples.length < DETAIL_LIMIT) {
          examples.push(`${city.slug}.${dataPath}: ${JSON.stringify(targetValue)}`);
        }
      }
    }
  }
  console.log(`[${lang}] ${totalMissing} total missing so far; ${JSON.stringify(counts)}`);
  for (const example of examples) console.log(`  - ${example}`);
}
console.log(`Total missing: ${totalMissing}`);
process.exitCode = totalMissing === 0 ? 0 : 1;
