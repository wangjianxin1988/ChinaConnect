import fs from "node:fs";
const strings = JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings;
const text = fs.readFileSync("src/data/guide/overrides-ko.ts","utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const real = new Set(strings);
const hasCJK = (s)=>/[\u3400-\u9fff]/.test(s);
const cats = { flag:0, domain:0, currency:0, capsbrand:0, temp:0, numberish:0, chinese_text:0, english_text:0, other:0 };
const samples = {};
function add(cat, s){ cats[cat]++; (samples[cat] ||= []).push(s.slice(0,70)); }
for (const k of strings) {
  const v = map.get(k);
  if (v === k) {
    if (/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u200d\ufe0f]/u.test(k)) add('flag', k);
    else if (/^(?:www\.)?[\w-]+(?:\.[\w-]+)+$/i.test(k)) add('domain', k);
    else if (/\b(?:CNY|RMB|USD|EUR|GBP|JPY|KRW|AUD|CAD|HKD|SGD|THB|VND|INR|PHP|MYR|IDR|TWD|ARS|BRL|RUB|TRY|AED|SAR|MXN)\b/i.test(k) && /\d/.test(k)) add('currency', k);
    else if (/^[A-Z]{2,7}$/.test(k)) add('capsbrand', k);
    else if (/°[CF]\b|℃|℉/.test(k)) add('temp', k);
    else if (/^[\d\s.,¥$€£₩₹₽+\-():/%×·&'"°CF]+$/.test(k)) add('numberish', k);
    else if (hasCJK(k)) add('chinese_text', k);
    else if (/[A-Za-z]{2}/.test(k)) add('english_text', k);
    else add('other', k);
  }
}
console.log(cats);
for (const c of Object.keys(samples)) console.log('\n--', c, '--\n' + samples[c].slice(0,8).map(s=>'  '+s).join('\n'));
