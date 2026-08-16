// EN residue fixer for cities-i18n data.
// Translates verbatim English-copy values (untranslated) into the target
// language, using the ja file as the "this field should be localized" gate.
// Usage: node scripts/fix-city-data-eng.mjs [--lang=ko] [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import { isKeepableToken } from "./lib/translation-accept.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English",
};
const LANGS = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const CJK_RE = /[\u3400-\u9fff]/;
const KANA_RE = /[\u3040-\u30ff]/;
const FOREIGN_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;
const SCRIPT_PRESENCE = {
  ko: /[\uac00-\ud7af]/, th: /[\u0e00-\u0e7f]/, ru: /[\u0400-\u04ff]/,
  ar: /[\u0600-\u06ff]/, fa: /[\u0600-\u06ff]/, "zh-CN": /[\u3400-\u9fff]/, "zh-TW": /[\u3400-\u9fff]/,
};

const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const showSample = args.includes("--sample");
const BASE = "src/data/cities-i18n";
const SRC = "src/data/cities";

function walk(o, pathStr = "") {
  const out = {};
  if (Array.isArray(o)) {
    o.forEach((v, i) => Object.assign(out, walk(v, `${pathStr}[${i}]`)));
  } else if (o && typeof o === "object") {
    for (const [k, v] of Object.entries(o)) {
      Object.assign(out, walk(v, pathStr ? `${pathStr}.${k}` : k));
    }
  } else if (typeof o === "string") {
    out[pathStr] = o;
  }
  return out;
}

function setPath(obj, pathStr, value) {
  const parts = pathStr.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const arrMatch = /^(.*)\[(\d+)\]$/.exec(part);
    const isLast = i === parts.length - 1;
    if (arrMatch) {
      const key = arrMatch[1];
      const idx = Number(arrMatch[2]);
      if (key === "") {
        // bare array index segment, e.g. transport.local.taxi[0][1]
        if (isLast) { cur[idx] = value; return; }
        if (!cur[idx]) cur[idx] = {};
        cur = cur[idx];
        continue;
      }
      if (isLast) {
        if (!Array.isArray(cur[key])) return;
        cur[key][idx] = value; return;
      }
      if (!cur[key]) cur[key] = [];
      if (!Array.isArray(cur[key])) return;
      if (!cur[key][idx]) cur[key][idx] = {};
      cur = cur[key][idx];
    } else {
      if (isLast) { cur[part] = value; return; }
      if (!cur[part]) cur[part] = {};
      cur = cur[part];
    }
  }
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Connection: "close" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const payload = await res.json();
  return payload.choices?.[0]?.message?.content;
}

function extractJson(content) {
  const cleaned = String(content || "").trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object");
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  if (end !== -1) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fall through */ }
  }
  const out = {};
  const re = /"k(\d+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(cleaned))) out[`k${m[1]}`] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
  if (Object.keys(out).length > 0) return out;
  throw new Error("No closing JSON object");
}

function escapeJson(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }

