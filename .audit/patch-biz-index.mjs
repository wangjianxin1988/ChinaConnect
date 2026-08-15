import fs from "node:fs";
const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";

const JA_TEXTS = {
  invitationTitle: "Invitation Letter Templates",
  invitationDesc: "Download ready-to-use bilingual invitation letters for visa applications. Editable formats covering trade delegations, conference attendance, and partner visits.",
  expoTitle: "Expo & Event Calendar",
  expoDesc: "Plan your trips around China's top trade shows and industry events. Canton Fair, CIIE, design weeks, and hundreds of regional expos with dates and venues.",
  regTitle: "Company Registration Guide",
  regDesc: "Step-by-step guide to setting up a WFOE, JV, or representative office in China. Documents, timelines, costs, and the latest 2026 regulatory updates.",
  etiTitle: "Business Etiquette Essentials",
  etiDesc: "Master Chinese business culture, dining etiquette, gift-giving customs, and meeting protocols. Avoid common mistakes and build lasting guanxi.",
  transTitle: "Translation & Interpreting",
  transDesc: "Book professional interpreters and translators for your business visits in China. Consecutive and simultaneous interpreting, certified document translation.",
  open: "Open",
  intro: "Bilingual business tools that pair with the rest of the China Travel Guide. Every link here is also reachable from /guide → Business Tools.",
};
const LANG_SHORT = { en: "Business Express", ja: "ビジネスエクスプレス", ko: "비즈니스 익스프레스", "zh-CN": "商务快线", "zh-TW": "商務快線", th: "บิสซิเนส เอ็กซ์เพรส", vi: "Business Express", ru: "Бизнес Экспресс", fr: "Business Express", de: "Business Express", ar: "بيزنس إكسبريس", fa: "بیزینس اکسپرس" };

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
async function translateJa(items) {
  const lines = items.map(([k, v], i) => `${i} = ${JSON.stringify(v)}`).join("\n");
  const prompt = `Translate these English strings from a China business travel website into natural Japanese for Japanese business travelers. Output ONLY a flat JSON object with EXACTLY ${items.length} keys ("0", "1", ...). No markdown. Keep proper nouns (WFOE, JV, Canton Fair, CIIE, guanxi) and English brand terms where natural. Keep "Business Express" as-is where it is a brand. Natural, concise Japanese.\n\n${lines}`;
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

const entries = Object.entries(JA_TEXTS);
const out = await translateJa(entries);
const jaMap = {};
entries.forEach(([k], i) => { jaMap[k] = out[String(i)]; });
console.log("ja translations:", JSON.stringify(jaMap, null, 1));

// Insert indexShort into all 12 language blocks
let s = fs.readFileSync("src/i18n/translations.ts", "utf8").replace(/\r\n/g, "\n");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
const blocks = [];
let m;
while ((m = langRe.exec(s))) blocks.push({ name: m[1].replace(/"/g, ""), start: m.index });
let inserted = 0;
for (const lang of ["en", "ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"].slice().reverse()) {
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
  const value = LANG_SHORT[lang] || "Business Express";
  s = s.slice(0, insertAt) + `      indexShort: ${JSON.stringify(value)},\n` + s.slice(insertAt);
  inserted++;
}
const tmp = "src/i18n/translations.ts.tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, "src/i18n/translations.ts");
console.log("indexShort inserted into", inserted, "blocks");

// Patch business index page
const p = "src/pages/[lang]/guide/business/index.astro";
let page = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
page = page.replace('title={translations.en.businessGuidePage?.indexTitle', 'title={(translations[lang] || translations.en).businessGuidePage?.indexTitle');
page = page.replace('description={translations.en.businessGuidePage?.indexDescription', 'description={(translations[lang] || translations.en).businessGuidePage?.indexDescription');
page = page.replace('data-i18n="businessGuidePage.backToGuide">\n            Business Express', 'data-i18n="businessGuidePage.indexShort">\n            Business Express');
// add titleJa/descriptionJa to tools
page = page.replace('title: "Invitation Letter Templates",', 'title: "Invitation Letter Templates",\n    titleJa: ' + JSON.stringify(jaMap.invitationTitle) + ',');
page = page.replace('description:\n      "Download ready-to-use bilingual invitation letters for visa applications. Editable formats covering trade delegations, conference attendance, and partner visits.",', 'description:\n      "Download ready-to-use bilingual invitation letters for visa applications. Editable formats covering trade delegations, conference attendance, and partner visits.",\n    descriptionJa: ' + JSON.stringify(jaMap.invitationDesc) + ',');
page = page.replace('title: "Expo & Event Calendar",', 'title: "Expo & Event Calendar",\n    titleJa: ' + JSON.stringify(jaMap.expoTitle) + ',');
page = page.replace('"Plan your trips around China\'s top trade shows and industry events. Canton Fair, CIIE, design weeks, and hundreds of regional expos with dates and venues.",', '"Plan your trips around China\'s top trade shows and industry events. Canton Fair, CIIE, design weeks, and hundreds of regional expos with dates and venues.",\n    descriptionJa: ' + JSON.stringify(jaMap.expoDesc) + ',');
page = page.replace('title: "Company Registration Guide",', 'title: "Company Registration Guide",\n    titleJa: ' + JSON.stringify(jaMap.regTitle) + ',');
page = page.replace('"Step-by-step guide to setting up a WFOE, JV, or representative office in China. Documents, timelines, costs, and the latest 2026 regulatory updates.",', '"Step-by-step guide to setting up a WFOE, JV, or representative office in China. Documents, timelines, costs, and the latest 2026 regulatory updates.",\n    descriptionJa: ' + JSON.stringify(jaMap.regDesc) + ',');
page = page.replace('title: "Business Etiquette Essentials",', 'title: "Business Etiquette Essentials",\n    titleJa: ' + JSON.stringify(jaMap.etiTitle) + ',');
page = page.replace('"Master Chinese business culture, dining etiquette, gift-giving customs, and meeting protocols. Avoid common mistakes and build lasting guanxi.",', '"Master Chinese business culture, dining etiquette, gift-giving customs, and meeting protocols. Avoid common mistakes and build lasting guanxi.",\n    descriptionJa: ' + JSON.stringify(jaMap.etiDesc) + ',');
page = page.replace('title: "Translation & Interpreting",', 'title: "Translation & Interpreting",\n    titleJa: ' + JSON.stringify(jaMap.transTitle) + ',');
page = page.replace('"Book professional interpreters and translators for your business visits in China. Consecutive and simultaneous interpreting, certified document translation.",', '"Book professional interpreters and translators for your business visits in China. Consecutive and simultaneous interpreting, certified document translation.",\n    descriptionJa: ' + JSON.stringify(jaMap.transDesc) + ',');
// Open label
page = page.replace('<span class="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">\n              Open', '<span class="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">\n              {lang === "ja" ? ' + JSON.stringify(jaMap.open) + ' : lang === "zh-CN" || lang === "zh-TW" ? "打开" : "Open"}');
// intro paragraph
page = page.replace(/<p class="text-muted-foreground max-w-2xl">\s*Bilingual business tools[\s\S]*?<\/a\s*>\.\s*<\/p>/, '<p class="text-muted-foreground max-w-2xl">{lang === "ja" ? ' + JSON.stringify(jaMap.intro) + ' : <>Bilingual business tools that pair with the rest of the China Travel Guide. Every link here is also reachable from <a href={`/${lang}/guide#business-tools`} class="text-primary hover:underline font-medium">/guide → Business Tools</a>.</>}</p>');
const tmp2 = p + ".tmp";
fs.writeFileSync(tmp2, page);
fs.renameSync(tmp2, p);
console.log("patched business index");
fs.writeFileSync(".audit/biz-index-ja.json", JSON.stringify(jaMap, null, 1));
