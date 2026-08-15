import fs from "fs";
const lines = fs.readFileSync("src/data/guide/ja-overrides.ts","utf8").split(/\r?\n/);
const entries = new Map(); // key -> [{line, value}]
for (let i=0;i<lines.length;i++){
  const m = lines[i].match(/^\s*"(.+?)":\s*(".*"),?$/);
  if(m){ const k=m[1]; const v=m[2]; if(!entries.has(k)) entries.set(k,[]); entries.get(k).push({line:i+1,value:v}); }
}
let diff = [], same = 0;
for(const [k,arr] of entries){
  if(arr.length>1){
    const vals = new Set(arr.map(a=>a.value));
    if(vals.size>1) diff.push({k, arr}); else same++;
  }
}
console.log("dups identical:", same, "differing:", diff.length);
for(const d of diff.slice(0,60)){ console.log("KEY:", JSON.stringify(d.k)); for(const a of d.arr) console.log("  line "+a.line+": "+a.value); }
