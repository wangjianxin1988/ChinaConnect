// Translate content-en.json to per-language files. Resumable.
import fs from "fs";

const KEY = "REDACTED_MINIMAX_KEY";
const HOST = "https://api.minimax.io";
const MODEL = "MiniMax-Text-01";
const PARALLEL = 4;
const BATCH = 5; // smaller batch = better distinctness
const SOURCE = "content-en.json";

const en = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const allKeys = Object.keys(en).sort();
console.log("source keys:", allKeys.length);

const TARGETS = {
  ja: "Japanese (Japan visitors). Polite tourism style. Use standard Japanese translations for proper nouns (e.g., Forbidden City = \u6545\u5bab, Beijing = \u5317\u4eac). Keep brand names and transliterate place names.",
  ko: "Korean (Korea visitors). Polite tourism style. Use standard Korean translations for proper nouns.",
  "zh-CN": "Simplified Chinese (Mainland China users). Concise, tourism-style. Use Simplified Chinese characters only. Use standard Chinese place names.",
  "zh-TW": "Traditional Chinese (Taiwan). Polite tourism style. Use Traditional Chinese characters (Taiwan standard). Use Taiwan place name conventions.",
  th: "Thai (Thailand visitors). Polite Thai for tourism. Transliterate proper nouns naturally.",
  vi: "Vietnamese (Vietnam visitors). Friendly, clear Vietnamese. Transliterate proper nouns.",
  ru: "Russian (Russian-speaking visitors). Modern Russian for tourism. Transliterate proper nouns.",
  fr: "French (France/Canada). Standard French for tourism. Transliterate proper nouns.",
  de: "German. Modern German tourism style. Transliterate proper nouns.",
  ar: "Modern Standard Arabic (MSA), formal, RTL. Transliterate proper nouns.",
  fa: "Modern Persian (Farsi), formal, RTL. Transliterate proper nouns."
};

function escape(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }

function buildPrompt(lang, batch) {
  const lines = batch.map(k => `${k} = "${escape(en[k])}"`).join("\n");
  return `You are a professional translator for a Chinese travel/AI tourism website (ChinaConnect, chinaengage.org).
Translate these ${batch.length} travel-content strings into ${TARGETS[lang]}
Content includes city descriptions, attraction info (names, descriptions, addresses, opening hours, ticket prices, tips), restaurant info (names, cuisine, descriptions, hours, dish highlights), and emergency contact details.
Rules:
- Translate naturally for tourists/visitors.
- Each key is unique. Translate each DISTINCTLY based on its specific meaning. Do not give the same translation to different keys.
- Keep proper nouns, brand names, place names, restaurant names, attraction names accurate.
- Keep ALL CAPS / acronyms (AI, FAQ, Wi-Fi, URL) unchanged.
- Keep numbers, dates, currency symbols (¥, $, €) and units unchanged.
- For addresses: keep street names in original language but use target-language format.
- For opening hours: keep HH:MM-HH:MM format.
- For currency prices: keep symbol and number, but translate "peak"/"off-peak" etc.
- For dish names: keep original language if no standard translation, add explanation in parentheses.
- Output ONLY a single JSON object with EXACTLY these ${batch.length} keys.
- No markdown, no commentary, no extra keys, no trailing commas.
${lines}
`;
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 4000 };
  const res = await fetch(HOST + "/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 200));
  const j = await res.json();
  return j.choices[0].message.content;
}

function extractJson(content) {
  let c = content.trim();
  if (c.startsWith("```")) c = c.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");
  const start = c.indexOf("{"); const end = c.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON: " + c.slice(0, 200));
  c = c.slice(start, end + 1);
  return JSON.parse(c);
}

async function translateLang(lang) {
  console.log("[" + lang + "] starting");
  const outFile = "content-" + lang + ".json";
  let out = {};
  if (fs.existsSync(outFile)) {
    try {
      const stat = fs.statSync(outFile);
      if (stat.size > 10) {
        out = JSON.parse(fs.readFileSync(outFile, "utf8"));
        console.log("[" + lang + "] loaded existing " + Object.keys(out).length + " keys from " + stat.size + " bytes");
      } else {
        console.warn("[" + lang + "] file too small (" + stat.size + " bytes), starting fresh");
      }
    } catch(e) { console.warn("[" + lang + "] parse error: " + e.message); }
  }
  const todo = allKeys.filter(k => !(k in out));
  console.log("[" + lang + "] existing: " + Object.keys(out).length + ", todo: " + todo.length);
  if (todo.length === 0) return out;

  const batches = [];
  for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));

  const startT = Date.now();
  let done = 0;
  for (let bi = 0; bi < batches.length; bi += PARALLEL) {
    const slice = batches.slice(bi, bi + PARALLEL);
    const results = await Promise.all(slice.map(function(b) {
      return (async function() {
        try {
          const content = await callChat(buildPrompt(lang, b));
          const obj = extractJson(content);
          return obj;
        } catch (e) {
          return {};
        }
      })();
    }));
    for (let s = 0; s < results.length; s++) {
      const batch = slice[s];
      const obj = results[s];
      let got = 0;
      for (const k of batch) if (obj[k] && typeof obj[k] === 'string' && obj[k].length > 0) { out[k] = obj[k]; got++; }
      if (!got && obj && Object.keys(obj).length === 0) {
        for (const k of batch) if (!(k in out)) out[k] = en[k];
      }
    }
    done += slice.length;
    const elapsed = (Date.now() - startT) / 1000;
    const total = Object.keys(out).length;
    process.stdout.write("[" + lang + " " + done + "/" + batches.length + "] total=" + total + " elapsed=" + elapsed.toFixed(0) + "s\n");
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log("[" + lang + "] FINAL " + Object.keys(out).length + " keys");
  return out;
}

const ALL_NON_EN = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const args = process.argv.slice(2);
let targets;
if (args.length === 0) targets = ["ja", "zh-CN"];
else if (args[0] === "all") targets = ALL_NON_EN;
else targets = args;

for (const t of targets) await translateLang(t);
console.log("ALL DONE");