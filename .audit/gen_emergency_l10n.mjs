// Generate src/data/emergency/emergency-l10n.ts from the English source strings.
// Usage: node .audit/gen_emergency_l10n.mjs [--lang=ja] [--dry-run]
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

const SOURCE = {
  // --- EmergencyCard phrases (30) ---
  phrases: [
    "I need an ambulance", "I am sick / I feel unwell", "I need a doctor", "Where is the hospital?",
    "Please call an ambulance", "I have a headache", "I have a stomachache", "I am allergic to...",
    "Help!", "Call the police!", "I have been robbed", "I lost my passport", "Stop! Thief!",
    "I have been assaulted", "There is a fire", "I need help", "Where is the embassy?",
    "How do I get to the hospital?", "Turn left", "Turn right", "Go straight", "Where is the police station?",
    "I do not understand", "Please speak slowly", "Do you speak English?", "Please help me",
    "I need a translator", "Where is the restroom?", "Please call my family", "I am lost",
  ],
  // --- UI strings ---
  ui: [
    "Emergency Translation Card", "Tap to hear pronunciation", "20+ essential phrases for emergencies",
    "Show Pinyin", "Hide Pinyin", "Works offline - phrases are cached. Tap any phrase to hear pronunciation.",
    "Hear Chinese pronunciation", "Hear English pronunciation",
    "All", "Medical", "Police", "Directions", "Basic",
    "Police", "Ambulance", "Fire", "Traffic",
    "Share your location with emergency services", "Get My Location", "Refresh Location",
    "Latitude", "Longitude", "Accuracy", "Copy Location", "Copied!", "Open in Maps", "Searching...",
    "Find Nearby Services", "Nearby Services",
    "Geolocation is not supported by your browser",
    "Location permission denied. Please enable location access in your browser settings.",
    "Location information is currently unavailable.",
    "Location request timed out. Please try again.",
    "An unknown error occurred while getting your location.",
    "Error:", "No nearby services found.", "Getting location...", "GPS Location",
    "This feature requires internet. Download offline maps for better preparedness.",
    "Embassy & Consulate Locator", "Find your embassy for emergency assistance", "Search country name...",
    "Address", "Phone", "Website", "Call", "No embassies found matching",
    "Emergency passport", "Prisoner welfare", "Notarial services", "Emergency travel documents",
    "Translation services", "Travel advice", "Legal assistance", "Emergency aid",
    "Emergency assistance", "Consular assistance", "Available Services", "Call Now", "Close",
    "No embassies found matching", "Emergency Contacts", "Add Contact",
    "No emergency contacts saved", 'Tap "+ Add" to save important contacts', "Primary", "Call", "Remove",
    "Add your hotel or tour guide for quick access during emergencies.",
    "Save your emergency contacts here", "Cancel", "+ Add", "Name", "Contact name", "Phone number",
    "Relationship", "Save Contact", "No contacts saved yet", "Please enter a name", "Please enter a phone number",
    "Family", "Spouse", "Parent", "Friend", "Colleague", "Hotel", "Tour Guide", "Other",
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan",
    "South Korea", "Singapore", "Netherlands", "Italy", "Spain",
  ],
  guideCard: [
    "Business Invitation Letter Templates",
    "Download ready-to-use invitation letters for visa applications, trade visits, and business meetings. Fill in the fields and download as PDF or print.",
    "• Include the company registration number (unified social credit code) — required by most embassies",
    "• Have the letter signed by an authorized person with company seal",
    "• Both English and Chinese versions are recommended for the Chinese embassy",
    "• Keep a scanned PDF copy and original for your visa interview",
    "PDF generation failed. Please try again.",
    "Please allow popups to print",
  ],
};

const args = process.argv.slice(2);
const onlyLang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];

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
  throw new Error("No closing JSON object");
}

function escapeJson(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }

