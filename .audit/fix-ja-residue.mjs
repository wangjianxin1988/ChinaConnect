// fix-ja-residue.mjs — translate remaining dirty strings in cities-i18n/ja/*.json.
import fs from "node:fs";
import path from "node:path";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : "https://api.minimaxi.com").replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 6;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const DIR = "src/data/cities-i18n/ja";

const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const isJa = (v) => kanaCount(v) > 0 || simplifiedCount(v) === 0;

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const response = await fetch(`${HOST}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
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
  const prompt = `The following Japanese strings from a China travel website still contain Simplified-Chinese characters or mixed-language artifacts. Fix each into natural, correct Japanese.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Replace Simplified-Chinese characters with proper Japanese kanji or kana (e.g. 传统→伝統, 火锅→火鍋, 龙→竜/龍, 边→辺, 锅→鍋, 鸡→鶏, 面→麺/メン, 药→薬, 阳→陽, 东→東, 馆→館, 见→見, 记→記).
- Restaurant/dish names: Japanese-readable form (e.g. 传统牛肉面→伝統牛肉麺, 成都味回锅肉→成都風回鍋肉, 老洛阳不翻汤→老洛陽不翻湯).
- For Chinese dialect phrases inside Japanese sentences, transliterate with a Japanese gloss in parentheses (e.g. 你好→「ニーハオ」(こんにちは)).
- KEEP EXACTLY UNCHANGED: ¥ symbol, numbers, prices, phone numbers, Latin words, brand names.
- If already natural Japanese, return unchanged.

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key count mismatch");
      const out = batch.map((text, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0) throw new Error("bad value " + i);
        if (!isJa(v)) throw new Error("not ja: " + JSON.stringify(v).slice(0, 80));
        return v;
      });
      return out;
    } catch (e) {
      console.warn(`  retry ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("batch failed after retries");
}

function writeJsonAtomic(fp, data) {
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, fp);
}

const locations = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const walk = (o, p) => {
    if (typeof o === "string") { if (isDirty(o)) locations.push({ file: f, path: p, text: o }); }
    else if (Array.isArray(o)) o.forEach((v, i) => walk(v, p + "[" + i + "]"));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? p + "." + k : k);
  };
  walk(data, "");
}
const unique = [...new Set(locations.map((l) => l.text))];
console.log(`dirty locations: ${locations.length} | unique: ${unique.length}`);

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
const pending = unique.filter((t) => !cache[t] || isDirty(cache[t]));
console.log("to translate (missing or still dirty in cache):", pending.length);

for (let i = 0; i < pending.length; i += BATCH_SIZE) {
  const batch = pending.slice(i, i + BATCH_SIZE);
  try {
    const results = await translateBatch(batch);
    batch.forEach((t, j) => { cache[t] = results[j]; });
    console.log(`batch ${i / BATCH_SIZE + 1}: ${batch.length} done`);
    writeJsonAtomic(CACHE_PATH, cache);
  } catch (e) {
    console.error(`batch ${i} FAILED: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 120));
}

let applied = 0;
const byFile = {};
for (const l of locations) (byFile[l.file] ||= []).push(l);
for (const [file, locs] of Object.entries(byFile)) {
  const fp = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  const setByPath = (obj, p, v) => {
    const parts = p.split(/[.[\]]/).filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = v;
  };
  for (const l of locs) {
    const v = cache[l.text];
    if (typeof v === "string" && v !== l.text) { setByPath(data, l.path, v); applied++; }
  }
  writeJsonAtomic(fp, data);
}
console.log(`applied ${applied} translations across ${Object.keys(byFile).length} files`);
