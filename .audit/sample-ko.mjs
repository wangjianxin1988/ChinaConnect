import fs from "node:fs";
const text = fs.readFileSync("src/data/guide/overrides-ko.ts","utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const map = new Map();
for (const m of text.matchAll(re)) {
  const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
  map.set(un(m[1]), un(m[2]));
}
let identity=0, translated=0, keepable=0;
const idSamples=[], trSamples=[];
for (const [k,v] of map) {
  if (v===k){ identity++; if(idSamples.length<5) idSamples.push([k.slice(0,60), v.slice(0,60)]); }
  else if(/[\uac00-\ud7af]/.test(v)){ translated++; if(trSamples.length<5) trSamples.push([k.slice(0,60), v.slice(0,60)]); }
}
console.log("identity", identity, "hangul-translated", translated, "map size", map.size);
console.log("id samples:", JSON.stringify(idSamples,null,1));
console.log("tr samples:", JSON.stringify(trSamples,null,1));
