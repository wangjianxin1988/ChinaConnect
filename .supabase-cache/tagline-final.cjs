const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const NL = '\r\n';

const taglines = [
  'Explore China with AI',
  'AIと一緒に中国を探索',
  'AI와 함께 중국 탐험',
  'AI 探索中国',
  'AI 探索中國',
  'สำรวจจีนด้วย AI',
  'Khám phá Trung Quốc với AI',
  'Изучайте Китай с ИИ',
  'Explorez la Chine avec l\u2019IA',
  'China mit KI entdecken',
  'استكشف الصين بالذكاء الاصطناعي',
  'چین را با هوش مصنوعی کاوش کنید',
];

let i = 0;
const navBlockRe = new RegExp('(nav:\\s*\\{[\\s\\S]*?business:\\s*"[^"]*",?\\s*)(\\})', 'g');
text = text.replace(navBlockRe, (m, before, after) => {
  if (i >= taglines.length) return m;
  const insert = NL + '      tagline: ' + JSON.stringify(taglines[i]) + ',';
  i++;
  return before + insert + NL + '    ' + after;
});
console.log('Replaced', i, 'nav blocks');
fs.writeFileSync(path, text, 'utf8');
