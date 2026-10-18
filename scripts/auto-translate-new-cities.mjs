// Translate newly added cities to all 11 non-English languages.
// Usage:
//   node scripts/auto-translate-new-cities.mjs                # check & translate new
//   node scripts/auto-translate-new-cities.mjs beijing shanghai  # specific cities
//
// This is invoked by the prebuild hook to ensure no city is missing translations.
import fs from 'fs';
import path from 'path';
// 2026-08-31 信哥要求:翻译全部切到 DeepSeek（原 MiniMax key 已失效 HTTP 401）
// getTranslateProvider() 按 TRANSLATE_PROVIDER > DEEPSEEK_API_KEY > DASHSCOPE > MiniMax 优先级选 provider
import { getTranslateProvider } from './lib/translate-provider.mjs';

try { process.loadEnvFile(); } catch (e) { if (e?.code !== 'ENOENT') throw e; }
const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();

const LANGS = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const TARGETS = {
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai",
  vi: "Vietnamese",
  ru: "Russian",
  fr: "French",
  de: "German",
  ar: "Modern Standard Arabic",
  fa: "Modern Persian (Farsi)",
};

const args = process.argv.slice(2);
const specific = args.length > 0 ? args : null;

function getTranslatableFields(city) {
  const fields = {};
  if (city.description) fields['description'] = city.description;
  if (Array.isArray(city.highlights)) {
    city.highlights.forEach((h, i) => { if (h) fields['highlights.' + i] = h; });
  }
  if (city.climate) {
    if (city.climate.tips) fields['climate.tips'] = city.climate.tips;
    if (city.climate.type) fields['climate.type'] = city.climate.type;
  }
  if (Array.isArray(city.culturalTips)) {
    city.culturalTips.forEach((t, i) => {
      if (typeof t === 'object' && t !== null) {
        if (t.title) fields['culturalTip.' + i + '.title'] = t.title;
        if (t.content) fields['culturalTip.' + i + '.content'] = t.content;
      } else if (typeof t === 'string' && t) {
        // 2026-10-18: some cities store culturalTips as plain strings (beijing uses
        // objects with title/content). Without this branch those strings never translate.
        fields['culturalTipStr.' + i] = t;
      }
    });
  }
  if (Array.isArray(city.attractions)) {
    city.attractions.forEach((a) => {
      if (!a.id) return;
      if (a.name) fields['attr.' + a.id + '.name'] = a.name;
      if (a.description) fields['attr.' + a.id + '.description'] = a.description;
      if (a.address) fields['attr.' + a.id + '.address'] = a.address;
      if (a.openingHours) fields['attr.' + a.id + '.openingHours'] = a.openingHours;
      if (a.ticketPrice) fields['attr.' + a.id + '.ticketPrice'] = a.ticketPrice;
      if (a.tips) fields['attr.' + a.id + '.tips'] = a.tips;
      if (a.recommendedVisitTime) fields['attr.' + a.id + '.recommendedVisitTime'] = a.recommendedVisitTime;
      if (Array.isArray(a.highlights)) {
        a.highlights.forEach((h, i) => { if (h) fields['attr.' + a.id + '.highlight.' + i] = h; });
      }
    });
  }
  if (Array.isArray(city.restaurants)) {
    city.restaurants.forEach((r) => {
      if (!r.id) return;
      if (r.name) fields['rest.' + r.id + '.name'] = r.name;
      if (r.description) fields['rest.' + r.id + '.description'] = r.description;
      if (r.address) fields['rest.' + r.id + '.address'] = r.address;
      if (r.cuisine) fields['rest.' + r.id + '.cuisine'] = r.cuisine;
      if (r.hours) fields['rest.' + r.id + '.hours'] = r.hours;
      // 2026-10-18: restaurants carry BOTH `highlights` and `dishHighlights`, plus a
      // `tips` field. Only dishHighlights was handled, so highlights/tips stayed English.
      if (r.tips) fields['rest.' + r.id + '.tips'] = r.tips;
      if (Array.isArray(r.highlights)) {
        r.highlights.forEach((h, i) => { if (h) fields['rest.' + r.id + '.highlight.' + i] = h; });
      }
      if (Array.isArray(r.dishHighlights)) {
        r.dishHighlights.forEach((d, i) => { if (d) fields['rest.' + r.id + '.dish.' + i] = d; });
      }
      if (Array.isArray(r.tags)) {
        r.tags.forEach((t, i) => { if (t) fields['rest.' + r.id + '.tag.' + i] = t; });
      }
    });
  }
  // 2026-10-18: hotels were never translated by this script even though live cities
  // (beijing etc.) do have translated hotels — new cities shipped with English hotels.
  if (Array.isArray(city.hotels)) {
    city.hotels.forEach((h) => {
      if (!h.id) return;
      if (h.name) fields['hotel.' + h.id + '.name'] = h.name;
      if (h.description) fields['hotel.' + h.id + '.description'] = h.description;
      if (h.address) fields['hotel.' + h.id + '.address'] = h.address;
      if (h.priceRange) fields['hotel.' + h.id + '.priceRange'] = h.priceRange;
      if (h.tips) fields['hotel.' + h.id + '.tips'] = h.tips;
      if (Array.isArray(h.highlights)) {
        h.highlights.forEach((x, i) => { if (x) fields['hotel.' + h.id + '.highlight.' + i] = x; });
      }
    });
  }
  return fields;
}

