// Bulk translate city JSON content via MyMemory API
// Translates attractions[].description/name/address/openingHours/ticketPrice/tips/highlights
// restaurants[].description/name/dishHighlights/tags, culturalTips[].title/content, quickFacts
// Outputs to src/data/cities-i18n/<lang>/<slug>.json

import fs from 'fs';
import path from 'path';

const CITIES_DIR = 'src/data/cities';
const I18N_DIR = 'src/data/cities-i18n';
const TARGETS = ['ja','ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW'];
const CONCURRENCY = 8;
const CACHE_FILE = '.i18n-cache.json';

const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE,'utf8')) : {};
const stats = { translated: 0, skipped: 0, failed: 0, cached: 0 };
const pendingSaves = new Set();

function log(msg) { process.stdout.write('[' + new Date().toISOString().slice(11,19) + '] ' + msg + '\n'); }

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 0));
}

async function translateText(text, langCode) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (trimmed.length === 0) return text;
  // Skip if mostly non-text (URLs, paths, etc.)
  if (trimmed.startsWith('/img/') || trimmed.startsWith('http')) return text;
  if (/^[\d\.\-\s\+\(\)\:¥\$\€\£\₩\₹\₽\,\/]+$/.test(trimmed)) return text; // pure numbers/prices

  const cacheKey = langCode + '::' + trimmed;
  if (cacheKey in cache) {
    stats.cached++;
    return cache[cacheKey];
  }

  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(trimmed.slice(0, 500)) + '&langpair=en|' + langCode;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (attempt < 2) { await sleep(500 * (attempt + 1)); continue; }
        stats.failed++;
        cache[cacheKey] = text;
        return text;
      }
      const j = await res.json();
      let translated = j?.responseData?.translatedText;
      if (!translated || translated.trim() === '' || translated.toLowerCase() === trimmed.toLowerCase()) {
        cache[cacheKey] = text;
        return text;
      }
      cache[cacheKey] = translated;
      stats.translated++;
      return translated;
    } catch (e) {
      if (attempt < 2) { await sleep(500 * (attempt + 1)); continue; }
      stats.failed++;
      cache[cacheKey] = text;
      return text;
    }
  }
  cache[cacheKey] = text;
  return text;
}

// Concurrency-limited map
async function parallelMap(items, fn, concurrency = CONCURRENCY) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const myIdx = i++;
      out[myIdx] = await fn(items[myIdx], myIdx);
    }
  });
  await Promise.all(workers);
  return out;
}

async function translateArray(arr, langCode) {
  if (!arr || !Array.isArray(arr)) return arr;
  return await parallelMap(arr, (item) => translateText(String(item), langCode));
}

async function translateAttraction(attr, langCode) {
  const fields = ['name','description','address','openingHours','ticketPrice','tips','recommendedVisitTime','category'];
  const out = { ...attr };
  const translated = await parallelMap(fields, async (f) => [f, attr.f ? await translateText(attr[f], langCode) : null]);
  for (const [f, v] of translated) if (v !== null) out[f] = v;
  if (attr.highlights) out.highlights = await translateArray(attr.highlights, langCode);
  return out;
}

async function translateRestaurant(rest, langCode) {
  const fields = ['name','description','address','hours','cuisine'];
  const out = { ...rest };
  const translated = await parallelMap(fields, async (f) => [f, rest[f] ? await translateText(rest[f], langCode) : null]);
  for (const [f, v] of translated) if (v !== null) out[f] = v;
  if (rest.dishHighlights) out.dishHighlights = await translateArray(rest.dishHighlights, langCode);
  if (rest.tags) out.tags = await translateArray(rest.tags, langCode);
  return out;
}

async function translateTip(tip, langCode) {
  const fields = ['title','content','category'];
  const out = { ...tip };
  const translated = await parallelMap(fields, async (f) => [f, tip[f] ? await translateText(tip[f], langCode) : null]);
  for (const [f, v] of translated) if (v !== null) out[f] = v;
  return out;
}

async function translateQuickFacts(qf, langCode) {
  if (!qf) return qf;
  const out = { ...qf };
  const keys = Object.keys(out).filter(k => typeof out[k] === 'string');
  const translated = await parallelMap(keys, async (k) => [k, await translateText(out[k], langCode)]);
  for (const [k, v] of translated) out[k] = v;
  return out;
}

async function translateClimate(cl, langCode) {
  if (!cl) return cl;
  const out = { ...cl };
  for (const k of ['type','tips','avgSummerTemp','avgWinterTemp']) {
    if (out[k]) out[k] = await translateText(out[k], langCode);
  }
  return out;
}

async function translateEmergency(ec, langCode) {
  if (!ec) return ec;
  const out = { ...ec };
  for (const k of ['name','address','notes']) {
    if (out[k]) out[k] = await translateText(out[k], langCode);
  }
  return out;
}

