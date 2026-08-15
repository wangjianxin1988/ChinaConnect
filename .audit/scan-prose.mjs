import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
// patterns of acceptable proper-noun lines
const ACCEPT = /^(Trip\.com|Wise|Pleco|.*Hotel|.*Inn|.*Resort|.*Hospital|.*Consulate|.*Embassy|.*Police|.*Fire|.*Bureau|.*Airlines|.*Airport|.*University|.*Medical|.*Center|.*Centre|.*International|.*Garden|.*Plaza|.*Tower|.*Club|.*Bank|.*Express|.*St\.|.*Dr\.|.*Rd\.|.*Ave\.|.*Subway|.*Line [0-9]|.*Station|.*Metro|.*Air|.*Train|.*Bus|.*App|.*Map|.*Museum|.*Temple|.*Park|.*Mountain|.*Lake|.*Beach|.*Island|.*Strait|.*Bay|.*Gulf|.*Sea|.*River|.*Street|.*Road|.*District|.*County|.*Province|.*City|.*Village|.*Town|.*Old|.*New|.*North|.*South|.*East|.*West|.*Central|.*International Airport|.*Airport Express|.*High Speed|.*Railway|.*Grand|.*The |.*Shangri|.*Marriott|.*Hilton|.*Hyatt|.*Sheraton|.*Westin|.*Four Seasons|.*InterContinental|.*Wanda|.*Atour|.*Novotel|.*Sofitel|.*Mercure|.*Pullman|.*Radisson|.*Ramada|.*Jinjiang|.*Home Inn|.*7 Days|.*Holiday|.*Crowne|.*Renaissance|.*Mandarin|.*St\. Regis|.*JW |.*DubleTree|.*DoubleTree|.*Sheraton|.*Pleco|.*Wise|.*TransferWise|.*Trip\.com|.*Alipay|.*WeChat|.*Metro|.*Didi|.*Gaode|.*Amap|.*Meituan|.*Xiaohongshu|.*Douyin|.*TikTok|.*Moovit|.*CDF|.*Klook|.*Booking|.*Airbnb|.*Agoda|.*Ctrip|.*Fliggy|.*Uber|.*Google|.*Apple|.*Samsung|.*Huawei|.*Xiaomi|.*BYD|.*DJI|.*Tencent|.*UnionPay|.*Visa|.*Mastercard|.*JCB|.*Amex|.*Diners|.*Discover|.*AM|.*PM|.*UTC|.*ISO|.*ID|.*SIM|.*eSIM|.*WiFi|.*VPN|.*NFC|.*QR|.*GPS|.*SOS|.*ATM|.*POS|.*CCTV|.*IMF|.*WTO|.*GDP|.*EMS|.*DHL|.*SF Express|.*China Post|.*Bank of China|.*ICBC|.*CCB|.*BOC|.*ABC|.*HSBC|.*Standard Chartered|.*Citibank|.*Canton Fair|.*UNESCO|.*World Heritage)/;
let hits = 0;
const results = [];
for (const [url, p] of Object.entries(d)) {
  const text = (p.title || "") + "\n" + (p.text || "");
  const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length >= 3 && !CJK.test(l) && /[A-Za-z]{2}/.test(l));
  for (const line of lines) {
    const words = line.match(/[A-Za-z][A-Za-z.'’-]+/g) || [];
    const alpha = line.replace(/[^A-Za-z]/g, "").length;
    if (words.length >= 4 && alpha >= 18 && !ACCEPT.test(line)) {
      hits++;
      results.push(url + " :: " + line.slice(0, 160));
    }
  }
}
console.log("suspicious english prose lines:", hits);
for (const r of results.slice(0, 120)) console.log(r);