function hasTargetScript(value, lang) {
  if (!value || typeof value !== "string") return false;
  const patterns = {
    ja: /[\\u3040-\\u30ff]/,
    ko: /[\\uac00-\\ud7af]/,
    th: /[\\u0e00-\\u0e7f]/,
    ru: /[\\u0400-\\u04ff]/,
    ar: /[\\u0600-\\u06ff]/,
    fa: /[\\u0600-\\u06ff]/,
    "zh-CN": /[\\u3400-\\u9fff]/,
    "zh-TW": /[\\u3400-\\u9fff]/,
    fr: /[àâçéèêëîïôùûüÿœæ]/i,
    de: /[äöüß]/i,
    vi: /[àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i,
  };
  return patterns[lang]?.test(value) ?? false;
}

function isTranslated(value, originalEn, lang) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (!v) return false;
  if (v.toLowerCase() === String(originalEn || "").trim().toLowerCase()) return false;
  if (hasTargetScript(v, lang)) return true;
  // Latin-script translations can be indistinguishable from English; retain
  // existing non-identical values and only retranslate exact English copies.
  return !/^[\\x00-\\x7F]+$/.test(v) || lang === "fr" || lang === "de" || lang === "vi";
}

// ---------------------------------------------------------------------------
// Field path resolver (2026-10-18)
// One walker for both read and write, so isFieldUntranslated and applyTranslation
// can never disagree. Handles nested arrays (highlights / dishHighlights / tags)
// which the old hand-written branches wrote to a wrong key (e.g. attr.highlight).
//   description
//   highlights.<i>
//   climate.<key>
//   culturalTip.<i>.<key>       object-shaped tips
//   culturalTipStr.<i>          plain-string tips
//   attr.<id>.<field>  | attr.<id>.highlight.<i>
//   rest.<id>.<field>  | rest.<id>.dish.<i> | rest.<id>.tag.<i>
//   hotel.<id>.<field> | hotel.<id>.highlight.<i>
// ---------------------------------------------------------------------------
const ROOT_COLLECTIONS = { attr: "attractions", rest: "restaurants", hotel: "hotels" };
const ARRAY_ALIASES = { highlight: "highlights", dish: "dishHighlights", tag: "tags" };

