import fs from "node:fs";
const wants = [
  ["chengdu","description"],["chengdu","restaurants[13].description"],["chengdu","transport.arrival[0].tips"],
  ["qingdao","description"],
  ["shenzhen","description"],
  ["dali","description"],
  ["fuzhou","restaurants[1].dishHighlights"],
  ["guangzhou","attractions[9].tips"],["guangzhou","attractions[12].address"],["guangzhou","restaurants[6].address"],
  ["jinan","restaurants[8].description"],
  ["kunming","restaurants[6].address"],["kunming","attractions[18].highlights"],
  ["sanya","payment[0].howToUse"],["sanya","payment[1].howToUse"],
  ["xiamen","restaurants[3].dishHighlights"],["xiamen","restaurants[21].description"],["xiamen","attractions[19].description"],
  ["dunhuang","attractions[16].highlights"],
  ["chongqing","hotels[3].address"],["chongqing","attractions[6].tips"],["chongqing","attractions[9].highlights"],["chongqing","restaurants[1].description"],["chongqing","restaurants[6].address"],["chongqing","culturalTips[3].content"],
  ["guangzhou","culturalTips[15].content"],["guangzhou","attractions[1].tips"],
  ["lanzhou","restaurants[5].description"],
  ["suzhou","hotels[3].bookingTips"],["suzhou","attractions[6].description"],
  ["weihai","restaurants[12].address"],
  ["lijiang","attractions[2].tips"],
  ["shanghai","attractions[2].tips"],["shanghai","attractions[46].description"],
  ["kunming","hotels[3].tips"],["kunming","restaurants[14].description"],
  ["chengde","restaurants[9].description"],
  ["ningbo","attractions[14].address"],
  ["zhangjiajie","transport.local.taxi"],["zhangjiajie","transport.local.bus"],
  ["xian","restaurants[9].description"],
  ["dalian","restaurants[16].description"],["dalian","restaurants[16].dishHighlights"],["dalian","restaurants[15].description"]
];
function get(o,p){const parts=p.replace(/\[(\d+)\]/g,".$1").split(".");let v=o;for(const k of parts){if(v==null)return undefined;v=v[k];}return v;}
for(const [city,p] of wants){
  const en=JSON.parse(fs.readFileSync(`src/data/cities/${city}.json`,"utf8"));
  const ja=JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${city}.json`,"utf8"));
  console.log("### "+city+" :: "+p);
  console.log("  EN: "+JSON.stringify(get(en,p)));
  console.log("  JA: "+JSON.stringify(get(ja,p)));
}
