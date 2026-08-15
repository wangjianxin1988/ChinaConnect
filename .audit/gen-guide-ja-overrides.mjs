// generate-guide-ja-overrides.mjs — translate Cn strings from guide data files into ja override dict.
import fs from "node:fs";
import path from "node:path";

const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
const KEY = useDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.MINIMAX_API_KEY;
const HOST = (useDeepSeek ? (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1") : "https://api.minimaxi.com").replace(/\/+$/, "");
const MODEL = useDeepSeek ? "deepseek-chat" : "MiniMax-Text-01";
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 5;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const FILES = [
  "src/data/guide/accommodation.ts","src/data/guide/communication.ts","src/data/guide/departure.ts",
  "src/data/guide/dining.ts","src/data/guide/emergency.ts","src/data/guide/payment.ts",
  "src/data/guide/transport.ts","src/data/guide/visa.ts","src/data/cultural-warnings.ts",
  "src/data/price-transparency.ts","src/data/scam-prevention.ts",
  "src/data/guide/business/company-registration.ts","src/data/guide/business/etiquette.ts",
  "src/data/guide/business/expo-calendar.ts","src/data/guide/business/invitation-letter.ts",
  "src/data/guide/business/translation.ts"
];

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
  const prompt = `Translate the following Simplified-Chinese strings from a China travel guide into natural Japanese for Japanese tourists.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Natural, fluent Japanese. Keep short practical phrases concise.
- KEEP EXACTLY UNCHANGED: ¥ symbol, numbers, prices, times, phone numbers, app/brand names (WeChat, Alipay, Meituan, Didi, 12306), metro lines, airport codes.
- Convert Chinese proper nouns to Japanese kanji form (北京→北京, 朝阳区→朝陽区, 故宫→故宮). When a dish has a common Japanese name, use it (e.g. 烤鸭→北京ダック, 锅贴→焼き餃子).

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key count mismatch");
      const out = batch.map((text, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0) throw new Error("bad value " + i);
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

// extract Cn string values
const strings = new Set();
for (const f of FILES) {
  const s = fs.readFileSync(f, "utf8");
  const re = /(\w*Cn)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|\[)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[2] !== undefined) strings.add(m[2]);
    else {
      const rest = s.slice(m.index + m[0].length);
      const arrRe = /"((?:[^"\\]|\\.)*)"/g;
      let am;
      let inArr = true;
      while (inArr && (am = arrRe.exec(rest))) {
        strings.add(am[1]);
        const after = rest.slice(arrRe.lastIndex);
        const nextBracket = after.indexOf("]");
        const nextComma = after.indexOf(",");
        inArr = !(nextBracket !== -1 && (nextComma === -1 || nextBracket < nextComma));
      }
    }
  }
}
const unique = [...strings];
console.log("guide Cn unique strings:", unique.length);

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
const pending = unique.filter((t) => !cache[t]);
console.log("cache hits:", unique.length - pending.length, "| to translate:", pending.length);

for (let i = 0; i < pending.length; i += BATCH_SIZE) {
  const batch = pending.slice(i, i + BATCH_SIZE);
  try {
    const results = await translateBatch(batch);
    batch.forEach((t, j) => { cache[t] = results[j]; });
    if ((i / BATCH_SIZE + 1) % 10 === 0 || i + BATCH_SIZE >= pending.length) {
      writeJsonAtomic(CACHE_PATH, cache);
      console.log(`progress: ${i + batch.length}/${pending.length}`);
    }
  } catch (e) {
    console.error(`batch ${i} FAILED: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 120));
}
writeJsonAtomic(CACHE_PATH, cache);

// emit override dict file
const overrides = {};
for (const t of unique) if (cache[t] && cache[t] !== t) overrides[t] = cache[t];
const out = `// Auto-generated ja override dictionary for guide data Cn fields.
// Key: original Simplified-Chinese string → natural Japanese.
export const JA_GUIDE_OVERRIDES: Record<string, string> = ${JSON.stringify(overrides, null, 2)};
`;
fs.writeFileSync("src/data/guide/ja-overrides.ts", out);
console.log("wrote src/data/guide/ja-overrides.ts with", Object.keys(overrides).length, "entries");
