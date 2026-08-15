import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const hits = [];
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const d = JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
  (function walk(o,p){
    if(typeof o==="string"){ if(o.includes("社区老店")) hits.push({file:f,path:p,text:o.slice(0,80)}); return; }
    if(Array.isArray(o)){ o.forEach((v,i)=>walk(v,p+"["+i+"]")); return; }
    if(o&&typeof o==="object"){ for(const [k,v] of Object.entries(o)) walk(v,p?p+"."+k:k); }
  })(d,"");
}
console.log("hits:", hits.length);
for(const h of hits.slice(0,15)) console.log(h.file+" | "+h.path+" | "+h.text);
