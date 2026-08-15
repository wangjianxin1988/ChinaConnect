import fs from "node:fs";
const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const PATH = "src/i18n/translations.ts";

const DESCS = {
  registrationDescription: "Step-by-step guide to registering a WFOE, Representative Office, or other business entity in China as a foreign investor. Complete timeline and document checklist.",
  etiquetteDescription: "Master Chinese business etiquette including business card exchange, dining, meetings, and gift giving. Practical do's and don'ts for foreign business professionals.",
  expoDescription: "Complete calendar of major trade fairs and exhibitions in China including the Canton Fair, auto shows, and industry events. Plan your business trip around key events.",
  invitationDescription: "Ready-to-use invitation letter templates for China visa applications and business visits. Fill in the fields and download instantly.",
  translationDescription: "Book vetted interpreters and translators for meetings, conferences, and negotiations in China.",
};

const TARGET_LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const LANGS_NAME = { ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German", ar: "Arabic", fa: "Persian" };

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.15, max_tokens: 8000 };
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
  return JSON.parse(cleaned.slice(start, end + 1));
}
async function translateBatch(lang, items) {
  const lines = items.map(([k, v], i) => `${i} = ${JSON.stringify(v)}`).join("\n");
  const prompt = `Translate these English meta descriptions for a China business travel website into ${LANGS_NAME[lang]}. Output ONLY a flat JSON object with EXACTLY ${items.length} keys ("0", "1", ...). No markdown. Natural, fluent ${LANGS_NAME[lang]}. Keep proper nouns like WFOE, Canton Fair, China, and app names. Keep "ChinaConnect" out (not present).\n\n${lines}`;
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

// collect translations
const byLang = {};
for (const lang of TARGET_LANGS) {
  const entries = Object.entries(DESCS);
  const out = await translateBatch(lang, entries);
  byLang[lang] = {};
  entries.forEach(([k], i) => { byLang[lang][k] = out[String(i)]; });
  console.log(lang, "done");
}

// insert into translations.ts
let s = fs.readFileSync(PATH, "utf8").replace(/\r\n/g, "\n");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
let m; const blocks = [];
while ((m = langRe.exec(s))) blocks.push({ name: m[1].replace(/"/g, ""), start: m.index });
const allLangs = ["en", "ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
let inserted = 0;
// process in reverse to keep indices valid
for (const lang of allLangs.slice().reverse()) {
  const block = blocks.find((b) => b.name === lang);
  if (!block) { console.log("no block", lang); continue; }
  const rest = s.slice(block.start);
  const close = rest.search(/\n  \},/m);
  const body = rest.slice(0, close);
  const cb = body.indexOf("businessGuidePage: {");
  if (cb < 0) { console.log("no bgp", lang); continue; }
  const sub = body.slice(cb);
  const subClose = sub.indexOf("\n    },");
  const insertAt = block.start + cb + subClose;
  let entries;
  if (lang === "en") entries = DESCS;
  else entries = byLang[lang] || {};
  const lines = Object.entries(entries).map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`).join("\n") + "\n";
  s = s.slice(0, insertAt) + lines + s.slice(insertAt);
  inserted++;
}
const tmp = PATH + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, PATH);
console.log("blocks patched:", inserted);
fs.writeFileSync(".audit/bgp-descs.json", JSON.stringify({ en: DESCS, ...byLang }, null, 1));
