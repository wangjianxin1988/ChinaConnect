import fs from "fs";
const lines = fs.readFileSync("src/data/guide/ja-overrides.ts","utf8").split(/\r?\n/);
const seen = new Map();
for (let i=0;i<lines.length;i++){
  const m = lines[i].match(/^\s*"(.+?)":/);
  if(m){ const k=m[1]; if(seen.has(k)) seen.get(k).push(i+1); else seen.set(k,[i+1]); }
}
// keys in the tail block (0-based 3798..) 
const tailStart = 3798;
let tailKeys = [], uniqueInTail = [];
for(let i=tailStart;i<lines.length;i++){
  const m = lines[i].match(/^\s*"(.+?)":/);
  if(m){ tailKeys.push({k:m[1], line:i+1, occ:seen.get(m[1]).length}); if(seen.get(m[1]).length===1) uniqueInTail.push({k:m[1],line:i+1}); }
}
console.log("tail key count:", tailKeys.length, "unique-in-tail:", uniqueInTail.length);
if(uniqueInTail.length) console.log(JSON.stringify(uniqueInTail,null,1));
// show boundary lines
console.log("--- 3796-3804 ---");
for(let i=3795;i<=3803;i++) console.log((i+1)+": "+lines[i]);
