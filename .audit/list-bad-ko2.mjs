import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";
const strings = JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings;
const text = fs.readFileSync("src/data/guide/overrides-ko.ts","utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const bad=[];
for (const k of strings) {
  const v = map.get(k);
  if (v === k && !isKeepableToken(k)) bad.push(k);
}
console.log('total bad:', bad.length);
const pats = {
  slug_dash: /^[a-z0-9]+(?:-[a-z0-9]+)+$/,
  lower_word: /^[a-z]{2,12}$/,
  mixed_word: /^[A-Za-z][A-Za-z0-9]{1,7}$/,
  email: /^[\w.+-]+@[\w-]+\.[\w.-]+$/,
  code_amount: /^[A-Z]{3}\s*[¥$€£₩₹₽]\s*\d+(?:\.\d+)?$/,
  range_currency: /^\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?\s*(?:CNY|RMB|USD|EUR|GBP|JPY|KRW|AUD|CAD)\b/i,
  css_class: /^[a-z]+-[a-z]+-\d+[a-z0-9-]*$/,
  placeholder_value: /^(AB\d+|INV-\d+|913\d+|liwei@|\d{6}-)/i,
  other: null,
};
const groups = {};
for (const k of bad) {
  let cat='other';
  for (const [n,p] of Object.entries(pats)) { if (p && p.test(k)) { cat=n; break; } }
  if (cat==='other' && /[\u3400-\u9fff]/.test(k)) cat='chinese_text';
  else if (cat==='other' && /[A-Za-z]{2}/.test(k)) cat='english_text';
  (groups[cat] ||= []).push(k);
}
for (const [g, arr] of Object.entries(groups)) {
  console.log('\n==', g, arr.length, '==');
  arr.slice(0,25).forEach(k=>console.log('  '+JSON.stringify(k.slice(0,80))));
  if (arr.length>25) console.log('  ... +'+(arr.length-25)+' more');
}
