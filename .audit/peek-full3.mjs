import fs from "node:fs";
for (const [f, p] of [["tianjin","description"],["qingdao","restaurants[18].cuisine"],["qingdao","restaurants[18].name"],["xiamen","restaurants[1].name"],["suzhou","culturalTips[7].content"],["dali","culturalTips[22].content"],["guangzhou","hotels[0].address"]]) {
  const en = JSON.parse(fs.readFileSync(`src/data/cities/${f}.json`,"utf8"));
  const get=(o,ps)=>{const parts=ps.replace(/\[(\d+)\]/g,".$1").split(".");let v=o;for(const k of parts){if(v==null)return undefined;v=v[k];}return v;};
  console.log("### "+f+"|"+p+"\n  EN: "+JSON.stringify(get(en,p))+"\n");
}
