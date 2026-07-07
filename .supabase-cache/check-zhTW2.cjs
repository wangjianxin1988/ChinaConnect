const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// 找 zh-TW 块位置
const zhTWStart = text.indexOf('\r\n  "zh-TW": {');
console.log('zh-TW starts at', zhTWStart);
const slice = text.substring(zhTWStart, zhTWStart + 4000);
const onboardingIdx = slice.indexOf('onboarding:');
const tooltipsIdx = slice.indexOf('tooltips:');
const featuresIdx = slice.indexOf('features:');
const recentsIdx = slice.indexOf('recents:');
console.log('onboarding=', onboardingIdx, 'tooltips=', tooltipsIdx, 'features=', featuresIdx, 'recents=', recentsIdx);
