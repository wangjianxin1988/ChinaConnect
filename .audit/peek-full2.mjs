import fs from "node:fs";
for (const [f, p] of [["dali","culturalTips[22].content"],["dali","culturalTips[20].content"],["dali","description"],["tianjin","description"]]) {
  const j = JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${f}.json`,"utf8"));
  const get=(o,ps)=>{const parts=ps.replace(/\[(\d+)\]/g,".$1").split(".");let v=o;for(const k of parts){v=v[k];}return v;};
  console.log("### "+f+"|"+p+"\n"+get(j,p)+"\n");
}
