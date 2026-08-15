const fs = require('fs');
const p = 'scripts/lib/translation-keys.mjs';
let c = fs.readFileSync(p, 'utf8');
const orig = export function isTranslated(value, lang, sourceValue, sourceWasMasked = false) {
  if (typeof value !== " string\ || value.length === 0) return false;
 if (sourceWasMasked && value === sourceValue) return false;
 if (hasLanguageScript(value, lang)) return true;
 if (typeof sourceValue === \string\ && value !== sourceValue) return true;
 return typeof sourceValue === \string\ && value === sourceValue && sourceValue.length <= 24;
};
const repl = export function isTranslated(value, lang, sourceValue, sourceWasMasked = false) {
 if (typeof value !== \string\ || value.length === 0) return false;
 if (sourceWasMasked && value === sourceValue) return false;
 if (lang === \zh-CN\ || lang === \zh-TW\) {
 return /[\\u4e00-\\u9fff]/.test(value);
 }
 if (hasLanguageScript(value, lang)) return true;
 if (typeof sourceValue === \string\ && value !== sourceValue) return true;
 return typeof sourceValue === \string\ && value === sourceValue && sourceValue.length <= 24;
};
console.log('original found:', c.includes(orig));
c = c.split(orig).join(repl);
const tmp = p + '.tmp';
fs.writeFileSync(tmp, c, 'utf8');
fs.renameSync(tmp, p);
console.log('OK,', c.length, 'bytes');
