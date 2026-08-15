// Second pass: fix emergency address/notes (always translate from en), names without kana, and 元->¥ in transport.
import fs from "node:fs";
import path from "node:path";

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com")).replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 4;
const CACHE_PATH = ".audit/ja-translation-cache.json";

const hasKana = (s) => /[\u3040-\u30ff]/.test(s);
const isJa = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s);

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const response = await fetch(`${HOST}/chat/completions`, {
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
  const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No JSON");
  return JSON.parse(cleaned.slice(s, e + 1));
}
async function translateBatch(batch) {
  const lines = batch.map((t, i) => `- ${i} = "${String(t).replace(/"/g, '\\"').replace(/\n/g, " ")}"`).join("\n");
  const prompt = `Translate the following strings into natural Japanese for a Chinese travel website (ChinaConnect).
Rules:
- Output ONLY a single flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown.
- Translate EVERY value into natural Japanese.
- KEEP EXACTLY UNCHANGED: ¥ symbol (never convert to 円 or 元), numbers, prices, times, phone numbers, station/line names, airport codes, app/brand names.
- Translate Chinese place names into Japanese (e.g. 廣州 -> 広州, 北京 -> 北京).

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key count mismatch");
      const out = batch.map((t, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0 || !isJa(v)) throw new Error("bad value " + i + ": " + JSON.stringify(v));
        return v;
      });
      return out;
    } catch (e) {
      console.warn(`  retry ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw new Error("batch failed");
}
function writeJsonAtomic(fp, data) {
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, fp);
}

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
function saveCache() { writeJsonAtomic(CACHE_PATH, cache); }

const citiesDir = "src/data/cities";
const outDir = "src/data/cities-i18n/ja";
const slugs = fs.readdirSync(citiesDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

// Collect en strings for address/notes (all) + names lacking kana in ja
const needs = new Set();
const jobs = [];
for (const slug of slugs) {
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, `${slug}.json`), "utf8"));
  const jaPath = path.join(outDir, `${slug}.json`);
  if (!fs.existsSync(jaPath)) continue;
  const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));
  const enEC = en.emergencyContacts || [];
  const jaEC = ja.emergencyContacts || [];
  enEC.forEach((c, i) => {
    if (!c || typeof c !== "object" || !jaEC[i] || typeof jaEC[i] !== "object") return;
    const target = jaEC[i];
    for (const field of ["address", "notes"]) {
      const text = c[field];
      if (typeof text === "string" && text.trim() && !cache[text.trim()]) {
        jobs.push({ slug, i, field, text: text.trim() });
        needs.add(text.trim());
      }
    }
    const curName = target.name || "";
    if (!hasKana(curName) && typeof c.name === "string" && c.name.trim() && !cache[c.name.trim()]) {
      jobs.push({ slug, i, field: "name", text: c.name.trim() });
      needs.add(c.name.trim());
    }
  });
}
console.log(`new unique strings needed: ${needs.size}`);
const todo = [...needs];
for (let start = 0; start < todo.length; start += BATCH_SIZE) {
  const batch = todo.slice(start, start + BATCH_SIZE);
  try {
    const translated = await translateBatch(batch);
    batch.forEach((t, i) => { cache[t] = translated[i]; });
    saveCache();
    console.log(`  translated ${Math.min(start + batch.length, todo.length)}/${todo.length}`);
  } catch (e) {
    console.error(`  BATCH FAILED: ${e.message}`);
  }
}

// Apply
let addressFixed = 0, notesFixed = 0, nameFixed = 0, yenFixed = 0;
for (const slug of slugs) {
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, `${slug}.json`), "utf8"));
  const jaPath = path.join(outDir, `${slug}.json`);
  const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));
  let changed = false;
  // transport 元->¥
  const jaLocal = ja.transport?.local || {};
  for (const mode of Object.keys(jaLocal)) {
    const arr = jaLocal[mode];
    if (!Array.isArray(arr)) continue;
    arr.forEach((s, i) => {
      if (typeof s !== "string") return;
      const fixed = s.replace(/([\d０-９〜\-.\s])元/g, "$1¥").replace(/元\//g, "¥/");
      if (fixed !== s) { arr[i] = fixed; yenFixed += 1; changed = true; }
    });
  }
  const enEC = en.emergencyContacts || [];
  const jaEC = ja.emergencyContacts || [];
  enEC.forEach((c, i) => {
    if (!c || typeof c !== "object" || !jaEC[i] || typeof jaEC[i] !== "object") return;
    const target = jaEC[i];
    for (const field of ["address", "notes"]) {
      const text = c[field];
      const tr = typeof text === "string" ? cache[text.trim()] : undefined;
      if (tr) { target[field] = tr; if (field === "address") addressFixed += 1; else notesFixed += 1; changed = true; }
    }
    const curName = target.name || "";
    if (!hasKana(curName) && typeof c.name === "string" && cache[c.name.trim()]) {
      target.name = cache[c.name.trim()];
      target.nameJa = target.name;
      nameFixed += 1; changed = true;
    } else if (target.name && target.nameJa !== target.name) {
      target.nameJa = target.name; changed = true;
    }
  });
  if (changed) writeJsonAtomic(jaPath, ja);
}
console.log(`DONE. address: ${addressFixed}, notes: ${notesFixed}, names: ${nameFixed}, yen-fixes: ${yenFixed}`);
