import fs from "node:fs";
const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const LANG_NAME = { en: "English", ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German", ar: "Arabic", fa: "Persian" };
const KEYS = {
  badge_michelin: "Michelin",
  badge_blackpearl: "Black Pearl",
  badge_local: "Local Favorite",
  avg_per_person: "Avg",
  signature_dishes: "Signature Dishes",
  call_button: "Call",
  transport_bus_route: "Bus",
  transport_metro_label: "Metro",
  transport_bus_label: "Bus",
  transport_taxi_label: "Taxi",
  transport_bike_label: "Bike",
};

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 8000 };
  const response = await fetch(`${HOST}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content;
}
function extractJson(c) {
  const cleaned = c.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const st = cleaned.indexOf("{");
  const en = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(st, en + 1));
}
async function translateBatch(targetLang, items) {
  const lines = items.map(([k, v], i) => `${i} = ${JSON.stringify(v)}`).join("\n");
  const prompt = `Translate these short UI labels from a China travel website into ${LANG_NAME[targetLang]}. Output ONLY a flat JSON object with EXACTLY ${items.length} keys ("0", "1", ...). No markdown. Keep them short and natural (UI button/label style). "Black Pearl" is a restaurant rating name — keep as "Black Pearl" or transliterate if needed. "Metro" -> metro/subway. "Bike" -> bicycle.\n\n${lines}`;
  for (let a = 1; a <= 5; a++) {
    try {
      const content = await callChat(prompt);
      const parsed = extractJson(content);
      if (Object.keys(parsed).length !== items.length) throw new Error("count mismatch");
      return parsed;
    } catch (e) {
      if (a === 5) throw e;
      await new Promise((r) => setTimeout(r, 1500 * a));
    }
  }
  throw new Error("unreachable");
}

const results = {};
for (const lang of LANGS) {
  if (lang === "en") continue;
  const items = Object.entries(KEYS);
  const out = await translateBatch(lang, items);
  results[lang] = {};
  items.forEach(([k], i) => { results[lang][k] = out[String(i)]; });
  console.log(lang, "done");
}
fs.writeFileSync(".audit/comp-labels.json", JSON.stringify(results, null, 1));

// Insert into components-strings.ts
let s = fs.readFileSync("src/i18n/components-strings.ts", "utf8").replace(/\r\n/g, "\n");
const insertIdx = s.lastIndexOf("};");
let block = "";
for (const [k, enVal] of Object.entries(KEYS)) {
  block += `  ${k}: {\n`;
  for (const lang of LANGS) {
    const v = lang === "en" ? enVal : results[lang][k];
    block += `    ${lang === "zh-CN" || lang === "zh-TW" ? JSON.stringify(lang) : lang}: ${JSON.stringify(v)},\n`;
  }
  block += "  },\n";
}
s = s.slice(0, insertIdx) + block + s.slice(insertIdx);
const tmp = "src/i18n/components-strings.ts.tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, "src/i18n/components-strings.ts");
console.log("inserted", Object.keys(KEYS).length, "keys");
