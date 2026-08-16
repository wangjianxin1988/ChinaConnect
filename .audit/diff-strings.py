import json
old=json.load(open('.audit/guide-strings.json.bak',encoding='utf-8'))['strings']
new=json.load(open('.audit/guide-strings.json',encoding='utf-8'))['strings']
so, sn = set(old), set(new)
added = sn - so
removed = so - sn
print('added', len(added), 'removed', len(removed))
print('--- sample added ---')
for s in sorted(added)[:40]:
    print(repr(s[:90]))
