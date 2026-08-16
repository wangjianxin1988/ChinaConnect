// v2: Fix CJK residue in cities-i18n data for non-zh languages.
// Fixes vs v1:
//  - setPath now resolves array paths correctly (attractions[i].highlights[j])
//  - removes "ja pure-CJK = keep" heuristic: words like 無料/火鍋 still translate
//  - strict output validation: reject output containing CJK/kana for non-ja langs
//  - optional phantom-key cleanup (numeric string keys inserted by v1 bug)
// Usage: node scripts/fix-city-data-cjk-v2.mjs [--lang=ko] [--dry-run] [--clean-phantoms]
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
const LANGS = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const CJK_RE = /[\u3400-\u9fff]/;
const KANA_RE = /[\u3040-\u30ff]/;
const FOREIGN_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;
const SCRIPT_PRESENCE = {
  ko: /[\uac00-\ud7af]/, th: /[\u0e00-\u0e7f]/, ru: /[\u0400-\u04ff]/,
  ar: /[\u0600-\u06ff]/, fa: /[\u0600-\u06ff]/,
};

const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const cleanPhantoms = args.includes("--clean-phantoms");
const BASE = "src/data/cities-i18n";

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
      const key = arrMatch[1] || "0";
      const idx = Number(arrMatch[2]);
      if (isLast) {
        cur[key][idx] = value;
        return;
      }
      if (!cur[key]) cur[key] = [];
      if (!cur[key][idx]) cur[key][idx] = {};
      cur = cur[key][idx];
    } else {
      if (isLast) { cur[part] = value; return; }
      if (!cur[part]) cur[part] = {};
      cur = cur[part];
    }
  }
}

function removePhantomKeys(obj, pathStr = "") {
  // Remove numeric-string keys that are not real array indices (v1 bug artifact).
  if (Array.isArray(obj)) { obj.forEach((v) => removePhantomKeys(v)); return; }
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    if (/^\d+$/.test(k) && typeof obj[k] === "string") {
      delete obj[k];
    } else {
      removePhantomKeys(obj[k], pathStr ? `${pathStr}.${k}` : k);
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
    ? "Your previous output was REJECTED because it still contained Chinese characters. Re-translate EVERY value into " + TARGETS[lang] + " with ZERO Chinese characters."
    : "";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following travel content strings into ${TARGETS[lang]} for foreign visitors to China.
Source strings are Japanese translations of Chinese travel content (city guides, attraction tips, tickets, addresses, dish names).
${extra}
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Output must be fluent natural ${TARGETS[lang]} with NO Chinese characters and NO Japanese kana.
- Keep numbers, prices, times, units, phone numbers and URLs unchanged.
- For dish names, use the standard ${TARGETS[lang]} name; for place names use the common ${TARGETS[lang]} name with a Chinese gloss in parentheses ONLY when needed for clarity, and gloss must be in ${TARGETS[lang]} script not Chinese.`;
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
    if (cleanPhantoms) removePhantomKeys(allTarget[fn]);
  }
  const jaDir = path.join(BASE, "ja");
  const actionable = [];
  for (const fn of fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))) {
    const target = allTarget[fn];
    const jaFile = path.join(jaDir, fn);
    if (!fs.existsSync(jaFile)) continue;
    const jaData = JSON.parse(fs.readFileSync(jaFile, "utf8"));
    const jaFields = walk(jaData);
    for (const [p, v] of Object.entries(walk(target))) {
      if (!CJK_RE.test(v)) continue;
      if (p.includes("emergencyContacts")) continue; // handled by fix-emergency-contacts.mjs
      if (isKeepableToken(v)) continue;
      if (p.endsWith(".name")) continue; // proper noun; displayed via nameEn
      const jaV = jaFields[p];
      if (jaV === undefined) continue;
      actionable.push({ file: fn, path: p, value: v, jaValue: jaV });
    }
  }
  console.log(`[${lang}] actionable fields: ${actionable.length}`);
  totalFields += actionable.length;
  if (dryRun || actionable.length === 0) continue;
  const uniqueJa = [...new Set(actionable.map((a) => a.jaValue))];
  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const startedAt = Date.now();
  const map = new Map();
  for (let i = 0; i < uniqueJa.length; i += BATCH_SIZE) {
    const chunk = uniqueJa.slice(i, i + BATCH_SIZE);
    const chunkMap = await translateBatch(chunk, lang);
    for (const [k, v] of chunkMap) map.set(k, v);
    const elapsed = Date.now() - startedAt;
    console.log(`  [${new Date().toISOString().slice(11, 19)}] lang ${lang} chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueJa.length / BATCH_SIZE)} done ${chunkMap.size}/${chunk.length}`);
  }
  let fixed = 0, missing = 0;
  for (const a of actionable) {
    const newVal = map.get(a.jaValue);
    if (!newVal || newVal === a.jaValue) { missing += 1; continue; }
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
