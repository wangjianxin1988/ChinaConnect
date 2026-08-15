import fs from "node:fs";
const wants = [
  ["chengdu","culturalTips[9].content"],["chengdu","culturalTips[16].content"],["chengdu","culturalTips[22].content"],["chengdu","transport.local.bus[1]"],
  ["zhangjiajie","hotels[1].address"],["zhangjiajie","attractions[16].address"],["zhangjiajie","restaurants[17].address"],["zhangjiajie","restaurants[23].address"],
  ["guangzhou","attractions[19].description"],["guangzhou","restaurants[13].name"],["guangzhou","restaurants[13].description"],
  ["xiamen","restaurants[3].dishHighlights"],["xiamen","restaurants[21].description"],["xiamen","attractions[19].description"],["xiamen","attractions[14].description"],
  ["sanya","payment[0].howToUse"],["sanya","payment[1].howToUse"],
  ["kunming","attractions[18].highlights"],["kunming","restaurants[6].address"],["kunming","restaurants[14].description"],
  ["fuzhou","attractions[11].tips"],["fuzhou","hotels[4].address"],["fuzhou","restaurants[1].dishHighlights"],
  ["lanzhou","restaurants[5].description"],["lanzhou","restaurants[8].description"],
  ["shanghai","restaurants[2].description"],["shanghai","attractions[30].highlights"],["shanghai","attractions[48].description"],
  ["yantai","restaurants[7].cuisine"],["yantai","restaurants[7].description"],["yantai","restaurants[7].dishHighlights"],
  ["suzhou","restaurants[0].dishHighlights"],
  ["weihai","hotels[10].highlights"],["weihai","hotels[10].address"],
  ["nanjing","attractions[10].highlights"],
  ["dalian","restaurants[16].dishHighlights"],
  ["xian","restaurants[45].cuisine"],["xian","restaurants[45].description"],
  ["beijing","restaurants[30].dishHighlights"]
];
function get(o,p){const parts=p.replace(/\[(\d+)\]/g,".$1").split(".");let v=o;for(const k of parts){if(v==null)return undefined;v=v[k];}return v;}
for(const [city,p] of wants){
  const en=JSON.parse(fs.readFileSync(`src/data/cities/${city}.json`,"utf8"));
  const ja=JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${city}.json`,"utf8"));
  console.log("### "+city+" :: "+p);
  console.log("  EN: "+JSON.stringify(get(en,p)).slice(0,500));
  console.log("  JA: "+JSON.stringify(get(ja,p)).slice(0,500));
}
