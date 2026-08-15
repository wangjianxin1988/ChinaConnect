import fs from "node:fs";
import path from "node:path";

const DIR = "src/data/cities-i18n/ja";
const CACHE_PATH = ".audit/ja-translation-cache.json";
const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const ASCII_WORD = /[A-Za-z]{2,}/;
const SKIP_KEYS = new Set([
  "id", "slug", "icon", "phone", "lat", "lng", "coordinates", "rating", "reviewCount",
  "code", "image", "coverImage", "photos", "email", "url", "website", "star", "diamond",
  "method", "nameEn", "nameJa", "type", "category", "budget", "importance", "name",
  "avgPrice", "hours", "openingHours", "frequency", "bestMonths",
]);
const BRAND = /^(Alipay|WeChat Pay|WeChat|Didi|Mobike|Meituan|12306|Trip\.com|Canton Fair|Spa|WiFi|eSIM|SIM|Qinghai|Beijing|Shanghai|China|Waldorf|Hilton|Shangri-La|Marriott|Hyatt|Ritz|Four Seasons|InterContinental|Peninsula|St\. Regis|Mandarin|Sofitel|Sheraton|Pullman|Crowne Plaza|Wanda|Jinling|Westin|Fairmont|Pan Pacific|Club Med|Andaz|Conrad|Grand Millennium|Le Meridien|W |Banyan|Anantara|Raffles|Regent|Langham|Kempinski|Holiday Inn|Home Inn|7 Days|Atour|Hanting|Jinjiang|GreenTree|Vienna|Ramada|Howard Johnson|Wyndham|DoubleTree|Radisson|Novotel|Mercure|ibis|Somerset|Ascott|Oakwood|Citadines|Wyndham Grand|Swissotel|Emperor|Kerry|Nuwa|Alila|Aman|Bulgari|Wanda Realm|Temple House|Astor|Garden Hotel|Golden|Harbour|Grand|Royal|Plaza|City|Central|International|Jinmao|Peace|Dongfang|Oriental|Beijing|Shanghai|Guangzhou|Shenzhen|Chengdu|Hangzhou|Nanjing|Wuhan|Xian|Chongqing|Tianjin|Suzhou|Qingdao|Dalian|Xiamen|Sanya|Guilin|Kunming|Changsha|Harbin|Lhasa|Urumqi|Turpan|Kashgar|Dunhuang|Luoyang|Yantai|Weihai|Jinan|Ningbo|Fuzhou|Quanzhou|Zhuhai|Shantou|Zhengzhou|Hefei|Nanchang|Guiyang|Nanning|Haikou|Xining|Yinchuan|Hohhot|Changchun|Shenyang|Taiyuan|Shijiazhuang|Lanzhou|Chengde|Hulunbuir|Zhangjiajie|Dali|Lijiang|Shangri-La|Wuxi|Yangzhou|Nantong|Jiaxing|Shaoxing|Wenzhou|Taizhou|Jinhua|Huzhou|Quzhou|Zhoushan|Lishui)/i;

function isEnglish(s) {
  if (typeof s !== "string" || !s) return false;
  if (s.length < 2 || s.length > 500) return false;
  if (CJK.test(s)) return false;
  if (!ASCII_WORD.test(s)) return false;
  if (/^[\d\s.,:%()+\-–/°NSEW&·¥$€]+$/.test(s)) return false;
  if (s.includes("http") || s.includes("@") || s.includes(".com") || s.includes(".cn")) return false;
  if (/^(UTC|N\/A|TBD)$/i.test(s)) return false;
  if (BRAND.test(s)) return false;
  if (/^[A-Za-z0-9_\-.]+$/.test(s) && !s.includes(" ")) {
    return /^[a-z][a-z-]{3,}$/.test(s) && !/^(night|per|min|max|day|week|month|year|line|stop|exit|gate|open|closed)$/.test(s.toLowerCase()) ? true : false;
  }
  return true;
}

let filesChanged = 0, stringsReplaced = 0, unmatched = 0;
const missing = new Set();
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const filePath = path.join(DIR, f);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n"));
  let changed = false;
  (function walk(obj) {
    if (Array.isArray(obj)) { obj.forEach(walk); return; }
    if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        if (SKIP_KEYS.has(k)) continue;
        walk(obj[k]);
      }
      return;
    }
    if (isEnglish(obj)) {
      const t = cache[obj];
      if (t && t !== obj) {
        // replace via parent: need parent reference; do in separate pass below
      }
    }
  })(data);
  // do replacement pass with parent tracking
  let fileReplaced = 0;
  (function walk2(obj, parent, key, idx) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk2(v, obj, null, i)); return; }
    if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        if (SKIP_KEYS.has(k)) continue;
        walk2(obj[k], obj, k, null);
      }
      return;
    }
    if (isEnglish(obj)) {
      const t = cache[obj];
      if (t && t !== obj) {
        if (key !== null) parent[key] = t; else parent[idx] = t;
        fileReplaced++; stringsReplaced++;
      } else if (!t) { unmatched++; missing.add(obj.slice(0, 60)); }
    }
  })(data, null, null, null);
  if (fileReplaced > 0) {
    const tmp = filePath + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, filePath);
    filesChanged++;
    console.log(f, "replaced:", fileReplaced);
  }
}
console.log("files changed:", filesChanged, "strings replaced:", stringsReplaced, "unmatched english:", unmatched);
const sample = [...missing].slice(0, 30);
console.log("sample unmatched:", JSON.stringify(sample, null, 1));
