import fs from "node:fs";
import path from "node:path";
const FIXES2 = {
  "dali.json|description": "大理は雲南省の絵のように美しい町で、雄大な蒼山を背に、透き通った洱海のほとりに位置しています。1000年の歴史を持つ白族の故郷であり、石畳の道、伝統的な白族建築、活気ある地元文化で知られています。サイクリング、ハイキング、文化体験に最適な落ち着いた雰囲気です。",
  "dali.json|restaurants[7].dishHighlights[3]": "湖の眺めを楽しむダイニング",
  "dali.json|restaurants[8].cuisine": "白族の特産料理",
  "dali.json|restaurants[23].description": "湖畔の居心地の良いカフェで、洱海の景色を楽しみながら、雲南コーヒー、洋風の朝食、手作りペストリーを提供しています。",
  "dali.json|transport.local.bus[3]": "景観ルートの「川の歌」バス",
  "dali.json|culturalTips[1].content": "洱海湖畔のサイクリングは象徴的な体験です。湖の周囲は120kmあります。早朝に出発し、水と日焼け止めを持参しましょう。大理または才村で自転車をレンタルできます。東側の湖畔は比較的空いています。",
  "dali.json|culturalTips[8].content": "白族の女性は「三道茶」の衣装、白いジャケット、青いベルト、刺しゅう入りの靴を着ています。有名な鳳凰帽の頭飾りは鳳凰を象徴しています。観光エリアでは写真用の衣装をレンタルできます。",
  "dali.json|culturalTips[17].content": "大理は藍染製品、銀細工、お茶（特に普洱茶）、大理石で有名です。最高の買い物は喜洲の朝市と周城の藍染、そして大理旧市街の外国人通りで銀製品やお土産を購入できます。市場では値切りが一般的です。",
  "dali.json|culturalTips[20].content": "洱海の生態系は脆弱です。使い捨てプラスチックを避け、立ち入り禁止区域では泳がないでください。環境に優しい移動手段を利用し、湖の保護活動に参加しましょう。責任ある旅行者になりましょう。",
  "dali.json|culturalTips[21].content": "大理は南詔国（738-902年）の首都でした。中国史上最も長く続いた王朝の一つです。三塔、南詔島、巍山古城はこの遺産を反映しています。歴史を理解すると訪問がより豊かなものになります。",
  "dali.json|culturalTips[22].content": "雲南省は中国で最高品質のコーヒーを生産しています。大理には地元産の豆を使ったスペシャルティコーヒーショップがいくつかあります。外国人通りのカフェで雲南式のハンドドリップを試してみましょう。近くにはコーヒー農園もあり、見学ツアーを提供しています。",
  "dali.json|culturalTips[24].content": "大理はデジタルノマドやリモートワーカーの人気の拠点になっています。多くのカフェが高速WiFiと静かな作業スペースを提供しています。月額のアパート賃料は手頃です。コワーキングスペースは大理旧市街で利用できます。",
  "dali.json|attractions[2].description": "伝統的な白族建築、趣のある石畳の道、生き生きとした地元文化が美しく保存された古代の町です。",
  "dali.json|attractions[2].tips": "夜の雰囲気を体験するために宿泊しましょう。お店が開く前の早朝は写真撮影に最適です。路地裏を探検して本物の白族の暮らしを体験してください。",
  "dali.json|attractions[7].description": "古代の木々に囲まれた伝説の泉で、春の蝶の繁殖期と伝統的に関連付けられています。",
  "dali.json|attractions[8].tips": "週末の朝市を訪れましょう。藍染めのDIY体験をしてみましょう。写真は早朝がベストです。",
  "dali.json|attractions[15].tips": "日の出と日没がベストです。週末は非常に混雑します。喜洲ツアーと組み合わせましょう。",
  "qingdao.json|restaurants[18].cuisine": "新雅苑シーフードシティ",
  "sanya.json|culturalTips[18].title": "シーフード価格のヒント",
  "shenzhen.json|restaurants[3].dishHighlights[0]": "シーフード粥",
  "shenzhen.json|restaurants[11].dishHighlights[2]": "子豚の丸焼き（ローストポーク）",
  "shenzhen.json|restaurants[18].tags[0]": "シーフード",
  "tianjin.json|restaurants[21].dishHighlights[0]": "シーフード粥",
  "tianjin.json|description": "北京近くの活気ある港町・天津は、欧風の植民地建築と伝統的な中国文化が融合しています。古文化街、麻花と狗不理包子で知られる食文化、そして素晴らしい天津之眼（観覧車）で有名です。",
  "tianjin.json|restaurants[20].address": "天津市南京路166号、大悦城（Joy City）",
  "quanzhou.json|attractions[23].address": "徳化県",
  "quanzhou.json|attractions[24].address": "徳化県",
  "quanzhou.json|hotels[15].address": "恵安県",
  "quanzhou.json|attractions[4].highlights[0]": "媽祖信仰",
  "quanzhou.json|attractions[4].tips": "海洋文化にとって重要です。近くの媽祖クッキーを試してみましょう。",
  "quanzhou.json|restaurants[23].dishHighlights[3]": "ラクサ",
  "quanzhou.json|restaurants[24].dishHighlights[2]": "新鮮なウナギ",
  "quanzhou.json|hotels[8].address": "石獅市",
  "guangzhou.json|attractions[6].highlights[0]": "マングローブ遊覧船",
  "guangzhou.json|hotels[0].address": "天河区珠江西路5号、IFCタワー2 3階",
  "suzhou.json|culturalTips[7].content": "市場では値切りが当然です。提示価格の30〜40%から交渉を始めましょう。親しみやすく、しかししっかりと交渉しましょう。ほとんどの定価店は手頃な価格です。",
  "chongqing.json|attractions[22].highlights[1]": "島巡り",
  "chongqing.json|attractions[22].highlights[3]": "水上アクティビティ",
  "beijing.json|attractions[44].recommendedVisitTime": "1〜2時間（ツアー）",
  "nanjing.json|attractions[20].highlights[3]": "竹林",
};
function navigate(obj, pathStr) {
  const parts = pathStr.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let v = obj;
  for (const k of parts) { if (v == null) return undefined; v = v[k]; }
  return v;
}
function setPath(obj, pathStr, val) {
  const parts = pathStr.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let v = obj;
  for (let i = 0; i < parts.length - 1; i++) { if (v[parts[i]] == null) return false; v = v[parts[i]]; }
  const last = parts[parts.length - 1];
  if (v == null || !(last in v)) return false;
  v[last] = val;
  return true;
}
const dir = "src/data/cities-i18n/ja";
let applied = 0, missing = 0;
const missingList = [];
const byFile = new Map();
for (const key of Object.keys(FIXES2)) {
  const [file, pathStr] = key.split("|");
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push([pathStr, FIXES2[key]]);
}
for (const [file, fixes] of byFile) {
  const fp = path.join(dir, file);
  const obj = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const [pathStr, val] of fixes) {
    if (navigate(obj, pathStr) === undefined) { missing++; missingList.push(file + "|" + pathStr); continue; }
    setPath(obj, pathStr, val);
    applied++;
  }
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf8");
}
console.log("round2 applied:", applied, "| missing:", missing);
if (missingList.length) console.log("MISSING:\n" + missingList.join("\n"));
