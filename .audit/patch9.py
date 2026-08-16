import io
p='.audit/check-guide-quality.mjs'
s=io.open(p,encoding='utf-8').read()
old='''let bad = 0, cont = 0, total = 0, junk = 0, missing = 0;
for (const p of paths) {
  for (const [k, v] of parse(p)) {
    if (REAL_KEYS.size > 0 && kind === "guide" && !REAL_KEYS.has(k)) { junk++; continue; }
    total++;
    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && hasCJK(k);
      if (!legalZhIdentity && !isKeepableToken(k)) bad++;
    } else if (disallow && disallow.test(v)) {
      cont++;
    }
  }
}
if (REAL_KEYS.size > 0 && kind === "guide") {
  for (const k of REAL_KEYS) {
    if (!paths.some((p) => parse(p).has(k))) missing++;
  }
}
console.log(JSON.stringify({ lang, kind, total, bad, cont, junk, missing }));'''
new='''let bad = 0, cont = 0, total = 0, junk = 0, missing = 0;
const covered = new Set();
for (const p of paths) {
  for (const [k, v] of parse(p)) {
    if (REAL_KEYS.size > 0 && kind === "guide" && !REAL_KEYS.has(k)) { junk++; continue; }
    covered.add(k);
    total++;
    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && hasCJK(k);
      if (!legalZhIdentity && !isKeepableToken(k)) bad++;
    } else if (disallow && disallow.test(v)) {
      cont++;
    }
  }
}
if (REAL_KEYS.size > 0 && kind === "guide") {
  for (const k of REAL_KEYS) {
    if (!covered.has(k)) missing++;
  }
}
console.log(JSON.stringify({ lang, kind, total, bad, cont, junk, missing }));'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched')
