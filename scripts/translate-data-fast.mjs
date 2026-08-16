// node scripts/translate-data-fast.mjs --lang=ja --source-lang=en fuzhou
// node scripts/translate-data-fast.mjs --lang=ko --source-lang=ja beijing
import fs from "fs";
import path from "path";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import {
  isTranslated,
  maskSensitiveTerms,
  restoreMaskedTerms,
  toApiKey,
  toDataPath,
} from "./lib/translation-keys.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
console.log(`Provider: ${HOST} | model: ${MODEL}`);
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai",
  vi: "Vietnamese",
  ru: "Russian",
  fr: "French",
  de: "German",
  ar: "Modern Standard Arabic",
  fa: "Modern Persian (Farsi)",
  en: "English",
};

function getTranslatableFields(city) {
  const fields = {};
  if (Array.isArray(city.payment)) {
    city.payment.forEach((payment, index) => {
      if (payment && typeof payment.description === "string") {
        fields[`payment.${index}.description`] = payment.description;
      }
      if (Array.isArray(payment?.howToUse)) {
        payment.howToUse.forEach((value, itemIndex) => {
          if (typeof value === "string") {
            fields[`payment.${index}.howToUse.${itemIndex}`] = value;
          }
        });
      }
      if (Array.isArray(payment?.tips)) {
        payment.tips.forEach((value, itemIndex) => {
          if (typeof value === "string") {
            fields[`payment.${index}.tips.${itemIndex}`] = value;
          }
        });
      }
    });
  }
  if (city.transport && typeof city.transport === "object") {
    ["arrival", "departure"].forEach((section) => {
      if (!Array.isArray(city.transport[section])) return;
      city.transport[section].forEach((transport, index) => {
        ["from", "to", "duration", "price", "tips", "frequency"].forEach((field) => {
          if (typeof transport[field] === "string") {
            fields[`transport.${section}.${index}.${field}`] = transport[field];
          }
        });
      });
    });
    // Translate local transport sections (metro, bus, taxi, bike arrays)
    ["metro", "bus", "taxi", "bike"].forEach((section) => {
      const items = city.transport?.local?.[section];
      if (!Array.isArray(items)) return;
      items.forEach((value, index) => {
        if (typeof value === "string" && value.length > 0) {
          fields[`transport.local.${section}.${index}`] = value;
        }
      });
    });
  }
  if (Array.isArray(city.hotels)) {
    city.hotels.forEach((hotel, index) => {
      ["description", "address", "name"].forEach((field) => {
        if (typeof hotel[field] === "string") {
          fields[`hotels.${index}.${field}`] = hotel[field];
        }
      });
      if (Array.isArray(hotel.highlights)) {
        hotel.highlights.forEach((value, itemIndex) => {
          if (typeof value === "string") {
            fields[`hotels.${index}.highlights.${itemIndex}`] = value;
          }
        });
      }
    });
  }
  if (Array.isArray(city.emergencyContacts)) {
    city.emergencyContacts.forEach((contact, index) => {
      ["name", "description"].forEach((field) => {
        if (typeof contact[field] === "string") {
          fields[`emergencyContacts.${index}.${field}`] = contact[field];
        }
      });
    });
  }
  if (Array.isArray(city.attractions)) {
    city.attractions.forEach((attraction, index) => {
      ["description", "address", "openingHours", "tips", "recommendedVisitTime"].forEach(
        (field) => {
          if (typeof attraction[field] === "string") {
            fields[`attractions.${index}.${field}`] = attraction[field];
          }
        },
      );
      if (Array.isArray(attraction.highlights)) {
        attraction.highlights.forEach((value, itemIndex) => {
          if (typeof value === "string") {
            fields[`attractions.${index}.highlights.${itemIndex}`] = value;
          }
        });
      }
    });
  }
  if (Array.isArray(city.restaurants)) {
    city.restaurants.forEach((restaurant, index) => {
      ["description", "address", "cuisine"].forEach((field) => {
        if (typeof restaurant[field] === "string") {
          fields[`restaurants.${index}.${field}`] = restaurant[field];
        }
      });
      if (Array.isArray(restaurant.dishHighlights)) {
        restaurant.dishHighlights.forEach((value, itemIndex) => {
          if (typeof value === "string") {
            fields[`restaurants.${index}.dishHighlights.${itemIndex}`] = value;
          }
        });
      }
      if (Array.isArray(restaurant.tags)) {
        restaurant.tags.forEach((value, itemIndex) => {
          if (typeof value === "string") {
            fields[`restaurants.${index}.tags.${itemIndex}`] = value;
          }
        });
      }
    });
  }
  return fields;
}

