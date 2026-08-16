import fs from "node:fs";
import { getTranslateProvider } from "../scripts/lib/translate-provider.mjs";

const p = getTranslateProvider();
const fixlist = JSON.parse(fs.readFileSync(".audit/_comp_fixlist2.json", "utf8"));

const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)",
};
const BATCH = 8;

function buildPrompt(items, lang) {
  const body = items.map((x, i) => `k${i}: ${JSON.stringify(x.en)}`).join("\n");
  return `Translate these short UI strings (payment methods, travel app labels, section headings) for a China travel website from English into ${TARGETS[lang]}.
The Japanese reference is a gold standard for meaning; produce the natural ${TARGETS[lang]} equivalent.
RULES:
- Keep placeholders like {count}, {city} unchanged.
- Keep brand/proper nouns unchanged: Alipay, WeChat, UnionPay, Visa, Mastercard, Apple Pay, Google Pay, Dianping, Meituan, Xiaohongshu, Michelin, Black Pearl, Changsha Tong Card, Wuhan Tong Card, Traveler's Checks.
- Output ONLY a JSON object {k0: "...", ...} with no markdown.
Input:
${body}`;
}

async function callChat(content) {
  const r = await fetch(p.baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + p.apiKey },
    body: JSON.stringify({ model: p.model, messages: [{ role: "user", content }], temperature: 0.2 }),
  });
  if (!r.ok) throw new Error("HTTP " + r.status + " " + (await r.text()).slice(0, 200));
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

function extractJson(content) {
  const m = content.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function valid(v, lang, src) {
  if (typeof v !== "string" || !v.trim()) return false;
  const CJK = /[\u3400-\u9fff]/;
  const KANA = /[\u3040-\u30ff]/;
  if (CJK.test(v) || KANA.test(v)) return false;
  if (lang === "ar" || lang === "fa") {
    const AR = /[\u0600-\u06ff]/;
    if (!AR.test(v)) return false;
    if (v === src) return false;
  }
  return true;
}

// group by lang
const byLang = {};
for (const f of fixlist) (byLang[f.lang] ||= []).push(f);

const results = {}; // key:lang -> new value
for (const lang of Object.keys(byLang)) {
  const items = byLang[lang];
  const uniqueEn = [...new Map(items.map((x) => [x.en, x])).values()];
  const map = new Map();
  for (let i = 0; i < uniqueEn.length; i += BATCH) {
    const chunk = uniqueEn.slice(i, i + BATCH);
    let out = null;
    for (let attempt = 1; attempt <= 4 && !out; attempt++) {
      try {
        const content = await callChat(buildPrompt(chunk, lang));
        out = extractJson(content);
      } catch (e) { console.warn(`[${lang}] retry ${attempt}: ${e.message}`); }
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
    if (!out) { console.error(`[${lang}] FAILED chunk ${i / BATCH}`); continue; }
    for (const [j, x] of chunk.entries()) {
      const v = out[`k${j}`];
      if (valid(v, lang, x.en)) map.set(x.en, v);
      else console.warn(`[${lang}] rejected: ${JSON.stringify(x.en)} -> ${JSON.stringify(v)}`);
    }
    console.log(`[${lang}] chunk ${i / BATCH + 1}/${Math.ceil(uniqueEn.length / BATCH)} ok ${map.size}`);
  }
  for (const f of items) {
    const v = map.get(f.en);
    if (v) results[`${f.key}\u0001${f.lang}`] = v;
  }
  console.log(`[${lang}] done ${map.size}/${uniqueEn.length}`);
}

fs.writeFileSync(".audit/_comp_fix_results2.json", JSON.stringify(results, null, 1), "utf8");
console.log("results written:", Object.keys(results).length);


