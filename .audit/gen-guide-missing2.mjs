import fs from "node:fs";
import { simplifiedCount } from "./ja-residue.mjs";
const dictRaw = fs.readFileSync("src/data/guide/ja-overrides.ts", "utf8");
const dict = {};
for (const m of dictRaw.matchAll(/(?:^|\n)\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) dict[m[1]] = m[2];
const missing = new Set();
const collect = (s) => { if (s && /[\u4e00-\u9fff]/.test(s) && simplifiedCount(s) >= 1 && (!dict[s] || simplifiedCount(dict[s]) >= 1)) missing.add(s); };
const compFiles = fs.readdirSync("src/components/Guide").filter((f) => f.endsWith(".tsx"));
for (const f of compFiles) {
  const src = fs.readFileSync("src/components/Guide/" + f, "utf8");
  for (const m of src.matchAll(/zh="((?:[^"\\]|\\.)*)"/g)) collect(m[1]);
  for (const m of src.matchAll(/zh='((?:[^'\\]|\\.)*)'/g)) collect(m[1]);
  for (const m of src.matchAll(/"((?:[^"\\]|\\.)*)"/g)) collect(m[1].replace(/\\(.)/g, "$1"));
  for (const m of src.matchAll(/'((?:[^'\\]|\\.)*)'/g)) collect(m[1].replace(/\\(.)/g, "$1"));
}
const dataFiles = [
  "src/data/cultural-warnings.ts","src/data/guide/dining.ts","src/data/guide/communication.ts",
  "src/data/guide/payment.ts","src/data/guide/transport.ts","src/data/guide/visa.ts",
  "src/data/guide/emergency.ts","src/data/guide/accommodation.ts","src/data/guide/departure.ts",
  "src/data/guide/business/company-registration.ts","src/data/guide/business/etiquette.ts",
  "src/data/guide/business/expo-calendar.ts","src/data/guide/business/translation.ts",
  "src/data/scam-prevention.ts","src/data/price-transparency.ts",
];
for (const f of dataFiles) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/'((?:[^'\\]|\\.)*)'/g)) collect(m[1].replace(/\\(.)/g, "$1"));
}
console.log("missing to translate:", missing.size);
const list = [...missing].sort();
list.forEach((s, i) => console.log((i + 1) + ". " + JSON.stringify(s)));

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : "https://api.minimaxi.com").replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 12;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
async function callChat(prompt) {
  const res = await fetch(`${HOST}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 300));
  return (await res.json()).choices?.[0]?.message?.content;
}
function extractJson(content) {
  const c = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no json");
  return JSON.parse(c.slice(s, e + 1));
}
async function translateBatch(batch) {
  const lines = batch.map((t, i) => `- ${i} = ${JSON.stringify(t)}`).join("\n");
  const prompt = `Translate the following strings for the Japanese version of a China travel guide. They are Chinese UI labels, phrases, or mixed English/Chinese sentences.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0","1",...). No markdown, no commentary.
- Natural Japanese UI labels and phrases.
- For mixed sentences containing Chinese quotes (e.g. "The number 4 sounds like \\"death\\" (si/死)..."), translate the whole sentence into natural Japanese, keeping Chinese terms as Japanese kanji/katakana with readings.
- KEEP EXACTLY UNCHANGED: ¥, numbers, prices, times, phone numbers, app/brand names (WeChat, Alipay, Meituan, Didi, 12306).
${lines}`;
  for (let a = 1; a <= 5; a++) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("count mismatch");
      return batch.map((t, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || !v.length) throw new Error("bad " + i);
        return v;
      });
    } catch (e) {
      console.warn("  retry " + a + ": " + e.message);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error("batch failed");
}
let translated = 0;
for (let i = 0; i < list.length; i += BATCH_SIZE) {
  const batch = list.slice(i, i + BATCH_SIZE);
  try {
    const results = await translateBatch(batch);
    batch.forEach((t, j) => { cache[t] = results[j]; dict[t] = results[j]; });
    translated += batch.length;
    if ((i / BATCH_SIZE + 1) % 4 === 0 || i + BATCH_SIZE >= list.length) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
      console.log("progress:", i + batch.length, "/", list.length);
    }
  } catch (e) {
    console.error("batch FAILED at", i, e.message);
  }
  await new Promise((r) => setTimeout(r, 120));
}
fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
const out = `// Auto-generated ja override dictionary for guide data Cn fields.
// Key: original Simplified-Chinese string → natural Japanese.
export const JA_GUIDE_OVERRIDES: Record<string, string> = ${JSON.stringify(dict, null, 2)};
`;
fs.writeFileSync("src/data/guide/ja-overrides.ts", out);
console.log("dict size:", Object.keys(dict).length, "translated:", translated);
