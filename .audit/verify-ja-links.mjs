import fs from "fs";
import path from "path";
const distJa = "dist/ja";
const urls = [];
(function walk(dir, base){
  for(const e of fs.readdirSync(dir, {withFileTypes:true})){
    if(e.isDirectory()) walk(path.join(dir,e.name), base+"/"+e.name);
    else if(e.name === "index.html"){
      const p = base === "" ? "/ja/" : "/ja" + base + "/";
      urls.push(p);
    }
  }
})(distJa, "");
console.log("total built ja pages:", urls.length);
fs.writeFileSync(".audit/ja-all-urls.txt", urls.sort().join("\n"), "utf8");
// verify each against dev server
const BASE = "http://localhost:4321";
let ok=0, bad=0; const badList=[];
const CONC = 8; let cursor=0;
const workers = Array.from({length:CONC}, async ()=>{
  while(true){
    const i = cursor++;
    if(i>=urls.length) return;
    const u = urls[i];
    try{
      const r = await fetch(BASE+u, {redirect:"follow"});
      if(r.status===200){ ok++; }
      else { bad++; badList.push(u+" :: "+r.status); }
    }catch(e){ bad++; badList.push(u+" :: ERR "+e.message.split("\n")[0]); }
  }
});
await Promise.all(workers);
console.log("ok:", ok, "| bad:", bad);
if(badList.length) console.log(badList.slice(0,30).join("\n"));
