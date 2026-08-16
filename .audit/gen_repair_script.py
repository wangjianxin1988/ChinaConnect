# -*- coding: utf-8 -*-
"""Generate scripts/fix-city-cjk-residue.mjs"""
simplified = ("门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电话样张专业乡历严丽举义气"
"让办热场观欢还边里语饭馆师帅币员实宝宫导游览现环线级纪纬综编美习联职听视证评认课讲议记设访请谢贵"
"买卖货质赚轻输转辆辅载辈辉处备复园围图团圆块声壶坛坝奋夸奖奥夺亩优伤价份众伪体余佣侣侦侧侨俭债值"
"倾储儿兑党兰关兴养兽内写军农冯冲决况凄准净凉减凑凤凯击凿划刘则刚创删别剂剑剧勋劲务劳势匀医华协单"
"卖卢卫厂厅厉压厌厕厘卤县变叠号叹吗吨启吴吵呐呜呢响哑哗哟喷唤啸嗓嗯嗨嘿噢嚷圣场坏坚坞坟坠垄垒垦垫"
"垮墙壁艳艺节苏芦苍药莲萝营蓝藏处备复庆广庙价亿亿码纸疯网网窝窝")
# dedupe preserving order
seen=set(); out=[]
for ch in simplified:
    if ch not in seen:
        seen.add(ch); out.append(ch)
simplified = "".join(out)
print("simplified set size:", len(simplified))

