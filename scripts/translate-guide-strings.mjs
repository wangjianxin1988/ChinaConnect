// Translate guide strings into one language, output src/data/guide/overrides-<lang>.ts
// Usage: node scripts/translate-guide-strings.mjs --lang=ko
import fs from "node:fs";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import { isTranslated } from "./lib/translation-keys.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English",
};

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
if (!lang || lang === "ja") {
  console.error("--lang required (non-ja)");
  process.exit(1);
}
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
const needsApi = strings.filter((s) => {
  if (existing[s] !== undefined) return false;
  if (lang === "zh-CN" || lang === "zh-TW") return !hasCJK(s);
  return true;
});
console.log(`[${lang}] total=${strings.length} needsApi=${needsApi.length} existing=${Object.keys(existing).length}`);

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

async function translateBatch(batch) {
  const lines = batch.map((s, i) => `k${i} = "${escapeTs(s)}"`).join("\n");
  const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into ${TARGETS[lang]} for foreign visitors.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${batch.length} keys (k0 ... k${batch.length - 1}).
- No markdown, no commentary, no extra keys.
- Translate EVERY value into ${TARGETS[lang]}. Do NOT keep English or Chinese text.
- Keep numbers, prices, times, units, brand names, phone numbers and URLs unchanged.
- Keep proper nouns recognizable (Forbidden City = ${lang === "zh-CN" ? "故宫" : lang === "zh-TW" ? "故宮" : "literal translation in target language"}).

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      const keys = Object.keys(result);
      const ok = keys.length === batch.length && batch.every((s, i) => typeof result[`k${i}`] === "string" && isTranslated(result[`k${i}`], lang, s));
      if (!ok) throw new Error("Incomplete translation response");
      return batch.map((_, i) => result[`k${i}`]);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * attempt));
  }
  // Fallback: single-key
  const out = [];
  for (let i = 0; i < batch.length; i += 1) {
    const [one] = await translateBatch([batch[i]]);
    out.push(one);
  }
  return out;
}

for (let i = 0; i < needsApi.length; i += BATCH_SIZE) {
  const batch = needsApi.slice(i, i + BATCH_SIZE);
  const startedAt = Date.now();
  const results = await translateBatch(batch);
  batch.forEach((s, idx) => { existing[s] = results[idx]; });
  // Write progress incrementally
  writeFile();
  const elapsed = Date.now() - startedAt;
  console.log(`  [${new Date().toISOString().slice(11, 19)}] batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needsApi.length / BATCH_SIZE)} done in ${elapsed}ms`);
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
