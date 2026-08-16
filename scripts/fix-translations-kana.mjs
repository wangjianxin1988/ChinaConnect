// Fix Japanese/Chinese contamination in translations.ts UI dictionary.
// For each non-en/non-ja language block, translate values containing
// Japanese kana (all langs) or CJK han (non-zh langs) into the target
// language, using the configured translate provider.
// Usage: node scripts/fix-translations-kana.mjs [--lang=ko] [--dry-run]
import fs from "node:fs";
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
const LANGS = ["ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
// Exclude U+30FB (katakana middle dot) which is a common CJK separator, not kana.
const KANA_RE = /[\u3040-\u30fa\u30fc-\u30ff]/;
const HAN_RE = /[\u3400-\u9fff]/;
// Simplified-only chars to catch zh-TW simplified residue.
const SIMP_RE = /[门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电话样张专业乡历严丽举义气乐龙应学体备后产单实导对当从]/;

const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const path = "src/i18n/translations.ts";
let text = fs.readFileSync(path, "utf8");

// Locate language blocks: "\n  ko: {" or "\n  "zh-CN": {".
const BLOCK_RE = /\n(\s*)(["']?)([a-zA-Z-]{2,10})\2\s*:\s*\{/g;
const blocks = [];
for (const m of text.matchAll(BLOCK_RE)) {
  if (LANGS.includes(m[3]) || m[3] === "en" || m[3] === "ja") {
    blocks.push({ lang: m[3], start: m.index });
  }
}
blocks.sort((a, b) => a.start - b.start);
const blockEnd = (i) => (i + 1 < blocks.length ? blocks[i + 1].start : text.length);

function escapeTs(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function unescapeTs(s) { return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n"); }

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
  // Last resort: regex-extract k0..kN values from a malformed response.
  const out = {};
  const re = /"k(\d+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(cleaned))) out[`k${m[1]}`] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
  if (Object.keys(out).length > 0) return out;
  throw new Error("No closing JSON object");
}

function buildPrompt(values, lang) {
  const body = "{\n" + values.map((s, i) => `  "k${i}": "${escapeTs(s)}"`).join(",\n") + "\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following UI strings into ${TARGETS[lang]}.
They are labels, headings, tips and short descriptions for foreign visitors in China.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Keep brand names, numbers, prices, units, URLs, phone numbers and proper nouns unchanged (transliterate where needed).
- For zh-TW output Traditional Chinese only. For zh-CN output Simplified Chinese only.
${lang === "ja" ? "- Translate into natural Japanese; use kanji normally.\n" : ""}`;
}

function translateOne(batch, lang) {
  const prompt = buildPrompt(batch, lang);
  return callChat(prompt).then((content) => extractJson(content));
}

async function translateValues(values, lang) {
  const result = {};
  const remaining = [...values];
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && remaining.length > 0) {
    attempt += 1;
    try {
      const out = await translateOne(remaining, lang);
      const newRemaining = [];
      remaining.forEach((v, i) => {
        const raw = out[`k${i}`];
        if (typeof raw === "string" && raw.length > 0) result[v] = raw;
        else newRemaining.push(v);
      });
      if (newRemaining.length < remaining.length) console.warn(`  partial: +${remaining.length - newRemaining.length} accepted, ${newRemaining.length} remaining`);
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
  }
  for (const v of remaining) {
    try {
      const out = await translateOne([v], lang);
      if (typeof out?.k0 === "string" && out.k0.length > 0) result[v] = out.k0;
    } catch { /* keep untranslated for manual review */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return result;
}

let totalFixed = 0;
for (let bi = blocks.length - 1; bi >= 0; bi -= 1) {
  const { lang, start } = blocks[bi];
  if (lang === "en" || lang === "ja") continue;
  if (onlyLang && lang !== onlyLang) continue;
  const end = blockEnd(bi);
  let seg = text.slice(start, end);
  const isZh = lang === "zh-CN" || lang === "zh-TW";
  const isZhTW = lang === "zh-TW";

  // Collect contaminated values. Skip the dead "language" section.
  const VALUES_RE = /:\s*"((?:[^"\\]|\\.)*)"/g;
  const contaminated = [];
  const seen = new Set();
  for (const m of seg.matchAll(VALUES_RE)) {
    const raw = m[1];
    const v = unescapeTs(raw);
    if (!v) continue;
    if (isKeepableToken(v)) continue;
    const hasKana = KANA_RE.test(v);
    const hasHan = HAN_RE.test(v);
    const hasSimp = SIMP_RE.test(v);
    const bad = isZhTW ? (hasKana || hasSimp) : (isZh ? hasKana : (hasKana || hasHan));
    if (!bad) continue;
    if (!seen.has(v)) { seen.add(v); contaminated.push(v); }
  }
  console.log(`[${lang}] contaminated values: ${contaminated.length}`);
  if (contaminated.length === 0) continue;

  const translated = dryRun ? {} : await translateValues(contaminated, lang);
  if (!dryRun) {
    let fixed = 0;
    for (const oldV of contaminated) {
      const newV = translated[oldV];
      if (!newV || newV === oldV) continue;
      const oldEsc = escapeTs(oldV);
      const newEsc = escapeTs(newV);
      // Replace only property-value positions: ': "old"' within this block.
      const re = new RegExp(`(:\\s*"${oldEsc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}")`, "g");
      let cnt = 0;
      seg = seg.replace(re, () => { cnt += 1; return `: "${newEsc}"`; });
      fixed += cnt;
      totalFixed += cnt;
    }
    text = text.slice(0, start) + seg + text.slice(end);
    const tmp = `${path}.tmp`;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      try {
        fs.writeFileSync(tmp, text, "utf8");
        fs.renameSync(tmp, path);
        break;
      } catch (error) {
        if (attempt === 6) throw error;
        console.warn(`  write retry ${attempt}: ${error?.code || error}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    console.log(`[${lang}] applied ${fixed} value replacements`);
  }
}
console.log(`done. total replacements: ${totalFixed}${dryRun ? " (dry run)" : ""}`);
