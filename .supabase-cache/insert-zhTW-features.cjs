const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const NL = '\r\n';

// 找 zh-TW 块的 tooltips 结束位置
const zhTWStart = text.indexOf('\r\n  "zh-TW": {');
const tooltipsStart = text.indexOf('tooltips: {', zhTWStart);
let depth = 0;
let i = text.indexOf('{', tooltipsStart);
let tooltipsEnd = -1;
for (; i < text.length; i++) {
  if (text[i] === '{') depth++;
  else if (text[i] === '}') { depth--; if (depth === 0) { tooltipsEnd = i; break; } }
}
let insertPos = tooltipsEnd;
// 跳过 }, 空白, 找到 recents 块开始
while (insertPos < text.length && (text[insertPos] === '}' || text[insertPos] === ' ' || text[insertPos] === '\t' || text[insertPos] === '\r' || text[insertPos] === '\n')) insertPos++;

console.log('Insert pos:', insertPos);
console.log('At pos:', JSON.stringify(text.substring(insertPos, insertPos + 30)));

const arr = [
  '餐廳指南','米其林星級、黑珍珠排名和本地最愛，附有詳細評論',
  '景點','頂級景點，附帶開放時間、門票和本地貼士',
  '交通','如何到達和出行 - 航班、火車、地鐵和本地貼士',
  '緊急聯絡','醫院、警察、大使館聯絡方式和重要電話號碼',
  '支付指南','支付寶、微信支付、現金貼士和刷卡資訊',
  '住宿','從豪華到經濟型，各類預算的飯店推薦',
  '文化貼士','各地風俗、禮儀和每個城市的文化見解',
  'AI 助理','用中文提問，立即獲得中國旅行相關解答',
];

const featuresBlock = ',\r\n    // Features section\r\n    features: {\r\n' +
  '      restaurantGuide: ' + JSON.stringify(arr[0]) + ',\r\n' +
  '      restaurantGuideDesc: ' + JSON.stringify(arr[1]) + ',\r\n' +
  '      attractions: ' + JSON.stringify(arr[2]) + ',\r\n' +
  '      attractionsDesc: ' + JSON.stringify(arr[3]) + ',\r\n' +
  '      transport: ' + JSON.stringify(arr[4]) + ',\r\n' +
  '      transportDesc: ' + JSON.stringify(arr[5]) + ',\r\n' +
  '      emergency: ' + JSON.stringify(arr[6]) + ',\r\n' +
  '      emergencyDesc: ' + JSON.stringify(arr[7]) + ',\r\n' +
  '      payment: ' + JSON.stringify(arr[8]) + ',\r\n' +
  '      paymentDesc: ' + JSON.stringify(arr[9]) + ',\r\n' +
  '      accommodation: ' + JSON.stringify(arr[10]) + ',\r\n' +
  '      accommodationDesc: ' + JSON.stringify(arr[11]) + ',\r\n' +
  '      culturalTips: ' + JSON.stringify(arr[12]) + ',\r\n' +
  '      culturalTipsDesc: ' + JSON.stringify(arr[13]) + ',\r\n' +
  '      aiAssistant: ' + JSON.stringify(arr[14]) + ',\r\n' +
  '      aiAssistantDesc: ' + JSON.stringify(arr[15]) + ',\r\n' +
  '    }';

text = text.substring(0, insertPos) + featuresBlock + text.substring(insertPos);
fs.writeFileSync(path, text, 'utf8');
console.log('Inserted features for zh-TW');
