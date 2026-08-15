import fs from "node:fs";
import path from "node:path";

const dir = "src/data/cities-i18n/ja";
const EXCLUDE_KEYS = new Set([
  "id","slug","coordinates","coverImage","imageUrl","image","icon","lat","lng","country","nameEn",
  // enum keys mapped to localized labels in UI
  "type","category","budget","importance","method"
]);
const ALLOW_WORDS = new Set([
  "WeChat","Alipay","PayPal","UnionPay","Apple","Google","Visa","Mastercard","JCB","Amex","Diners","Discover","Pay","Didi","Meituan","Gaode","Amap","Baidu","Tencent","QQ","Taobao","Tmall","JD","Trip","Trip.com","Ctrip","Fliggy","Booking","Airbnb","Agoda","Klook","Uber","LINE","WhatsApp","Xiaohongshu","RedNote","Douyin","TikTok","Meituan",
  "Metro","Airport","Express","Station","SIM","eSIM","WiFi","Wi-Fi","QR","GPS","LTE","NFC","USB","SMS","VPN","OTP","ID","CVV","PIN","ATM","EMS","SF","DHL","5G","4G",
  "CNY","RMB","USD","EUR","JPY","HKD","UTC","AM","PM","Mon","Tue","Wed","Thu","Fri","Sat","Sun","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  "PEK","PKX","SHA","PVG","CAN","CTU","HGH","KWL","SZX","XIY","CKG","DLC","TAO","TNA","WUH","XMN","NGB","FOC","CSX","TSN","URC","HET","YNT","WEH","LJG","XNN","CGO","HRB","HLD","JHG","ZUH","NNG","KMG","LHW","DNH",
  "Mid-Range","MID-RANGE","Luxury","Budget","Standard","Deluxe","Suite","Hostel","Resort","Hotel","Hotels.com","Trip.com","Booking.com","Ctrip","Agoda","Airbnb",
  "Hotpot","BBQ","Cantonese","Sichuan","Hunan","Shanghainese","Dim","Dumpling","Noodle","Rice","Tea","Peking","Mapo","Kung","Pao","Dan","Deng",
  "China","Beijing","Shanghai","Guangzhou","Shenzhen","Hangzhou","Chengdu","Chongqing","Xi'an","Xian","Tianjin","Suzhou","Nanjing","Wuhan","Qingdao","Dalian","Xiamen","Kunming","Harbin","Lhasa","Urumqi","Guilin","Yangshuo","Dali","Lijiang","Zhangjiajie","Luoyang","Dunhuang","Lanzhou","Xining","Yantai","Weihai","Fuzhou","Quanzhou","Ningbo","Changsha","Chengde","Hulunbuir","Sanya","Jinan","Macau","Hong","Kong","Taiwan","Tokyo","Osaka","Korea","Japan","Asia",
  "Tourist","Temple","Street","River","Lake","Mountain","Island","Tower","Beach","Garden","Museum","Park","Old","New","North","South","East","West","Central","English","Japanese","Mandarin","Cantonese","International","World","Heritage","UNESCO","Open","Closed","OCT-LOFT","Stone","Forest","Tiger","Beach","Loft","Sanyuan","Wangfujing","Qianmen","Sanlitun","Wudaokou","Zhongguancun","CBD","Forbidden","City","Summer","Palace","Great","Wall","Temple","Heaven","Summer",
  "Hmm","Yes","No","OK","App","AI","Mini","Program","Day","Night","Floor","Level","Exit","Entrance","Gate","Platform","Terminal","Railway","Metro","Line","Chengdu","Pearl","River","Tower","West","Lake","East","Gate"
]);

function isAllowed(w) {
  return ALLOW_WORDS.has(w) || /^[A-Z][a-z]+[A-Z]/.test(w); // CamelCase names
}

const result = [];
function walk(obj, file, p) {
  if (typeof obj === "string") {
    if (p.split(".").some((seg) => EXCLUDE_KEYS.has(seg.replace(/\[\d+\]/g, "")))) return;
    const words = obj.match(/[A-Za-z][A-Za-z.'’-]{1,}/g);
    if (!words) return;
    const suspect = words.map((w) => w.replace(/[.'’-]$/,"")).filter((w) => w.length >= 3 && !isAllowed(w));
    if (suspect.length) {
      result.push({ file, path: p, text: obj.slice(0, 120), words: [...new Set(suspect)].slice(0, 8) });
    }
    return;
  }
  if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, file, p + "[" + i + "]")); return; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (EXCLUDE_KEYS.has(k)) continue;
      walk(v, file, p ? p + "." + k : k);
    }
  }
}
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const obj = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  walk(obj, f, "");
}
const byWord = new Map();
for (const r of result) for (const w of r.words) {
  if (!byWord.has(w)) byWord.set(w, []);
  byWord.get(w).push(r.file + " :: " + r.path);
}
const sorted = [...byWord.entries()].sort((a, b) => b[1].length - a[1].length);
console.log("suspect entries:", result.length, "| unique words:", sorted.length);
for (const [w, locs] of sorted) {
  console.log(w + " (" + locs.length + ")");
  for (const l of locs.slice(0, 5)) console.log("    " + l);
}
fs.writeFileSync(".audit/ja-city-english-precise.json", JSON.stringify(result, null, 2));
