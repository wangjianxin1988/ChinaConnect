// Focused translator: translate only city descriptions + highlights + cultural tips
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
const onlyLang = args.find(a => a.startsWith('--lang='));
const TARGETS_FINAL = onlyLang ? [onlyLang.split('=')[1]] : LANGS;

const SRC = "src/data/cities";
const OUT = "src/data/cities-i18n";

const NON_ASCII_RE = /[^\x00-\x7F]/;
function isEnglish(s) {
  if (!s) return true;
  // English = all chars are ASCII
  return !NON_ASCII_RE.test(s);
}

function getTranslatableFields(city) {
  const fields = {};
  if (city.description) fields['description'] = city.description;
  if (Array.isArray(city.highlights)) {
    city.highlights.forEach((h, i) => { if (h) fields['highlights.' + i] = h; });
  }
  if (city.climate?.tips) fields['climate.tips'] = city.climate.tips;
  if (Array.isArray(city.culturalTips)) {
    city.culturalTips.forEach((t, i) => {
      if (typeof t === 'object') {
        if (t.title) fields['culturalTip.' + i + '.title'] = t.title;
        if (t.content) fields['culturalTip.' + i + '.content'] = t.content;
      } else if (typeof t === 'string') {
        fields['culturalTip.' + i] = t;
      }
    });
  }
  return fields;
}

function getUntranslatedCityFields(cityI18n, fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'description') {
      if (isEnglish(cityI18n.description)) out[k] = v;
    } else if (k.startsWith('highlights.')) {
      const idx = parseInt(k.split('.')[1], 10);
      if (isEnglish(cityI18n.highlights?.[idx])) out[k] = v;
    } else if (k === 'climate.tips') {
      if (isEnglish(cityI18n.climate?.tips)) out[k] = v;
    } else if (k.startsWith('culturalTip.')) {
      const parts = k.split('.');
      const idx = parseInt(parts[1], 10);
      if (parts.length === 2) {
        const cur = cityI18n.culturalTips?.[idx];
        if (typeof cur === 'string' && isEnglish(cur)) out[k] = v;
      } else {
        const prop = parts[2];
        if (isEnglish(cityI18n.culturalTips?.[idx]?.[prop])) out[k] = v;
      }
    }
  }
  return out;
}

function applyTranslation(cityI18n, field, value) {
  if (field === 'description') {
    cityI18n.description = value;
  } else if (field.startsWith('highlights.')) {
    const idx = parseInt(field.split('.')[1], 10);
    if (cityI18n.highlights) cityI18n.highlights[idx] = value;
  } else if (field === 'climate.tips') {
    if (!cityI18n.climate) cityI18n.climate = {};
    cityI18n.climate.tips = value;
  } else if (field.startsWith('culturalTip.')) {
    const parts = field.split('.');
    const idx = parseInt(parts[1], 10);
    if (parts.length === 2) {
      if (cityI18n.culturalTips && typeof cityI18n.culturalTips[idx] === 'string') {
        cityI18n.culturalTips[idx] = value;
      }
    } else {
      const prop = parts[2];
      if (cityI18n.culturalTips && cityI18n.culturalTips[idx]) {
        cityI18n.culturalTips[idx][prop] = value;
      }
    }
  }
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 6000 };
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
  const lines = keys.map(k => '- ' + k + ' = "' + String(fields[k]).replace(/"/g, '\\\\"').replace(/\n/g, ' ') + '"').join('\n');
  const prompt = 'You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\nTranslate the following English strings into ' + TARGETS[lang] + '.\nFor each field name (like "description", "highlights.0", "culturalTip.5.title"), keep the same key.\nRules:\n- Output ONLY a single JSON object with EXACTLY these ' + keys.length + ' keys.\n- No markdown, no commentary, no extra keys.\n- Translate EVERY value into ' + lang + '.\n- Keep proper nouns recognizable (e.g., Forbidden City, Beijing, etc.).\n- Keep numbers, prices, times, brand names unchanged.\n\n' + lines + '\n';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callChat(prompt);
      const obj = extractJson(content);
      const result = {};
      for (const k of keys) {
        if (obj[k] && typeof obj[k] === 'string' && obj[k].trim()) result[k] = obj[k];
      }
      if (Object.keys(result).length > 0) return result;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  return {};
}

async function run() {
  const cities = fs.readdirSync(SRC).filter(f => f.endsWith('.json')).map(f => ({
    slug: f.replace('.json', ''),
    data: JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')),
  }));
  console.log('Translating ' + cities.length + ' cities to ' + TARGETS_FINAL.length + ' languages...');
  let totalNew = 0;
  for (const lang of TARGETS_FINAL) {
    const langDir = path.join(OUT, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
    let langNew = 0;
    for (const city of cities) {
      const outFile = path.join(langDir, city.slug + '.json');
      let i18n = JSON.parse(JSON.stringify(city.data));
      if (fs.existsSync(outFile)) {
        try { i18n = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch (e) {}
      }
      const fields = getTranslatableFields(city.data);
      const untranslated = getUntranslatedCityFields(i18n, fields);
      if (Object.keys(untranslated).length === 0) continue;
      const result = await translateFields(lang, untranslated);
      for (const [k, v] of Object.entries(result)) {
        applyTranslation(i18n, k, v);
        langNew++;
      }
      fs.writeFileSync(outFile, JSON.stringify(i18n, null, 2), 'utf8');
    }
    console.log('[' + lang + '] translated ' + langNew + ' new city fields');
    totalNew += langNew;
  }
  console.log('Total: ' + totalNew + ' new fields translated');
}

run().catch(e => { console.error(e); process.exit(1); });
