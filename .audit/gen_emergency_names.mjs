// Generate src/data/emergency/emergency-names-l10n.ts: localized names for the
// 416 unique EN emergency-contact nameEn values, per language.
// Usage: node .audit/gen_emergency_names.mjs [--lang=ja] [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { getTranslateProvider } from "../scripts/lib/translate-provider.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)",
};
const SCRIPT_CHECK = {
  ja: /[\u3040-\u30ff\u3400-\u9fff]/, ko: /[\uac00-\ud7af]/, "zh-CN": /[\u3400-\u9fff]/, "zh-TW": /[\u3400-\u9fff]/,
  th: /[\u0e00-\u0e7f]/, vi: /[\u00e0-\u1ef9a-z]/i, ru: /[\u0400-\u04ff]/, ar: /[\u0600-\u06ff]/, fa: /[\u0600-\u06ff]/,
  fr: /[a-z\u00e0-\u00ff]/i, de: /[a-z\u00e4\u00f6\u00fc\u00df]/i,
};
const FORBIDDEN = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;
const JA_SIMP_CHARS = /[驻总广发门东乐让节开汉语书报纸们吗这那电时马鸟鱼龙车长]/;
const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];

const names = [];
for (const fn of fs.readdirSync("src/data/cities").filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join("src/data/cities", fn), "utf8"));
  for (const c of d.emergencyContacts || []) if (c.nameEn) names.push(c.nameEn);
}
const all = [...new Set(names)];
console.log(`unique nameEn sources: ${all.length}`);

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
  if (end !== -1) { try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fall through */ } }
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
  const langHint = lang === "ja"
    ? " Use proper JAPANESE kanji readings (e.g. 病院, 警察署, 消防署, 大使館, 総領事館, 庁). NEVER use Simplified Chinese characters or Simplified Chinese names like 驻/总/广/医院."
    : lang === "ko"
      ? " Use the standard Korean name; NEVER use Chinese characters or Hanja."
      : "";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following English names of emergency services, hospitals, police stations, embassies and consulates in China into ${TARGETS[lang]} for foreign visitors.
Use the standard, commonly used ${TARGETS[lang]} name for each institution; for Chinese institutions use their well-known ${TARGETS[lang]} name when one exists.${langHint}
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is the name translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Output must be fluent natural ${TARGETS[lang]} with NO English words, NO Chinese characters and NO Japanese kana.
- Keep phone numbers, "120"/"110"/"119" and brand names unchanged.`;
}
function validOutput(raw, lang, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  const trimmed = raw.trim();
  if (trimmed === source) return false;
  if (trimmed.toLowerCase() === source.toLowerCase()) return false;
  if (lang === "ja" && JA_SIMP_CHARS.test(trimmed)) return false;
  if (lang === "vi" || lang === "fr" || lang === "de") {
    if (FORBIDDEN.test(trimmed)) return false;
  } else {
    const chk = SCRIPT_CHECK[lang];
    if (chk && !chk.test(trimmed)) return false;
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
        if (validOutput(raw, lang, s)) { resultMap.set(s, raw.trim()); accepted += 1; }
        else newRemaining.push(s);
      });
      if (newRemaining.length < remaining.length) console.warn(`  partial: +${accepted}, ${newRemaining.length} remaining (attempt ${attempt})`);
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) { console.warn(`  retry ${attempt}: ${error?.message || error}`); }
    await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
  }
  return resultMap;
}

const out = { en: {} };
for (const s of all) out.en[s] = s;
for (const lang of LANGS) {
  if (onlyLang && lang !== onlyLang) continue;
  if (dryRun) { console.log(`[${lang}] would translate ${all.length}`); continue; }
  const map = new Map();
  for (let i = 0; i < all.length; i += BATCH_SIZE) {
    const chunk = all.slice(i, i + BATCH_SIZE);
    const chunkMap = await translateBatch(chunk, lang);
    for (const [k, v] of chunkMap) map.set(k, v);
    console.log(`  [${new Date().toLocaleTimeString("en-GB", { hour12: false })}] ${lang} ${Math.min(i + BATCH_SIZE, all.length)}/${all.length}`);
  }
  const obj = {};
  let missing = 0;
  for (const s of all) {
    const v = map.get(s);
    if (v) obj[s] = v; else { obj[s] = s; missing += 1; }
  }
  out[lang] = obj;
  console.log(`[${lang}] translated ${all.length - missing}, missing ${missing}`);
  await new Promise((r) => setTimeout(r, 400));
}

if (!dryRun) {
  const lines = [];
  lines.push("// Auto-generated by .audit/gen_emergency_names.mjs — do not edit by hand.");
  lines.push("// Localized names for emergency contacts, keyed by English source name, per language.");
  lines.push("export const EMERGENCY_NAMES_L10N: Record<string, Record<string, string>> = {");
  for (const lang of [...LANGS, "en"]) {
    lines.push(`  ${JSON.stringify(lang)}: {`);
    for (const s of all) {
      lines.push(`    ${JSON.stringify(s)}: ${JSON.stringify(out[lang][s])},`);
    }
    lines.push("  },");
  }
  lines.push("};");
  lines.push("");
  const outPath = "src/data/emergency/emergency-names-l10n.ts";
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`wrote ${outPath}`);
}
console.log("DONE");
