// Fix English-residue values in translations.ts for non-ja langs.
// For each key where lang value === en value (prose, not keepable, not kept-English-by-ja):
// translate the en value into the target language.
// Usage: node scripts/fix-translations-en-residue.mjs [--lang=ko] [--dry-run]
import fs from "node:fs";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import { isKeepableToken } from "./lib/translation-accept.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)",
};
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const FIX_LANGS = ["ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
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

const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
const blocks = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = /^  (["']?)([a-zA-Z-]{2,10})\1: \{/.exec(lines[i]);
  if (m && LANGS.includes(m[2])) blocks.push({ lang: m[2], startLine: i });
}

function parseBlock(ls, baseLine) {
  // values: Map<keyPath, {line, raw, quote, indent}>
  const values = new Map();
  const stack = [];
  for (let li = 0; li < ls.length; li += 1) {
    const raw = ls[li];
    const trim = raw.trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) { if (stack.length) stack.pop(); continue; }
    const valMatch = /^([A-Za-z0-9_]+)\s*:\s*("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'),?\s*$/.exec(trim);
    if (valMatch) {
      const key = [...stack, valMatch[1]].join(".");
      const quote = valMatch[3] !== undefined ? '"' : "'";
      const rawVal = valMatch[3] !== undefined ? valMatch[3] : valMatch[4];
      const un = rawVal.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
      values.set(key, { line: baseLine + li, raw: rawVal, quote, value: un });
    }
  }
  return values;
}

const dicts = {};
for (let b = 0; b < blocks.length; b += 1) {
  const start = blocks[b].startLine;
  const end = b + 1 < blocks.length ? blocks[b + 1].startLine : lines.length;
  dicts[blocks[b].lang] = parseBlock(lines.slice(start + 1, end - 1), start + 1);
}
const en = dicts.en, ja = dicts.ja;

function escapeTs(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }

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

function buildPrompt(values, lang) {
  const body = values.map((s, i) => `  "k${i}": ${JSON.stringify(s)}`).join(",\n");
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following UI strings (buttons, labels, headings, descriptions, placeholders) into ${TARGETS[lang]}.
Input JSON:
{
${body}
}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Keep placeholders like {city}, {count}, {name} and brand names (Alipay, WeChat, Didi, Trip.com) unchanged.
- Output must be fluent natural ${TARGETS[lang]}${lang === "zh-CN" || lang === "zh-TW" ? "" : " with NO Chinese characters and NO Japanese kana."}`;
}

function validOutput(raw, lang, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  if (raw === source) return false;
  if (lang !== "zh-CN" && lang !== "zh-TW") {
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

let total = 0;
for (const lang of FIX_LANGS) {
  if (onlyLang && lang !== onlyLang) continue;
  const d = dicts[lang];
  const jobs = [];
  for (const [k, info] of d) {
    const v = info.value;
    if (!v || v.trim().length === 0) continue;
    const enV = en.get(k)?.value;
    const jaV = ja.get(k)?.value;
    const isProse = (s) => s.includes(" ") || s.length > 12;
    // ja keeps it English -> intentional brand/ref, skip
    if (jaV && jaV === v) continue;
    if (enV && v === enV && isProse(enV) && !isKeepableToken(enV)) {
      jobs.push({ key: k, info, value: enV });
    }
  }
  const unique = [...new Set(jobs.map((j) => j.value))];
  console.log(`[${lang}] residue keys: ${jobs.length}, unique values: ${unique.length}`);
  total += unique.length;
  if (dryRun || unique.length === 0) continue;
  const map = new Map();
  const startedAt = Date.now();
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const chunk = unique.slice(i, i + BATCH_SIZE);
    const chunkMap = await translateBatch(chunk, lang);
    for (const [k, v] of chunkMap) map.set(k, v);
    console.log(`  [${new Date().toISOString().slice(11, 19)}] ${lang} chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(unique.length / BATCH_SIZE)}`);
  }
  let fixed = 0;
  for (const j of jobs) {
    const newVal = map.get(j.value);
    if (!newVal) continue;
    const lineIdx = j.info.line;
    const indent = lines[lineIdx].match(/^\s*/)[0];
    const keyName = j.key.split(".").pop();
    lines[lineIdx] = `${indent}${keyName}: "${escapeTs(newVal)}",`;
    fixed += 1;
  }
  console.log(`[${lang}] replaced ${fixed} values`);
}
if (!dryRun) {
  fs.writeFileSync("src/i18n/translations.ts", lines.join("\n"), "utf8");
  console.log("written. total unique translated:", total);
} else {
  console.log(`dry-run. total unique values would translate: ${total}`);
}