async function processCity(citySlug, lang, topN) {
  const enFile = path.join(CITIES_DIR, citySlug + '.json');
  if (!fs.existsSync(enFile)) return;
  const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

  const langDir = path.join(I18N_DIR, lang);
  const outFile = path.join(langDir, citySlug + '.json');
  let out = {};
  if (fs.existsSync(outFile)) {
    try { out = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch(e) {}
  }

  // Climate
  if (en.climate) out.climate = await translateClimate(en.climate, lang);
  // QuickFacts
  if (en.quickFacts) out.quickFacts = await translateQuickFacts(en.quickFacts, lang);

  // Attractions (top N)
  if (Array.isArray(en.attractions)) {
    const target = (out.attractions || []).slice();
    const targetById = new Map(target.map(a => [a.id, a]));
    const toTranslate = en.attractions.slice(0, topN.attractions);
    const translated = await parallelMap(toTranslate, (a) => translateAttraction(a, lang));
    for (let i = 0; i < toTranslate.length; i++) {
      const a = toTranslate[i];
      if (targetById.has(a.id)) {
        const idx = target.findIndex(x => x.id === a.id);
        target[idx] = translated[i];
      } else {
        target.push(translated[i]);
      }
    }
    out.attractions = target;
  }

  // Restaurants (top N)
  if (Array.isArray(en.restaurants)) {
    const target = (out.restaurants || []).slice();
    const targetById = new Map(target.map(r => [r.id, r]));
    const toTranslate = en.restaurants.slice(0, topN.restaurants);
    const translated = await parallelMap(toTranslate, (r) => translateRestaurant(r, lang));
    for (let i = 0; i < toTranslate.length; i++) {
      const r = toTranslate[i];
      if (targetById.has(r.id)) {
        const idx = target.findIndex(x => x.id === r.id);
        target[idx] = translated[i];
      } else {
        target.push(translated[i]);
      }
    }
    out.restaurants = target;
  }

  // CulturalTips (top N)
  if (Array.isArray(en.culturalTips)) {
    const target = (out.culturalTips || []).slice();
    const targetById = new Map();
    for (let i = 0; i < target.length; i++) {
      // Match by category+title since tips might not have id
      const t = target[i];
      if (t.category && t.title) targetById.set(t.category + '::' + t.title, i);
    }
    const toTranslate = en.culturalTips.slice(0, topN.tips);
    const translated = await parallelMap(toTranslate, (t) => translateTip(t, lang));
    for (let i = 0; i < toTranslate.length; i++) {
      const t = toTranslate[i];
      const key = t.category + '::' + t.title;
      if (targetById.has(key)) {
        target[targetById.get(key)] = translated[i];
      } else {
        target.push(translated[i]);
      }
    }
    out.culturalTips = target;
  }

  // EmergencyContacts (top 10)
  if (Array.isArray(en.emergencyContacts)) {
    const toTranslate = en.emergencyContacts.slice(0, 10);
    out.emergencyContacts = await parallelMap(toTranslate, (c) => translateEmergency(c, lang));
  }

  // Save
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const cityArg = args[0];
  const langArg = args[1] || 'all';
  const topAttr = parseInt(args[2] || '5');
  const topRest = parseInt(args[3] || '5');
  const topTips = parseInt(args[4] || '999');

  const cities = fs.readdirSync(CITIES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  const targetCities = cityArg === 'all' ? cities : (cityArg === 'rest' ? cities.slice(17) : cities.filter(c => c === cityArg));
  const targetLangs = langArg === 'all' ? TARGETS : [langArg];

  const topN = { attractions: topAttr, restaurants: topRest, tips: topTips };
  log('targets: ' + targetLangs.length + ' langs x ' + targetCities.length + ' cities, topN=' + JSON.stringify(topN));

  const totalStart = Date.now();
  let cityCount = 0;
  for (const lang of targetLangs) {
    const langDir = path.join(I18N_DIR, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
    for (const slug of targetCities) {
      cityCount++;
      const start = Date.now();
      try {
        await processCity(slug, lang, topN);
        const dur = ((Date.now() - start) / 1000).toFixed(1);
        const totalDur = ((Date.now() - totalStart) / 60).toFixed(1);
        log(cityCount + '/' + (targetLangs.length*targetCities.length) + ' ' + lang + '/' + slug + ' done ' + dur + 's (total ' + totalDur + 'm, stats: ' + stats.translated + ' trans, ' + stats.cached + ' cached, ' + stats.failed + ' fail)');
      } catch (e) {
        log(lang + '/' + slug + ' ERROR: ' + e.message);
      }
      // Save cache periodically
      if (cityCount % 5 === 0) saveCache();
    }
  }
  saveCache();
  log('FINAL: ' + stats.translated + ' translated, ' + stats.cached + ' cached, ' + stats.failed + ' failed');
}

main().catch(e => { console.error(e); process.exit(1); });

