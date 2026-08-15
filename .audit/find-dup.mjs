import fs from "fs";
const lines = fs.readFileSync("src/data/guide/ja-overrides.ts","utf8").split(/\r?\n/);
const seen = new Map();
for (let i=0;i<lines.length;i++){
  const m = lines[i].match(/^\s*"(.+?)":/);
  if(m){
    const k = m[1];
    if(seen.has(k)) seen.get(k).push(i+1); else seen.set(k,[i+1]);
  }
}
let dup = [...seen.entries()].filter(([k,v])=>v.length>1);
console.log("total dup keys:", dup.length);
for(const [k,v] of dup) console.log(JSON.stringify(k), "=>", v.join(","));
