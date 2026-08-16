// Emergency contact name fixer for cities-i18n data.
// 1) Restore emergencyContacts[i].nameEn to the EN source nameEn (all langs).
// 2) ja: fill nameJa with Japanese translation of the EN nameEn where the
//    current value is missing or contains no kana (i.e. pure-Chinese copy).
// 3) ko: fill nameKo with Korean translation of the EN nameEn (all missing).
// Usage: node scripts/fix-emergency-names.mjs [--lang=ja] [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { getTranslateProvider } from "./lib/translate-provider.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese",
  ko: "Korean",
};
const KANA_RE = /[\u3040-\u30ff]/;
const HANGUL_RE = /[\uac00-\ud7af]/;

const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const BASE = "src/data/cities-i18n";
const SRC = "src/data/cities";
const LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 4000 };
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
  throw new Error("No closing JSON object");
}

function escapeJson(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }

function buildPrompt(values, lang) {
  const body = "{\n" + values.map((s, i) => `  "k${i}": "${escapeJson(s)}"`).join(",\n") + "\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following English names of emergency services / hospitals / embassies in China into ${TARGETS[lang]}.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Output must be fluent natural ${TARGETS[lang]} with NO Chinese characters, NO English words and NO Japanese kana.
- Keep phone numbers, numbers and brand names unchanged.
- For Chinese institutions (police, hospital, fire brigade), use the standard ${TARGETS[lang]} name for that service in China.`;
}

function validOutput(raw, lang, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  if (raw === source) return false;
  const trimmed = raw.trim();
  if (lang === "ja" && !(KANA_RE.test(trimmed) || /[\u3400-\u9fff]/.test(trimmed))) return false;
  if (lang === "ko" && !HANGUL_RE.test(trimmed)) return false;
  if (/新加坡|シンガポール|싱가포르/.test(trimmed)) return false;
  return true;
}

async function translateBatch(batch, lang) {
  const resultMap = new Map();
  const remaining = [...batch];
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && remaining.length > 0) {
    attempt += 1;
    try {
      const content = await callChat(buildPrompt(remaining, lang));
      const result = extractJson(content);
      const newRemaining = [];
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (validOutput(raw, lang, s)) resultMap.set(s, raw.trim());
        else newRemaining.push(s);
      });
      if (newRemaining.length < remaining.length) console.warn(`  partial: +${remaining.length - newRemaining.length} accepted, ${newRemaining.length} remaining (attempt ${attempt})`);
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
  }
  return resultMap;
}

let restored = 0;
let queued = 0;
for (const lang of LANGS) {
  if (onlyLang && lang !== onlyLang) continue;
  const langDir = path.join(BASE, lang);
  if (!fs.existsSync(langDir)) continue;
  const key = lang === "ja" ? "nameJa" : lang === "ko" ? "nameKo" : null;
  let toTranslate = [];
  let langRestored = 0;

  for (const fn of fs.readdirSync(langDir).filter((f) => f.endsWith(".json"))) {
    const fp = path.join(langDir, fn);
    const slug = fn.replace(/\.json$/, "");
    const enFile = path.join(SRC, `${slug}.json`);
    if (!fs.existsSync(enFile)) continue;
    const target = JSON.parse(fs.readFileSync(fp, "utf8"));
    const en = JSON.parse(fs.readFileSync(enFile, "utf8"));
    const ec = target.emergencyContacts || [];
    const eec = en.emergencyContacts || [];
    let dirty = false;
    for (let i = 0; i < Math.min(ec.length, eec.length); i += 1) {
      const t = ec[i];
      const e = eec[i];
      if (typeof e.nameEn === "string" && t.nameEn !== e.nameEn) {
        if (!dryRun) t.nameEn = e.nameEn;
        langRestored += 1;
        dirty = true;
      }
      if (key) {
        const cur = t[key] || "";
        const needs = !cur || (lang === "ja" && !KANA_RE.test(cur)) || (lang === "ko" && !HANGUL_RE.test(cur));
        if (needs && e.nameEn) {
          toTranslate.push({ file: fn, idx: i, enValue: e.nameEn });
          dirty = true;
        }
      }
    }
    if (!dryRun && dirty) fs.writeFileSync(fp, JSON.stringify(target, null, 2) + "\n");
  }

  console.log(`[${lang}] restored nameEn: ${langRestored} (dry-run: ${dryRun})`);
  if (!key) continue;

  const unique = [...new Set(toTranslate.map((x) => x.enValue))];
  console.log(`[${lang}] localized names to translate: ${toTranslate.length} (unique EN: ${unique.length})`);
  queued += toTranslate.length;
  if (dryRun || toTranslate.length === 0) continue;

  const resultMap = new Map();
  for (let s = 0; s < unique.length; s += BATCH_SIZE) {
    const batch = unique.slice(s, s + BATCH_SIZE);
    const mapped = await translateBatch(batch, lang);
    for (const [k, v] of mapped.entries()) resultMap.set(k, v);
    const done = Math.min(s + BATCH_SIZE, unique.length);
    console.log(`  [${new Date().toLocaleTimeString("en-GB", { hour12: false })}] ${lang} ${done}/${unique.length}`);
  }
  let applied = 0;
  for (const { file, idx, enValue } of toTranslate) {
    const fp = path.join(langDir, file);
    const target = JSON.parse(fs.readFileSync(fp, "utf8"));
    const v = resultMap.get(enValue);
    if (v) { target.emergencyContacts[idx][key] = v; applied += 1; }
    fs.writeFileSync(fp, JSON.stringify(target, null, 2) + "\n");
  }
  console.log(`[${lang}] applied ${applied}/${toTranslate.length}`);
}
console.log(`DONE. restored=${restored} queued=${queued}`);