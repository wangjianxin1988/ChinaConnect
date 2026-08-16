// Translate guide strings into one language, output src/data/guide/overrides-<lang>.ts
// v2: partial batch acceptance + refill of identity/contaminated values.
// Usage: node scripts/translate-guide-strings.mjs --lang=ko [--force]
import fs from "node:fs";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import { acceptTranslation } from "./lib/translation-accept.mjs";
import { isKeepableToken } from "./lib/translation-accept.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English",
};

const KANA = "\\u3040-\\u30ff", CJK = "\\u3400-\\u9fff", HANGUL = "\\uac00-\\ud7af",
      CYR = "\\u0400-\\u04ff", ARAB = "\\u0600-\\u06ff", THAI = "\\u0e00-\\u0e7f";
const DISALLOWED = {
  ja:  new RegExp("[" + HANGUL + CYR + ARAB + THAI + "]"),
  ko:  new RegExp("[" + CJK + KANA + CYR + ARAB + THAI + "]"),
  "zh-CN": new RegExp("[" + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  "zh-TW": new RegExp("[" + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  th:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + "]"),
  vi:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  ru:  new RegExp("[" + CJK + KANA + HANGUL + ARAB + THAI + "]"),
  fr:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  de:  new RegExp("[" + CJK + KANA + HANGUL + CYR + ARAB + THAI + "]"),
  ar:  new RegExp("[" + CJK + KANA + HANGUL + CYR + THAI + "]"),
  fa:  new RegExp("[" + CJK + KANA + HANGUL + CYR + THAI + "]"),
};

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const force = args.includes("--force");
if (!lang || lang === "ja") {
  console.error("--lang required (non-ja)");
  process.exit(1);
}
const disallow = DISALLOWED[lang] ?? null;
const source = JSON.parse(fs.readFileSync(".audit/guide-strings.json", "utf8"));
const strings = source.strings;
const outFile = `src/data/guide/overrides-${lang}.ts`;
const existing = {};
if (fs.existsSync(outFile)) {
  const text = fs.readFileSync(outFile, "utf8");
  const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
  for (const m of text.matchAll(re)) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
}

const hasCJK = (s) => /[\u3400-\u9fff]/.test(s);
// For zh-CN / zh-TW, Chinese strings stay as-is (zhconv pass handles zh-TW conversion).
// For other languages, re-translate identity values and values with foreign scripts.
const needsApi = strings.filter((s) => {
  const v = existing[s];
  if (v === undefined) return true;
  if (lang === "zh-CN" || lang === "zh-TW") {
    if (hasCJK(s)) return false; // Chinese stays as-is
  } else {
    if (v === s && !isKeepableToken(s)) return true; // identity not keepable -> refill
  }
  if (force) return true;
  if (disallow && disallow.test(v)) return true; // contamination -> refill
  return false;
});
console.log(`[${lang}] total=${strings.length} needsApi=${needsApi.length} existing=${Object.keys(existing).length} force=${force}`);

function unescapeTs(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
}
function escapeTs(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const payload = await res.json();
  return payload.choices?.[0]?.message?.content;
}

function extractJson(content) {
  const cleaned = String(content || "").trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object in response");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1)); }
  }
  throw new Error("No closing JSON object");
}

function goodValue(value, source) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (disallow && disallow.test(value)) return false;
  return acceptTranslation(value, lang, source);
}

// Translate a batch with partial acceptance: valid keys are kept, invalid ones retried.
async function translateBatch(batch) {
  const remaining = [...batch];
  const accepted = [];
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && remaining.length > 0) {
    attempt += 1;
    const lines = remaining.map((s, i) => `k${i} = "${escapeTs(s)}"`).join("\n");
    const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into ${TARGETS[lang]} for foreign visitors.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${remaining.length} keys (k0 ... k${remaining.length - 1}).
- No markdown, no commentary, no extra keys.
- Translate EVERY value into ${TARGETS[lang]}. Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Do NOT leave any Chinese characters in the output. Proper nouns should be transliterated into ${TARGETS[lang]} or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a ${TARGETS[lang]} gloss in parentheses where helpful.

${lines}`;
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      const newRemaining = [];
      let acceptedNow = 0;
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (goodValue(raw, s)) {
          accepted.push(raw);
          acceptedNow += 1;
        } else {
          newRemaining.push(s);
        }
      });
      if (newRemaining.length < remaining.length) {
        console.warn(`  partial: +${acceptedNow} accepted, ${newRemaining.length} remaining (attempt ${attempt})`);
      }
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * attempt));
  }
  return accepted;
}

for (let i = 0; i < needsApi.length; i += BATCH_SIZE) {
  const batch = needsApi.slice(i, i + BATCH_SIZE);
  const startedAt = Date.now();
  const results = await translateBatch(batch);
  batch.forEach((s, idx) => { existing[s] = results[idx] ?? existing[s] ?? s; });
  writeFile();
  const elapsed = Date.now() - startedAt;
  console.log(`  [${new Date().toISOString().slice(11, 19)}] batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needsApi.length / BATCH_SIZE)} done ${results.length}/${batch.length} in ${elapsed}ms`);
}

function writeFile() {
  const entries = strings.map((s) => `  "${escapeTs(s)}": "${escapeTs(existing[s] ?? s)}",`).join("\n");
  const content = `// Auto-generated ${lang} override dictionary for guide data.
// Key: original string (EN or ZH) -> ${TARGETS[lang]}.
export const ${lang.toUpperCase().replace("-", "_")}_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
  const tmp = `${outFile}.tmp`;
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, outFile);
}
writeFile();
console.log(`[${lang}] done: ${Object.keys(existing).length} entries -> ${outFile}`);

