// batch-translate-ja-data.mjs — translate Chinese/Korean residue in cities-i18n/ja/*.json to Japanese.
import fs from "node:fs";
import path from "node:path";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com")).replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 5;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const DIR = "src/data/cities-i18n/ja";

const isJa = (s, orig) => {
  if (/[\u3040-\u30ff]/.test(s)) return true;
  // kanji-only proper nouns are OK if they contain Han and are not more "simplified" than the original
  if (/[\u4e00-\u9fff]/.test(s)) {
    return simplifiedCount(s) <= simplifiedCount(orig || s);
  }
  return false;
};

export function isDirty(text) {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
}

function isMixed(text) {
  const k = kanaCount(text);
  return k > 0 && k / text.length >= 0.3;
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const url = `${HOST}/chat/completions`;
  const response = await fetch(url, {
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

async function translateBatch(batch, mixed) {
  const lines = batch.map((text, i) => `- ${i} = "${String(text).replace(/"/g, '\\"').replace(/\n/g, " ")}"`).join("\n");
  const prompt = mixed
    ? `The following Japanese strings from a Chinese travel website contain leftover Simplified Chinese characters, Korean text, or machine-translation errors. Fix each into natural, correct Japanese.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Fix Simplified-Chinese characters into proper Japanese kanji (e.g. 这→この, 时→時, 馆→館, 园→園, 广→広, 东→東, 长→長), fix awkward machine-translation phrasing into natural Japanese.
- KEEP EXACTLY UNCHANGED: ¥ symbol, numbers, prices, percentages, times, phone numbers, metro/line numbers, airport codes, brand/app names (WeChat, Alipay, Meituan, Didi...).
- Keep proper nouns readable for Japanese users (e.g. 长沙→長沙, 山顶→山頂).

${lines}`
    : `Translate the following strings from a Chinese travel website into natural Japanese (kanji/hiragana/katakana) for Japanese tourists visiting China.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Translate EVERY value into natural, fluent Japanese.
- KEEP EXACTLY UNCHANGED: ¥ symbol (never convert to 円 or 元), numbers, prices, percentages, times (23:00-05:00), phone numbers, metro/line numbers (Line 2, 2号线), airport codes (PEK/PKX), and app/brand names (Didi, Alipay, WeChat, Meituan, Hello).
- Convert Chinese proper nouns to their Japanese-kanji form (e.g. 北京市朝阳区→北京市朝陽区, 长沙→長沙, 圆明园→円明園, 东来顺→東来順). Restaurant/dish names: give the Japanese-readable name (e.g. 红烧肉→紅焼肉（豚の角煮）, 炸酱面→ジャージャー麺). When a dish has a common Japanese name, prefer it.
- If a string is already natural Japanese, return it unchanged.

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key count mismatch: got " + Object.keys(result).length);
      const out = batch.map((text, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0) throw new Error("bad value for " + i);
        if (!isJa(v, text)) throw new Error("non-Japanese value for " + i + ": " + JSON.stringify(v).slice(0, 80));
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

function writeJsonAtomic(filePath, data) {
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, filePath);
}

// ---- collect dirty locations ----
const locations = []; // { file, path, text }
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const walk = (o, p) => {
    if (typeof o === "string") {
      if (isDirty(o)) locations.push({ file: f, path: p, text: o });
    } else if (Array.isArray(o)) {
      o.forEach((v, i) => walk(v, p + "[" + i + "]"));
    } else if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) walk(v, p ? p + "." + k : k);
    }
  };
  walk(data, "");
}
const unique = [...new Set(locations.map((l) => l.text))];
console.log(`dirty locations: ${locations.length} | unique texts: ${unique.length}`);

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
let cachedHits = 0, translated = 0, failed = [];

const pending = unique.filter((t) => !cache[t]);
console.log(`cache hits: ${unique.length - pending.length} | to translate: ${pending.length}`);

for (let i = 0; i < pending.length; i += BATCH_SIZE) {
  const batch = pending.slice(i, i + BATCH_SIZE);
  const mixed = batch.every((t) => isMixed(t));
  try {
    const results = await translateBatch(batch, mixed);
    batch.forEach((t, j) => { cache[t] = results[j]; });
    translated += batch.length;
    if (translated % 100 === 0 || i + BATCH_SIZE >= pending.length) {
      saveCache();
      console.log(`progress: ${translated}/${pending.length} translated (${(translated / pending.length * 100).toFixed(0)}%)`);
    }
  } catch (e) {
    failed.push(...batch);
    console.error(`batch ${i} FAILED: ${e.message}`);
    saveCache();
    if (failed.length >= 60) break;
  }
  await new Promise((r) => setTimeout(r, 120));
}

function saveCache() { writeJsonAtomic(CACHE_PATH, cache); }
saveCache();

// ---- apply back ----
const byFile = {};
for (const l of locations) {
  (byFile[l.file] ||= []).push(l);
}
let applied = 0;
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
    if (typeof v === "string" && v !== l.text) {
      setByPath(data, l.path, v);
      applied++;
    }
  }
  writeJsonAtomic(fp, data);
}
console.log(`applied ${applied} translations across ${Object.keys(byFile).length} files`);
console.log(failed.length ? `FAILED batches: ${failed.length}` : "all batches succeeded");
