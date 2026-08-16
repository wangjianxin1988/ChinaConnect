// Residue/contamination cleanup for city i18n data.
// Re-translates every field (except .name display names) that:
//   - is missing / not a string
//   - fails isTranslated (per scripts/lib/translation-keys.mjs)
//   - contains scripts that do not belong to the target language
//
// Partial acceptance: valid keys from a batch are kept; only the invalid
// keys are retried, so one bad key does not block the whole batch.
//
// Usage:
//   node scripts/translate-residue.mjs --lang=ko
//   node scripts/translate-residue.mjs --lang=th beijing shanghai
import fs from "node:fs";
import path from "node:path";
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
const BATCH_SIZE = 6;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English",
};

const KANA = "\\u3040-\\u30ff", CJK = "\\u3400-\\u9fff", HANGUL = "\\uac00-\\ud7af",
      CYR = "\\u0400-\\u04ff", ARAB = "\\u0600-\\u06ff", THAI = "\\u0e00-\\u0e7f";
const DISALLOWED = {
  ja:  new RegExp("[" + HANGUL + CYR + ARAB + THAI + "]"),
  ko:  new RegExp("[" + CJK + KANA + CYR + ARAB + THAI + "]"),
  "zh-CN": new RegExp("[" + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  "zh-TW": new RegExp("[" + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  th:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + "]"),
  vi:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  ru:  new RegExp("[" + CJK + KANA + HANGUL + ARAB + THAI + "]"),
  fr:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  de:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  ar:  new RegExp("[" + CJK + KANA + HANGUL + CYR + THAI + "]"),
  fa:  new RegExp("[" + CJK + KANA + HANGUL + CYR + THAI + "]"),
};

function walkStrings(obj, path, out) {
  if (typeof obj === "string") { out.push([path, obj]); return; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => walkStrings(v, `${path}.${i}`, out)); return; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) walkStrings(v, path ? `${path}.${k}` : k, out);
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

function setValue(obj, dataPath, value) {
  const parts = dataPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const index = parseInt(part, 10);
    if (Number.isNaN(index)) {
      if (!current[part]) current[part] = {};
      current = current[part];
    } else {
      if (!current[index]) current[index] = {};
      current = current[index];
    }
  }
  const last = parts.at(-1);
  const lastIndex = parseInt(last, 10);
  if (!Number.isNaN(lastIndex) && Array.isArray(current)) current[lastIndex] = value;
  else current[last] = value;
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

async function callChat(prompt) {
  const body = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 8000,
  };
  const response = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
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
      if (depth === 0 && start !== -1) { end = index; break; }
    }
  }
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildPrompt(fields, lang, sourceLang, promptMasks) {
  const keys = Object.keys(fields);
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
  return `Translate the following ${sourceLabel} strings into ${targetLabel} for ChinaConnect (chinaengage.org), a Chinese travel website.
Rules:
- Output ONLY a single flat JSON object.
- Each input key is a LITERAL underscore-delimited string. Never parse it, never add brackets or dots, and never create nested objects.
- No markdown, no commentary, no extra keys.
- CRITICAL: Translate EVERY value into ${targetLabel}. You MUST return ALL ${keys.length} keys with EXACTLY those key names.
- Do NOT leave any Chinese characters in the output. Proper nouns (place names, dish names, brand names) should be transliterated into ${targetLabel} or kept as standard English/pinyin where ${targetLabel} has no equivalent.
- Keep numbers, prices, times, phone numbers, and short English brand/station names unchanged.

${lines}`;
}

