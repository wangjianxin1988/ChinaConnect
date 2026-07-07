const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const NL = '\r\n';

const arr = [
  '餐厅指南','米其林星级、黑珍珠排名和本地最爱，配有详细评价',
  '景点','顶级景点，附带开放时间、门票和本地贴士',
  '交通','如何到达和出行 - 航班、火车、地铁和本地贴士',
  '紧急联系','医院、警察、大使馆联系方式和重要电话号码',
  '支付指南','支付宝、微信支付、现金贴士和刷卡信息',
  '住宿','从豪华到经济型，各类预算的酒店推荐',
  '文化贴士','各地风俗、礼仪和每个城市的文化见解',
  'AI 助手','用中文提问，立刻获得中国旅行相关解答',
];

const arrTW = [
  '餐廳指南','米其林星級、黑珍珠排名和本地最愛，附有詳細評論',
  '景點','頂級景點，附帶開放時間、門票和本地貼士',
  '交通','如何到達和出行 - 航班、火車、地鐵和本地貼士',
  '緊急聯絡','醫院、警察、大使館聯絡方式和重要電話號碼',
  '支付指南','支付寶、微信支付、現金貼士和刷卡資訊',
  '住宿','從豪華到經濟型，各類預算的飯店推薦',
  '文化貼士','各地風俗、禮儀和每個城市的文化見解',
  'AI 助理','用中文提問，立即獲得中國旅行相關解答',
];

function insertFor(langMarker, arrData) {
  const langStart = text.indexOf(langMarker);
  if (langStart < 0) return false;
  const recentsStart = text.indexOf('recents: {', langStart);
  if (recentsStart < 0) return false;
  let depth = 0;
  let i = text.indexOf('{', recentsStart);
  let recentsEnd = -1;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) { recentsEnd = i; break; } }
  }
  if (recentsEnd < 0) return false;
  let commaPos = recentsEnd;
  while (commaPos < text.length && (text[commaPos] === '}' || text[commaPos] === ' ' || text[commaPos] === '\t' || text[commaPos] === '\r' || text[commaPos] === '\n')) commaPos++;
  if (text[commaPos] === ',') commaPos++;
  
  const featuresBlock = NL + '    // Features section' + NL + '    features: {' + NL +
    '      restaurantGuide: ' + JSON.stringify(arrData[0]) + ',' + NL +
    '      restaurantGuideDesc: ' + JSON.stringify(arrData[1]) + ',' + NL +
    '      attractions: ' + JSON.stringify(arrData[2]) + ',' + NL +
    '      attractionsDesc: ' + JSON.stringify(arrData[3]) + ',' + NL +
    '      transport: ' + JSON.stringify(arrData[4]) + ',' + NL +
    '      transportDesc: ' + JSON.stringify(arrData[5]) + ',' + NL +
    '      emergency: ' + JSON.stringify(arrData[6]) + ',' + NL +
    '      emergencyDesc: ' + JSON.stringify(arrData[7]) + ',' + NL +
    '      payment: ' + JSON.stringify(arrData[8]) + ',' + NL +
    '      paymentDesc: ' + JSON.stringify(arrData[9]) + ',' + NL +
    '      accommodation: ' + JSON.stringify(arrData[10]) + ',' + NL +
    '      accommodationDesc: ' + JSON.stringify(arrData[11]) + ',' + NL +
    '      culturalTips: ' + JSON.stringify(arrData[12]) + ',' + NL +
    '      culturalTipsDesc: ' + JSON.stringify(arrData[13]) + ',' + NL +
    '      aiAssistant: ' + JSON.stringify(arrData[14]) + ',' + NL +
    '      aiAssistantDesc: ' + JSON.stringify(arrData[15]) + ',' + NL +
    '    },';
  
  // We need to write back
  return { pos: commaPos, block: featuresBlock };
}

let out = text;
const results = [
  insertFor('\n  "zh-CN": {', arr),
  insertFor('\n  "zh-TW": {', arrTW),
];

let newOut = out;
for (const r of results) {
  if (!r) { console.log('FAILED to find recents for a zh block'); continue; }
  newOut = newOut.substring(0, r.pos) + r.block + newOut.substring(r.pos);
}
fs.writeFileSync('src/i18n/translations.ts', newOut, 'utf8');
console.log('Inserted features for zh-CN and zh-TW');
