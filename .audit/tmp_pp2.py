# -*- coding: utf-8 -*-
import io, json, re
d = json.loads(io.open('src/data/cities-i18n/ko/beijing.json', encoding='utf-8').read())
r = d['restaurants'][5]
print('restaurants[5] keys:', list(r.keys()))
for k, v in r.items():
    print(' ', k, '=', str(v)[:90])
print()
# top-level numeric keys
root_nums = [k for k in d.keys() if re.fullmatch(r'\d+', k)]
print('root numeric keys:', root_nums)
for k in root_nums[:5]:
    print('  ', k, '=', str(d[k])[:80])
# local
def find_local(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'local':
                print('local at', path, type(v).__name__, str(v)[:100])
            find_local(v, path + '.' + k if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            find_local(v, '%s[%d]' % (path, i))
find_local(d)
