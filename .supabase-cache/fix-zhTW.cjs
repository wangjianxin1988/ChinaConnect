const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// zh-TW 中错位插入的 features 块: 从 "// Features section" 到 "},\n welcome:"
// 找出错位 features 块位置
const pos = text.indexOf('  "zh-TW": {');
const wrongFeatures = text.indexOf('// Features section', pos);
const endWrong = text.indexOf('welcome: "歡迎', wrongFeatures);
const block = text.substring(wrongFeatures, endWrong);
console.log('Wrong block to remove:');
console.log(block);
console.log('---');
console.log('Length:', block.length);

if (wrongFeatures > 0 && endWrong > 0) {
  // 删除错位 features 块 + 前面多余的空行/缩进
  let removeFrom = wrongFeatures;
  // 向后扫掉 "\r\n  \r\n" (前置空白)
  while (removeFrom > 0 && text[removeFrom] !== 'o' /* onboarding */) {
    if (text.substring(removeFrom - 1, removeFrom + 1) === '\r\n') { removeFrom--; break; }
    removeFrom--;
  }
  // 找到 onboarding: { 的开始
  const onboardingPos = text.lastIndexOf('onboarding: {', wrongFeatures);
  if (onboardingPos > 0 && onboardingPos > wrongFeatures - 100) {
    // 错位 features 在 onboarding 内部, 但 welcome 仍然在 onboarding 内
    // 我们要: 删除从 onboarding: { 后到 features 块结束的乱码, 重新加回 onboarding 内容
    // 简化: 直接找 'onboarding: {\r\n\r\n    // Features section' 模式, 删除中间 features
    const fix = 'onboarding: {\r\n';
    const fixPos = text.lastIndexOf(fix, wrongFeatures);
    if (fixPos > 0) {
      const newText = text.substring(0, fixPos + fix.length) + text.substring(endWrong);
      fs.writeFileSync('src/i18n/translations.ts', newText, 'utf8');
      console.log('Removed wrong features block from zh-TW onboarding');
    }
  }
}
