import fs from 'fs';
import path from 'path';

function reallyEnglish(s) {
  if (!s) return true;
  const v = s.trim();
  if (!v) return true;
  const hasNonLatin = /[\u00A0-\uFFFF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u0590-\u05FF]/.test(v);
  const isPureAscii = /^[\x00-\x7F\s.,!?'"\-_/()0-9]+$/.test(v);
  return isPureAscii || !hasNonLatin;
}

const cities = fs.readdirSync('src/data/cities').filter(f => f.endsWith('.json')).map(f => f.replace('.json',''));
const langs = ['ja', 'ko', 'zh-CN', 'zh-TW', 'th', 'vi', 'ru', 'fr', 'de', 'ar', 'fa'];

console.log('City description translation status:');
for (const lang of langs) {
  let ok = 0;
  for (const city of cities) {
    const filePath = path.join('src/data/cities-i18n', lang, city + '.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!reallyEnglish(data.description)) ok++;
    }
  }
  console.log(lang + ': ' + ok + '/' + cities.length + ' cities translated');
}
