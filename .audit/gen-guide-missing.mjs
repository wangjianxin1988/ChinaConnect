import fs from "node:fs";
import { simplifiedCount } from "./ja-residue.mjs";
const FILES = [
  "src/data/guide/accommodation.ts","src/data/guide/communication.ts","src/data/guide/departure.ts",
  "src/data/guide/dining.ts","src/data/guide/emergency.ts","src/data/guide/payment.ts",
  "src/data/guide/transport.ts","src/data/guide/visa.ts","src/data/cultural-warnings.ts",
  "src/data/price-transparency.ts","src/data/scam-prevention.ts",
  "src/data/guide/business/company-registration.ts","src/data/guide/business/etiquette.ts",
  "src/data/guide/business/expo-calendar.ts","src/data/guide/business/invitation-letter.ts",
  "src/data/guide/business/translation.ts"
];
const DICT_PATH = "src/data/guide/ja-overrides.ts";
const dictRaw = fs.readFileSync(DICT_PATH, "utf8");
const dict = {};
for (const m of dictRaw.matchAll(/(?:^|\n)\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)) dict[m[1]] = m[2];

// collect all strings containing CJK OR mixed en(zh) pattern
const strings = new Set();
for (const f of FILES) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
    const s = m[1].replace(/\\(.)/g, "$1");
    if (/[\u4e00-\u9fff]/.test(s)) strings.add(s);
  }
}
const need = [...strings].filter((s) => !dict[s] || simplifiedCount(dict[s]) >= 1);
console.log("missing:", need.length);

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
function writeJsonAtomic(fp, data) {
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, fp);
}
async function translateBatch(batch) {
  const lines = batch.map((t, i) => `- ${i} = "${String(t).replace(/"/g, '\\"').replace(/\n/g, " ")}"`).join("\n");
  const prompt = `Translate the following strings for the Japanese version of a China travel guide. They are Chinese phrases, dish names, or "English (Chinese)" mixed labels.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0","1",...). No markdown, no commentary.
- Produce natural Japanese that a Japanese tourist would read.
- For "English (Chinese)" mixed labels like "Kung Pao Chicken (宫保鸡丁)": output the dish name in Japanese, e.g. "宮保鶏丁（クンパオチーディン）" or use the common Japanese dish name (麻婆豆腐→マーボー豆腐, 北京烤鸭→北京ダック, 点心→点心).
- For pure Chinese phrases: translate naturally (你好→ニーハオ, 多少钱?→いくらですか？).
- For official/business document names: natural Japanese bureaucratic style.
- KEEP EXACTLY UNCHANGED: ¥, numbers, prices, times, phone numbers, app/brand names (WeChat, Alipay, Meituan, Didi, 12306), metro lines, airport codes.
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
for (let i = 0; i < need.length; i += BATCH_SIZE) {
  const batch = need.slice(i, i + BATCH_SIZE);
  try {
    const results = await translateBatch(batch);
    batch.forEach((t, j) => { cache[t] = results[j]; dict[t] = results[j]; });
    translated += batch.length;
    if ((i / BATCH_SIZE + 1) % 4 === 0 || i + BATCH_SIZE >= need.length) {
      writeJsonAtomic(CACHE_PATH, cache);
      console.log("progress:", i + batch.length, "/", need.length);
    }
  } catch (e) {
    console.error("batch FAILED at", i, e.message);
  }
  await new Promise((r) => setTimeout(r, 120));
}
writeJsonAtomic(CACHE_PATH, cache);
// write dict: preserve existing entries + new, sorted
const out = `// Auto-generated ja override dictionary for guide data Cn fields.
// Key: original Simplified-Chinese string → natural Japanese.
export const JA_GUIDE_OVERRIDES: Record<string, string> = ${JSON.stringify(dict, null, 2)};
`;
fs.writeFileSync(DICT_PATH, out);
console.log("wrote dict with", Object.keys(dict).length, "entries; translated", translated);
