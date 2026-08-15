import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const KANA = /[ぁ-んァ-ヶ]/;
const CN = new RegExp("[广门车场机东乐园馆岛图发汉阳长马鱼龙兴华风观远达丽质铁这还现县乡为务报卖单难态说认让议变盘环实贵惠味正宗推酱面店豆汁炒肝爆肚涮羊肉饭馆务员菜单营打折优导航里走骑坐推荐实惠味道本地人营业时间开放时间门票免费收费套餐预约订位评价好评老字号家常菜下午茶安静文艺环境服务排队]");
const count = new Map(); const loc = new Map();
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const d = JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
  (function walk(o,p){
    if(typeof o==="string"){
      if(o.length>=2 && !KANA.test(o) && /tags\[\d+\]$/.test(p) && CN.test(o)){
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
console.log("distinct CN-flavored tags:", arr.length, "occ:", arr.reduce((s,[,c])=>s+c,0));
for(const [s,c] of arr.slice(0,60)) console.log(c+"x  ["+s+"]  <- "+loc.get(s)[0]);
