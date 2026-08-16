import io
p='.audit/check-guide-quality.mjs'
s=io.open(p,encoding='utf-8').read()
old='''const disallow = DISALLOWED[lang];
const hasCJK = (s) => /[\\u3400-\\u9fff]/.test(s);'''
new='''const disallow = DISALLOWED[lang];
const hasCJK = (s) => /[\\u3400-\\u9fff]/.test(s);
const hasKana = (s) => /[\\u3040-\\u30ff]/.test(s);
const isZhSource = (s) => hasCJK(s) && !hasKana(s);'''
assert old in s
s=s.replace(old,new)
old='''      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && hasCJK(k);'''
new='''      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && isZhSource(k);'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched quality gate zh source logic')