function buildPrompt(values, lang, correction) {
  const body = "{\n" + values.map((s, i) => `  "k${i}": "${escapeJson(s)}"`).join(",\n") + "\n}";
  const extra = correction
    ? "Your previous output was REJECTED because it was identical to the input or still English. Re-translate EVERY value into " + TARGETS[lang] + " with ZERO English words."
    : "";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following English travel content into ${TARGETS[lang]} for foreign visitors to China.
Source strings are English city-guide content (descriptions, transport tips, climate info, opening hours, dish names, addresses).
${extra}
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Output must be fluent natural ${TARGETS[lang]} with NO Chinese characters and NO Japanese kana.
- Keep numbers, prices, times, units, phone numbers, URLs and brand names (Didi, WeChat, Alipay, Michelin, etc.) unchanged.
- Keep placeholders like {city}, [NAME] unchanged.
- For proper nouns (place names, street names, dish names) use the common ${TARGETS[lang]} name; when a Chinese gloss is helpful, write it in ${TARGETS[lang]} script, never Chinese.`;
}

function validOutput(raw, lang, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  if (raw === source) return false;
  if (CJK_RE.test(raw) || KANA_RE.test(raw)) return false;
  const presence = SCRIPT_PRESENCE[lang];
  if (presence && !presence.test(raw)) return false;
  if (lang === "vi" || lang === "fr" || lang === "de") {
    if (FOREIGN_RE.test(raw)) return false;
  }
  return true;
}

function norm(v) {
  return String(v).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]/g, "");
}

async function translateBatch(batch, lang) {
  const resultMap = new Map();
  const remaining = [...batch];
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && remaining.length > 0) {
    attempt += 1;
    try {
      const content = await callChat(buildPrompt(remaining, lang, attempt > 1));
      const result = extractJson(content);
      const newRemaining = [];
      let accepted = 0;
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (validOutput(raw, lang, s)) { resultMap.set(s, raw); accepted += 1; }
        else newRemaining.push(s);
      });
      if (newRemaining.length < remaining.length) console.warn(`  partial: +${accepted} accepted, ${newRemaining.length} remaining (attempt ${attempt})`);
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
  }
  for (const s of remaining) {
    try {
      const content = await callChat(buildPrompt([s], lang, true));
      const result = extractJson(content);
      if (validOutput(result?.k0, lang, s)) resultMap.set(s, result.k0);
    } catch { /* keep */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return resultMap;
}

let totalFields = 0;
for (const lang of LANGS) {
  if (onlyLang && lang !== onlyLang) continue;
  const langDir = path.join(BASE, lang);
  if (!fs.existsSync(langDir)) continue;
  const allTarget = {};
  for (const fn of fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))) {
    allTarget[fn] = JSON.parse(fs.readFileSync(path.join(langDir, fn), "utf8"));
  }
  const actionable = [];
  for (const fn of fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))) {
    const target = allTarget[fn];
    const slug = fn.replace(/\.json$/, "");
    const enFile = path.join(SRC, `${slug}.json`);
    const jaFile = path.join(BASE, "ja", fn);
    if (!fs.existsSync(enFile) || !fs.existsSync(jaFile)) continue;
    const enFields = walk(JSON.parse(fs.readFileSync(enFile, "utf8")));
    const jaFields = walk(JSON.parse(fs.readFileSync(jaFile, "utf8")));
    for (const [p, v] of Object.entries(walk(target))) {
      if (p.endsWith(".name") || p.endsWith(".nameEn") || p.endsWith(".category") || p.endsWith(".importance")) continue;
      if (p === "name") continue;
      if (p.includes("emergencyContacts")) continue;
      if (isKeepableToken(v)) continue;
      const enV = enFields[p];
      const jaV = jaFields[p];
      if (typeof enV !== "string" || typeof jaV !== "string") continue;
      if (norm(v) !== norm(enV)) continue;           // not a verbatim EN copy
      if (norm(jaV) === norm(enV)) continue;          // ja also untranslated
      if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(jaV)) continue; // ja not Japanese => skip
      // skip enum-ish type values
      if (p.endsWith(".type") && (/^[a-z]{2,20}$/.test(v) || ["Michelin", "Black Pearl", "Local", "Local Favorite"].includes(v))) continue;
      actionable.push({ file: fn, path: p, value: v, enValue: enV, jaValue: jaV });
    }
  }
  // Additional pass: any leftover CJK value (non-zh langs) where EN source is
  // clean English and ja is Japanese -> translate EN source into target.
  if (lang !== "zh-CN" && lang !== "zh-TW") {
    for (const fn of fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))) {
      const target = allTarget[fn];
      const slug = fn.replace(/\.json$/, "");
      const enFile = path.join(SRC, `${slug}.json`);
      const jaFile = path.join(BASE, "ja", fn);
      if (!fs.existsSync(enFile) || !fs.existsSync(jaFile)) continue;
      const enFields = walk(JSON.parse(fs.readFileSync(enFile, "utf8")));
      const jaFields = walk(JSON.parse(fs.readFileSync(jaFile, "utf8")));
      for (const [p, v] of Object.entries(walk(target))) {
        if (!CJK_RE.test(v)) continue;
        if (p.endsWith(".name") || p.endsWith(".nameEn") || p.endsWith(".category") || p.endsWith(".importance")) continue;
        if (p === "name") continue;
        if (p.includes("emergencyContacts")) continue;
        const enV = enFields[p];
        const jaV = jaFields[p];
        if (typeof enV !== "string" || typeof jaV !== "string") continue;
        if (!/[぀-ヿ㐀-鿿]/.test(jaV)) continue;
        if (!actionable.some((x) => x.file === fn && x.path === p)) {
          actionable.push({ file: fn, path: p, value: v, enValue: enV, jaValue: jaV });
        }
      }
    }
  }
  console.log(`[${lang}] actionable fields: ${actionable.length}`);
  if (showSample) { for (const a of actionable.slice(0, 15)) console.log(`    ${a.file} ${a.path} = ${JSON.stringify(a.value).slice(0, 90)}`); }
  totalFields += actionable.length;
  if (dryRun || actionable.length === 0) continue;
  const uniqueEn = [...new Set(actionable.map((a) => a.enValue))];
  console.log(`[${lang}] unique en sources: ${uniqueEn.length}`);
  const startedAt = Date.now();
  const map = new Map();
  for (let i = 0; i < uniqueEn.length; i += BATCH_SIZE) {
    const chunk = uniqueEn.slice(i, i + BATCH_SIZE);
    const chunkMap = await translateBatch(chunk, lang);
    for (const [k, v] of chunkMap) map.set(k, v);
    const elapsed = Date.now() - startedAt;
    console.log(`  [${new Date().toISOString().slice(11, 19)}] lang ${lang} chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueEn.length / BATCH_SIZE)} done ${chunkMap.size}/${chunk.length}`);
  }
  let fixed = 0, missing = 0;
  for (const a of actionable) {
    const newVal = map.get(a.enValue);
    if (!newVal || newVal === a.enValue) { missing += 1; continue; }
    setPath(allTarget[a.file], a.path, newVal);
    fixed += 1;
  }
  for (const [fn, data] of Object.entries(allTarget)) {
    const outPath = path.join(langDir, fn);
    const tmp = `${outPath}.tmp`;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      try {
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
        fs.renameSync(tmp, outPath);
        break;
      } catch (error) {
        if (attempt === 6) throw error;
        console.warn(`  write retry ${attempt}: ${error?.code || error}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  console.log(`[${lang}] applied ${fixed} field translations (untranslated: ${missing})`);
}
console.log(`done. total actionable fields: ${totalFields}${dryRun ? " (dry run)" : ""}`);
