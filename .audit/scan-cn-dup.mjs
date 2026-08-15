import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const KANA = /[ぁ-んァ-ヶ]/;
const CN = new RegExp("[广门车场机东乐园馆岛图发汉阳长马鱼龙兴华风观远达丽质铁这还现县乡为务报卖单难态说认让议变盘环实贵惠味正宗推酱面店豆汁炒肝爆肚涮羊肉饭馆务员菜单营打折优导航里走骑坐]");
const count = new Map();
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const d = JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
  (function walk(o){
    if(typeof o==="string"){
      if(o.length>=4 && !KANA.test(o) && CN.test(o)){
        count.set(o,(count.get(o)||0)+1);
      }
      return;
    }
    if(Array.isArray(o)){ o.forEach(walk); return; }
    if(o&&typeof o==="object"){ for(const v of Object.values(o)) walk(v); }
  })(d);
}
const arr = [...count.entries()].sort((a,b)=>b[1]-a[1]);
console.log("distinct strings:", arr.length);
for(const [s,c] of arr.slice(0,60)) console.log(c+"x  "+s);
