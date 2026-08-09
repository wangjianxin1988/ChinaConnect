// Parallel translator: runs all 11 languages simultaneously with optimal config.
import fs from "fs";

const KEY = "REDACTED_MINIMAX_KEY";
const HOST = "https://api.minimax.io";
const MODEL = "MiniMax-M2.5";
const PARALLEL = 3;        // per language
const BATCH = 15;          // keys per API call
const MAX_RETRIES = 3;
const SLEEP_MS = 200;
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
    max_tokens: 8000
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
  if (start === -1 || end === -1) throw new Error("No JSON");
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
      // Accept if at least 30% translated
      if (ok >= Math.max(1, Math.floor(batch.length * 0.3))) {
        return { ok, result };
      }
      if (attempt === MAX_RETRIES) return { ok: 0, result: {} };
    } catch (e) {
      if (attempt === MAX_RETRIES) return { ok: 0, result: {} };
    }
    await sleep(200 * attempt);
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
      }
    } catch (e) {}
  }
  const todo = allKeys.filter(k => !(k in out));
  console.log("[" + lang + "] verified: " + Object.keys(out).length + ", todo: " + todo.length);
  if (todo.length === 0) return;

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
    if (done % 20 === 0 || done === batches.length) {
      process.stdout.write("[" + lang + " " + done + "/" + batches.length + "] total=" + total + " elapsed=" + elapsed.toFixed(0) + "s\n");
      fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    }
    await sleep(SLEEP_MS);
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log("[" + lang + "] FINAL " + Object.keys(out).length + " keys");
}

(async () => {
  // Run all 11 languages in parallel
  await Promise.all(ALL_NON_EN.map(lang => translateLang(lang)));
  console.log("ALL DONE");
})();
