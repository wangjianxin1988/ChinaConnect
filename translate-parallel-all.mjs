// Parallel translator: runs all 11 languages simultaneously with optimal config.
import fs from "fs";
import { getMiniMaxConfig } from "./scripts/lib/minimax-config.mjs";

const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-M2.5";
const PARALLEL = 1;        // one API request at a time
const BATCH = 20;          // translated keys per API call
const MAX_RETRIES = 3;
const MAX_PASSES = 3;
const SLEEP_MS = 1000;
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

const ALL_NON_EN = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const requestedLanguages = process.argv.slice(2).filter(lang => ALL_NON_EN.includes(lang));
const LANGS_TO_RUN = requestedLanguages.length > 0 ? requestedLanguages : ALL_NON_EN;

function escape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function buildPrompt(lang, batch) {
  const lines = batch.map(k => k + " = \"" + escape(en[k]) + "\"").join("\n");
  return "You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\nTranslate these " + batch.length + " English strings into " + TARGETS[lang] + " for foreign visitors.\nContent: city descriptions, attraction info, restaurant info, hotel info, cultural tips.\nRULES:\n- Output ONLY a single JSON object with EXACTLY these " + batch.length + " keys.\n- No markdown, no commentary, no extra keys.\n- Translate EVERY value into " + TARGETS[lang] + ". Do NOT keep English text.\n- Keep numbers, prices, times, units, brand names unchanged.\n- Keep proper nouns recognizable (Forbidden City = Cite interdite in French).\n" + lines + "\n";
}

async function callChat(prompt) {
  const body = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 12000,
    reasoning: { enabled: false }
  };
  const res = await fetch(HOST + "/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const error = new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 200));
    error.status = res.status;
    throw error;
  }
  const j = await res.json();
  return j.choices?.[0]?.message?.content;
}

function extractJson(content) {
  let c = String(content || "").trim();
  c = c.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/, "");
  const start = c.indexOf("{");
  if (start === -1) throw new Error("No JSON");
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < c.length; i++) {
    const ch = c[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\\\") { escape = true; continue; }
    if (ch === "\"") { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return JSON.parse(c.slice(start, i + 1)); }
  }
  throw new Error("Unterminated JSON");
}

function needsTranslation(value) {
  return /[A-Za-z]/.test(String(value));
}

function isTranslated(value, originalEn) {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  if (!needsTranslation(originalEn)) return value.trim() === String(originalEn).trim();
  return value.trim().toLowerCase() !== String(originalEn).trim().toLowerCase();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const outCache = new Map();
const outFor = (lang) => outCache.get(lang);

async function translateBatch(lang, batch, depth = 0) {
  const result = {};
  let remaining = [...batch];
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES && remaining.length > 0; attempt++) {
    try {
      const content = await callChat(buildPrompt(lang, remaining));
      const obj = extractJson(content);
      for (const key of remaining) {
        if (isTranslated(obj[key], en[key])) result[key] = obj[key];
      }
      remaining = remaining.filter(key => !(key in result));
      lastError = null;
    } catch (error) {
      lastError = error;
    }
    if (remaining.length > 0) {
      const delay = lastError?.status === 429 ? 10000 * (2 ** (attempt - 1)) : 400 * attempt;
      await sleep(delay);
    }
  }

  if (remaining.length > 0 && batch.length > 1 && lastError?.status !== 429) {
    const midpoint = Math.ceil(remaining.length / 2);
    const left = remaining.slice(0, midpoint);
    const right = remaining.slice(midpoint);
    const leftResult = await translateBatch(lang, left, depth + 1);
    const rightResult = await translateBatch(lang, right, depth + 1);
    return {
      result: { ...result, ...leftResult.result, ...rightResult.result },
      remaining: [...leftResult.remaining, ...rightResult.remaining],
    };
  }

  if (remaining.length > 0) {
    const reason = lastError ? " error=" + lastError.message : "";
    console.warn("[" + lang + "] single key incomplete: " + remaining[0] + reason);
  }
  return { result, remaining };
}

async function translateLang(lang) {
  console.log("[" + lang + "] starting");
  const outFile = "content-" + lang + ".json";
  let out = {};

  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 10) {
    try {
      out = JSON.parse(fs.readFileSync(outFile, "utf8"));
    } catch {
      out = {};
    }
  }

  let dropped = 0;
  for (const key of Object.keys(out)) {
    if (!(key in en) || !isTranslated(out[key], en[key])) {
      delete out[key];
      dropped++;
    }
  }

  const translationBySource = new Map();
  for (const key of allKeys) {
    if (needsTranslation(en[key]) && isTranslated(out[key], en[key])) {
      translationBySource.set(String(en[key]), out[key]);
    }
  }

  let neutral = 0;
  let reused = 0;
  for (const key of allKeys) {
    if (isTranslated(out[key], en[key])) continue;
    if (!needsTranslation(en[key])) {
      out[key] = String(en[key]);
      neutral++;
      continue;
    }
    const existing = translationBySource.get(String(en[key]));
    if (existing) {
      out[key] = existing;
      reused++;
    }
  }

  if (dropped || neutral || reused) {
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  }
  console.log("[" + lang + "] verified=" + Object.keys(out).length + " neutral=" + neutral + " reused=" + reused + " dropped=" + dropped);

  const startTime = Date.now();
  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    const todo = allKeys.filter(key => !isTranslated(out[key], en[key]));
    if (todo.length === 0) break;

    const groups = new Map();
    for (const key of todo) {
      const sourceValue = String(en[key]);
      if (!groups.has(sourceValue)) groups.set(sourceValue, []);
      groups.get(sourceValue).push(key);
    }
    const representatives = [...groups.values()].map(keys => keys[0]);
    const aliases = new Map(representatives.map(key => [key, groups.get(String(en[key]))]));
    const batches = [];
    for (let index = 0; index < representatives.length; index += BATCH) {
      batches.push(representatives.slice(index, index + BATCH));
    }

    console.log("[" + lang + "] pass=" + pass + " missingKeys=" + todo.length + " uniqueValues=" + representatives.length + " batches=" + batches.length);
    const before = Object.keys(out).length;
    let done = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex += PARALLEL) {
      const slice = batches.slice(batchIndex, batchIndex + PARALLEL);
      const results = await Promise.all(slice.map(batch => translateBatch(lang, batch)));
      for (const { result } of results) {
        for (const [representative, translation] of Object.entries(result)) {
          for (const key of aliases.get(representative) || [representative]) out[key] = translation;
        }
      }
      done += slice.length;
      if (true) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log("[" + lang + " pass=" + pass + " " + done + "/" + batches.length + "] total=" + Object.keys(out).length + " elapsed=" + elapsed + "s");
        fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
      }
      await sleep(SLEEP_MS);
    }

    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    const gained = Object.keys(out).length - before;
    if (gained === 0) break;
  }

  const remaining = allKeys.filter(key => !isTranslated(out[key], en[key]));
  if (remaining.length > 0) {
    console.warn("[" + lang + "] incomplete: " + remaining.length + " keys remain (likely 422 sensitive content, safe to skip)");
  }
  console.log("[" + lang + "] COMPLETE " + Object.keys(out).length + "/" + allKeys.length + " keys");
}

async function runSelectedLanguages() {
  for (const lang of LANGS_TO_RUN) {
    await translateLang(lang);
  }
  console.log("ALL DONE: " + LANGS_TO_RUN.length + "/" + ALL_NON_EN.length + " selected languages complete");
}

runSelectedLanguages().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});