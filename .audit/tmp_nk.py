# -*- coding: utf-8 -*-
import io, json, re
CJK = re.compile(r'[\u3400-\u9fff]')
def find_numeric_keys(o, path='', out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items():
            if re.fullmatch(r'\d+', k):
                out.append((path + '.' + k, type(v).__name__, str(v)[:60]))
            else:
                find_numeric_keys(v, path + '.' + k if path else k, out)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            find_numeric_keys(v, '%s[%d]' % (path, i), out)
    return out

for lang in ['ko', 'fr', 'de']:
    d = json.loads(io.open('src/data/cities-i18n/%s/beijing.json' % lang, encoding='utf-8').read())
    nk = find_numeric_keys(d)
    print('==', lang, 'numeric-string keys:', len(nk))
    for p, t, v in nk[:8]:
        print('   ', p, t, repr(v))
