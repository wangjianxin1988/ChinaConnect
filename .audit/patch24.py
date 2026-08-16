import io
p='scripts/scan-lang-pages.py'
lines=io.open(p,encoding='utf-8').read().splitlines()
for i,l in enumerate(lines):
    if l.startswith('SIMPLIFIED = set('):
        lines[i] = "SIMPLIFIED = set('门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电电话样张专业乡历严丽举义气')"
        break
else:
    raise SystemExit('SIMPLIFIED line not found')
io.open(p,'w',encoding='utf-8',newline='\n').write('\n'.join(lines)+'\n')
print('patched scan-lang-pages.py SIMPLIFIED')
