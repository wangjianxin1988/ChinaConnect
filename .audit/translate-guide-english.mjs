import fs from "node:fs";
const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 5;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const STRINGS_PATH = ".audit/guide-english-strings.json";
const OVERRIDES_PATH = "src/data/guide/ja-overrides.ts";

const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
const strings = JSON.parse(fs.readFileSync(STRINGS_PATH, "utf8"));
const toTranslate = strings.filter((t) => !cache[t]);
console.log("unique:", strings.length, "cached:", strings.length - toTranslate.length, "to translate:", toTranslate.length);

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 8000 };
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
  if (start === -1 || end === -1) throw new Error("No JSON object");
  return JSON.parse(cleaned.slice(start, end + 1));
}
async function translateBatch(batch) {
  const lines = batch.map((text, i) => `${i} = ${JSON.stringify(text)}`).join("\n");
  const prompt = `You are translating English strings from a China travel guide website into natural Japanese for Japanese tourists.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Translate into natural, natural-sounding Japanese. Keep short practical phrases concise.
- Keep EXACTLY: numbers, prices (¥/元/$), times, durations, hours, phone numbers, app/brand names (Alipay, WeChat Pay, Didi, Trip.com, 12306, WeChat, Meituan), metro line names, airport/city codes (PEK, PVG, CAN).
- Country names: translate to standard Japanese (United States -> アメリカ, United Kingdom -> イギリス, Australia -> オーストラリア, etc.).
- Visa terms: "Tourist (L)" -> "観光ビザ（L）"; "10 years multiple entry" -> "10年・数次入国"; "3-5 business days" -> "3〜5営業日".
- Hotel/attraction/restaurant names and Latin proper nouns (Sanlitun, Pudong, Canton Fair): keep as-is.
- If a string is already natural Japanese, return it unchanged.

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const parsed = extractJson(content);
      if (Object.keys(parsed).length !== batch.length) throw new Error(`Expected ${batch.length} keys, got ${Object.keys(parsed).length}`);
      return parsed;
    } catch (e) {
      if (attempt === RETRY_ATTEMPTS) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error("unreachable");
}

let translated = 0, saved = 0;
for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
  const batch = toTranslate.slice(i, i + BATCH_SIZE);
  const out = await translateBatch(batch);
  for (const [k, v] of Object.entries(out)) {
    const orig = batch[Number(k)];
    if (typeof v === "string" && v && v !== orig) { cache[orig] = v; translated++; }
  }
  saved += batch.length;
  if (saved % 200 < BATCH_SIZE) console.log("progress:", saved, "/", toTranslate.length);
}
fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
console.log("translated:", translated, "cached entries now:", Object.keys(cache).length);

// Merge into ja-overrides.ts
let ov = fs.readFileSync(OVERRIDES_PATH, "utf8").replace(/\r\n/g, "\n");
const existingKeys = new Set([...ov.matchAll(/"((?:[^"\\]|\\.)*)":/g)].map((m) => JSON.parse(`"${m[1]}"`)));
let added = 0;
const lines = [];
for (const s of strings) {
  const t = cache[s];
  if (!t || t === s) continue;
  if (existingKeys.has(s)) continue;
  lines.push(`  ${JSON.stringify(s)}: ${JSON.stringify(t)},`);
  existingKeys.add(s);
  added++;
}
if (added) {
  const idx = ov.lastIndexOf("};");
  ov = ov.slice(0, idx) + lines.join("\n") + "\n" + ov.slice(idx);
  const tmp = OVERRIDES_PATH + ".tmp";
  fs.writeFileSync(tmp, ov);
  fs.renameSync(tmp, OVERRIDES_PATH);
}
console.log("overrides added:", added);
