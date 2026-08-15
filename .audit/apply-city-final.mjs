// Apply DeepSeek cache + kanji fixes + xm-* names + currency fix to ja city JSONs
import fs from "node:fs";
import path from "node:path";

const CACHE = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
const LOCS = JSON.parse(fs.readFileSync(".audit/ja-city-translate-locations.json", "utf8"));
const PRICES = JSON.parse(fs.readFileSync(".audit/ja-city-price-range.json", "utf8"));

const SIMP = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
const simpRe = new RegExp("[" + SIMP.join("") + "]");

// Simplified -> Japanese kanji char map (for chars found in ja city strings)
const CHAR_MAP = {
  东:"東",丽:"麗",亚:"亜",兰:"蘭",兴:"興",刘:"劉",华:"華",厅:"庁",处:"処",尔:"爾",
  帮:"幫",汇:"匯",滨:"浜",营:"営",虾:"蝦",蚵:"蚵",话:"話",边:"辺",钱:"錢",门:"門",
  陕:"陝",顶:"頂",风:"風",饺:"餃",驴:"驢",鹅:"鵝",鹏:"鵬",书:"書",云:"雲",栈:"桟",
  滩:"灘",广:"広",龙:"龍",阳:"陽",岭:"嶺",县:"県",梦:"夢",谷:"谷",馆:"館",饭:"飯",
  园:"園",场:"場",岛:"島",台:"台",镇:"鎮",城:"城",桥:"橋",村:"村",路:"路",滩:"灘",
};
const PHRASE_MAP = [
  ["ゲル营地", "ゲルキャンプ"],
  ["各处", "各所"],
  ["茶餐厅", "茶餐庁"],
];
function kanjiFix(s) {
  let out = s;
  for (const [a, b] of PHRASE_MAP) out = out.split(a).join(b);
  out = out.split("").map((ch) => CHAR_MAP[ch] || ch).join("");
  return out;
}

// xm-* restaurant name fixes (xiamen garbage placeholder names)
const XM_NAMES = {
  "xm-sのメリット": "アイエスオー（ISO）",
  "xm-yuxi": "玉熙（ユーシー）",
  "xm-jianong": "稼農（ジアノン）",
  "xm-エユエホワ": "月華（ユエホア）",
  "xm-ナイアンザ": "耐庵斎（ナイアンザイ）",
  "xm-ハイゼン": "海正（ハイヂョン）",
  "xm-シャシェン": "沙県小吃（シャーシェン）",
  "xm-ラオモン": "老夢（ラオモン）",
  "xm-ダグ": "大鼓（ダーグー）",
  "xm-紅霞": "紅霞（ホンシア）",
  "xm-身心": "身心（シンシン）",
  "xm-聴雨谷": "聴雨谷（ティンイーグー）",
  "xm-路線": "鮮魯（シェンルー）",
  "xm-新苑": "新苑（シンユエン）",
  "xm-龍徳": "龍徳（ロンドー）",
  "xm-zhaole": "招楽（ヂャオラー）",
  "xm-chengyi": "程逸（チェンイー）",
};

function writeJson(p, data) {
  const tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, p);
}

const dir = "src/data/cities-i18n/ja";
const filesChanged = new Set();
let replaced = 0, missed = 0, priceFixed = 0, xmFixed = 0;

function applyToLocations(str, ja) {
  const locs = LOCS[str] || [];
  for (const { file, path: keyPath } of locs) {
    const p = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n"));
    const segs = keyPath.match(/[^.\[\]]+|\[\d+\]/g) || [];
    let node = data, ok = true;
    for (const seg of segs) {
      if (/^\[\d+\]$/.test(seg)) { const i = Number(seg.slice(1, -1)); if (!Array.isArray(node) || !(i in node)) { ok = false; break; } node = node[i]; }
      else { if (node && typeof node === "object" && seg in node) node = node[seg]; else { ok = false; break; } }
    }
    if (!ok || node !== str) { missed++; continue; }
    const parentPath = segs.slice(0, -1);
    const lastSeg = segs[segs.length - 1];
    let parent = data;
    for (const seg of parentPath) {
      if (/^\[\d+\]$/.test(seg)) parent = parent[Number(seg.slice(1, -1))];
      else parent = parent[seg];
    }
    if (/^\[\d+\]$/.test(lastSeg)) parent[Number(lastSeg.slice(1, -1))] = ja;
    else parent[lastSeg] = ja;
    writeJson(p, data);
    filesChanged.add(file);
    replaced++;
  }
}

// 1) Apply translations from cache
for (const [str, ja] of Object.entries(CACHE)) {
  if (!LOCS[str]) continue;
  if (ja === str) continue;
  applyToLocations(str, ja);
}

// 2) Apply kanji-fix to strings still containing simplified chars (unchanged or not in cache)
for (const str of Object.keys(LOCS)) {
  const ja = CACHE[str];
  if (ja && ja !== str) continue; // already translated
  if (!simpRe.test(str)) continue;
  const fixed = kanjiFix(str);
  if (fixed !== str) applyToLocations(str, fixed);
}

// 3) xm-* restaurant names in xiamen.json
{
  const p = path.join(dir, "xiamen.json");
  const data = JSON.parse(fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n"));
  let changed = false;
  if (Array.isArray(data.restaurants)) {
    data.restaurants.forEach((r) => {
      if (XM_NAMES[r.name]) { r.name = XM_NAMES[r.name]; changed = true; xmFixed++; }
      if (typeof r.nameEn === "string" && r.nameEn.trim().startsWith(" ") ) { r.nameEn = r.nameEn.trim(); changed = true; }
    });
  }
  if (changed) { writeJson(p, data); filesChanged.add("xiamen.json"); }
}

// 4) priceRange 円 -> 元
{
  const byFile = {};
  for (const pr of PRICES) { (byFile[pr.file] ||= []).push(pr); }
  for (const [file, list] of Object.entries(byFile)) {
    const p = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n"));
    let changed = false;
    for (const { idx } of list) {
      const h = data.hotels?.[idx];
      if (h && typeof h.priceRange === "string" && h.priceRange.includes("円")) {
        h.priceRange = h.priceRange.split("円").join("元");
        changed = true; priceFixed++;
      }
    }
    if (changed) { writeJson(p, data); filesChanged.add(file); }
  }
}

console.log("files changed:", filesChanged.size);
console.log("replaced:", replaced, "| missed:", missed, "| priceFixed:", priceFixed, "| xmFixed:", xmFixed);
