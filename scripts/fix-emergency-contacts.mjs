// Fix per-city emergencyContacts for all languages from the EN source.
// Problems fixed:
//  - name kept Chinese for non-zh langs
//  - nameEn corrupted to a single wrong value (Singapore consulate) for ALL entries
//  - address truncated/wrong
// For non-ja/zh langs: name/nameEn/address translated into the target language.
// For ja: nameJa preserved, nameEn restored to English source.
// For zh-CN/zh-TW: name (Chinese) preserved, nameEn restored to English source.
// Usage: node scripts/fix-emergency-contacts.mjs [--lang=ko] [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { getTranslateProvider } from "./lib/translate-provider.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)",
};
const LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const CJK_RE = /[\u3400-\u9fff]/;
const KANA_RE = /[\u3040-\u30ff]/;
const FOREIGN_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;
const SCRIPT_PRESENCE = {
  ja: /[\u3040-\u30ff]/, ko: /[\uac00-\ud7af]/, th: /[\u0e00-\u0e7f]/, ru: /[\u0400-\u04ff]/,
  ar: /[\u0600-\u06ff]/, fa: /[\u0600-\u06ff]/,
};
const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const EN_DIR = "src/data/cities";
const OUT_DIR = "src/data/cities-i18n";

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

function buildPrompt(values, lang) {
  const body = "{\n" + values.map((s, i) => `  "k${i}": "${escapeJson(s)}"`).join(",\n") + "\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following emergency-contact strings (hospital / police / embassy names, addresses, notes) into ${TARGETS[lang]}.
Source strings are English or Chinese originals from a China city guide.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Keep numbers, phone numbers, district names in Latin script unchanged.
- Output must be fluent natural ${TARGETS[lang]}${lang === "ja" ? "" : " with NO Chinese characters and NO Japanese kana."}`;
}

function validOutput(raw, lang, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  if (raw === source) return false;
  if (lang !== "ja" && lang !== "zh-CN" && lang !== "zh-TW") {
    if (CJK_RE.test(raw) || KANA_RE.test(raw)) return false;
    const presence = SCRIPT_PRESENCE[lang];
    if (presence && !presence.test(raw)) return false;
    if (lang === "vi" || lang === "fr" || lang === "de") {
      if (FOREIGN_RE.test(raw)) return false;
    }
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
      const content = await callChat(buildPrompt(remaining, lang));
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
      const content = await callChat(buildPrompt([s], lang));
      const result = extractJson(content);
      if (validOutput(result?.k0, lang, s)) resultMap.set(s, result.k0);
    } catch { /* keep */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return resultMap;
}

let totalTranslated = 0;
for (const lang of LANGS) {
  if (onlyLang && lang !== onlyLang) continue;
  const files = fs.readdirSync(EN_DIR).filter((f) => f.endsWith(".json"));
  const langDir = path.join(OUT_DIR, lang);
  if (!fs.existsSync(langDir)) continue;
  const allTarget = {};
  for (const fn of files) {
    const p = path.join(langDir, fn);
    if (fs.existsSync(p)) allTarget[fn] = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  // Collect unique sources: name, nameEn, address, notes, description
  const jobs = []; // {file, index, field, value}
  for (const fn of files) {
    const city = JSON.parse(fs.readFileSync(path.join(EN_DIR, fn), "utf8"));
    const target = allTarget[fn];
    if (!target) continue;
    const ec = city.emergencyContacts || [];
    for (let i = 0; i < ec.length; i += 1) {
      const src = ec[i];
      const tgt = target.emergencyContacts?.[i];
      if (!tgt) continue;
      if (lang === "zh-CN" || lang === "zh-TW") {
        // keep Chinese name; restore nameEn from English source
        jobs.push({ file: fn, index: i, field: "nameEn", value: src.nameEn });
      } else if (lang === "ja") {
        jobs.push({ file: fn, index: i, field: "name", value: src.name });
        jobs.push({ file: fn, index: i, field: "nameEn", value: src.nameEn });
      } else {
        jobs.push({ file: fn, index: i, field: "name", value: src.name });
        jobs.push({ file: fn, index: i, field: "nameEn", value: src.nameEn });
      }
      if (src.address) jobs.push({ file: fn, index: i, field: "address", value: src.address });
      if (src.notes) jobs.push({ file: fn, index: i, field: "notes", value: src.notes });
      if (src.description) jobs.push({ file: fn, index: i, field: "description", value: src.description });
    }
  }
  // Dedupe by (field,value) so each unique string is translated once.
  const unique = new Map();
  for (const j of jobs) {
    if (!j.value || !j.value.trim()) continue;
    if (!unique.has(`${j.field}|${j.value}`)) unique.set(`${j.field}|${j.value}`, []);
    unique.get(`${j.field}|${j.value}`).push(j);
  }
  const sources = [...unique.keys()].map((k) => k.slice(k.indexOf("|") + 1));
  console.log(`[${lang}] unique sources: ${sources.length} (jobs: ${jobs.length})`);
  totalTranslated += sources.length;
  if (dryRun || sources.length === 0) continue;
  const startedAt = Date.now();
  const map = new Map();
  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const chunk = sources.slice(i, i + BATCH_SIZE);
    const chunkMap = await translateBatch(chunk, lang);
    for (const [k, v] of chunkMap) map.set(k, v);
    console.log(`  [${new Date().toISOString().slice(11, 19)}] lang ${lang} chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(sources.length / BATCH_SIZE)} done ${chunkMap.size}/${chunk.length}`);
  }
  let fixed = 0;
  for (const [key, jobList] of unique) {
    const srcVal = key.slice(key.indexOf("|") + 1);
    const newVal = map.get(srcVal);
    if (!newVal) continue;
    for (const j of jobList) {
      const contact = allTarget[j.file].emergencyContacts[j.index];
      contact[j.field] = newVal;
      fixed += 1;
    }
  }
  // ja/ko extra nameJa/nameKo fields
  for (const fn of files) {
    const target = allTarget[fn];
    if (!target) continue;
    for (const c of target.emergencyContacts || []) {
      if (lang === "ja" && c.name) c.nameJa = c.name;
      if (lang === "ko" && c.name) c.nameKo = c.name;
    }
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
  console.log(`[${lang}] applied ${fixed} field translations`);
}
console.log(`done. total unique sources: ${totalTranslated}${dryRun ? " (dry run)" : ""}`);
