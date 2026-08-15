import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
// simplified-only chars (not valid Japanese kanji in these words)
const bad = /[广场地铁高铁公交出租车门票酒店旺季淡季机场火车站这里这个我们很的了吗吗/]./;
const terms = ["广场","地铁","高铁","公交","出租车","门票","酒店","旺季","淡季","营业时间","开放时间","机场","火车站","这里","这个","我们","很","的","吗","呢","们","什么","怎么","现在","可以","需要","如果","但是","因为","所以","时候","地方","东西","朋友","家人","酒店","房间","电话","号码","地址","信息","服务","免费","收费","价格","费用","时间","分钟","小时","天","周","月","年"];
const found = [];
function walk(obj, file, p){
  if(typeof obj==="string"){
    for(const t of terms){
      if(obj.includes(t)) found.push({file,path:p,term:t,text:obj.slice(0,80)});
    }
    return;
  }
  if(Array.isArray(obj)){ obj.forEach((v,i)=>walk(v,file,p+"["+i+"]")); return; }
  if(obj && typeof obj==="object"){ for(const [k,v] of Object.entries(obj)){ walk(v,file,p?p+"."+k:k); } }
}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))) walk(JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")), f, "");
const byTerm = new Map();
for(const f of found){ const k=f.term; if(!byTerm.has(k)) byTerm.set(k,[]); byTerm.get(k).push(f.file); }
console.log("total hits:", found.length);
for(const [t, files] of [...byTerm.entries()].sort((a,b)=>b[1].length-a[1].length)){
  console.log(t, "->", files.length, "files:", [...new Set(files)].slice(0,6).join(","));
}
