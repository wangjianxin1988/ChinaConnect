import fs from "node:fs";
const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 5;
const CACHE_PATH = ".audit/ja-translation-cache.json";
const LOC_PATH = ".audit/cn-sentence-locations.json";

const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
const locations = JSON.parse(fs.readFileSync(LOC_PATH, "utf8"));
const unique = Object.keys(locations);
const toTranslate = unique.filter((t) => !cache[t]);
console.log("unique:", unique.length, "cached:", unique.length - toTranslate.length, "to translate:", toTranslate.length);

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 8000 };
  const response = await fetch(`${HOST}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content;
}
function extractJson(content) {
  const cleaned = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1));
}
async function translateBatch(batch) {
  const lines = batch.map((text, i) => `${i} = ${JSON.stringify(text)}`).join("\n");
  const prompt = `You are translating Simplified Chinese strings (tips/descriptions for attractions in a Japan-language China travel website) into natural Japanese for Japanese tourists.
Rules:
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0", "1", ...). No markdown, no commentary.
- Natural, concise Japanese travel-tip style. Use polite plain form (e.g. 〜できます、〜がおすすめ、〜が最適).
- Keep proper nouns: place names, dynasties (唐代 -> 唐代), people (辛追夫人 -> 辛追夫人), numbers and units (1000多年 -> 1000年以上, 海拔3520米 -> 標高3520m).
- "了解〜文化。" -> "〜の文化を学べます。"; "品尝〜小吃。" -> "〜の軽食を味わえます。"; "拍照打卡。" -> "写真映えスポット。"; "人少安静。" -> "人が少なく静かです。"; "夏季最佳。" -> "夏がベストシーズン。"
- If a string is already natural Japanese, return it unchanged.

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const content = await callChat(prompt);
      const parsed = extractJson(content);
      if (Object.keys(parsed).length !== batch.length) throw new Error(`Expected ${batch.length}, got ${Object.keys(parsed).length}`);
      return parsed;
    } catch (e) {
      if (attempt === RETRY_ATTEMPTS) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error("unreachable");
}

let translated = 0, saved = 0;
for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
  const batch = toTranslate.slice(i, i + BATCH_SIZE);
  const out = await translateBatch(batch);
  for (const [k, v] of Object.entries(out)) {
    const orig = batch[Number(k)];
    if (typeof v === "string" && v && v !== orig) { cache[orig] = v; translated++; }
  }
  saved += batch.length;
  if (saved % 150 < BATCH_SIZE) console.log("progress:", saved, "/", toTranslate.length);
}
fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
console.log("translated:", translated);

// Apply to JSONs
const dir = "src/data/cities-i18n/ja";
const filesChanged = new Set();
let replaced = 0, missed = 0;
for (const [text, locs] of Object.entries(locations)) {
  const ja = cache[text];
  if (!ja || ja === text) { missed++; continue; }
  for (const { file, path } of locs) {
    const p = dir + "/" + file;
    const data = JSON.parse(fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n"));
    const segs = path.match(/[^.\[\]]+|\[\d+\]/g) || [];
    let node = data;
    let ok = true;
    for (const seg of segs) {
      if (/^\[\d+\]$/.test(seg)) { const i = Number(seg.slice(1, -1)); if (!Array.isArray(node) || !(i in node)) { ok = false; break; } node = node[i]; }
      else { if (node && typeof node === "object" && seg in node) node = node[seg]; else { ok = false; break; } }
    }
    if (!ok || node !== text) { missed++; continue; }
    const parentPath = segs.slice(0, -1);
    const lastSeg = segs[segs.length - 1];
    let parent = data;
    for (const seg of parentPath) {
      if (/^\[\d+\]$/.test(seg)) parent = parent[Number(seg.slice(1, -1))];
      else parent = parent[seg];
    }
    if (/^\[\d+\]$/.test(lastSeg)) parent[Number(lastSeg.slice(1, -1))] = ja;
    else parent[lastSeg] = ja;
    const tmp = p + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, p);
    filesChanged.add(file);
    replaced++;
  }
}
console.log("replaced:", replaced, "missed:", missed, "files changed:", filesChanged.size);
