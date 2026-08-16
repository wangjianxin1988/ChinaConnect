# -*- coding: utf-8 -*-
import io, os, json, re
def find_numeric_keys(o, path='', out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items():
            if re.fullmatch(r'\d+', k):
                out.append((path + '.' + k, str(v)[:60]))
            else:
                find_numeric_keys(v, path + '.' + k if path else k, out)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            find_numeric_keys(v, '%s[%d]' % (path, i), out)
    return out
for fn in sorted(os.listdir('src/data/cities-i18n/ko')):
    d = json.loads(io.open('src/data/cities-i18n/ko/%s' % fn, encoding='utf-8').read())
    for p, v in find_numeric_keys(d):
        if 'local' in p:
            print(fn, p, '=', v)
