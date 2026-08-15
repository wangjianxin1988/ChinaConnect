// Priority translator: payment, transport, attractions.description+tips, restaurants.description
// Usage: node scripts/translate-priority.mjs --lang=<code> --source-lang=en [cities...]
import fs from "fs"; import path from "path";
import { getMiniMaxConfig } from "./lib/minimax-config.mjs";
const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";
const T = { ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)", th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German", ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English" };
const P = { ja: /[\u3040-\u30ff]/, ko: /[\uac00-\ud7af]/, th: /[\u0e00-\u0e7f]/, ru: /[\u0400-\u04ff]/, ar: /[\u0600-\u06ff]/, fa: /[\u0600-\u06ff]/, "zh-CN": /[\u4e00-\u9fff]/, "zh-TW": /[\u4e00-\u9fff]/, fr: /[àâçéèêëîïôùûüÿœæ]/i, de: /[äöüß]/i, vi: /[àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i };
function hasScript(s, l) { return !!s && typeof s === "string" && (P[l]?.test(s) ?? false); }
function isAscii(s) { return !!s && typeof s === "string" && /^[\x00-\x7F]+$/.test(s); }
function isT(s, l) { if (!s || typeof s !== "string") return false; if (l === "fr" || l === "de" || l === "vi") return hasScript(s, l) || !isAscii(s); return hasScript(s, l); }
function getFields(c) { const f = {};
  if (Array.isArray(c.payment)) c.payment.forEach((p, i) => { if (p && typeof p.description === "string") f["payment."+i+".description"] = p.description; if (Array.isArray(p.howToUse)) p.howToUse.forEach((s, j) => { if (typeof s === "string") f["payment."+i+".howToUse."+j] = s; }); if (Array.isArray(p.tips)) p.tips.forEach((s, j) => { if (typeof s === "string") f["payment."+i+".tips."+j] = s; }); });
  if (c.transport && typeof c.transport === "object") ["arrival","departure"].forEach(sec => { if (Array.isArray(c.transport[sec])) c.transport[sec].forEach((t, i) => { if (typeof t.from === "string") f["transport."+sec+"."+i+".from"] = t.from; if (typeof t.to === "string") f["transport."+sec+"."+i+".to"] = t.to; if (typeof t.duration === "string") f["transport."+sec+"."+i+".duration"] = t.duration; if (typeof t.price === "string") f["transport."+sec+"."+i+".price"] = t.price; if (typeof t.tips === "string") f["transport."+sec+"."+i+".tips"] = t.tips; }); });
  if (Array.isArray(c.attractions)) c.attractions.forEach((a, i) => { if (typeof a.description === "string") f["attractions."+i+".description"] = a.description; });
  if (Array.isArray(c.restaurants)) c.restaurants.forEach((r, i) => { if (typeof r.description === "string") f["restaurants."+i+".description"] = r.description; });
  return f; }
function gv(o, p) { const parts = p.split("."); let c = o; for (const x of parts) { const i = parseInt(x, 10); c = !isNaN(i) ? c?.[i] : c?.[x]; if (c == null) return undefined; } return c; }
function ap(o, p, v) { const parts = p.split("."); let c = o; for (let i = 0; i < parts.length - 1; i++) { const x = parts[i]; const idx = parseInt(x, 10); if (!isNaN(idx)) { if (!c[idx]) c[idx] = {}; c = c[idx]; } else { if (!c[x]) c[x] = {}; c = c[x]; } } const last = parts[parts.length - 1]; const li = parseInt(last, 10); if (!isNaN(li) && Array.isArray(c)) c[li] = v; else c[last] = v; }
async function cc(p) { const body = { model: MODEL, messages: [{ role: "user", content: p }], temperature: 0.2, max_tokens: 6000 }; const r = await fetch(HOST + "/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!r.ok) throw new Error("HTTP "+r.status); const j = await r.json(); return j.choices?.[0]?.message?.content; }
function ex(c) { c = c.trim().replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/, ""); const s = c.indexOf("{"), e = c.lastIndexOf("}"); if (s < 0 || e < 0) throw new Error("No JSON"); return JSON.parse(c.slice(s, e+1)); }
async function tr(fields, lang, srcLang) {
  const keys = Object.keys(fields); if (!keys.length) return {};
  const lines = keys.map(k => "- "+k+" = \""+String(fields[k]).slice(0,300).replace(/"/g, '\\"').replace(/\n/g, " ")+"\"").join("\n");
  const tgt = T[lang] || lang; const src = T[srcLang] || srcLang;
  const prompt = "Translate these "+src+" strings into "+tgt+" for ChinaConnect. Output ONLY a JSON object with EXACTLY these "+keys.length+" keys. No markdown. Keep numbers/prices/phone/URLs unchanged.\n\n"+lines+"\n";
  for (let a = 1; a <= 3; a++) { try { const c = await cc(prompt); const o = ex(c); const r = {}; for (const k of keys) if (isT(o[k], lang)) r[k] = o[k]; if (Object.keys(r).length > 0) return r; } catch(e){} await new Promise(r=>setTimeout(r,1500)); }
  return {}; }
async function run() {
  const args = process.argv.slice(2);
  const lang = args.find(a=>a.startsWith("--lang="))?.split("=")[1];
  const srcLang = args.find(a=>a.startsWith("--source-lang="))?.split("=")[1] || "en";
  if (!lang) { console.error("--lang required"); process.exit(1); }
  const specific = args.filter(a=>!a.startsWith("--"));
  const citiesDir = "src/data/cities"; const outDir = "src/data/cities-i18n"; const langDir = path.join(outDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
  const srcDir = srcLang === "en" ? citiesDir : path.join(outDir, srcLang);
  let files = fs.readdirSync(srcDir).filter(f => f.endsWith(".json"));
  if (specific.length > 0) files = files.filter(f => specific.includes(f.replace(".json", "")));
  console.log("Translating "+files.length+" cities to "+lang+" (source: "+srcLang+")");
  let total = 0;
  for (const f of files) {
    const slug = f.replace(".json", "");
    const srcPath = path.join(srcDir, f); const outPath = path.join(langDir, slug + ".json");
    let src; try { src = JSON.parse(fs.readFileSync(srcPath, "utf8")); } catch(e){ continue; }
    let dst; if (fs.existsSync(outPath)) try { dst = JSON.parse(fs.readFileSync(outPath, "utf8")); } catch(e) { dst = JSON.parse(JSON.stringify(src)); } else dst = JSON.parse(JSON.stringify(src));
    const all = getFields(src); const ut = {};
    for (const [k, v] of Object.entries(all)) { const cur = gv(dst, k); if (cur == null || !isT(cur, lang)) ut[k] = v; }
    if (!Object.keys(ut).length) { process.stdout.write("."); continue; }
    console.log("\n["+slug+"] "+Object.keys(ut).length+" fields");
    const BATCH = 25; const entries = Object.entries(ut);
    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = Object.fromEntries(entries.slice(i, i+BATCH));
      const r = await tr(batch, lang, srcLang);
      for (const [k, v] of Object.entries(r)) { ap(dst, k, v); total++; }
      await new Promise(r=>setTimeout(r, 800));
    }
    fs.writeFileSync(outPath, JSON.stringify(dst, null, 2), "utf8");
  }
  console.log("\nDone: "+total+" fields -> "+lang);
}
run().catch(e=>{console.error(e);process.exit(1);});
