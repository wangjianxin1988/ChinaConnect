const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

function extractBlock(text, startIdx) {
  let depth = 0, i = startIdx;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) break; }
  }
  return text.substring(startIdx + 1, i);
}

function findSection(text, name) {
  const re = new RegExp('\\b' + name + ':\\s*\\{', 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const start = m.index + m[0].length;
    return { start, text: extractBlock(text, start - 1) };
  }
  return null;
}

const ifaceStart = text.indexOf('export interface Translations');
const ifaceEnd = text.indexOf('}\n', ifaceStart);
const ifaceText = text.substring(ifaceStart, ifaceEnd + 1);
const homeIface = findSection(ifaceText, 'home').text;
const citiesIface = findSection(ifaceText, 'cities').text;
const navIface = findSection(ifaceText, 'nav').text;
const ifaceFields = (s) => Array.from(s.matchAll(/^\s+(\w+):\s*string;/gm)).map(x => x[1]);
const homeIfaceFields = ifaceFields(homeIface);
const citiesIfaceFields = ifaceFields(citiesIface);
const navIfaceFields = ifaceFields(navIface);

const recordStart = text.indexOf('export const translations');
const recordBrace = text.indexOf('{', recordStart);
const recordBody = extractBlock(text, recordBrace);

const langCodes = ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa'];
const data = {};
for (const lang of langCodes) {
  // 找 '  en: {' 格式
  const langMarker = '\n  ' + lang + ': {';
  const langStart = recordBody.indexOf(langMarker);
  if (langStart < 0) {
    const fallback = '\n  "' + lang + '": {';
    const fbStart = recordBody.indexOf(fallback);
    if (fbStart < 0) { console.log('NOT FOUND:', lang); continue; }
    const block = extractBlock(recordBody, fbStart + fallback.length - 1);
    parseBlock(lang, block);
    continue;
  }
  const block = extractBlock(recordBody, langStart + langMarker.length - 1);
  parseBlock(lang, block);
}

function parseBlock(lang, block) {
  const nav = findSection(block, 'nav');
  const home = findSection(block, 'home');
  const cities = findSection(block, 'cities');
  data[lang] = {
    nav: nav ? Array.from(nav.text.matchAll(/^\s+(\w+):\s*"[^"]*",?$/gm)).map(x => x[1]) : [],
    home: home ? Array.from(home.text.matchAll(/^\s+(\w+):\s*"[^"]*",?$/gm)).map(x => x[1]) : [],
    cities: cities ? Array.from(cities.text.matchAll(/^\s+(\w+):\s*"[^"]*",?$/gm)).map(x => x[1]) : [],
  };
}

console.log('=== Per-lang NAV keys ===');
for (const lang of langCodes) if (data[lang]) console.log(lang + ': [' + data[lang].nav.join(', ') + ']');
console.log('\n=== Per-lang HOME keys ===');
for (const lang of langCodes) if (data[lang]) console.log(lang + ': [' + data[lang].home.join(', ') + ']');
console.log('\n=== Per-lang CITIES keys ===');
for (const lang of langCodes) if (data[lang]) console.log(lang + ': [' + data[lang].cities.join(', ') + ']');

function commonInAll(getter) {
  return langCodes.reduce((acc, lang) => {
    if (!acc) return new Set(data[lang][getter]);
    return new Set(data[lang][getter].filter(k => acc.has(k)));
  }, null);
}
console.log('\n=== COMMON keys in all 12 langs ===');
console.log('NAV:', [...commonInAll('nav')].sort().join(', '));
console.log('HOME:', [...commonInAll('home')].sort().join(', '));
console.log('CITIES:', [...commonInAll('cities')].sort().join(', '));

console.log('\n=== Per-lang home data MISSING fields (vs iface) ===');
for (const lang of langCodes) {
  if (!data[lang]) continue;
  const missing = homeIfaceFields.filter(f => !data[lang].home.includes(f));
  if (missing.length) console.log(lang + ': missing [' + missing.join(', ') + ']');
}
console.log('\n=== Per-lang home data EXTRA fields (not in iface) ===');
for (const lang of langCodes) {
  if (!data[lang]) continue;
  const extra = data[lang].home.filter(f => !homeIfaceFields.includes(f));
  if (extra.length) console.log(lang + ': extra [' + extra.join(', ') + ']');
}
console.log('\n=== Per-lang cities data MISSING fields (vs iface) ===');
for (const lang of langCodes) {
  if (!data[lang]) continue;
  const missing = citiesIfaceFields.filter(f => !data[lang].cities.includes(f));
  if (missing.length) console.log(lang + ': missing [' + missing.join(', ') + ']');
}
console.log('\n=== Per-lang cities data EXTRA fields (not in iface) ===');
for (const lang of langCodes) {
  if (!data[lang]) continue;
  const extra = data[lang].cities.filter(f => !citiesIfaceFields.includes(f));
  if (extra.length) console.log(lang + ': extra [' + extra.join(', ') + ']');
}
console.log('\n=== Per-lang nav data MISSING fields (vs iface) ===');
for (const lang of langCodes) {
  if (!data[lang]) continue;
  const missing = navIfaceFields.filter(f => !data[lang].nav.includes(f));
  if (missing.length) console.log(lang + ': missing [' + missing.join(', ') + ']');
}
console.log('\n=== Per-lang nav data EXTRA fields (not in iface) ===');
for (const lang of langCodes) {
  if (!data[lang]) continue;
  const extra = data[lang].nav.filter(f => !navIfaceFields.includes(f));
  if (extra.length) console.log(lang + ': extra [' + extra.join(', ') + ']');
}
