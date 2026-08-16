import re,io,json
text=io.open('src/data/guide/ja-overrides.ts',encoding='utf-8').read()
re_=re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$',re.M)
m=re_.findall(text)
print('ja-overrides entries:', len(m))
real=set(json.load(open('.audit/guide-strings.json',encoding='utf-8'))['strings'])
ja_keys={k for k,v in m}
missing=[s for s in real if s not in ja_keys]
print('real keys missing from ja-overrides:', len(missing))
for s in sorted(missing)[:25]: print('  MISS:', repr(s[:70]))
