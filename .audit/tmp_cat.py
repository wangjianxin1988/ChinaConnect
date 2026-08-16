# -*- coding: utf-8 -*-
import io, os, json, re
from collections import Counter
CJK = re.compile(r'[\u3400-\u9fff]')
lang = 'ko'
base = 'src/data/cities-i18n/' + lang
cnt = Counter()
examples = {}
for fn in sorted(os.listdir(base)):
    d = json.loads(io.open(os.path.join(base, fn), encoding='utf-8').read())
    def walk(o, path):
        if isinstance(o, str):
            if CJK.search(o):
                leaf = path.split('.')[-1]
                key = '.'.join(path.split('.')[:-1][-2:]) if '.' in path else leaf
                cnt[leaf] += 1
                examples.setdefault(leaf, []).append((fn, path, o[:70]))
        elif isinstance(o, list):
            for i, v in enumerate(o): walk(v, '%s.%d' % (path, i))
        elif isinstance(o, dict):
            for k, v in o.items(): walk(v, '%s.%s' % (path, k) if path else k)
    walk(d, '')
print(lang, 'total CJK string fields:', sum(cnt.values()))
for k, n in cnt.most_common(25):
    print('  %-24s %5d   e.g. %s' % (k, n, examples[k][0][2] if examples.get(k) else ''))
