import io, re, json
d = json.loads(io.open('.audit/guide-strings.json', encoding='utf-8').read())
strings = d['strings']
print('total source strings:', len(strings))
# find the pinyin-like ones
pats = [s for s in strings if re.search(r'[à-ÿÀ-Ý]', s)]
print('pinyin-ish strings:', len(pats))
for s in pats[:40]:
    print(repr(s[:110]))
