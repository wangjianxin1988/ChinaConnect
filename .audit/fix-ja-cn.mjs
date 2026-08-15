import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";

const TAG_MAP = {
  "性价比高": "コスパ最高",
  "排队王": "行列のできる店",
  "老字号": "老舗",
  "家常菜": "家庭料理",
  "社区老店": "地元の老舗",
  "文艺": "おしゃれ",
  "下午茶": "アフタヌーンティー",
  "安静": "落ち着いた",
  "猪肉": "豚肉",
};
const RUSSIAN_MAP = {
  " классическая рисовая миска Цзинань - тушеная свиная грудинка на рисе с подливой": "済南名物のご飯もの。豚バラ肉の煮込みを甘辛いタレでご飯にかけた一品。",
  " классик хунань ресторан с острыми блюдами и рисом.": "湖南料理の定番レストラン。辛い料理とご飯が楽しめます。",
  "Ночной рынок с разнообразными жареными мясными блюдами и шашлыками.": "焼き肉や串焼きなど多彩な肉料理が楽しめるナイトマーケット。",
  "Популярный сычуаньский ресторан с фирменным тофу мапо и острыми блюдами.": "四川料理の人気店。名物の麻婆豆腐と辛い料理が楽しめます。",
  "Местный любимый ресторан, подающий аутентичные блюда Тудзя в домашнем стиле.": "地元で愛されるレストラン。トゥチャ族の家庭料理を堪能できます。",
};
const ADDR_MAP = { "多家分店": "市内に複数店舗", "多条分店": "市内に複数店舗" };
const LOCAL_RE = /^(.{1,8}?)本地人推荐的(.+?)店，味道正宗，价格实惠$/;

let totalDesc = 0, totalTag = 0, totalRu = 0, totalAddr = 0;
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const file = path.join(dir, f);
  let d = JSON.parse(fs.readFileSync(file, "utf8"));
  (function walk(o){
    if(typeof o === "string") return;
    if(Array.isArray(o)){ o.forEach(walk); return; }
    if(o && typeof o === "object"){
      for(const [k,v] of Object.entries(o)){
        if(typeof v === "string"){
          if(k === "description"){
            const m = v.match(LOCAL_RE);
            if(m){ o[k] = m[1] + "の地元民おすすめの" + m[2] + "店。本格的な味で、価格もお手頃。"; totalDesc++; continue; }
            if(RUSSIAN_MAP[v]){ o[k] = RUSSIAN_MAP[v]; totalRu++; continue; }
          }
          if(k === "address" && ADDR_MAP[v]){ o[k] = ADDR_MAP[v]; totalAddr++; continue; }
          if(/^tags?$/i.test(k) === false && Array.isArray(o[k]) === false) { /* noop */ }
        } else if(Array.isArray(v) && /^tags?$/i.test(k)){
          v.forEach((t,i)=>{ if(typeof t==="string" && TAG_MAP[t]){ v[i]=TAG_MAP[t]; totalTag++; } });
        }
        walk(v);
      }
    }
  })(d);
  fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");
}
console.log("fixed desc:", totalDesc, "| russian:", totalRu, "| addr:", totalAddr, "| tags:", totalTag);
