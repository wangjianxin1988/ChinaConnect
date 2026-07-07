const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const recStart = text.indexOf('export const translations');
const recBrace = text.indexOf('{', recStart);
const recEnd = text.indexOf('}\n', recBrace);
const recordBody = text.substring(recBrace, recEnd);

function extractBlock(text, startIdx) {
  let depth = 0, i = startIdx;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) return text.substring(startIdx + 1, i); }
  }
  return '';
}

const zhTWStart = recordBody.indexOf('\n  \"zh-TW\": {');
const zhTWBlockStart = recordBody.indexOf('{', zhTWStart);
const zhTWBlock = extractBlock(recordBody, zhTWBlockStart);
const topKeys = Array.from(zhTWBlock.matchAll(/^\s+(\w+):\s*\{/gm)).map(x => x[1]);
console.log('zh-TW top-level keys:', topKeys);

const enStart = recordBody.indexOf('\n  en: {');
const enBlockStart = recordBody.indexOf('{', enStart);
const enBlock = extractBlock(recordBody, enBlockStart);
const enKeys = Array.from(enBlock.matchAll(/^\s+(\w+):\s*\{/gm)).map(x => x[1]);
console.log('en top-level keys:', enKeys);
