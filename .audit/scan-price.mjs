import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const targets = ["价格","旺季","淡季"];
const out = [];
function walk(obj, file, p){
  if(typeof obj==="string"){
    for(const t of targets) if(obj.includes(t)) out.push({file,path:p,term:t,text:obj.slice(0,100)});
    return;
  }
  if(Array.isArray(obj)){ obj.forEach((v,i)=>walk(v,file,p+"["+i+"]")); return; }
  if(obj && typeof obj==="object"){ for(const [k,v] of Object.entries(obj)) walk(v,file,p?p+"."+k:k); }
}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))) walk(JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")), f, "");
let shown={};
for(const o of out){ const k=o.term; if((shown[k]||0)<8){ shown[k]=(shown[k]||0)+1; console.log("["+k+"] "+o.file+" | "+o.path+" | "+o.text); } }
console.log("total:", out.length);