async function translateFields(fields, lang, sourceLang) {
  let remaining = { ...fields };
  const accepted = {};
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && Object.keys(remaining).length > 0) {
    attempt += 1;
    const promptMasks = new Map();
    const prompt = buildPrompt(remaining, lang, sourceLang, promptMasks);
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      let acceptedNow = 0;
      for (const key of Object.keys(remaining)) {
        const apiKey = toApiKey(key);
        const raw = result[apiKey];
        const value = restoreMaskedTerms(raw, promptMasks.get(apiKey));
        const sourceWasMasked = (promptMasks.get(apiKey)?.size || 0) > 0;
        if (typeof raw === "string" && isTranslated(value, lang, fields[key], sourceWasMasked)) {
          accepted[apiKey] = value;
          acceptedNow += 1;
        }
      }
      for (const k of Object.keys(accepted)) {
        delete remaining[toDataPath(k)];
      }
      if (Object.keys(remaining).length > 0) {
        console.warn(`  partial: +${acceptedNow} accepted, ${Object.keys(remaining).length} remaining`);
      }
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt * attempt));
  }
  return accepted;
}

async function run() {
  const args = process.argv.slice(2);
  const lang = args.find((arg) => arg.startsWith("--lang="))?.split("=")[1];
  const sourceLang = args.find((arg) => arg.startsWith("--source-lang="))?.split("=")[1] || "en";
  if (!lang) { console.error("--lang required"); process.exit(1); }
  const specificCities = args.filter((arg) => !arg.startsWith("--"));
  const sourceDir = sourceLang === "en" ? "src/data/cities" : `src/data/cities-i18n/${sourceLang}`;
  const langDir = `src/data/cities-i18n/${lang}`;
  fs.mkdirSync(langDir, { recursive: true });
  let files = fs.readdirSync(sourceDir).filter((f) => f.endsWith(".json"));
  if (specificCities.length > 0) files = files.filter((f) => specificCities.includes(f.replace(".json", "")));
  const disallow = DISALLOWED[lang];
  console.log(`Residue cleanup: ${files.length} cities to ${lang} (source: ${sourceLang})`);
  let totalCleaned = 0;
  for (const file of files) {
    const slug = file.replace(".json", "");
    const sourceData = JSON.parse(fs.readFileSync(path.join(sourceDir, file), "utf8"));
    const outputPath = path.join(langDir, `${slug}.json`);
    const i18nData = fs.existsSync(outputPath)
      ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
      : JSON.parse(JSON.stringify(sourceData));
    const srcFlat = [];
    walkStrings(sourceData, "", srcFlat);
    const dirty = {};
    for (const [dataPath, sourceValue] of srcFlat) {
      const leaf = dataPath.split(".").pop();
      if (leaf === "name") continue;
      const currentValue = getValue(i18nData, dataPath);
      const sourceWasMasked = maskSensitiveTerms(sourceValue).replacements.size > 0;
      let needs = false;
      if (typeof currentValue !== "string" || currentValue.length === 0) needs = true;
      else if (!isTranslated(currentValue, lang, sourceValue, sourceWasMasked)) needs = true;
      else if (disallow && disallow.test(currentValue)) needs = true;
      if (needs) dirty[dataPath] = sourceValue;
    }
    const entries = Object.entries(dirty);
    if (entries.length === 0) { process.stdout.write("."); continue; }
    console.log(`\n[${slug}] ${entries.length} dirty fields`);
    for (let index = 0; index < entries.length; index += BATCH_SIZE) {
      const batch = Object.fromEntries(entries.slice(index, index + BATCH_SIZE));
      const result = await translateFields(batch, lang, sourceLang);
      for (const [apiKey, value] of Object.entries(result)) {
        setValue(i18nData, toDataPath(apiKey), value);
        totalCleaned += 1;
      }
      const done = Math.floor(index / BATCH_SIZE) + 1;
      const count = Math.ceil(entries.length / BATCH_SIZE);
      console.log(`  [${new Date().toISOString().slice(11, 19)}] batch ${done}/${count} done ${Object.keys(result).length}/${Object.keys(batch).length}`);
      await writeJsonWithRetry(outputPath, i18nData);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await writeJsonWithRetry(outputPath, i18nData);
  }
  console.log(`\nDone: ${totalCleaned} fields cleaned for ${lang}`);
}

run().catch((error) => { console.error(error); process.exit(1); });