function resolveSlot(root, field) {
  const parts = field.split(".");
  let cur = root;
  let i = 0;

  while (i < parts.length) {
    const p = parts[i];

    // <collection>.<id>.<rest...>
    if (i === 0 && ROOT_COLLECTIONS[p]) {
      const id = parts[i + 1];
      const arr = cur[ROOT_COLLECTIONS[p]] || [];
      const item = arr.find((x) => x && x.id === id);
      if (!item) return null;
      cur = item;
      i += 2;
      continue;
    }

    // culturalTip.<i>.<key>
    if (i === 0 && p === "culturalTip") {
      const idx = Number(parts[i + 1]);
      const arr = cur.culturalTips || [];
      const tip = arr[idx];
      if (tip == null || typeof tip !== "object") return null;
      cur = tip;
      i += 2;
      continue;
    }

    // culturalTipStr.<i> / highlights.<i> -> direct array slot
    if (i === 0 && (p === "culturalTipStr" || p === "highlights")) {
      const arrKey = p === "culturalTipStr" ? "culturalTips" : "highlights";
      const arr = cur[arrKey];
      if (!Array.isArray(arr)) return null;
      return { container: arr, key: Number(parts[i + 1]) };
    }

    const realKey = ARRAY_ALIASES[p] || p;
    const nextIsIndex = /^\d+$/.test(parts[i + 1] || "");

    if (nextIsIndex) {
      const arr = cur[realKey];
      if (!Array.isArray(arr)) return null;
      if (i + 2 < parts.length) return null; // deeper array nesting unsupported
      return { container: arr, key: Number(parts[i + 1]) };
    }

    if (i + 1 < parts.length) {
      const next = cur[realKey];
      if (next == null) return null;
      cur = next;
      i += 1;
      continue;
    }

    return { container: cur, key: realKey };
  }
  return null;
}

function isFieldUntranslated(cityI18n, field, enValue, currentLang) {
  const slot = resolveSlot(cityI18n, field);
  if (!slot) return true;
  return !isTranslated(slot.container[slot.key], enValue, currentLang);
}

function applyTranslation(cityI18n, field, value) {
  const slot = resolveSlot(cityI18n, field);
  if (!slot) return false;
  slot.container[slot.key] = value;
  return true;
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const res = await fetch(HOST + '/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(90000),
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()).slice(0, 200));
  const j = await res.json();
  return j.choices?.[0]?.message?.content;
}

function extractJson(content) {
  let c = content.trim();
  c = c.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/, '');
  const start = c.indexOf('{');
  const end = c.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON');
  c = c.slice(start, end + 1);
  return JSON.parse(c);
}

// Translate one batch of fields (single API call + up to 3 attempts).
async function translateBatch(lang, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return {};
  const lines = keys.map(k => '- ' + k + ' = "' + String(fields[k]).replace(/"/g, '\\"').replace(/\n/g, ' ') + '"').join('\n');
  const prompt = 'You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\nTranslate the following English strings into ' + TARGETS[lang] + '.\nRules:\n- Output ONLY a single JSON object with EXACTLY these ' + keys.length + ' keys.\n- No markdown, no commentary, no extra keys.\n- Translate EVERY value into ' + lang + '.\n- Keep proper nouns recognizable (e.g., Forbidden City).\n- Keep numbers, prices, times unchanged.\n\n' + lines + '\n';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callChat(prompt);
      const obj = extractJson(content);
      const result = {};
      for (const k of keys) {
        if (isTranslated(obj[k], fields[k], lang)) result[k] = obj[k];
      }
      if (Object.keys(result).length > 0) return result;
    } catch (e) { /* retry */ }
    await new Promise(r => setTimeout(r, 1500));
  }
  return {};
}

// BUG FIX 2026-10-18: a single city has ~140 translatable fields. Sending them all in
// one prompt blows past max_tokens, the JSON gets truncated, every retry fails, and the
// whole language silently produces zero translations. Batch them instead.
const BATCH_SIZE = 22;

async function translateFields(lang, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return {};
  if (keys.length <= BATCH_SIZE) return translateBatch(lang, fields);

  const result = {};
  const total = Math.ceil(keys.length / BATCH_SIZE);
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const chunk = {};
    for (const k of keys.slice(i, i + BATCH_SIZE)) chunk[k] = fields[k];
    const part = await translateBatch(lang, chunk);
    Object.assign(result, part);
    const n = Math.floor(i / BATCH_SIZE) + 1;
    console.log('  [' + lang + '] batch ' + n + '/' + total + ' → ' + Object.keys(part).length + '/' + Object.keys(chunk).length + ' translated');
  }
  return result;
}

