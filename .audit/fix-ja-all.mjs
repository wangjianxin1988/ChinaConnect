// fix-ja-all.mjs — translate remaining Chinese + display-English residue in cities-i18n/ja/*.json to Japanese.
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

// keys that are internal identifiers / en-name fields / non-display
const INTERNAL_KEYS = new Set([
  "id", "slug", "icon", "type", "category", "method", "country", "timezone",
  "nameEn", "nameJa", "nameCn", "phone", "lat", "lng", "coordinates", "website",
  "url", "email", "image", "coverImage", "photos", "star", "diamond", "rating",
  "reviewCount", "price", "commission", "affiliateLink", "androidUrl", "appStoreUrl",
  "iosScheme", "androidScheme", "androidPackage", "iosAppId", "hasEnglish", "isEssential",
  "shortCode", "mapUrl", "direction", "imageUrl", "logo", "iconUrl", "englishName",
]);

const BRAND_RE = /^(WeChat|Alipay|Didi|Mobike|Hello|Meituan|12306|Uber|Google|Apple|China Unicom|China Telecom|China Mobile|Metro|Airport Express|QR code|WiFi|SIM|eSIM|GPS|LTE|4G|5G|NFC|ID|PEK|PKX|SHA|PVG|CAN|CTU|HGH|KWL|SZX|XIY|CKG|DLC|TAO|TNA|WUH|XMN|SIA|NGB|FOC|KHN|CGO|TSN|CSX|URC|HET|YNT|WEH|NNH|LHW|XNN|LJG|DLU|ZY|AKL)/i;
const KEEP_EN = /^(Cultural|Natural|Nature|Landmark|Historical|Modern|Museum|Temple|Park|Street|Shopping|Food|Culture|Luxury|Budget|Mid-range|Economy|Standard|Business|Family|Suite|Deluxe|Embassy|Hospital|Police|Fire|Ambulance|Train|Cash|Alipay|WeChat Pay|Didi|Restaurant|Hotel|Airport|Central|Value|Free|Clean|Good|Budget-friendly|Modern|River|Sea|Mountain|Lake|Tower|Beach|Island|Garden|Bridge|Old|New|Small|Large|Local|International|English|Chinese|Japanese|Korean|Thai|Vietnamese|Russian|French|German|Arabic|Persian|Mon-Sun|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Open|Closed|Yes|No|All|None|Main|North|South|East|West|Central|Downtown|Suburb|Exit|Entrance|Floor|Level|Room|Night|Day|Week|Month|Year|Min|Max|Per|From|To|Line|Stop|Station|Terminal|Gate|Platform|Seat|Ticket|Pass|Card|App|Online|Offline|Required|Optional|Included|Extra|Only|Plus|Prime|VIP|First|Last|Next|Previous|Total|Average|Standard|Fast|Slow|High|Low|Top|Best|Most|Least|More|Less|Near|Far|About|Around|Over|Under|Between|During|Before|After|Early|Late|All-day|24-hour|24h|Nightly|Daily|Weekly|Monthly|One-way|Round-trip|Non-stop|Direct|Indirect|Express|Local|Regional|National|International)/;

function isEnglishDisplay(text, key) {
  if (INTERNAL_KEYS.has(key)) return false;
  const t = text.trim();
  if (t.length < 4 || t.length > 400) return false;
  if (!/^[A-Za-z][A-Za-z0-9\s,.'’()\-/:%&$+#°*]*$/.test(t)) return false;
  if (/^[\d\s.,%$¥€£+-]+$/.test(t)) return false;
  if (t.includes("http") || t.includes("@") || t.includes(".com") || t.includes(".cn") || t.includes(".net") || t.includes(".org")) return false;
  if (/^[A-Za-z0-9-]+$/.test(t) && !t.includes(" ")) {
    // single token: only translate if it's clearly a display word, not a code
    if (/^[a-z]/.test(t) && t.length > 3 && !/^(cultural|natural|nature|landmark|historical|modern|museum|temple|park|street|shopping|food|culture|luxury|budget|mid-range|economy|standard|business|family|suite|deluxe|embassy|hospital|police|fire|ambulance|train|cash|dining|weather|rental|route|line|station|terminal|gate|ticket|pass|card|app|english|chinese|japanese|local|international|main|north|south|east|west|central|suburb|floor|level|room|night|day|week|month|year|min|max|per|from|to|stop|exit|entrance|required|optional|included|extra|only|plus|first|last|next|total|average|fast|slow|high|low|top|best|most|least|more|less|near|far|about|around|over|under|between|during|before|after|early|late|daily|weekly|monthly|nightly|one-way|round-trip|non-stop|direct|indirect|express|regional|national)$/.test(t)) return false;
    return true;
  }
  if (BRAND_RE.test(t)) return false;
  if (KEEP_EN.test(t)) return false;
  return true;
}

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
  const prompt = `The following strings are from the Japanese version of a China travel website. They contain leftover Simplified-Chinese characters or untranslated English text. Convert each into natural Japanese.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- For Chinese: replace simplified chars with proper Japanese kanji/kana (传统→伝統, 锅→鍋, 鸡→鶏, 面→麺, 药→薬, 阳→陽, 东→東).
- For English: translate into natural Japanese (e.g. "Central location"→"中心部に位置", "Free WiFi"→"Wi-Fi無料", "Budget-friendly"→"リーズナブルな価格", "Most widely accepted mobile payment in China"→"中国で最も普及しているモバイル決済").
- Restaurant/store names: Japanese-readable form with Japanese kanji for proper nouns.
- KEEP EXACTLY UNCHANGED: ¥ symbol, numbers, prices, times, phone numbers, metro/line numbers, airport codes (PEK/PKX), brand/app names (WeChat, Alipay, Didi, Meituan, Mobike, Hello, 12306), English words that are proper nouns or brand names, Latin script.
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
  const walk = (o, p, key) => {
    if (typeof o === "string") {
      if (isDirty(o) || isEnglishDisplay(o, key)) locations.push({ file: f, path: p, text: o });
    } else if (Array.isArray(o)) {
      o.forEach((v, i) => walk(v, p + "[" + i + "]", key));
    } else if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) walk(v, p ? p + "." + k : k, k);
    }
  };
  walk(data, "", "");
}
const unique = [...new Set(locations.map((l) => l.text))];
console.log(`locations: ${locations.length} | unique: ${unique.length}`);

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
const pending = unique.filter((t) => !cache[t] || cache[t] === t || isDirty(cache[t]));
console.log("to translate:", pending.length);

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
