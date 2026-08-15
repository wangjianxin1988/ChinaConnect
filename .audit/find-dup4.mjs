import fs from "fs";
const lines = fs.readFileSync("src/data/guide/ja-overrides.ts","utf8").split(/\r?\n/);
const first = new Map();
for (let i=0;i<lines.length;i++){
  const m = lines[i].match(/^\s*"(.+?)":/);
  if(m && !first.has(m[1])) first.set(m[1], i+1);
}
const dupFirstLines = new Set();
const seen = new Map();
for (let i=0;i<lines.length;i++){
  const m = lines[i].match(/^\s*"(.+?)":/);
  if(m){ if(seen.has(m[1])) dupFirstLines.add(first.get(m[1])); else seen.set(m[1],1); }
}
const sorted = [...dupFirstLines].sort((a,b)=>a-b);
console.log(JSON.stringify(sorted));
// group into ranges
let ranges=[], start=sorted[0], prev=sorted[0];
for(let i=1;i<sorted.length;i++){ if(sorted[i]===prev+1){prev=sorted[i];} else {ranges.push([start,prev]); start=sorted[i]; prev=sorted[i];} }
ranges.push([start,prev]);
console.log("ranges:", JSON.stringify(ranges));
