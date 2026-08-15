// Pass 3: translate the 15 remaining notes (lenient validation).
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const CACHE_PATH = ".audit/ja-translation-cache.json";

const isJa = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s);
const passThrough = (s) => /^[\s\d\-\+\(\)\.:：,，xXa-zA-Z%¥元/]+$/.test(s);

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const response = await fetch(`${HOST}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content;
}
function extractJson(content) {
  const cleaned = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No JSON");
  return JSON.parse(cleaned.slice(s, e + 1));
}
async function translateBatch(batch) {
  const lines = batch.map((t, i) => `- ${i} = "${String(t).replace(/"/g, '\\"').replace(/\n/g, " ")}"`).join("\n");
  const prompt = `Translate the following strings into natural Japanese for a Chinese travel website (ChinaConnect).
Rules:
- Output ONLY a single flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown.
- Translate EVERY value into natural Japanese.
- Keep phone numbers and digits EXACTLY (e.g. "+86 21 8011 2400", "63268823"). For "ACS: +86 21 8011 2400", translate "Tourist Police" style labels if present but keep the number.
- "For Australian citizens" -> "オーストラリア人向け" (same pattern for other nationalities).

${lines}`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key count mismatch");
      const out = batch.map((t, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0) throw new Error("bad value " + i);
        if (isJa(v) || passThrough(v)) return v;
        throw new Error("not japanese: " + JSON.stringify(v));
      });
      return out;
    } catch (e) {
      console.warn(`  retry ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw new Error("batch failed");
}
function writeJsonAtomic(fp, data) {
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, fp);
}

const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};
const targets = [
  "24-hour tourism complaints and emergency assistance",
  "ACS: +86 21 8011 2400",
  "Beach and water emergency rescue.",
  "Consumer rights protection and complaints.",
  "English support improving",
  "For Australian citizens",
  "For British citizens",
  "For Canadian citizens",
  "For French citizens",
  "For German citizens",
  "For Singapore citizens",
  "For South Korean citizens",
  "For U.S. citizens",
  "Top public hospital, ER available",
  "Tourist Police: 63268823",
];
const todo = targets.filter((t) => !cache[t]);
for (let start = 0; start < todo.length; start += 15) {
  const batch = todo.slice(start, start + 15);
  const translated = await translateBatch(batch);
  batch.forEach((t, i) => { cache[t] = translated[i]; });
  writeJsonAtomic(CACHE_PATH, cache);
  console.log("translated:", batch.map((t, i) => `${t.slice(0, 30)} -> ${translated[i]}`).join(" | "));
}

// Apply notes for all ja cities
const citiesDir = "src/data/cities";
const outDir = "src/data/cities-i18n/ja";
let fixed = 0;
for (const file of fs.readdirSync(citiesDir).filter((f) => f.endsWith(".json"))) {
  const slug = file.replace(".json", "");
  const jaPath = path.join(outDir, `${slug}.json`);
  if (!fs.existsSync(jaPath)) continue;
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, file), "utf8"));
  const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));
  let changed = false;
  const enEC = en.emergencyContacts || [];
  const jaEC = ja.emergencyContacts || [];
  enEC.forEach((c, i) => {
    if (!c || typeof c !== "object" || !jaEC[i] || typeof jaEC[i] !== "object") return;
    const t = c.notes;
    if (typeof t === "string" && t.trim() && cache[t.trim()]) {
      jaEC[i].notes = cache[t.trim()]; fixed += 1; changed = true;
    }
  });
  if (changed) writeJsonAtomic(jaPath, ja);
}
console.log("DONE, notes fixed:", fixed);
