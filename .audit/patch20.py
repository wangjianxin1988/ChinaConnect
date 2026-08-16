import io
p='scripts/translate-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
# add isZhSource helper and use in needsApi
old='''const hasCJK = (s) => /[\\u3400-\\u9fff]/.test(s);
// For zh-CN / zh-TW, Chinese strings stay as-is (zhconv pass handles zh-TW conversion).'''
new='''const hasCJK = (s) => /[\\u3400-\\u9fff]/.test(s);
const hasKana = (s) => /[\\u3040-\\u30ff]/.test(s);
// Genuine Chinese source: Han characters and NO kana (Japanese strings must be translated).
const isZhSource = (s) => hasCJK(s) && !hasKana(s);
// For zh-CN / zh-TW, Chinese strings stay as-is (zhconv pass handles zh-TW conversion).'''
assert old in s
s=s.replace(old,new)

old='''  if (lang === "zh-CN" || lang === "zh-TW") {
    if (hasCJK(s)) return false; // Chinese stays as-is (zh-TW converted by zhconv pass)
    if (v === s && !isKeepableToken(s)) return true; // non-CJK identity not keepable -> refill
  } else {'''
new='''  if (lang === "zh-CN" || lang === "zh-TW") {
    if (isZhSource(s)) return false; // Chinese stays as-is (zh-TW converted by zhconv pass)
    if (v === s && !isKeepableToken(s)) return true; // non-Chinese identity not keepable -> refill
  } else {'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched translate-guide-strings zh source logic')
