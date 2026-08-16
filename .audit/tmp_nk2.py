# -*- coding: utf-8 -*-
import io, json
d = json.loads(io.open('src/data/cities-i18n/ko/beijing.json', encoding='utf-8').read())
a = d['attractions'][8]
print('attractions[8] keys:', list(a.keys()))
for k, v in a.items():
    print(' ', k, '=', str(v)[:100])
print()
a9 = d['attractions'][9]
print('attractions[9] keys:', list(a9.keys()))
for k, v in a9.items():
    print(' ', k, '=', str(v)[:100])
