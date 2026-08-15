import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const KANA = /[ぁ-んァ-ヶ]/;
const count = new Map();
const loc = new Map();
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const d = JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
  (function walk(o,p){
    if(typeof o==="string"){
      if(o.length>=8 && !KANA.test(o) && p.includes("restaurants") && p.endsWith(".description")){
        count.set(o,(count.get(o)||0)+1);
        if(!loc.has(o)) loc.set(o,[]);
        if(loc.get(o).length<2) loc.get(o).push(f+" | "+p);
      }
      return;
    }
    if(Array.isArray(o)){ o.forEach((v,i)=>walk(v,p+"["+i+"]")); return; }
    if(o&&typeof o==="object"){ for(const [k,v] of Object.entries(o)) walk(v,p?p+"."+k:k); }
  })(d,"");
}
const arr=[...count.entries()].sort((a,b)=>b[1]-a[1]);
const sentences = arr.filter(([s])=>!s.includes("本地人推荐") && !/^[\d:：（）()\-~〜区市县镇路街道号大厦].*$/.test(s) && !/区$|市$|县$|路$|街$|道$|号$/.test(s));
console.log("distinct non-pattern restaurant descriptions:", sentences.length);
for(const [s,c] of sentences.slice(0,60)) console.log(c+"x  ["+s+"]  <- "+loc.get(s)[0]);
