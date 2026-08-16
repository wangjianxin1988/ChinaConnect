import re,io
text=io.open('src/data/guide/overrides-zh-TW.ts',encoding='utf-8').read()
re_=re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$',re.M)
m=re_.findall(text)
print('entries:', len(m))
for k,v in m[:12]:
    print(' ', repr(k[:45]), '=>', repr(v[:60]))
simplified_chars = '门国这为长东车红经间见进说时书万与个来对发会开动东西风头飞云电电话样哪里这里些关问题张专业乡历史严丽举义气'
sc = sum(1 for k,v in m if any(c in v for c in simplified_chars))
print('values containing simplified-only chars:', sc)
