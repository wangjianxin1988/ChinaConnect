const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

function extractBlock(text, startIdx) {
  let depth = 0, i = startIdx;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) return text.substring(startIdx + 1, i); }
  }
  return '';
}

const recStart = text.indexOf('export const translations');
const recBrace = text.indexOf('{', recStart);
const recEnd = text.indexOf('};', recBrace);
const recordBody = text.substring(recBrace, recEnd);

for (const lang of ['en', 'ja', 'ko', 'zh-CN', 'zh-TW', 'th', 'vi', 'ru', 'fr', 'de', 'ar', 'fa']) {
  const langKey = lang.includes('-') ? '"' + lang + '"' : lang;
  const marker = '\r\n  ' + langKey + ': {';
  const idx = recordBody.indexOf(marker);
  if (idx < 0) { console.log(lang + ': NOT FOUND'); continue; }
  const blockStart = recordBody.indexOf('{', idx);
  const block = extractBlock(recordBody, blockStart);
  const topKeys = [];
  const re = /\r\n    (\w+):\s*\{/g;
  let m;
  while ((m = re.exec(block)) !== null) topKeys.push(m[1]);
  console.log(lang + ': ' + topKeys.length + ' keys -> [' + topKeys.join(',') + ']');
}
