import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
// fix remaining
let t1=0,t2=0;
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))){
  const file = path.join(dir, f);
  let d = JSON.parse(fs.readFileSync(file, "utf8"));
  (function walk(o){
    if(typeof o==="string") return;
    if(Array.isArray(o)){ o.forEach(walk); return; }
    if(o&&typeof o==="object"){
      for(const [k,v] of Object.entries(o)){
        if(typeof v==="string"){
          if(k==="tips" && /^(\d+(?:-\d+)?)月最美。$/.test(v)){
            o[k] = v.replace(/^(\d+(?:-\d+)?)月最美。$/, "$1月が見頃。"); t1++;
          }
        } else if(Array.isArray(v) && /^tags?$/i.test(k)){
          v.forEach((x,i)=>{ if(x==="隐藏美食"){v[i]="隠れた名店"; t2++;} if(x==="深夜美食"){v[i]="深夜グルメ"; t2++;} if(x==="速食"){v[i]="ファストフード"; t2++;} });
        }
        walk(v);
      }
    }
  })(d);
  fs.writeFileSync(file, JSON.stringify(d, null, 2), "utf8");
}
console.log("tips fixed:", t1, "| tags fixed:", t2);
