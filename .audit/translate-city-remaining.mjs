// Batch translate remaining ja city strings (English + Simplified Chinese) via DeepSeek
import fs from "node:fs";

const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const BATCH_SIZE = 20;
const RETRY_ATTEMPTS = 5;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const LOC_PATH = ".audit/ja-city-translate-locations.json";

const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
const locations = JSON.parse(fs.readFileSync(LOC_PATH, "utf8"));
const unique = Object.keys(locations);
const toTranslate = unique.filter((t) => !cache[t]);
console.log("unique:", unique.length, "cached:", unique.length - toTranslate.length, "to translate:", toTranslate.length);

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 8000 };
  const response = await fetch(`${HOST}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content;
}
function extractJson(content) {
  const cleaned = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1));
}
async function translateBatch(batch) {
  const lines = batch.map((text, i) => `${i} = ${JSON.stringify(text)}`).join("\n");
  const prompt = `You are localizing strings for a Japanese-language China travel website (ja version). Strings are EITHER English (travel tips, hotel highlights, transport notes, payment instructions, consulate addresses) OR Simplified Chinese (mixed with some Japanese text).

Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Target: natural, concise Japanese for Japanese tourists.
- English strings: translate fully to Japanese. Keep brand/proper nouns as-is where appropriate (WeChat, Alipay, Visa, Mastercard, UnionPay, Didi, Metro, Bell Tower, Forbidden City, etc.).
- City/station/airport names: "Shanghai (4.5h), Xian (4.5h)" -> "上海（4.5時間）、西安（4.5時間）"; "Wuhan Tianhe International Airport (WUH)" -> "武漢天河国際空港（WUH）".
- "Central location" -> "中心部に好立地"; "WeChat app required" -> "WeChatアプリが必要"; "International cards accepted" -> "国際カード対応"; "Citywide coverage" -> "市内全域".
- Consulate entries: "Guangzhou (closest US consulate)" -> "広州（最寄りの米国領事館）"; "Citywide coverage" -> "市内全域".
- Simplified Chinese within Japanese text: convert to Japanese kanji forms (丽江->麗江, 三亚->三亜, 山顶->山頂, 大鹏->大鵬, 刘公島->劉公島, 滨海->浜海, 营->キャンプ, 各处->各所). Keep the existing Japanese text, only fix the kanji.
- If a string is already natural Japanese, return it unchanged.
- Keep numbers, units (¥, 元, km, %, minutes -> 分), and time formats intact.
- For strings like "Westin brand quality. Book direct for best rates." -> "ウェスティン品質。直接予約でお得な特典。"

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const parsed = extractJson(content);
      if (Object.keys(parsed).length !== batch.length) throw new Error(`Expected ${batch.length}, got ${Object.keys(parsed).length}`);
      return parsed;
    } catch (e) {
      if (attempt === RETRY_ATTEMPTS) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error("unreachable");
}

let translated = 0;
for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
  const batch = toTranslate.slice(i, i + BATCH_SIZE);
  const out = await translateBatch(batch);
  for (const [k, v] of Object.entries(out)) {
    const orig = batch[Number(k)];
    if (typeof v === "string" && v && v !== orig) { cache[orig] = v; translated++; }
  }
  console.log("progress:", Math.min(i + BATCH_SIZE, toTranslate.length), "/", toTranslate.length);
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
}
console.log("translated:", translated);
