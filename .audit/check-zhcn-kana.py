import re,io
text=io.open('src/data/guide/overrides-zh-CN.ts',encoding='utf-8').read()
kana=[m for m in re.findall(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$', text, re.M) if re.search(r'[\u3040-\u30ff]', m[0]) or re.search(r'[\u3040-\u30ff]', m[1])]
print('zh-CN entries with kana key or value:', len(kana))
for k,v in kana[:10]: print(' ', repr(k[:50]),'=>',repr(v[:50]))
