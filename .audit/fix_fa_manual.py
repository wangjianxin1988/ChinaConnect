import io, json
def load(p): return json.loads(io.open(p, encoding='utf-8').read())
def save(p, d): io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

p1 = 'src/data/cities-i18n/fa/hangzhou.json'
d1 = load(p1)
d1['culturalTips'][3]['content'] = 'برای دوری از ازدحام، دریاچه غربی را صبح زود یا اواخر شب بازدید کنید. روزهای هفته کمتر از آخر هفته شلوغ است. بهار (آوریل-مه) برای گلها و پاییز برای برگهای رنگارنگ مناسب است.'
save(p1, d1)

p2 = 'src/data/cities-i18n/fa/kunming.json'
d2 = load(p2)
d2['restaurants'][11]['highlights'][0] = 'نودلهای عبور از پل به سبک فیوژن'
save(p2, d2)
print('fixed 2 fa fields')
