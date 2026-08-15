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
      if(o.length>=6 && !KANA.test(o) && /[\u4e00-\u9fff]/.test(o) && (p.includes("description")||p.includes("tips")||p.includes("address")||p.includes("openingHours")||p.includes("ticketPrice"))){
        count.set(o,(count.get(o)||0)+1);
        if(!loc.has(o)) loc.set(o,[]);
        if(loc.get(o).length<3) loc.get(o).push(f+" | "+p);
      }
      return;
    }
    if(Array.isArray(o)){ o.forEach((v,i)=>walk(v,p+"["+i+"]")); return; }
    if(o&&typeof o==="object"){ for(const [k,v] of Object.entries(o)) walk(v,p?p+"."+k:k); }
  })(d,"");
}
const arr=[...count.entries()].sort((a,b)=>b[1]-a[1]);
console.log("distinct no-kana prose strings:", arr.length, "| total occurrences:", arr.reduce((s,[,c])=>s+c,0));
for(const [s,c] of arr.slice(0,80)) console.log(c+"x  ["+s+"]  <- "+loc.get(s)[0]);
