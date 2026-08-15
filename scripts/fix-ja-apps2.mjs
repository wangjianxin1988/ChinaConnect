// Re-translate descriptionJa (previous output was Chinese) -> proper Japanese with kana validation
import fs from "node:fs";

const KEY = process.env.DEEPSEEK_API_KEY;
const HOST = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
const MODEL = "deepseek-chat";
const FILE = "src/data/apps/app-recommendations.ts";
const STRING = '"(?:[^"\\\\]|\\\\.)*"';

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
const apps = [];
const idRe = /id:\s*"([^"]+)"/g;
let m;
while ((m = idRe.exec(txt))) {
  const id = m[1];
  const start = m.index;
  const end = txt.indexOf("\n  },", start);
  if (end === -1) break;
  const body = txt.slice(start, end + 5);
  const re = new RegExp(`descriptionEn:\\s*(${STRING})`);
  const mm = body.match(re);
  if (!mm) throw new Error("no descriptionEn for " + id);
  apps.push({ id, descEn: JSON.parse(mm[1]) });
}
console.log("apps:", apps.length);

const lines = apps.map((a, i) => `- ${i} = "${a.descEn.replace(/"/g, '\\"')}"`).join("\n");
const prompt = `You are a professional Japanese translator. Translate the following English app descriptions into natural, concise JAPANESE for a China travel guide website.
REQUIREMENTS:
- The output MUST be Japanese written with hiragana/katakana/kanji. It MUST NOT be Chinese.
- Keep app/brand names unchanged (WeChat, Alipay, DiDi, Trip.com, etc.).
- Output ONLY a flat JSON object with EXACTLY ${apps.length} keys ("0".."${apps.length - 1}"). No markdown.

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
      if (!/[\u3040-\u30ff]/.test(v)) throw new Error("no kana (likely Chinese): " + v.slice(0, 30));
      a.descJa = v;
    });
    break;
  } catch (e) {
    console.warn("retry", attempt, e.message);
    await new Promise((r) => setTimeout(r, 1000));
  }
}
if (!apps.every((a) => a.descJa)) throw new Error("incomplete");
apps.forEach((a) => console.log(`  ${a.id}: ${a.descJa.slice(0, 60)}`));

// replace descriptionJa values
let out = txt;
for (const a of apps) {
  const re = new RegExp(`(id:\\s*"${a.id}"[\\s\\S]*?descriptionJa:\\s*)(?:${STRING})`);
  const mm = out.match(re);
  if (!mm) throw new Error("no descriptionJa for " + a.id);
  const descJa = a.descJa.replace(/"/g, '\\"');
  out = out.replace(re, `${mm[1]}"${descJa}"`);
}
fs.writeFileSync(FILE, out, "utf8");
console.log("replaced descriptionJa values");
