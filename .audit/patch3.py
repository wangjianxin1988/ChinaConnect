import io
p='scripts/translate-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
old='''    try {
      const content = await callChat(prompt);
      const result = extractJson(content);'''
new='''    let content = "";
    try {
      content = await callChat(prompt);
      const result = extractJson(content);'''
assert s.count(old)==1, s.count(old)
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('fixed content scoping OK')
