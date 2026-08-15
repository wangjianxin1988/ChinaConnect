// Translate 22 app descriptions to Japanese + patch app-recommendations.ts
import fs from "node:fs";

const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const FILE = "src/data/apps/app-recommendations.ts";

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

const txt = fs.readFileSync(FILE, "utf8");
const STRING = '"(?:[^"\\\\]|\\\\.)*"';
// find app blocks: id line up to next "  },\n"
const blocks = [];
const idRe = /id:\s*"([^"]+)"/g;
let m;
while ((m = idRe.exec(txt))) {
  const id = m[1];
  const start = m.index;
  const end = txt.indexOf("\n  },", start);
  if (end === -1) break;
  blocks.push({ id, body: txt.slice(start, end + 5) });
}
console.log("blocks:", blocks.length);
const apps = [];
for (const b of blocks) {
  const re = new RegExp(`descriptionEn:\\s*(${STRING})`);
  const mm = b.body.match(re);
  if (!mm) throw new Error("no descriptionEn for " + b.id);
  apps.push({ id: b.id, descEn: JSON.parse(mm[1]) });
}

const lines = apps.map((a, i) => `- ${i} = "${a.descEn.replace(/"/g, '\\"')}"`).join("\n");
const prompt = `Translate the following app descriptions into natural, concise Japanese for a China travel app guide (ChinaConnect).
Output ONLY a flat JSON object with EXACTLY ${apps.length} keys ("0".."${apps.length - 1}"). No markdown, no commentary.
Keep app/brand names (WeChat, Alipay, DiDi, Trip.com, Baidu, Amap, Meituan, etc.) and proper nouns unchanged. Keep it natural and short.

${lines}`;
let content = "";
for (let attempt = 1; attempt <= 4; attempt += 1) {
  try {
    content = await callChat(prompt);
    const result = extractJson(content);
    if (Object.keys(result).length !== apps.length) throw new Error("key mismatch");
    apps.forEach((a, i) => {
      const v = result[String(i)];
      if (typeof v !== "string" || v.length < 5) throw new Error("bad value " + i);
      a.descJa = v;
    });
    break;
  } catch (e) {
    console.warn("retry", attempt, e.message);
    await new Promise((r) => setTimeout(r, 1000));
  }
}
if (!apps.every((a) => a.descJa)) throw new Error("translation incomplete");
apps.forEach((a) => console.log(`  ${a.id}: ${a.descJa.slice(0, 60)}`));

// patch: add interface field + insert descriptionJa after descriptionEn string
let out = txt;
// 1. interface
out = out.replace(
  '  descriptionEn: string;',
  '  descriptionEn: string;\n  /** Japanese description */\n  descriptionJa?: string;'
);
// 2. per app: after descriptionEn value line
for (const a of apps) {
  const re = new RegExp(`(id:\\s*"${a.id}"[\\s\\S]*?descriptionEn:\\s*${STRING})`);
  const mm = out.match(re);
  if (!mm) throw new Error("patch pattern not found for " + a.id);
  const descJa = a.descJa.replace(/"/g, '\\"');
  out = out.replace(re, `${mm[1]},\n    descriptionJa: "${descJa}"`);
}
fs.writeFileSync(FILE, out, "utf8");
console.log("patched", FILE);
