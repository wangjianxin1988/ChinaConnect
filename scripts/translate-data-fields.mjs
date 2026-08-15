// Translate data-layer i18n fields
// node scripts/translate-data-fields.mjs --lang=ja --source-lang=en
// node scripts/translate-data-fields.mjs --lang=ko --source-lang=ja beijing shanghai
import fs from "fs";
import path from "path";
import { getMiniMaxConfig } from "./lib/minimax-config.mjs";
const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";
const TARGETS = { ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)", th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German", ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English" };
const PATTERNS = { ja: /[\u3040-\u30ff]/, ko: /[\uac00-\ud7af]/, th: /[\u0e00-\u0e7f]/, ru: /[\u0400-\u04ff]/, ar: /[\u0600-\u06ff]/, fa: /[\u0600-\u06ff]/, "zh-CN": /[\u4e00-\u9fff]/, "zh-TW": /[\u4e00-\u9fff]/, fr: /[àâçéèêëîïôùûüÿœæ]/i, de: /[äöüß]/i, vi: /[àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i };
function hasScript(s, lang) { return !!s && typeof s === "string" && (PATTERNS[lang]?.test(s) ?? false); }
function isAsciiOnly(s) { return !!s && typeof s === "string" && /^[\x00-\x7F]+$/.test(s); }
function isTranslated(s, lang) { if (!s || typeof s !== "string") return false; if (lang === "fr" || lang === "de" || lang === "vi") return hasScript(s, lang) || !isAsciiOnly(s); return hasScript(s, lang); }
function getTranslatableFields(city) {
  const fields = {};
  if (Array.isArray(city.payment)) city.payment.forEach((p, i) => {
    if (p && typeof p.description === "string") fields["payment."+i+".description"] = p.description;
    if (Array.isArray(p.howToUse)) p.howToUse.forEach((s, j) => { if (typeof s === "string") fields["payment."+i+".howToUse."+j] = s; });
    if (Array.isArray(p.tips)) p.tips.forEach((s, j) => { if (typeof s === "string") fields["payment."+i+".tips."+j] = s; });
  });
  if (city.transport && typeof city.transport === "object") ["arrival", "departure"].forEach(sec => {
    if (Array.isArray(city.transport[sec])) city.transport[sec].forEach((t, i) => {
      if (typeof t.from === "string") fields["transport."+sec+"."+i+".from"] = t.from;
      if (typeof t.to === "string") fields["transport."+sec+"."+i+".to"] = t.to;
      if (typeof t.duration === "string") fields["transport."+sec+"."+i+".duration"] = t.duration;
      if (typeof t.price === "string") fields["transport."+sec+"."+i+".price"] = t.price;
      if (typeof t.tips === "string") fields["transport."+sec+"."+i+".tips"] = t.tips;
    });
  });
  if (Array.isArray(city.hotels)) city.hotels.forEach((h, i) => {
    if (typeof h.description === "string") fields["hotels."+i+".description"] = h.description;
    if (typeof h.address === "string") fields["hotels."+i+".address"] = h.address;
  });
  if (Array.isArray(city.emergencyContacts)) city.emergencyContacts.forEach((e, i) => {
    if (typeof e.name === "string") fields["emergencyContacts."+i+".name"] = e.name;
    if (typeof e.description === "string") fields["emergencyContacts."+i+".description"] = e.description;
  });
  if (Array.isArray(city.attractions)) city.attractions.forEach((a, i) => {
    if (typeof a.description === "string") fields["attractions."+i+".description"] = a.description;
    if (typeof a.address === "string") fields["attractions."+i+".address"] = a.address;
    if (typeof a.openingHours === "string") fields["attractions."+i+".openingHours"] = a.openingHours;
    if (typeof a.tips === "string") fields["attractions."+i+".tips"] = a.tips;
    if (typeof a.recommendedVisitTime === "string") fields["attractions."+i+".recommendedVisitTime"] = a.recommendedVisitTime;
    if (Array.isArray(a.highlights)) a.highlights.forEach((s, j) => { if (typeof s === "string") fields["attractions."+i+".highlights."+j] = s; });
  });
  if (Array.isArray(city.restaurants)) city.restaurants.forEach((r, i) => {
    if (typeof r.description === "string") fields["restaurants."+i+".description"] = r.description;
    if (typeof r.address === "string") fields["restaurants."+i+".address"] = r.address;
    if (typeof r.cuisine === "string") fields["restaurants."+i+".cuisine"] = r.cuisine;
    if (Array.isArray(r.dishHighlights)) r.dishHighlights.forEach((s, j) => { if (typeof s === "string") fields["restaurants."+i+".dishHighlights."+j] = s; });
    if (Array.isArray(r.tags)) r.tags.forEach((s, j) => { if (typeof s === "string") fields["restaurants."+i+".tags."+j] = s; });
  });
  return fields;
}
function getValue(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) { const idx = parseInt(p, 10); cur = !isNaN(idx) ? cur?.[idx] : cur?.[p]; if (cur == null) return undefined; }
  return cur;
}
function applyTranslation(cityI18n, path, value) {
  const parts = path.split(".");
  let cur = cityI18n;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const idx = parseInt(p, 10);
    if (!isNaN(idx)) { if (!cur[idx]) cur[idx] = {}; cur = cur[idx]; }
    else { if (!cur[p]) cur[p] = {}; cur = cur[p]; }
  }
  const last = parts[parts.length - 1];
  const lastIdx = parseInt(last, 10);
  if (!isNaN(lastIdx) && Array.isArray(cur)) cur[lastIdx] = value;
  else cur[last] = value;
}
async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const res = await fetch(HOST + "/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 200));
  const j = await res.json();
  return j.choices?.[0]?.message?.content;
}
function extractJson(content) {
  let c = content.trim();
  c = c.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/, "");
  const start = c.indexOf("{"); const end = c.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON");
  return JSON.parse(c.slice(start, end + 1));
}
async function translateFields(fields, lang, sourceLang) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return {};
  const lines = keys.map(k => "- "+k+" = \""+String(fields[k]).replace(/"/g, '\\"').replace(/\n/g, " ")+"\"").join("\n");
  const srcLabel = TARGETS[sourceLang] || sourceLang;
  const tgtLabel = TARGETS[lang] || lang;
  const prompt = "Translate the following "+srcLabel+" strings into "+tgtLabel+" for ChinaConnect (chinaengage.org), a Chinese travel website.\nRules:\n- Output ONLY a single JSON object with EXACTLY these "+keys.length+" keys.\n- No markdown, no commentary, no extra keys.\n- Translate EVERY value into "+tgtLabel+".\n- Keep proper nouns, numbers, prices, times, phone numbers unchanged.\n- Use the local convention for place names and addresses.\n\n"+lines+"\n";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callChat(prompt);
      const obj = extractJson(content);
      const result = {};
      for (const k of keys) { if (isTranslated(obj[k], lang)) result[k] = obj[k]; }
      if (Object.keys(result).length > 0) return result;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1500));
  }
  return {};
}
async function run() {
  const args = process.argv.slice(2);
  const lang = args.find(a => a.startsWith("--lang="))?.split("=")[1];
  const sourceLang = args.find(a => a.startsWith("--source-lang="))?.split("=")[1] || "en";
  if (!lang) { console.error("--lang required"); process.exit(1); }
  const specific = args.filter(a => !a.startsWith("--"));
  const citiesDir = "src/data/cities";
  const outDir = "src/data/cities-i18n";
  const langDir = path.join(outDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
  let srcDir;
  if (sourceLang === "en") srcDir = citiesDir; else srcDir = path.join(outDir, sourceLang);
  let files = fs.readdirSync(srcDir).filter(f => f.endsWith(".json"));
  if (specific.length > 0) files = files.filter(f => specific.includes(f.replace(".json", "")));
  console.log("Translating "+files.length+" cities to "+lang+" (source: "+sourceLang+")");
  let totalTranslated = 0, citiesDone = 0;
  for (const f of files) {
    const slug = f.replace(".json", "");
    const srcPath = path.join(srcDir, f);
    const outPath = path.join(langDir, slug + ".json");
    let srcData; try { srcData = JSON.parse(fs.readFileSync(srcPath, "utf8")); } catch (e) { continue; }
    let i18nData;
    if (fs.existsSync(outPath)) try { i18nData = JSON.parse(fs.readFileSync(outPath, "utf8")); } catch (e) { i18nData = JSON.parse(JSON.stringify(srcData)); }
    else i18nData = JSON.parse(JSON.stringify(srcData));
    const allFields = getTranslatableFields(srcData);
    const untranslated = {};
    for (const [k, v] of Object.entries(allFields)) {
      const current = getValue(i18nData, k);
      if (current == null || !isTranslated(current, lang)) untranslated[k] = v;
    }
    if (Object.keys(untranslated).length === 0) { process.stdout.write("."); citiesDone++; continue; }
    console.log("\n["+slug+"] "+Object.keys(untranslated).length+" fields to translate");
    const BATCH = 20;
    const entries = Object.entries(untranslated);
    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = Object.fromEntries(entries.slice(i, i + BATCH));
      const result = await translateFields(batch, lang, sourceLang);
      for (const [k, v] of Object.entries(result)) { applyTranslation(i18nData, k, v); totalTranslated++; }
      await new Promise(r => setTimeout(r, 800));
    }
    fs.writeFileSync(outPath, JSON.stringify(i18nData, null, 2), "utf8");
    citiesDone++;
  }
  console.log("\nDone: "+citiesDone+"/"+files.length+" cities, "+totalTranslated+" fields translated to "+lang);
}
run().catch(e => { console.error(e); process.exit(1); });
