// Robust translator: validates each translation, retries if LLM returns English.
// Resumable: keeps existing content-{lang}.json and only processes missing keys.
// Usage: node translate-robust.mjs <lang1> [lang2] [...]
//        node translate-robust.mjs all
import fs from "fs";
import { getMiniMaxConfig } from "./scripts/lib/minimax-config.mjs";

const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";
const PARALLEL = 2;        // low to avoid rate limit
const BATCH = 4;            // small batch for quality
const MAX_RETRIES = 4;
const SLEEP_MS = 400;
const SOURCE = "content-en.json";

const en = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const allKeys = Object.keys(en);
console.log("source keys:", allKeys.length);

const TARGETS = {
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  th: "Thai",
  vi: "Vietnamese",
  ru: "Russian",
  fr: "French",
  de: "German",
  ar: "Modern Standard Arabic",
  fa: "Modern Persian (Farsi)"
};

function escape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function buildPrompt(lang, batch) {
  const lines = batch.map(k => `${k} = "${escape(en[k])}"`).join("\n");
  return `You are a professional translator for a travel/AI tourism website (ChinaConnect, chinaengage.org).
Translate these ${batch.length} English strings into ${TARGETS[lang]} for foreign visitors.
Each key is unique and represents a specific travel-related string: city descriptions, attraction names/descriptions/addresses/opening hours/ticket prices/tips, restaurant info, hotel info, cultural tips.
RULES (follow strictly):
- Output ONLY a single JSON object with EXACTLY these ${batch.length} keys, nothing else.
- No markdown code blocks, no commentary, no extra keys, no trailing commas.
- Translate EVERY value into ${TARGETS[lang]}. Do NOT keep any English text.
- Each translation must be in ${TARGETS[lang]} (proper script/characters for that language).
- Keep numbers, prices (Y, $, etc.), times, dates, units, brand names unchanged.
- Keep proper nouns recognizable (e.g., "Forbidden City" = "Cite interdite" in French).
${lines}
`;
}

async function callChat(prompt) {
  const body = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4000
  };
  const res = await fetch(HOST + "/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 200));
  const j = await res.json();
  return j.choices?.[0]?.message?.content;
}

function extractJson(content) {
  let c = content.trim();
  c = c.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/, "");
  const start = c.indexOf("{");
  const end = c.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON: " + c.slice(0, 200));
  c = c.slice(start, end + 1);
  return JSON.parse(c);
}

function isTranslated(value, originalEn) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (v.length === 0) return false;
  if (v.toLowerCase() === String(originalEn).trim().toLowerCase()) return false;
  return true;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function translateBatch(lang, batch) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const content = await callChat(buildPrompt(lang, batch));
      const obj = extractJson(content);
      const result = {};
      let ok = 0;
      for (const k of batch) {
        if (isTranslated(obj[k], en[k])) {
          result[k] = obj[k];
          ok++;
        }
      }
      if (ok >= Math.max(1, Math.floor(batch.length * 0.5))) {
        return { ok, result };
      }
      if (attempt === MAX_RETRIES) {
        return { ok: 0, result: {} };
      }
    } catch (e) {
      if (attempt === MAX_RETRIES) {
        return { ok: 0, result: {} };
      }
    }
    await sleep(300 * attempt);
  }
  return { ok: 0, result: {} };
}

async function translateLang(lang) {
  console.log("[" + lang + "] starting");
  const outFile = "content-" + lang + ".json";
  let out = {};
  if (fs.existsSync(outFile)) {
    try {
      const stat = fs.statSync(outFile);
      if (stat.size > 10) {
        out = JSON.parse(fs.readFileSync(outFile, "utf8"));
        let verified = 0, dropped = 0;
        for (const k of Object.keys(out)) {
          if (isTranslated(out[k], en[k])) verified++;
          else { delete out[k]; dropped++; }
        }
        if (dropped > 0) {
          console.log("[" + lang + "] cleaned: kept " + verified + ", dropped " + dropped);
          fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
        }
        console.log("[" + lang + "] loaded " + verified + " verified keys from " + stat.size + " bytes");
      }
    } catch (e) {
      console.warn("[" + lang + "] parse error: " + e.message);
    }
  }
  const todo = allKeys.filter(k => !(k in out));
  console.log("[" + lang + "] verified existing: " + Object.keys(out).length + ", todo: " + todo.length);
  if (todo.length === 0) return out;

  const batches = [];
  for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));
  console.log("[" + lang + "] " + batches.length + " batches of " + BATCH);

  const startT = Date.now();
  let done = 0;
  for (let bi = 0; bi < batches.length; bi += PARALLEL) {
    const slice = batches.slice(bi, bi + PARALLEL);
    const results = await Promise.all(slice.map(b => translateBatch(lang, b)));
    for (const r of results) {
      for (const kv of Object.entries(r.result)) {
        out[kv[0]] = kv[1];
      }
    }
    done += slice.length;
    const elapsed = (Date.now() - startT) / 1000;
    const total = Object.keys(out).length;
    if (done % 50 === 0 || done === batches.length) {
      process.stdout.write("[" + lang + " " + done + "/" + batches.length + "] total=" + total + " elapsed=" + elapsed.toFixed(0) + "s\n");
      fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    }
    await sleep(SLEEP_MS);
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log("[" + lang + "] FINAL " + Object.keys(out).length + " keys");
  return out;
}

const ALL_NON_EN = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const args = process.argv.slice(2);
let targets;
if (args.length === 0) targets = ["ja"];
else if (args[0] === "all") targets = ALL_NON_EN;
else targets = args;

for (const t of targets) await translateLang(t);
console.log("ALL DONE");
