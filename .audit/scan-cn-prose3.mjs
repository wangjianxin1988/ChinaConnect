import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const KANA = /[ぁ-んァ-ヶ]/;
// simplified-only chars (never used in Japanese orthography)
const SIMP = /[广门车场机东乐园馆岛图发汉阳长马鱼龙兴华风观远达丽质铁这还现县乡为务报卖单难态说认让议变盘环实贵惠味正宗推酱面店豆汁炒肝爆肚涮羊肉饭馆务员菜单营打折优导航里走骑坐] /;
// fix: remove trailing space typo
const SIMP2 = new RegExp("[广门车场机东乐园馆岛图发汉阳长马鱼龙兴华风观远达丽质铁这还现县乡为务报卖单难态说认让议变盘环实贵惠味正宗推酱面店豆汁炒肝爆肚涮羊肉饭馆务员菜单营打折优导航里走骑坐]");
const CN_WORDS = ["推荐","实惠","正宗","味道","本地人","营业时间","开放时间","门票","免费","收费","套餐","预约","订位","评价","好评","人气","性价比","性价比高","特色菜","招牌菜","老字号","环境好","服务好","分量足","排队"];
const PROSE = /description|tips|notes|content|highlight|openingHours|ticketPrice|recommendedVisitTime|address/;
const out = [];
function walk(obj, file, p){
  if(typeof obj==="string"){
    if(obj.length < 4) return;
    const hasKana = KANA.test(obj);
    if(hasKana) return;
    const hasSimp = SIMP2.test(obj);
    const hasCnWord = CN_WORDS.some(w=>obj.includes(w));
    if(hasSimp || hasCnWord){
      out.push({file,path:p,text:obj.slice(0,70),simp:hasSimp,cn:hasCnWord});
    }
    return;
  }
  if(Array.isArray(obj)){ obj.forEach((v,i)=>walk(v,file,p+"["+i+"]")); return; }
  if(obj && typeof obj==="object"){ for(const [k,v] of Object.entries(obj)) walk(v,file,p?p+"."+k:k); }
}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))) walk(JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")), f, "");
console.log("suspicious CN-flavored strings:", out.length);
const byFile = new Map();
for(const o of out){ byFile.set(o.file,(byFile.get(o.file)||0)+1); }
for(const [f,c] of [...byFile.entries()].sort((a,b)=>b[1]-a[1])) console.log(" ", f, c);
console.log("--- samples (prose only) ---");
let n=0;
for(const o of out){ if(PROSE.test(o.path) && n<50){ n++; console.log(o.file+" | "+o.path+" | "+o.text); } }
