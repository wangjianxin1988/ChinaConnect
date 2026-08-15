// Translate newly added cities to all 11 non-English languages.
// Usage:
//   node scripts/auto-translate-new-cities.mjs                # check & translate new
//   node scripts/auto-translate-new-cities.mjs beijing shanghai  # specific cities
//
// This is invoked by the prebuild hook to ensure no city is missing translations.
import fs from 'fs';
import path from 'path';
import { getMiniMaxConfig } from './lib/minimax-config.mjs';

const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";

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
      if (typeof t === 'object') {
        if (t.title) fields['culturalTip.' + i + '.title'] = t.title;
        if (t.content) fields['culturalTip.' + i + '.content'] = t.content;
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
      if (Array.isArray(r.dishHighlights)) {
        r.dishHighlights.forEach((d, i) => { if (d) fields['rest.' + r.id + '.dish.' + i] = d; });
      }
      if (Array.isArray(r.tags)) {
        r.tags.forEach((t, i) => { if (t) fields['rest.' + r.id + '.tag.' + i] = t; });
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

function isFieldUntranslated(cityI18n, field, enValue, currentLang) {
  // field is in dot notation like "attr.beijing-forbidden-city.description"
  // We need to navigate the city i18n structure
  const parts = field.split('.');
  let cur = cityI18n;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null) return true;
    const p = parts[i];
    // attr.X.name -> city.attractions[].name
    if (parts[0] === 'attr' && i === 1) {
      const id = parts[1];
      const attr = (cur.attractions || []).find(a => a.id === id);
      cur = attr;
      if (!cur) return true;
      continue;
    }
    if (parts[0] === 'rest' && i === 1) {
      const id = parts[1];
      const rest = (cur.restaurants || []).find(r => r.id === id);
      cur = rest;
      if (!cur) return true;
      continue;
    }
    if (parts[0] === 'culturalTip' && i === 1) {
      const idx = parseInt(parts[1], 10);
      cur = (cur.culturalTips || [])[idx];
      if (!cur) return true;
      continue;
    }
    if (parts[0] === 'highlights' && i === 0) {
      const idx = parseInt(parts[1], 10);
      cur = (cur || [])[idx];
      if (!cur) return true;
      continue;
    }
    if (parts[0] === 'climate' && i === 1) {
      cur = (cur.climate || {})[parts[2]];
      continue;
    }
    // generic
    cur = cur[p];
  }
  return !isTranslated(cur, enValue, currentLang);
}

function applyTranslation(cityI18n, field, value) {
  const parts = field.split('.');
  if (parts[0] === 'attr' && parts.length >= 3) {
    const id = parts[1];
    const attrName = parts[2];
    const attr = (cityI18n.attractions || []).find(a => a.id === id);
    if (attr) attr[attrName] = value;
    return;
  }
  if (parts[0] === 'rest' && parts.length >= 3) {
    const id = parts[1];
    const restName = parts[2];
    const rest = (cityI18n.restaurants || []).find(r => r.id === id);
    if (rest) rest[restName] = value;
    return;
  }
  if (parts[0] === 'culturalTip' && parts.length >= 3) {
    const idx = parseInt(parts[1], 10);
    const tipName = parts[2];
    if (cityI18n.culturalTips && cityI18n.culturalTips[idx]) {
      cityI18n.culturalTips[idx][tipName] = value;
    }
    return;
  }
  if (parts[0] === 'highlights' && parts.length >= 2) {
    const idx = parseInt(parts[1], 10);
    if (cityI18n.highlights && cityI18n.highlights[idx] !== undefined) {
      cityI18n.highlights[idx] = value;
    }
    return;
  }
  if (parts[0] === 'climate' && parts.length >= 2) {
    if (!cityI18n.climate) cityI18n.climate = {};
    cityI18n.climate[parts[1]] = value;
    return;
  }
  if (parts.length === 1) {
    cityI18n[parts[0]] = value;
    return;
  }
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 8000 };
  const res = await fetch(HOST + '/v1/chat/completions', {
    method: 'POST',
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

async function translateFields(lang, fields) {
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
        if (isTranslated(obj[k], fields[k])) result[k] = obj[k];
      }
      if (Object.keys(result).length > 0) return result;
    } catch (e) { /* retry */ }
    await new Promise(r => setTimeout(r, 1500));
  }
  return {};
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
  for (const lang of LANGS) {
    const langDir = path.join(outDir, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
    let langNew = 0;
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
      const result = await translateFields(lang, untranslated);
      for (const [k, v] of Object.entries(result)) {
        applyTranslation(i18n, k, v);
        langNew++;
      }
      fs.writeFileSync(outFile, JSON.stringify(i18n, null, 2), 'utf8');
    }
    if (langNew > 0) {
      console.log('[' + lang + '] translated ' + langNew + ' new fields');
      totalNew += langNew;
    } else {
      console.log('[' + lang + '] up to date');
    }
  }
  console.log('Total new fields translated: ' + totalNew);
}

run().catch(e => { console.error(e); process.exit(1); });