async function writeJsonWithRetry(filePath, data) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      fs.writeFileSync(temporaryPath, JSON.stringify(data, null, 2), "utf8");
      fs.renameSync(temporaryPath, filePath);
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      console.warn(`  write retry ${attempt}: ${error?.code || error}`);
      fs.rmSync(temporaryPath, { force: true });
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function getValue(obj, dataPath) {
  const parts = dataPath.split(".");
  let current = obj;
  for (const part of parts) {
    const index = parseInt(part, 10);
    current = Number.isNaN(index) ? current?.[part] : current?.[index];
    if (current == null) return undefined;
  }
  return current;
}

function applyTranslation(cityI18n, dataPath, value) {
  const parts = dataPath.split(".");
  let current = cityI18n;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const arrayIndex = parseInt(part, 10);
    if (Number.isNaN(arrayIndex)) {
      if (!current[part]) current[part] = {};
      current = current[part];
    } else {
      if (!current[arrayIndex]) current[arrayIndex] = {};
      current = current[arrayIndex];
    }
  }
  const lastPart = parts.at(-1);
  const lastIndex = parseInt(lastPart, 10);
  if (!Number.isNaN(lastIndex) && Array.isArray(current)) {
    current[lastIndex] = value;
  } else {
    current[lastPart] = value;
  }
}

async function callChat(prompt) {
  const body = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 8000,
  };
  const response = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Connection: "close",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content;
}

function extractJson(content) {
  const cleaned = content
    .trim()
    .replace(/^```[a-zA-Z]*\n?/i, "")
    .replace(/\n?```\s*$/g, "");
  let depth = 0;
  let start = -1;
  let end = -1;
  for (let index = 0; index < cleaned.length; index += 1) {
    if (cleaned[index] === "{") {
      if (start === -1) start = index;
      depth += 1;
    } else if (cleaned[index] === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        end = index;
        break;
      }
    }
  }
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function translateFields(fields, lang, sourceLang) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return {};
  const promptMasks = new Map();
  const lines = keys
    .map((key) => {
      const apiKey = toApiKey(key);
      const masked = maskSensitiveTerms(String(fields[key]));
      promptMasks.set(apiKey, masked.replacements);
      return `- ${apiKey} = "${masked.text.replace(/"/g, '\\"').replace(/\n/g, " ")}"`;
    })
    .join("\n");
  const sourceLabel = TARGETS[sourceLang] || sourceLang;
  const targetLabel = TARGETS[lang] || lang;
  const prompt = `Translate the following ${sourceLabel} strings into ${targetLabel} for ChinaConnect (chinaengage.org), a Chinese travel website.
Rules:
- Output ONLY a single flat JSON object with EXACTLY ${keys.length} keys.
- Each input key is a LITERAL underscore-delimited string. Never parse it, never add brackets or dots, and never create nested objects.
- No markdown, no commentary, no extra keys.
- CRITICAL: Translate EVERY value into ${targetLabel}. You MUST return ALL ${keys.length} keys.
- Keep proper nouns, numbers, prices, times, and phone numbers unchanged.
- Use the local convention for place names and addresses.

${lines}`;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      const exactKeys = Object.keys(result).length === keys.length;
      const validValues = keys.every((key) => {
        const apiKey = toApiKey(key);
        const value = restoreMaskedTerms(result[apiKey], promptMasks.get(apiKey));
        const sourceWasMasked = (promptMasks.get(apiKey)?.size || 0) > 0;
        return (
          typeof result[apiKey] === "string" &&
          isTranslated(value, lang, fields[key], sourceWasMasked)
        );
      });
      if (!exactKeys || !validValues) throw new Error("Incomplete translation response");
      return Object.fromEntries(
        keys.map((key) => {
          const apiKey = toApiKey(key);
          return [apiKey, restoreMaskedTerms(result[apiKey], promptMasks.get(apiKey))];
        }),
      );
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * attempt));
  }
  if (keys.length <= 1) return {};
  const fallbackBatchSize = 1;
  const fallbackResult = {};
  for (let index = 0; index < keys.length; index += fallbackBatchSize) {
    const fallbackFields = Object.fromEntries(
      keys.slice(index, index + fallbackBatchSize).map((key) => [key, fields[key]]),
    );
    const translated = await translateFields(fallbackFields, lang, sourceLang);
    Object.assign(fallbackResult, translated);
  }
  return fallbackResult;
}

