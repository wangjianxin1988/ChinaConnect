# -*- coding: utf-8 -*-
import io, os, json, re
from collections import Counter
def walk(o, path='', out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items():
            if re.fullmatch(r'\d+', k):
                out.append((path, k, str(v)[:40]))
            else:
                walk(v, path + '.' + k if path else k, out)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, '%s[%d]' % (path, i), out)
    return out
c = Counter()
parents = []
for fn in sorted(os.listdir('src/data/cities-i18n/ko')):
    d = json.loads(io.open('src/data/cities-i18n/ko/%s' % fn, encoding='utf-8').read())
    for parent, k, v in walk(d):
        # parent like attractions[8] or restaurants[5]
        seg = re.sub(r'\[\d+\]', '[]', parent)
        c[seg.split('.')[-1]] += 1
        parents.append(seg)
for k, n in c.most_common(15):
    print('%-28s %d' % (k, n))
