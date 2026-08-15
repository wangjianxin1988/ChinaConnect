// Pass 4: translate transport.arrival/departure frequency for ja + fix '?' bullets in astro.
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const CACHE_PATH = ".audit/ja-translation-cache.json";
const isJa = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s);

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
  const prompt = `Translate the following strings into natural Japanese (ChinaConnect travel site). Output ONLY a flat JSON object with EXACTLY ${batch.length} keys "0".."${batch.length - 1}". No markdown. Keep place names, numbers unchanged.
${lines}`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("key mismatch");
      const out = batch.map((t, i) => {
        const v = result[String(i)];
        if (typeof v !== "string" || v.length === 0 || !isJa(v)) throw new Error("bad " + i + ": " + JSON.stringify(v));
        return v;
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

// collect unique frequency strings
const citiesDir = "src/data/cities";
const outDir = "src/data/cities-i18n/ja";
const unique = new Set();
for (const file of fs.readdirSync(citiesDir).filter((f) => f.endsWith(".json"))) {
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, file), "utf8"));
  for (const sec of ["arrival", "departure"]) {
    for (const t of (en.transport?.[sec] || []) || []) {
      if (t?.frequency && typeof t.frequency === "string" && !cache[t.frequency.trim()]) unique.add(t.frequency.trim());
    }
  }
}
const todo = [...unique];
console.log("unique frequency to translate:", todo.length);
for (let start = 0; start < todo.length; start += 15) {
  const batch = todo.slice(start, start + 15);
  const tr = await translateBatch(batch);
  batch.forEach((t, i) => { cache[t] = tr[i]; });
  writeJsonAtomic(CACHE_PATH, cache);
  console.log("  " + batch.map((t, i) => `${t.slice(0, 25)} -> ${tr[i].slice(0, 25)}`).join(" | "));
}

// apply
let fixed = 0;
for (const file of fs.readdirSync(citiesDir).filter((f) => f.endsWith(".json"))) {
  const slug = file.replace(".json", "");
  const jaPath = path.join(outDir, `${slug}.json`);
  if (!fs.existsSync(jaPath)) continue;
  const en = JSON.parse(fs.readFileSync(path.join(citiesDir, file), "utf8"));
  const ja = JSON.parse(fs.readFileSync(jaPath, "utf8"));
  let changed = false;
  for (const sec of ["arrival", "departure"]) {
    const enList = en.transport?.[sec] || [];
    const jaList = ja.transport?.[sec] || [];
    enList.forEach((t, i) => {
      if (t?.frequency && typeof t.frequency === "string" && jaList[i] && cache[t.frequency.trim()]) {
        if (jaList[i].frequency !== cache[t.frequency.trim()]) {
          jaList[i].frequency = cache[t.frequency.trim()]; fixed += 1; changed = true;
        }
      }
    });
  }
  if (changed) writeJsonAtomic(jaPath, ja);
}
console.log("frequency fixed:", fixed);

// fix '?' bullets in astro
const astroPath = "src/pages/[lang]/city/[slug].astro";
let astro = fs.readFileSync(astroPath, "utf8");
const before = (astro.match(/<span class="text-(?:blue|green|orange|purple)-500">\?<\/span>/g) || []).length;
astro = astro.replace(/<span class="text-(blue|green|orange|purple)-500">\?<\/span>/g, '<span class="text-$1-500">•</span>');
fs.writeFileSync(astroPath, astro, "utf8");
console.log("astro bullets replaced:", before);