async function run() {
  const args = process.argv.slice(2);
  const lang = args.find((arg) => arg.startsWith("--lang="))?.split("=")[1];
  const sourceLang = args.find((arg) => arg.startsWith("--source-lang="))?.split("=")[1] || "en";
  if (!lang) {
    console.error("--lang required");
    process.exit(1);
  }
  const specificCities = args.filter((arg) => !arg.startsWith("--"));
  const citiesDir = "src/data/cities";
  const outputDir = "src/data/cities-i18n";
  const langDir = path.join(outputDir, lang);
  fs.mkdirSync(langDir, { recursive: true });
  const sourceDir = sourceLang === "en" ? citiesDir : path.join(outputDir, sourceLang);
  let files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".json"));
  if (specificCities.length > 0) {
    files = files.filter((file) => specificCities.includes(file.replace(".json", "")));
  }
  console.log(`Translating ${files.length} cities to ${lang} (source: ${sourceLang})`);
  let totalTranslated = 0;
  let citiesDone = 0;
  for (const file of files) {
    const slug = file.replace(".json", "");
    const sourcePath = path.join(sourceDir, file);
    const outputPath = path.join(langDir, `${slug}.json`);
    let sourceData;
    try {
      sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    } catch (error) {
      console.warn(`Skipping invalid source file ${sourcePath}: ${error?.message || error}`);
      continue;
    }
    let i18nData = fs.existsSync(outputPath)
      ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
      : JSON.parse(JSON.stringify(sourceData));
    const allFields = getTranslatableFields(sourceData);
    const untranslated = {};
    const isCJK = (v) => typeof v === 'string' && /[一-鿿]/.test(v);
    for (const [dataPath, sourceValue] of Object.entries(allFields)) {
      const currentValue = getValue(i18nData, dataPath);
      const sourceWasMasked = maskSensitiveTerms(sourceValue).replacements.size > 0;
      // For hotel name fields, always re-translate if still Chinese (CJK) in non-zh langs
      // For hotel highlight fields, always re-translate if still English
      let forceRetranslate = false;
      if (lang !== 'zh-CN' && lang !== 'zh-TW' && dataPath.includes('hotels.') && dataPath.endsWith('.name')) {
        if (isCJK(currentValue)) forceRetranslate = true;
      }
      if (lang !== 'en' && dataPath.includes('.highlights.')) {
        // If still all-ASCII (English), force re-translation
        if (typeof currentValue === 'string' && currentValue.length > 0 && !/[-￿]/.test(currentValue)) {
          forceRetranslate = true;
        }
      }
      if (currentValue == null || !isTranslated(currentValue, lang, sourceValue, sourceWasMasked) || forceRetranslate) {
        untranslated[dataPath] = sourceValue;
      }
    }
    if (Object.keys(untranslated).length === 0) {
      process.stdout.write(".");
      citiesDone += 1;
      continue;
    }
    console.log(`\n[${slug}] ${Object.keys(untranslated).length} fields to translate`);
    const entries = Object.entries(untranslated);
    for (let index = 0; index < entries.length; index += BATCH_SIZE) {
      const batch = Object.fromEntries(entries.slice(index, index + BATCH_SIZE));
      const startedAt = Date.now();
      const result = await translateFields(batch, lang, sourceLang);
      for (const [apiKey, value] of Object.entries(result)) {
        applyTranslation(i18nData, toDataPath(apiKey), value);
        totalTranslated += 1;
      }
      const elapsed = Date.now() - startedAt;
      const batchNumber = Math.floor(index / BATCH_SIZE) + 1;
      const batchCount = Math.ceil(entries.length / BATCH_SIZE);
      console.log(
        `  [${new Date().toISOString().slice(11, 19)}] batch ${batchNumber}/${batchCount} done ${Object.keys(result).length}/${Object.keys(batch).length} in ${elapsed}ms`,
      );
      await writeJsonWithRetry(outputPath, i18nData);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await writeJsonWithRetry(outputPath, i18nData);
    citiesDone += 1;
  }
  console.log(
    `\nDone: ${citiesDone}/${files.length} cities, ${totalTranslated} fields translated to ${lang}`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
