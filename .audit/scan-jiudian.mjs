import fs from "fs";
import path from "path";
const dir = "src/data/cities-i18n/ja";
const out = [];
function walk(obj, file, p){
  if(typeof obj==="string"){
    if(obj.includes("酒店")) out.push({file, path:p, text:obj.slice(0,90)});
    return;
  }
  if(Array.isArray(obj)){ obj.forEach((v,i)=>walk(v,file,p+"["+i+"]")); return; }
  if(obj && typeof obj==="object"){ for(const [k,v] of Object.entries(obj)) walk(v,file,p?p+"."+k:k); }
}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".json"))) walk(JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")), f, "");
// bucket by path kind
const buckets = {hotels:0, name:0, description:0, other:0};
const samples = {hotels:[], name:[], description:[], other:[]};
for(const o of out){
  const seg = o.path.split(".").pop().replace(/\[\d+\]/g,"");
  let b;
  if(/hotels?/.test(o.path)) b="hotels";
  else if(seg==="name") b="name";
  else if(/description|tips|notes|address|openingHours|ticketPrice/.test(o.path)) b="description";
  else b="other";
  buckets[b]++; if(samples[b].length<6) samples[b].push(o.file+" | "+o.path+" | "+o.text);
}
console.log(JSON.stringify(buckets));
for(const [b,arr] of Object.entries(samples)){ console.log("--- "+b+" ---"); for(const s of arr) console.log("  "+s); }
