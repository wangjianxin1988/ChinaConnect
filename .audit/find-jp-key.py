import json,re
d=json.load(open('.audit/guide-strings.json',encoding='utf-8'))
for s in d['strings']:
    if 'VPNをダウンロードして設定' in s:
        print('guide-strings key LEN', len(s))
        print('has lone surrogates:', any(0xD800<=ord(c)<=0xDFFF for c in s))
        print(repr(s[:60]))
