const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const NL = '\r\n';

// 12 个语言的 tagline (1 行简单翻译) - 顺序对应 en/ja/ko/zh-CN/zh-TW/th/vi/ru/fr/de/ar/fa
const taglines = [
  'Explore China with AI',                                   // en
  'AIと一緒に中国を探索',                                      // ja
  'AI와 함께 중국 탐험',                                       // ko
  'AI 探索中国',                                              // zh-CN
  'AI 探索中國',                                              // zh-TW
  'สำรวจจีนด้วย AI',                                          // th
  'Khám phá Trung Quốc với AI',                               // vi
  'Изучайте Китай с ИИ',                                     // ru
  'Explorez la Chine avec l\u2019IA',                        // fr
  'China mit KI entdecken',                                   // de
  'استكشف الصين بالذكاء الاصطناعي',                            // ar
  'چین را با هوش مصنوعی کاوش کنید',                             // fa
];

// 在每个语言的 nav 块中找到 `business: "..."` 后插入 tagline
let i = 0;
const navBlockRe = new RegExp(
  '(nav:\\s*\\{[\\s\\S]*?business:\\s*"[^"]*",?\\s*)(\\})',
  'g'
);
text = text.replace(navBlockRe, (m, before, after) => {
  if (i >= taglines.length) return m;
  const insert = NL + '      tagline: ' + JSON.stringify(taglines[i]) + ',';
  i++;
  return before + insert + NL + '    ' + after;
});
console.log('Replaced', i, 'nav blocks');
if (i !== 12) console.log('WARNING: expected 12, got', i);

fs.writeFileSync(path, text, 'utf8');
console.log('DONE');
