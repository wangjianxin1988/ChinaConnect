// Generate translations for missing languages via MiniMax-Text-01 chat API.
// Usage:
//   node gen-missing.mjs                  # fill gaps in th, vi, ru, fr, de, ar, fa
//   node gen-missing.mjs th               # only one language
//   node gen-missing.mjs all              # all 11 non-en languages
//   node gen-missing.mjs en ja zh-CN      # explicit list
import fs from "fs";
import { getMiniMaxConfig } from "./scripts/lib/minimax-config.mjs";

const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";
const BATCH = 60;

const EN_FILE = "en-translations.json";
const EXTRA_FILES = ["zh-CN-translations.json", "zh-TW-translations.json", "ja-translations.json", "ko-translations.json"];

const en = JSON.parse(fs.readFileSync(EN_FILE, "utf8"));
const extras = {};
for (const f of EXTRA_FILES) {
  try { const d = JSON.parse(fs.readFileSync(f, "utf8")); Object.assign(extras, d); } catch (e) {}
}
const sourceMap = { ...en };
for (const k of Object.keys(extras)) if (!(k in sourceMap)) sourceMap[k] = extras[k];
const allKeys = Object.keys(sourceMap).sort();
console.log("total source keys:", allKeys.length);

const TARGETS = {
  en: "English (baseline, never re-translate).",
  ja: "Japanese. Polite tourism style. Keep URL/AI/Wi-Fi as-is.",
  ko: "Korean. Polite tourism style. Keep URL/AI/Wi-Fi as-is.",
  "zh-CN": "Simplified Chinese. Concise, marketing-friendly. Keep URL/AI/Wi-Fi as-is.",
  "zh-TW": "Traditional Chinese (Taiwan). Polite tourism style. Keep URL/AI/Wi-Fi as-is.",
  th: "Thai (Thailand visitors). Polite Thai for tourism. Keep URL/AI/Wi-Fi as-is.",
  vi: "Vietnamese (Vietnam visitors). Friendly, clear Vietnamese. Keep URL/AI/Wi-Fi as-is.",
  ru: "Russian (Russian-speaking visitors). Modern Russian for tourism. Keep URL/AI/Wi-Fi as-is.",
  fr: "French (France/Canada-compatible). Standard French for tourism. Keep URL/AI/Wi-Fi as-is.",
  de: "German. Modern German tourism style. Keep URL/AI/Wi-Fi as-is.",
  ar: "Modern Standard Arabic (MSA), formal, RTL-aware UI. Keep URL/AI/Wi-Fi as-is.",
  fa: "Modern Persian (Farsi), formal, RTL-aware UI. Keep URL/AI/Wi-Fi as-is."
};

function escape(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }

function buildPrompt(lang, batch) {
  const lines = batch.map(k => `- ${k} = "${escape(sourceMap[k])}"`).join("\n");
  return `You are a professional translator for a Chinese travel/AI tourism website (ChinaConnect, chinaengage.org).
Translate the following UI strings into ${TARGETS[lang]}
Rules:
- Keep placeholder syntax unchanged (e.g., {count}, {city}).
- Keep ALL CAPS / acronyms (AI, FAQ, Wi-Fi, URL, RSS, MIT, Google, GitHub) unchanged.
- Keep numbers, dates, currency symbols unchanged.
- For RTL languages (ar, fa): text should read naturally.
- Output ONLY a single JSON object with EXACTLY these ${batch.length} keys.
- No markdown, no commentary, no extra keys, no trailing commas.
JSON to output:
${lines}
`;
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 6000 };
  const res = await fetch(HOST + "/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 200));
  const j = await res.json();
  return j.choices[0].message.content;
}

function extractJson(content) {
  let c = content.trim();
  if (c.startsWith("```")) c = c.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");
  const start = c.indexOf("{"); const end = c.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in: " + c.slice(0, 200));
  c = c.slice(start, end + 1);
  return JSON.parse(c);
}

async function translateLang(lang) {
  console.log("\n=== " + lang + " ===");
  const outFile = lang + "-translations.json";
  let out = {};
  if (fs.existsSync(outFile)) {
    try { out = JSON.parse(fs.readFileSync(outFile, "utf8")); } catch (e) {}
  }
  console.log("[" + lang + "] resuming with " + Object.keys(out).length + " existing keys");

  const todo = allKeys.filter(k => !(k in out));
  console.log("[" + lang + "] need to translate: " + todo.length);
  if (todo.length === 0) return out;

  const batches = [];
  for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const t0 = Date.now();
    let attempt = 0; let success = false;
    while (attempt < 3 && !success) {
      attempt++;
      try {
        const content = await callChat(buildPrompt(lang, batch));
        const obj = extractJson(content);
        let got = 0;
        for (const k of batch) if (obj[k]) { out[k] = obj[k]; got++; }
        if (got === 0) throw new Error("empty object");
        success = true;
        process.stdout.write("[" + lang + " " + (bi+1) + "/" + batches.length + "] +" + got + "/" + batch.length + " (" + (Date.now()-t0) + "ms)\n");
        fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
      } catch (e) {
        process.stdout.write("[" + lang + " " + (bi+1) + "/" + batches.length + " attempt " + attempt + " fail: " + e.message.slice(0, 80) + "\n");
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    if (!success) {
      for (const k of batch) if (!(k in out)) out[k] = sourceMap[k];
      fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
      console.warn("[" + lang + " batch " + bi + "] FALLBACK to en");
    }
    await new Promise(r => setTimeout(r, 800));
  }
  console.log("[" + lang + "] FINAL " + Object.keys(out).length + " keys");
  return out;
}

const ALL_NON_EN = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const args = process.argv.slice(2);
let targets;
if (args.length === 0) targets = ["th", "vi", "ru", "fr", "de", "ar", "fa"];
else if (args[0] === "all") targets = ALL_NON_EN;
else targets = args;

for (const t of targets) await translateLang(t);
console.log("ALL DONE");
