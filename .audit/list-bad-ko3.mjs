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
const groups={};
for (const k of bad) {
  let cat;
  if (/^[A-Z]{3}\s*[¥$€£]\s*\d+(?:\.\d+)?$/.test(k)) cat='code_amount';
  else if (/^\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?\s*(?:CNY|RMB|USD|EUR|GBP|JPY|KRW|AUD|CAD)\b/i.test(k)) cat='range_currency';
  else if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(k)) cat='email';
  else if (/^(AB\d+|INV-\d+|913\d+|9\d{9,}|[A-Z]{2}\d{4,})/.test(k)) cat='example_value';
  else if (/^[A-Za-z]+(?:-[A-Za-z0-9]+){1,3}$/.test(k) && k.length<=12) cat='dashed_word';
  else if (/^[a-z]{2,12}$/.test(k)) cat='lower_word';
  else if (/^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(k) && k.split(' ').length<=3) cat='title_case';
  else if (/[\u3400-\u9fff]/.test(k)) cat='chinese_text';
  else if (/[A-Za-z]{2}/.test(k)) cat='english_text';
  else cat='other';
  (groups[cat] ||= []).push(k);
}
for (const [g,arr] of Object.entries(groups)) {
  console.log('\n==', g, arr.length, '==');
  arr.slice(0,40).forEach(k=>console.log('  '+JSON.stringify(k.slice(0,70))));
  if(arr.length>40) console.log('  ...+'+(arr.length-40)+' more');
}
