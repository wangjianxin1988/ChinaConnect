// gen-food-ja-overrides.mjs — translate dirty Cn strings in food data into a ja override dict.
import fs from "node:fs";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : "https://api.minimaxi.com").replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 5;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const FILES = ["src/data/food/restaurants.ts", "src/data/food/categories.ts", "src/data/food/cities.ts"];

const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};

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
  const prompt = `Translate the following Simplified-Chinese strings (restaurant names, addresses, descriptions, cuisines, tags from a China travel site) into natural Japanese for Japanese tourists.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Restaurant/store names: give a Japanese-readable form (e.g. 北京烤鸭→北京ダック, 陈记卤煮小肠→陳記卤煮小腸, 新荣记→新栄記). Keep the brand readable; use Japanese kanji for proper nouns.
- Addresses: natural Japanese, convert simplified kanji to Japanese forms (北京市朝阳区→北京市朝陽区).
- Descriptions/cuisines/tags: natural, fluent Japanese (e.g. 商务宴请→ビジネス接待, 苍蝇馆子→大衆食堂, 米其林二星餐厅→ミシュラン二つ星レストラン).
- KEEP EXACTLY UNCHANGED: ¥ symbol, numbers, prices, phone numbers, Latin letters, English words, WeChat/Alipay/Didi brand names.
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
        if (v === text) return v;
        return v;
      });
      return out;
    } catch (e) {
      console.warn(`  retry ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("batch failed");
}

function writeJsonAtomic(fp, data) {
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, fp);
}

// collect dirty string literals
const strings = new Set();
for (const f of FILES) {
  const s = fs.readFileSync(f, "utf8");
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[1];
    if (t.length >= 2 && /[\u4e00-\u9fff]/.test(t) && isDirty(t)) strings.add(t);
  }
}
const unique = [...strings];
console.log("food dirty unique strings:", unique.length);

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
const pending = unique.filter((t) => !cache[t]);
console.log("cache hits:", unique.length - pending.length, "| to translate:", pending.length);

for (let i = 0; i < pending.length; i += BATCH_SIZE) {
  const batch = pending.slice(i, i + BATCH_SIZE);
  try {
    const results = await translateBatch(batch);
    batch.forEach((t, j) => { cache[t] = results[j]; });
    if (((i / BATCH_SIZE) + 1) % 10 === 0 || i + BATCH_SIZE >= pending.length) {
      writeJsonAtomic(CACHE_PATH, cache);
      console.log(`progress: ${i + batch.length}/${pending.length}`);
    }
  } catch (e) {
    console.error(`batch ${i} FAILED: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 120));
}
writeJsonAtomic(CACHE_PATH, cache);

const overrides = {};
for (const t of unique) if (cache[t] && cache[t] !== t) overrides[t] = cache[t];
const out = `// Auto-generated ja override dictionary for food data Cn strings.
// Key: original Simplified-Chinese string → natural Japanese.
export const JA_FOOD_OVERRIDES: Record<string, string> = ${JSON.stringify(overrides, null, 2)};
`;
fs.writeFileSync("src/data/food/ja-food-overrides.ts", out);
console.log("wrote src/data/food/ja-food-overrides.ts with", Object.keys(overrides).length, "entries");
