import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";
const strings = JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings;
const text = fs.readFileSync("src/data/guide/overrides-ko.ts","utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const hasCJK = (s)=>/[\u3400-\u9fff]/.test(s);
let bad=0, cont=0, badSamples=[], contSamples=[];
for (const k of strings) {
  const v = map.get(k);
  if (v === k) {
    if (hasCJK(k)) { /* legal? no for ko */ }
    if (!isKeepableToken(k)) { bad++; if (badSamples.length<60) badSamples.push(k.slice(0,80)); }
  } else if (/[\u3400-\u9fff\u3040-\u30ff\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/.test(v)) {
    cont++; if (contSamples.length<20) contSamples.push(k.slice(0,60)+' => '+v.slice(0,60));
  }
}
console.log('bad', bad, 'cont', cont);
console.log('--- bad samples ---'); badSamples.forEach(s=>console.log('  '+JSON.stringify(s)));
console.log('--- cont samples ---'); contSamples.forEach(s=>console.log('  '+s));
