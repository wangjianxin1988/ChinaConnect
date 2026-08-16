import io
p='scripts/lib/translation-accept.mjs'
s=io.open(p,encoding='utf-8').read()
old='"Customize protocol",'
new='"Customize protocol", "Navigation", "Problem:", "Proxy:", "Service",'
assert old in s
s=s.replace(old,new,1)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched')
