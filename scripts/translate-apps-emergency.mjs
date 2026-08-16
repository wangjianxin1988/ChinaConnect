// Translate app descriptions, category labels and national emergency contacts into one language.
// Usage: node scripts/translate-apps-emergency.mjs --lang=ko
import fs from "node:fs";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import { isTranslated } from "./lib/translation-keys.mjs";
import { acceptTranslation, isKeepableToken } from "./lib/translation-accept.mjs";
import { APP_CATEGORIES, APP_RECOMMENDATIONS } from "../src/data/apps/app-recommendations.ts";
import { NATIONAL_EMERGENCY_NUMBERS } from "../src/data/emergency/global-contacts.ts";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English",
};

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
if (!lang || lang === "ja" || lang === "en") { console.error("--lang required (non-ja/en)"); process.exit(1); }

// Build payload: key -> english text
const payload = {};
for (const app of APP_RECOMMENDATIONS) payload[`app:${app.id}`] = app.descriptionEn || app.description;
for (const [cat, info] of Object.entries(APP_CATEGORIES)) payload[`cat:${cat}`] = info.label;
for (const num of NATIONAL_EMERGENCY_NUMBERS) {
  payload[`ename:${num.phone}`] = num.name;
  payload[`edesc:${num.phone}`] = num.description;
}
const entries = Object.entries(payload);
console.log(`[${lang}] payload entries: ${entries.length}`);

function escapeTs(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function unescapeTs(s) { return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n"); }

function readExisting(path) {
  const map = {};
  if (fs.existsSync(path)) {
    const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
    for (const m of fs.readFileSync(path, "utf8").matchAll(re)) map[unescapeTs(m[1])] = unescapeTs(m[2]);
  }
  return map;
}

const appPath = `src/data/apps/overrides-${lang}.ts`;
const emergencyPath = `src/data/emergency/overrides-${lang}.ts`;
const appExisting = readExisting(appPath);
const emergencyExisting = readExisting(emergencyPath);
const existing = { ...appExisting, ...emergencyExisting };

const toTranslate = entries.filter(([key]) => existing[key] === undefined || (existing[key] === key && !isKeepableToken(key)));
console.log(`[${lang}] to translate: ${toTranslate.length}`);

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 4000 };
  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Connection: "close" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json().then((j) => j.choices?.[0]?.message?.content);
}

function extractJson(content) {
  const cleaned = String(content || "").trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1)); }
  }
  throw new Error("No closing JSON");
}

function buildPrompt(entries) {
  const body = "{\n" + entries.map(([, text], i) => `  "k${i}": "${escapeTs(text)}"`).join(",\n") + "\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate these ${entries.length} English strings into ${TARGETS[lang]} for foreign visitors.
Content: mobile app descriptions, app category labels, and emergency contact names/descriptions in China.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${entries.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input. Do NOT leave Chinese characters.
- Keep brand names (WeChat, Alipay, etc.), phone numbers and URLs unchanged.`;
}

async function translateBatch(batch) {
  const prompt = buildPrompt(batch);
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      const ok = Object.keys(result).length === batch.length && batch.every(([, text], i) => typeof result[`k${i}`] === "string" && acceptTranslation(result[`k${i}`], lang, text));
      if (!ok) throw new Error("Incomplete translation response");
      return batch.map((_, i) => result[`k${i}`]);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * attempt));
  }
  const out = [];
  for (const one of batch) {
    // Single-key fallback: ONE direct attempt (no recursion), accept or keep identity.
    try {
      const content = await callChat(buildPrompt([one]));
      const result = extractJson(content);
      const raw = result?.k0;
      if (typeof raw === "string" && acceptTranslation(raw, lang, one[1])) out.push(raw);
      else out.push(one[1]);
    } catch {
      out.push(one[1]);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return out;
}

for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
  const batch = toTranslate.slice(i, i + BATCH_SIZE);
  const results = await translateBatch(batch);
  batch.forEach(([key], idx) => { existing[key] = results[idx]; });
  writeFiles();
  console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toTranslate.length / BATCH_SIZE)} done`);
}

function writeFiles() {
  const appEntries = Object.entries(APP_RECOMMENDATIONS).map(([, app], idx) => {
    const key = `app:${app.id}`;
    return `  "${app.id}": "${escapeTs(existing[key] ?? app.descriptionEn)}",`;
  }).join("\n");
  const catEntries = Object.entries(APP_CATEGORIES).map(([cat]) => {
    const key = `cat:${cat}`;
    return `  "${cat}": "${escapeTs(existing[key] ?? "")}",`;
  }).join("\n");
  fs.writeFileSync(appPath, `// Auto-generated ${lang} app overrides.\nexport const APP_OVERRIDES_${lang.toUpperCase().replace("-", "_")}: Record<string, string> = {\n${appEntries}\n};\nexport const APP_CATEGORY_OVERRIDES_${lang.toUpperCase().replace("-", "_")}: Record<string, string> = {\n${catEntries}\n};\n`, "utf8");
  const nameEntries = NATIONAL_EMERGENCY_NUMBERS.map((num) => `  "${num.phone}": "${escapeTs(existing[`ename:${num.phone}`] ?? num.name)}",`).join("\n");
  const descEntries = NATIONAL_EMERGENCY_NUMBERS.map((num) => `  "${num.phone}": "${escapeTs(existing[`edesc:${num.phone}`] ?? num.description)}",`).join("\n");
  fs.writeFileSync(emergencyPath, `// Auto-generated ${lang} emergency overrides.\nexport const EMERGENCY_NAME_OVERRIDES_${lang.toUpperCase().replace("-", "_")}: Record<string, string> = {\n${nameEntries}\n};\nexport const EMERGENCY_DESC_OVERRIDES_${lang.toUpperCase().replace("-", "_")}: Record<string, string> = {\n${descEntries}\n};\n`, "utf8");
}
writeFiles();
console.log(`[${lang}] done -> ${appPath}, ${emergencyPath}`);
