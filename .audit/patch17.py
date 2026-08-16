import io
p='scripts/translate-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
old='''  if (lang === "zh-CN" || lang === "zh-TW") {
    if (hasCJK(s)) return false; // Chinese stays as-is
  } else {
    if (v === s && !isKeepableToken(s)) return true; // identity not keepable -> refill
  }'''
new='''  if (lang === "zh-CN" || lang === "zh-TW") {
    if (hasCJK(s)) return false; // Chinese stays as-is (zh-TW converted by zhconv pass)
    if (v === s && !isKeepableToken(s)) return true; // non-CJK identity not keepable -> refill
  } else {
    if (v === s && !isKeepableToken(s)) return true; // identity not keepable -> refill
  }'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched needsApi for zh-CN/zh-TW')
