import io
p='scripts/lib/translation-accept.mjs'
s=io.open(p,encoding='utf-8').read()
old='"K-ETA", "eTA",'
new='"K-ETA", "eTA", "Halal", "Compliment", "NordVPN", "Kill switch", "App Store", "Android", "Li Wei", "Zhang Ming", "Religion", "Description", "Service", "App Store / Android", "Quick Info", "Customize protocol",'
assert old in s
s=s.replace(old,new,1)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched BRAND')
