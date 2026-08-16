import json,re
d=json.load(open('.audit/guide-strings.json',encoding='utf-8'))
kana=[s for s in d['strings'] if re.search(r'[\u3040-\u30ff]', s)]
print('kana keys:', len(kana))
for s in kana[:30]: print('  ', repr(s[:80]))
