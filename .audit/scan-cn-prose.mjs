import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const KANA = /[ぁ-んァ-ヶ]/;
const HAN = /[\u4e00-\u9fff]/;
const LATIN = /[A-Za-z]/;
const SKIP_KEYS = new Set(["id","slug","coordinates","coverImage","imageUrl","image","icon","lat","lng","country","category","type","budget","importance","method","nameEn","phone","website","url","email","hours","openingHours"]);
const out = [];
function walk(obj, file, p){
  if(typeof obj==="string"){
    if(obj.length < 4) return;
    const segs = p.split(".").map(s=>s.replace(/\[\d+\]/g,""));
    if(segs.some(s=>SKIP_KEYS.has(s))) return;
    const hasKana = KANA.test(obj);
    const hanCount = (obj.match(HAN)||[]).length;
    const hasLatin = LATIN.test(obj);
    if(!hasKana && !hasLatin && hanCount >= 4 && hanCount/obj.length > 0.4){
      out.push({file,path:p,text:obj.slice(0,70)});
    }
    return;
  }
  if(Array.isArray(obj)){ obj.forEach((v,i)=>walk(v,file,p+"["+i+"]")); return; }
  if(obj && typeof obj==="object"){ for(const [k,v] of Object.entries(obj)) walk(v,file,p?p+"."+k:k); }
}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))) walk(JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")), f, "");
console.log("pure-han-no-kana strings:", out.length);
const byFile = new Map();
for(const o of out){ byFile.set(o.file,(byFile.get(o.file)||0)+1); }
console.log("files affected:", byFile.size);
for(const [f,c] of [...byFile.entries()].sort((a,b)=>b[1]-a[1])) console.log(" ", f, c);
console.log("--- samples ---");
for(const o of out.slice(0,40)) console.log(o.file+" | "+o.path+" | "+o.text);
