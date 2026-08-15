import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const KANA = /[ぁ-んァ-ヶ]/;
const CN = new RegExp("[广门车场机东乐园馆岛图发汉阳长马鱼龙兴华风观远达丽质铁这还现县乡为务报卖单难态说认让议变盘环实贵惠味正宗推酱面店豆汁炒肝爆肚涮羊肉饭馆务员菜单营打折优导航里走骑坐推荐实惠味道本地人营业时间开放时间门票免费收费套餐预约订位评价好评老字号家常菜下午茶安静文艺环境服务排队隐藏美食]");
const tags = new Map(), desc = new Map(), locT = new Map(), locD = new Map();
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const d = JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
  (function walk(o,p){
    if(typeof o==="string"){
      if(o.length>=2 && !KANA.test(o) && CN.test(o)){
        if(/tags\[\d+\]$/.test(p)){ tags.set(o,(tags.get(o)||0)+1); if(!locT.has(o)) locT.set(o,[]); if(locT.get(o).length<2) locT.get(o).push(f); }
        else if(/\.(description|tips|content)(\[\d+\])?$/.test(p)){ desc.set(o,(desc.get(o)||0)+1); if(!locD.has(o)) locD.set(o,[]); if(locD.get(o).length<2) locD.get(o).push(f+" | "+p); }
      }
      return;
    }
    if(Array.isArray(o)){ o.forEach((v,i)=>walk(v,p+"["+i+"]")); return; }
    if(o&&typeof o==="object"){ for(const [k,v] of Object.entries(o)) walk(v,p?p+"."+k:k); }
  })(d,"");
}
console.log("=== remaining CN tags ===");
for(const [s,c] of [...tags].sort((a,b)=>b[1]-a[1]).slice(0,40)) console.log(c+"x  ["+s+"]  "+locT.get(s).join(","));
console.log("=== remaining CN prose ===");
for(const [s,c] of [...desc].sort((a,b)=>b[1]-a[1]).slice(0,40)) console.log(c+"x  ["+s+"]  "+locD.get(s)[0]);
