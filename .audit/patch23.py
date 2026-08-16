import io
p='scripts/scan-lang-pages.py'
s=io.open(p,encoding='utf-8').read()
old="SIMPLIFIED = set('门们国这长为东车红经间见进说时书万与个来对发会开动东西风头飞云电电话话样哪里这里些关问题张专业乡历史严丽举义气')"
new="SIMPLIFIED = set('门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电电话样张专业乡历严丽举义气')"
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched SIMPLIFIED set')
