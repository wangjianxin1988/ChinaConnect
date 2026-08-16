import io, re
s = io.open('src/pages/[lang]/city/[slug].astro', encoding='utf-8').read()
for m in re.finditer(r'isJapanese', s):
    ctx = re.sub(r'\s+', ' ', s[max(0,m.start()-150):m.start()+250])
    print('---')
    print(ctx[:400])