function buildPrompt(values, lang) {
  const body = "{\n" + values.map((s, i) => `  "k${i}": "${escapeJson(s)}"`).join(",\n") + "\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following short English travel-safety phrases and UI labels into ${TARGETS[lang]} for foreign visitors to China.
Keep phone numbers, brand names and the "..." literal unchanged. "Pinyin" stays as "Pinyin" (romanization system name).
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${values.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Output must be fluent natural ${TARGETS[lang]} with NO English words, NO Chinese characters and NO Japanese kana.
- Keep "SOS", "Pinyin", "GPS", "Alipay", "WeChat" and URLs unchanged.
- For country/place names use the standard ${TARGETS[lang]} name.`;
}

function validOutput(raw, lang, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  const trimmed = raw.trim();
  if (trimmed === source) return false;
  if (trimmed.toLowerCase() === source.toLowerCase()) return false;
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
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (validOutput(raw, lang, s)) resultMap.set(s, raw.trim());
        else newRemaining.push(s);
      });
      if (newRemaining.length < remaining.length) console.warn(`  partial: +${remaining.length - newRemaining.length}, ${newRemaining.length} remaining (attempt ${attempt})`);
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      console.warn(`  retry ${attempt}: ${error?.message || error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
  }
  return resultMap;
}

const all = [...new Set([...SOURCE.phrases, ...SOURCE.ui])];
const allGuide = [...new Set([...SOURCE.guideCard])];
console.log(`unique source strings: ${all.length}`);

const out = { en: {} };
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
  await new Promise((r) => setTimeout(r, 500));
}

if (!dryRun) {
  const outGuide = { en: {} };
  for (const lang of LANGS) {
    const map = new Map();
    for (let i = 0; i < allGuide.length; i += BATCH_SIZE) {
      const chunk = allGuide.slice(i, i + BATCH_SIZE);
      const chunkMap = await translateBatch(chunk, lang);
      for (const [k, v] of chunkMap) map.set(k, v);
      console.log(`  guide [${lang}] ${Math.min(i + BATCH_SIZE, allGuide.length)}/${allGuide.length}`);
    }
    const obj = {};
    let missing = 0;
    for (const s of allGuide) {
      const v = map.get(s);
      if (v) obj[s] = v; else { obj[s] = s; missing += 1; }
    }
    outGuide[lang] = obj;
    console.log(`[guide:${lang}] translated ${allGuide.length - missing}, missing ${missing}`);
    await new Promise((r) => setTimeout(r, 500));
  }
  for (const s of allGuide) outGuide.en[s] = s;
  const lines2 = [];
  lines2.push("// Auto-generated by .audit/gen_emergency_l10n.mjs — do not edit by hand.");
  lines2.push("export const GUIDE_CARD_L10N: Record<string, Record<string, string>> = {");
  for (const lang of [...LANGS, "en"]) {
    lines2.push(`  ${JSON.stringify(lang)}: {`);
    for (const s of allGuide) {
      lines2.push(`    ${JSON.stringify(s)}: ${JSON.stringify(outGuide[lang][s])},`);
    }
    lines2.push("  },");
  }
  lines2.push("};");
  lines2.push("");
  fs.writeFileSync("src/data/guide/guide-card-l10n.ts", lines2.join("\n"), "utf8");
  console.log("wrote src/data/guide/guide-card-l10n.ts");
}

if (!dryRun) {
  // en is identity
  for (const s of all) out.en[s] = s;
  const lines = [];
  lines.push("// Auto-generated by .audit/gen_emergency_l10n.mjs — do not edit by hand.");
  lines.push("// Emergency page component strings, keyed by English source, per language.");
  lines.push("export const EMERGENCY_L10N: Record<string, Record<string, string>> = {");
  for (const lang of [...LANGS, "en"]) {
    lines.push(`  ${JSON.stringify(lang)}: {`);
    for (const s of all) {
      lines.push(`    ${JSON.stringify(s)}: ${JSON.stringify(out[lang][s])},`);
    }
    lines.push("  },");
  }
  lines.push("};");
  lines.push("");
  const outPath = "src/data/emergency/emergency-l10n.ts";
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`wrote ${outPath}`);
}
console.log("DONE");