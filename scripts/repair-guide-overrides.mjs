// Repair untranslated residue in a guide override file for one language.
// Usage: node scripts/repair-guide-overrides.mjs --lang=ko [--rounds 4]
// Flags:
//   - identity values for non-keepable sources (English/Chinese leftover)
//   - CJK values in non-Chinese targets
// Then re-translates flagged strings with a strict prompt until clean.
import fs from "node:fs";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import { hasLanguageScript, isTranslated } from "./lib/translation-keys.mjs";
import { acceptTranslation, isKeepableToken } from "./lib/translation-accept.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)",
};
const FOREIGN_SCRIPTS = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const roundsArg = args.find((a) => a.startsWith("--rounds="))?.split("=")[1];
if (!lang || !TARGETS[lang]) { console.error("--lang required (ko/zh-CN/zh-TW/th/vi/ru/fr/de/ar/fa)"); process.exit(1); }
const MAX_ROUNDS = roundsArg ? parseInt(roundsArg, 10) : 4;

const outFile = `src/data/guide/overrides-${lang}.ts`;
const source = JSON.parse(fs.readFileSync(".audit/guide-strings.json", "utf8"));
const strings = source.strings;

function escapeTs(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function unescapeTs(s) { return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n"); }

const existing = {};
if (fs.existsSync(outFile)) {
  const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
  for (const m of fs.readFileSync(outFile, "utf8").matchAll(re)) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
}

function needsRepair(s) {
  const v = existing[s];
  if (v === undefined) return true;
  if (lang === "zh-CN" || lang === "zh-TW") {
    // English source must be translated into Chinese; Chinese source can stay.
    if (hasLanguageScript(v, lang)) return false;
    if (v === s) return !/[\u3400-\u9fff]/.test(s); // english identity = residue
    return true;
  }
  if (/[\u3400-\u9fff]/.test(v)) return true; // Chinese in non-Chinese target
  if (hasLanguageScript(v, lang)) return false;
  if (v === s) return !isKeepableToken(s);
  if (FOREIGN_SCRIPTS.test(v)) return true;
  return !isTranslated(v, lang, s);
}

function writeFile() {
  const entries = strings.map((s) => `  "${escapeTs(s)}": "${escapeTs(existing[s] ?? s)}",`).join("\n");
  const content = `// Auto-generated ${lang} override dictionary for guide data (repaired).
// Key: original string (EN or ZH) -> ${TARGETS[lang]}.
export const ${lang.toUpperCase().replace("-", "_")}_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
  const tmp = `${outFile}.tmp`;
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, outFile);
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 8000 };
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

async function translateBatch(batch) {
  const lines = batch.map((s, i) => `k${i} = "${escapeTs(s)}"`).join("\n");
  const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into ${TARGETS[lang]}. These were previously left untranslated - you MUST translate them now.
Some sources are Chinese, some are English; translate the MEANING of every string into ${TARGETS[lang]}.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${batch.length} keys (k0 ... k${batch.length - 1}).
- No markdown, no commentary, no extra keys.
- Translate EVERY value into ${TARGETS[lang]}. ABSOLUTELY NO English or Chinese characters in the output values.
- Keep numbers, prices, times, units, brand names (Alipay, WeChat, Trip.com, etc.), phone numbers and URLs unchanged.
- Keep proper nouns recognizable but in ${TARGETS[lang]} form where natural (e.g. city names may stay in Latin form).

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      const keys = Object.keys(result);
      const ok = keys.length === batch.length && batch.every((s, i) => typeof result[`k${i}`] === "string" && acceptTranslation(result[`k${i}`], lang, s));
      if (!ok) throw new Error("Incomplete translation response");
      return batch.map((_, i) => result[`k${i}`]);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * attempt));
  }
  const out = [];
  for (let i = 0; i < batch.length; i += 1) {
    const one = batch[i];
    try {
      const [r] = await translateBatch([one]);
      out.push(r);
    } catch {
      out.push(existing[one] ?? one);
    }
  }
  return out;
}

(async () => {
  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    const flagged = strings.filter(needsRepair);
    console.log(`[${lang}] round ${round}: flagged=${flagged.length}`);
    if (flagged.length === 0) break;
    for (let i = 0; i < flagged.length; i += BATCH_SIZE) {
      const batch = flagged.slice(i, i + BATCH_SIZE);
      const results = await translateBatch(batch);
      batch.forEach((s, idx) => { existing[s] = results[idx]; });
      writeFile();
    }
    writeFile();
  }
  const remaining = strings.filter(needsRepair);
  console.log(`[${lang}] FINAL residue=${remaining.length}`);
  if (remaining.length > 0) {
    const out = remaining.map((s) => `  ${JSON.stringify(s)} -> ${JSON.stringify(existing[s] ?? s)}`).join("\n");
    fs.writeFileSync(`.audit/guide-residue-${lang}.txt`, out + "\n", "utf8");
    console.log(`  wrote .audit/guide-residue-${lang}.txt`);
    for (const s of remaining.slice(0, 15)) {
      console.log(`    ${JSON.stringify(s.slice(0, 90))} -> ${JSON.stringify((existing[s] ?? s).slice(0, 90))}`);
    }
  }
})();
