// Fix dirty nameEn values in content-ja.json via DeepSeek, so future builds don't regress.
import fs from "node:fs";
import { simplifiedCount } from "./ja-residue.mjs";

const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const BATCH_SIZE = 15;

const trPath = "content-ja.json";
const tr = JSON.parse(fs.readFileSync(trPath, "utf8"));
const dirtyKeys = Object.keys(tr).filter(k => k.includes("nameEn") && typeof tr[k] === "string" && simplifiedCount(tr[k]) >= 1);
console.log("dirty nameEn keys:", dirtyKeys.length);
const unique = [...new Set(dirtyKeys.map(k => tr[k]))];
console.log("unique dirty values:", unique.length);

const CACHE = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
const needs = unique.filter(t => !CACHE[t] || CACHE[t] === t || simplifiedCount(CACHE[t]) >= 1);
console.log("to translate:", needs.length);

async function callChat(prompt) {
  const res = await fetch(`${HOST}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2, max_tokens: 4000 }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + (await res.text()).slice(0, 300));
  return (await res.json()).choices?.[0]?.message?.content;
}
function extractJson(content) {
  const c = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no json");
  return JSON.parse(c.slice(s, e + 1));
}
function writeJsonAtomic(fp, data) {
  const tmp = `${fp}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, fp);
}

for (let i = 0; i < needs.length; i += BATCH_SIZE) {
  const batch = needs.slice(i, i + BATCH_SIZE);
  const lines = batch.map((t, j) => `- ${j} = "${String(t).replace(/"/g, '\\"')}"`).join("\n");
  const prompt = `These are Chinese/partially-Chinese place, restaurant, and hotel names from the Japanese version of a China travel site. Convert each into a natural Japanese-readable name.
Rules:
- Use Japanese kanji forms (鱼→魚, 锅→鍋, 门→門, 龙→竜/龍, 东→東, 国→国 is same, 长→長, 乐→楽, 岭→嶺, 岛→島, 湾→湾 same, 滨→浜, 兰→蘭, 里→里 same, 汇→匯, 庙→廟, 汤→湯, 铁→鉄, 边→辺, 场→場, 馆→館, 楼→楼 same, 园→園, 饭→飯, 面→麺, 鸡→鶏, 鸭→鴨, 虾→蝦, 鱼→魚, 饺→餃, 药→薬, 阳→陽, 钟→鐘, 观→観, 台→台 same, 圣→聖, 卫→衛, 湾→湾, 门→門, 车→車, 云→雲, 汉→漢, 汇→匯, 荣→栄, 华→華).
- Keep brand names (e.g., Novotel, Hilton, Shangri-La, Home Inn) as-is; translate only the Chinese portion naturally.
- For dish names, keep the Chinese name in Japanese kanji and add the Japanese dish name if helpful.
- Keep numbers, prices, and Latin proper nouns unchanged.
- Output ONLY a flat JSON object with EXACTLY ${batch.length} keys ("0","1",...). No markdown.
${lines}`;
  let ok = false;
  for (let a = 1; a <= 5 && !ok; a++) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      if (Object.keys(result).length !== batch.length) throw new Error("count mismatch");
      batch.forEach((t, j) => {
        const v = result[String(j)];
        if (typeof v !== "string" || !v.length) throw new Error("bad value " + j);
        CACHE[t] = v;
      });
      ok = true;
    } catch (e) {
      console.warn("  retry " + a + ": " + e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  if (!ok) console.error("batch FAILED at " + i);
  if (ok && ((i / BATCH_SIZE + 1) % 5 === 0 || i + BATCH_SIZE >= needs.length)) {
    writeJsonAtomic(".audit/ja-translation-cache.json", CACHE);
    console.log("progress:", i + batch.length, "/", needs.length);
  }
  await new Promise(r => setTimeout(r, 120));
}
writeJsonAtomic(".audit/ja-translation-cache.json", CACHE);
// apply to tr
let applied = 0;
for (const k of dirtyKeys) {
  const v = CACHE[tr[k]];
  if (typeof v === "string" && v !== tr[k] && simplifiedCount(v) === 0) { tr[k] = v; applied++; }
}
writeJsonAtomic(trPath, tr);
console.log("applied to content-ja.json:", applied);


