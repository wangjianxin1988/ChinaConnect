import re,io
text=io.open('src/data/guide/overrides-zh-TW.ts',encoding='utf-8').read()
re_=re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$',re.M)
m=re_.findall(text)
print('entries:', len(m))
for k,v in m[:12]:
    print(' ', repr(k[:45]), '=>', repr(v[:60]))