async function run() {
  const citiesDir = 'src/data/cities';
  const outDir = 'src/data/cities-i18n';
  if (!fs.existsSync(citiesDir)) {
    console.log('No cities dir found');
    return;
  }
  const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.json'));
  let cities = files.map(f => ({ slug: f.replace('.json', ''), data: JSON.parse(fs.readFileSync(path.join(citiesDir, f), 'utf8')) }));

  if (specific) cities = cities.filter(c => specific.includes(c.slug));

  let totalNew = 0;

  // 2026-10-18: translate languages concurrently. Serially this was ~4 min per language
  // (~44 min for 11). Concurrency 4 brings a single city down to a few minutes.
  const CONCURRENCY = Number(process.env.TRANSLATE_CONCURRENCY || 4);

  async function processLang(lang) {
    const langDir = path.join(outDir, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
    let langNew = 0;
    let attempted = 0;
    for (const city of cities) {
      const outFile = path.join(langDir, city.slug + '.json');
      let i18n = JSON.parse(JSON.stringify(city.data));
      if (fs.existsSync(outFile)) {
        try { i18n = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch (e) {}
      }
      const fields = getTranslatableFields(city.data);
      const untranslated = {};
      for (const [k, v] of Object.entries(fields)) {
        if (isFieldUntranslated(i18n, k, v, lang)) untranslated[k] = v;
      }
      if (Object.keys(untranslated).length === 0) continue;
      attempted++;
      // 2026-10-18: translate batch-by-batch and flush to disk after each batch, so a
      // killed/time-limited run keeps the batches it already paid for.
      const uKeys = Object.keys(untranslated);
      let writeFailed = true;
      for (let i = 0; i < uKeys.length; i += BATCH_SIZE) {
        const chunk = {};
        for (const k of uKeys.slice(i, i + BATCH_SIZE)) chunk[k] = untranslated[k];
        const part = await translateBatch(lang, chunk);
        if (Object.keys(part).length === 0) continue;
        for (const [k, v] of Object.entries(part)) {
          applyTranslation(i18n, k, v);
          langNew++;
        }
        writeFailed = false;
        // BUG FIX 2026-08-31: only persist when this batch actually produced translations,
        // so a failed API call can never overwrite the file with an English copy.
        fs.writeFileSync(outFile, JSON.stringify(i18n, null, 2), 'utf8');
        const n = Math.floor(i / BATCH_SIZE) + 1;
        console.log('  [' + lang + '/' + city.slug + '] batch ' + n + '/' + Math.ceil(uKeys.length / BATCH_SIZE) + ' flushed → ' + Object.keys(part).length + ' fields');
      }
      if (writeFailed) {
        console.warn('  [' + lang + '/' + city.slug + '] skipped write: translation failed (likely API quota/HTTP error), file would have been en-only contamination');
      }
    }
    if (langNew > 0) {
      console.log('[' + lang + '] translated ' + langNew + ' new fields');
      return langNew;
    } else if (attempted > 0) {
      console.log('[' + lang + '] no new fields translated (likely API failure — file unchanged)');
    } else {
      console.log('[' + lang + '] up to date');
    }
    return 0;
  }

  // Run languages in waves of CONCURRENCY.
  for (let i = 0; i < LANGS.length; i += CONCURRENCY) {
    const wave = LANGS.slice(i, i + CONCURRENCY);
    const results = await Promise.all(wave.map((lang) =>
      processLang(lang).catch((e) => {
        console.error('[' + lang + '] failed:', e?.message || e);
        return 0;
      })
    ));
    totalNew += results.reduce((a, b) => a + (b || 0), 0);
  }

  console.log('Total new fields translated: ' + totalNew);
}

run().catch(e => { console.error(e); process.exit(1); });

