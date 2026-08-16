import re,io
text=io.open('src/data/guide/overrides-vi.ts',encoding='utf-8').read()
i=text.find('VPNをダウンロード')
print('found at', i)
seg=text[max(0,i-40):i+80]
print(repr(seg))
print('---bytes of key start---')
# extract the key line
line_start=text.rfind('\n  "', 0, i)
line_end=text.find('\n', i)
line=text[line_start+1:line_end]
print(repr(line[:160]))
