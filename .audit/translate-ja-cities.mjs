// .audit/translate-ja-cities.mjs — Phase B: batch translate remaining English in ja city JSONs
import fs from "node:fs";
import path from "node:path";

const DIR = "src/data/cities-i18n/ja";
const CACHE_PATH = ".audit/ja-translation-cache.json";
const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 5;

const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const ASCII_WORD = /[A-Za-z]{2,}/;
const SKIP_KEYS = new Set([
  "id", "slug", "icon", "phone", "lat", "lng", "coordinates", "rating", "reviewCount",
  "code", "image", "coverImage", "photos", "email", "url", "website", "star", "diamond",
  "method", "nameEn", "nameJa", "type", "category", "budget", "importance", "name",
  "avgPrice", "hours", "openingHours", "frequency", "bestMonths",
]);
const BRAND = /^(Alipay|WeChat Pay|WeChat|Didi|Mobike|Meituan|12306|Trip\.com|Canton Fair|Spa|WiFi|eSIM|SIM|Qinghai|Beijing|Shanghai|China|Waldorf|Hilton|Shangri-La|Marriott|Hyatt|Ritz|Four Seasons|InterContinental|Peninsula|St\. Regis|Mandarin|Sofitel|Sheraton|Pullman|Crowne Plaza|Wanda|Jinling|Westin|Fairmont|Pan Pacific|Club Med|Andaz|Conrad|Grand Millennium|Le Meridien|W |Banyan|Anantara|Raffles|Regent|Langham|Kempinski|Holiday Inn|Home Inn|7 Days|Atour|Hanting|Jinjiang|GreenTree|Vienna|Ramada|Howard Johnson|Wyndham|DoubleTree|Radisson|Novotel|Mercure|ibis|Somerset|Ascott|Oakwood|Citadines|Wyndham Grand|Swissotel|Emperor|Kerry|Nuwa|Alila|Aman|Bulgari|Wanda Realm|Temple House|Astor|Garden Hotel|Golden|Harbour|Grand|Royal|Plaza|City|Central|International|Jinmao|Peace|Dongfang|Oriental|Beijing|Shanghai|Guangzhou|Shenzhen|Chengdu|Hangzhou|Nanjing|Wuhan|Xian|Chongqing|Tianjin|Suzhou|Qingdao|Dalian|Xiamen|Sanya|Guilin|Kunming|Changsha|Harbin|Lhasa|Urumqi|Turpan|Kashgar|Dunhuang|Luoyang|Yantai|Weihai|Jinan|Ningbo|Fuzhou|Quanzhou|Zhuhai|Shantou|Zhengzhou|Hefei|Nanchang|Guiyang|Nanning|Haikou|Xining|Yinchuan|Hohhot|Changchun|Shenyang|Taiyuan|Shijiazhuang|Lanzhou|Chengde|Hulunbuir|Zhangjiajie|Dali|Lijiang|Shangri-La|Wuxi|Yangzhou|Nantong|Jiaxing|Shaoxing|Wenzhou|Taizhou|Jinhua|Huzhou|Quzhou|Zhoushan|Lishui)/i;

function isEnglish(s) {
  if (typeof s !== "string" || !s) return false;
  if (s.length < 2 || s.length > 500) return false;
  if (CJK.test(s)) return false;
  if (!ASCII_WORD.test(s)) return false;
  if (/^[\d\s.,:%()+\-–/°NSEW&·¥$€]+$/.test(s)) return false;
  if (s.includes("http") || s.includes("@") || s.includes(".com") || s.includes(".cn")) return false;
  if (/^(UTC|N\/A|TBD)$/i.test(s)) return false;
  if (BRAND.test(s)) return false;
  // pure numbers/codes
  if (/^[A-Za-z0-9_\-.]+$/.test(s) && !s.includes(" ")) {
    return /^[a-z][a-z-]{3,}$/.test(s) && !/^(night|per|min|max|day|week|month|year|line|stop|exit|gate|open|closed)$/.test(s.toLowerCase()) ? true : false;
  }
  return true;
}

const results = {};
let total = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const hits = [];
  (function walk(obj, keyPath) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, keyPath + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        if (SKIP_KEYS.has(k)) continue;
        walk(obj[k], keyPath ? keyPath + "." + k : k);
      }
      return;
    }
    if (isEnglish(obj)) hits.push({ path: keyPath, value: obj });
  })(data, "");
  if (hits.length) results[f] = hits;
  total += hits.length;
}
console.log("files with english:", Object.keys(results).length, "strings:", total);

// collect unique strings
const unique = new Map(); // text -> {count, files[]}
for (const [f, hits] of Object.entries(results)) {
  for (const h of hits) {
    if (!unique.has(h.value)) unique.set(h.value, { count: 0, files: new Set() });
    unique.get(h.value).count++;
    unique.get(h.value).files.add(f);
  }
}
const texts = [...unique.keys()];
console.log("unique strings:", texts.length);

// Use cache: filter out already-translated
const pending = texts.filter((t) => !cache[t] && !/^[A-Za-z]/.test(t) === false);
const toTranslate = texts.filter((t) => !cache[t]);
console.log("cached:", texts.length - toTranslate.length, "to translate:", toTranslate.length);

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
  const prompt = `You are translating leftover English strings from the Japanese version of a China travel website into natural Japanese.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Translate each string into natural, natural-sounding Japanese.
- Keep EXACTLY: numbers, prices (¥/元), times, hours, airport/city codes, brand names (Alipay, WeChat Pay, Didi, Trip.com, 12306), and Latin proper nouns that are place/business names (e.g. "Canton Fair", "Sanlitun", "Pudong").
- Hotel/attraction/restaurant names: keep the English name as-is (proper noun).
- Hotel addresses: translate into Japanese address format, e.g. "8 Xinyuanli, Chaoyang District" -> "朝陽区新源里8号". Preserve street names and numbers exactly.
- "China" -> "中国"; "UTC+8 (China Standard Time)" -> "UTC+8（中国標準時）"; "32 million" -> "約3200万人".
- "Line 1" -> "1号線"; "Tourist Bus 1" -> "観光バス1号線"; "Last Train" -> "終電"; "English Signs" -> "英語表記"; "Starting Fare" -> "初乗り運賃"; "Per km" -> "1kmあたり"; "Included" -> "料金込み"; "Near Forest Park" -> "森林公園付近".
- "High-risk" -> "高リスク"; "Low" -> "低い"; "Very High" -> "非常に高い".
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
  if (saved % 100 < BATCH_SIZE) console.log("progress:", saved, "/", toTranslate.length);
}
fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
console.log("translated:", translated, "cached entries now:", Object.keys(cache).length);