script = r'''// Fix city i18n data CJK residue: translate fields that still contain Chinese.
// Usage:
//   node scripts/fix-city-cjk-residue.mjs --lang=ko
//   node scripts/fix-city-cjk-residue.mjs --lang=ja --dry-run
//   node scripts/fix-city-cjk-residue.mjs --lang=ko beijing shanghai
import fs from "node:fs";
import path from "node:path";
import { getTranslateProvider } from "./lib/translate-provider.mjs";
import {
  isTranslated,
  maskSensitiveTerms,
  restoreMaskedTerms,
  toApiKey,
} from "./lib/translation-keys.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
console.log(`Provider: ${HOST} | model: ${MODEL}`);
const BATCH_SIZE = 15;
const RETRY_ATTEMPTS = 4;
const TARGETS = {
  ja: "Japanese", ko: "Korean", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai", vi: "Vietnamese", ru: "Russian", fr: "French", de: "German",
  ar: "Modern Standard Arabic", fa: "Modern Persian (Farsi)", en: "English",
};
const CJK = /[\u3400-\u9fff]/;
const SCRIPTS = {
  ja: /[\u3040-\u30ff]/,
  ko: /[\uac00-\ud7af]/,
  th: /[\u0e00-\u0e7f]/,
  ru: /[\u0400-\u04ff]/,
  ar: /[\u0600-\u06ff]/,
  fa: /[\u0600-\u06ff]/,
  "zh-CN": /[\u3400-\u9fff]/,
  "zh-TW": /[\u3400-\u9fff]/,
  fr: /[a-zA-Z\u00c0-\u00ff\u0152\u0153]/,
  de: /[a-zA-Z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u1e9e]/,
  vi: /[a-zA-Z\u00c0-\u1ef9]/,
};
const SIMPLIFIED_ONLY = new Set("__SIMPLIFIED__");
const SKIP_LEAF = new Set(["name", "nameEn", "id", "slug", "image", "imageUrl", "coverImage", "phone", "coordinates", "icon", "lat", "lng"]);

function isResidue(value, lang) {
  if (typeof value !== "string" || !CJK.test(value)) return false;
  if (lang === "zh-CN" || lang === "zh-TW") return false;
  if (lang === "ja") {
    // ja: simplified-Chinese-only chars mean Chinese residue; kana means it is Japanese.
    if (SCRIPTS.ja.test(value)) return false;
    for (const ch of value) if (SIMPLIFIED_ONLY.has(ch)) return true;
    return false;
  }
  // non-zh: CJK present but no target script => untranslated Chinese residue
  return !(SCRIPTS[lang]?.test(value) ?? false);
}

function collectResidue(city, lang) {
  const out = [];
  (function walk(o, path) {
    if (Array.isArray(o)) { o.forEach((v, i) => walk(v, path + `[${i}]`)); return; }
    if (o && typeof o === "object") {
      for (const k of Object.keys(o)) walk(o[k], path ? path + "/" + k : k);
      return;
    }
    const leaf = path.split("/").pop() || "";
    if (SKIP_LEAF.has(leaf)) return;
    if (isResidue(o, lang)) out.push({ path, value: String(o) });
  })(city, "");
  return out;
}

function applyPath(city, path, value) {
  const parts = path.split("/");
  let cur = city;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const idx = parseInt(p, 10);
    cur = Number.isNaN(idx) ? cur[p] : cur[idx];
  }
  const last = parts[parts.length - 1];
  const idx = parseInt(last, 10);
  if (!Number.isNaN(idx) && Array.isArray(cur)) cur[idx] = value;
  else cur[last] = value;
}

function writeJson(filePath, data) {
  const tmp = `${filePath}.${process.pid}.tmp`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8"); fs.renameSync(tmp, filePath); return; }
    catch (e) { if (attempt === 3) throw e; console.warn("  write retry", attempt, e?.code); }
  }
}

async function callChat(prompt) {
  const body = { model: MODEL, temperature: 0.2, max_tokens: 8000,
    messages: [{ role: "user", content: prompt }] };
  const resp = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Connection: "close" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return (await resp.json()).choices?.[0]?.message?.content;
}

function extractJson(content) {
  let s = content.trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  let depth = 0, start = -1, end = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") { if (start === -1) start = i; depth++; }
    else if (s[i] === "}") { depth--; if (depth === 0 && start !== -1) { end = i; break; } }
  }
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(s.slice(start, end + 1));
}

async function translateFields(fields, lang) {
  const keys = Object.keys(fields);
  if (!keys.length) return {};
  const masks = new Map();
  const lines = keys.map((k) => {
    const ak = toApiKey(k);
    const m = maskSensitiveTerms(String(fields[k]));
    masks.set(ak, m.replacements);
    return `- ${ak} = "${m.text.replace(/"/g, '\\"').replace(/\n/g, " ")}"`;
  }).join("\n");
  const target = TARGETS[lang];
  const extra = lang === "ja" ? " Output natural Japanese; NEVER use Simplified Chinese characters (use Japanese kanji, kana)." : " Output MUST be in " + target + " and MUST NOT contain any Chinese characters.";
  const prompt = `Translate the following strings (mostly Chinese text) into ${target} for ChinaConnect, a Chinese travel website.
Rules:
- Output ONLY a single flat JSON object with EXACTLY ${keys.length} keys.
- Keys are LITERAL underscore-delimited strings. Never parse them, never create nested objects.
- Keep proper nouns, numbers, prices, times, phone numbers, and currency symbols unchanged.
- No markdown, no commentary, no extra keys.${extra}

${lines}`;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const content = await callChat(prompt);
      const result = extractJson(content);
      const exact = Object.keys(result).length === keys.length;
      const ok = exact && keys.every((k) => {
        const ak = toApiKey(k);
        const v = restoreMaskedTerms(result[ak], masks.get(ak));
        if (typeof v !== "string" || !v) return false;
        if (lang === "ja") {
          if (!SCRIPTS.ja.test(v)) return false;
          for (const ch of v) if (SIMPLIFIED_ONLY.has(ch)) return false;
          return true;
        }
        return isTranslated(v, lang, fields[k], (masks.get(ak)?.size || 0) > 0);
      });
      if (!ok) throw new Error("Incomplete translation response");
      return Object.fromEntries(keys.map((k) => [toApiKey(k), restoreMaskedTerms(result[toApiKey(k)], masks.get(toApiKey(k)))]));
    } catch (e) { console.warn(`  retry ${attempt}: ${e?.message || e}`); }
    await new Promise((r) => setTimeout(r, 1000 * attempt * attempt));
  }
  // fallback: retry one by one
  const out = {};
  for (const k of keys) {
    try { Object.assign(out, await translateFields({ [k]: fields[k] }, lang)); } catch { console.warn("  gave up:", k); }
  }
  return out;
}

const args = process.argv.slice(2);
const lang = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const cities = args.filter((a) => !a.startsWith("--") && a !== lang);
if (!lang || !TARGETS[lang]) { console.error("need --lang=xx (ja/ko/th/vi/ru/fr/de/ar/fa)"); process.exit(1); }
const cityList = cities.length ? cities : fs.readdirSync("src/data/cities").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
let totalFields = 0, totalCities = 0;
for (const slug of cityList) {
  const file = path.join("src/data/cities-i18n", lang, slug + ".json");
  if (!fs.existsSync(file)) { console.log("SKIP", slug, "(no i18n file)"); continue; }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const residue = collectResidue(data, lang);
  if (!residue.length) { console.log("CLEAN", slug); continue; }
  totalCities++;
  console.log(`--- ${slug}: ${residue.length} residue fields`);
  if (dryRun) { residue.slice(0, 8).forEach((r) => console.log("   ", r.path, "=>", r.value.slice(0, 60))); totalFields += residue.length; continue; }
  const fields = Object.fromEntries(residue.map((r) => [r.path, r.value]));
  const translated = {};
  for (let i = 0; i < Object.keys(fields).length; i += BATCH_SIZE) {
    const chunk = Object.fromEntries(Object.entries(fields).slice(i, i + BATCH_SIZE));
    Object.assign(translated, await translateFields(chunk, lang));
  }
  for (const r of residue) {
    const v = translated[r.path];
    if (typeof v === "string" && v && v !== r.value) applyPath(data, r.path, v);
    else console.warn("  unchanged:", r.path);
  }
  writeJson(file, data);
  totalFields += Object.keys(translated).length;
  console.log(`  saved ${slug} (${Object.keys(translated)} translated)`);
}
console.log(`\nDONE lang=${lang} cities=${totalCities} fields=${totalFields} dry=${dryRun}`);
'''.replace("__SIMPLIFIED__", simplified)
io.open(r"scripts/fix-city-cjk-residue.mjs", "w", encoding="utf-8", newline="\n").write(script)
print("written scripts/fix-city-cjk-residue.mjs", len(script))
