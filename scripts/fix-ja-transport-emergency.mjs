// One-off: translate ja transport.local tips + emergency contact fields for all 35 cities.
// Provider: DeepSeek (env) with MiniMax fallback.
import fs from "node:fs";
import path from "node:path";

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com")).replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 4;
const CACHE_PATH = ".audit/ja-translation-cache.json";

const isJa = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s);
const hasKana = (s) => /[\u3040-\u30ff]/.test(s);

async function callChat(prompt) {
  const body = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 8000,
  };
  const url = `${HOST}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content;
}

function extractJson(content) {
  const cleaned = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function translateBatch(batch) {
  const lines = batch.map((text, i) => `- ${i} = "${String(text).replace(/"/g, '\\"').replace(/\n/g, " ")}"`).join("\n");
  const prompt = `Translate the following strings into natural Japanese for a Chinese travel website (ChinaConnect).
Rules:
- Output ONLY a single flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...).
- No markdown, no commentary.
- Translate EVERY value into natural Japanese (kanji/hiragana/katakana).
- KEEP EXACTLY UNCHANGED: the yen symbol ¥ (never convert to 円 or 元), numbers, prices, percentages, times (23:00-05:00), phone numbers, metro/line numbers (Line 2, 2号线), airport codes (PEK/PKX), and app/brand names (Didi, Alipay, WeChat, Meituan, Hello).
- Keep English proper nouns of places only when a Japanese name does not exist.

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key count mismatch");
      const out = batch.map((text, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0 || !isJa(v)) throw new Error("bad value for " + i + ": " + JSON.stringify(v));
        return v;
      });
      return out;
    } catch (e) {
      console.warn(`  retry ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("batch failed after retries");
}

function writeJsonAtomic(filePath, data) {
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, filePath);
}

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
function saveCache() { writeJsonAtomic(CACHE_PATH, cache); }

const citiesDir = "src/data/cities";
const outDir = "src/data/cities-i18n/ja";
const slugs = fs.readdirSync(citiesDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
const jobs = [];
const needs = new Set();
for (const slug of slugs) {
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, `${slug}.json`), "utf8"));
  const jaPath = path.join(outDir, `${slug}.json`);
  if (!fs.existsSync(jaPath)) continue;
  const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));
  const enLocal = en.transport?.local || {};
  const jaLocal = ja.transport?.local || {};
  for (const mode of Object.keys(enLocal)) {
    const items = enLocal[mode];
    if (!Array.isArray(items)) continue;
    items.forEach((text, i) => {
      if (typeof text === "string" && text.trim() && !hasKana(text) && !(jaLocal[mode]?.[i] && hasKana(jaLocal[mode][i]))) {
        jobs.push({ slug, kind: "transport", mode, i, text: text.trim() });
        needs.add(text.trim());
      }
    });
  }
  const enEC = en.emergencyContacts || [];
  const jaEC = ja.emergencyContacts || [];
  if (enEC.length !== jaEC.length) console.warn(`  [${slug}] emergencyContacts length mismatch ${enEC.length} vs ${jaEC.length}`);
  enEC.forEach((c, i) => {
    if (!c || typeof c !== "object") return;
    for (const field of ["name", "address", "notes"]) {
      const text = c[field];
      if (typeof text === "string" && text.trim() && !hasKana(text)) {
        const cur = jaEC[i]?.[field] || "";
        if (!hasKana(cur)) {
          jobs.push({ slug, kind: "emergency", i, field, text: text.trim() });
          needs.add(text.trim());
        }
      }
    }
  });
}
console.log(`unique strings to translate: ${needs.size}; total jobs: ${jobs.length}`);
console.log(`provider: ${useDeepSeek ? "deepseek" : "minimax"} model: ${MODEL}`);

const todo = [...needs].filter((t) => !cache[t]);
console.log(`uncached: ${todo.length}`);
let failCount = 0;
for (let start = 0; start < todo.length; start += BATCH_SIZE) {
  const batch = todo.slice(start, start + BATCH_SIZE);
  try {
    const translated = await translateBatch(batch);
    batch.forEach((t, i) => { cache[t] = translated[i]; });
    saveCache();
    console.log(`  translated ${Math.min(start + batch.length, todo.length)}/${todo.length} (${Math.round(Math.min(start + batch.length, todo.length) / todo.length * 100)}%)`);
  } catch (e) {
    failCount += 1;
    console.error(`  BATCH FAILED: ${e.message}`);
  }
}
console.log(`translation phase done, failed batches: ${failCount}`);

let transportFixed = 0, emergencyFixed = 0;
for (const slug of slugs) {
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, `${slug}.json`), "utf8"));
  const jaPath = path.join(outDir, `${slug}.json`);
  const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));
  let changed = false;
  const enLocal = en.transport?.local || {};
  const jaLocal = ja.transport?.local || {};
  for (const mode of Object.keys(enLocal)) {
    const items = enLocal[mode];
    if (!Array.isArray(items)) continue;
    const arr = (jaLocal[mode] = Array.isArray(jaLocal[mode]) ? [...jaLocal[mode]] : []);
    items.forEach((text, i) => {
      if (typeof text === "string" && text.trim() && !hasKana(text) && !(arr[i] && hasKana(arr[i]))) {
        const tr = cache[text.trim()];
        if (tr) { arr[i] = tr; transportFixed += 1; changed = true; }
      }
    });
  }
  const enEC = en.emergencyContacts || [];
  const jaEC = ja.emergencyContacts || [];
  enEC.forEach((c, i) => {
    if (!c || typeof c !== "object" || !jaEC[i] || typeof jaEC[i] !== "object") return;
    const target = jaEC[i];
    for (const field of ["name", "address", "notes"]) {
      const text = c[field];
      if (typeof text === "string" && text.trim() && !hasKana(text)) {
        const tr = cache[text.trim()];
        if (tr) { target[field] = tr; emergencyFixed += 1; changed = true; }
      }
    }
    if (typeof c.nameEn === "string" && c.nameEn && target.nameEn !== c.nameEn) { target.nameEn = c.nameEn; changed = true; }
    const jaName = target.name;
    if (jaName && target.nameJa !== jaName) { target.nameJa = jaName; changed = true; }
  });
  if (changed) writeJsonAtomic(jaPath, ja);
}
console.log(`DONE. transport tips fixed: ${transportFixed}; emergency fields fixed: ${emergencyFixed}`);
