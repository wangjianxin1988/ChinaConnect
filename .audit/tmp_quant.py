# -*- coding: utf-8 -*-
import io, os, json, re
CJK = re.compile(r'[\u3400-\u9fff]')
def walk(o, path='', out=None):
    if out is None: out = []
    if isinstance(o, str): out.append((path, o))
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, '%s[%d]' % (path, i), out)
    elif isinstance(o, dict):
        for k, v in o.items(): walk(v, '%s.%s' % (path, k) if path else k, out)
    return out

for lang in ['fr', 'de', 'ko', 'vi', 'ru', 'th', 'ar', 'fa']:
    base = 'src/data/cities-i18n/%s' % lang
    total = 0
    ja_cjk = 0
    no_ja = 0
    for fn in sorted(os.listdir(base)):
        t = json.loads(io.open(os.path.join(base, fn), encoding='utf-8').read())
        jf = 'src/data/cities-i18n/ja/%s' % fn
        if not os.path.exists(jf): continue
        ja = json.loads(io.open(jf, encoding='utf-8').read())
        ja_map = dict(walk(ja))
        for p, v in walk(t):
            if not CJK.search(v): continue
            if p.endswith('.name'): continue
            if re.search(r'\d+$', p) and '.' in p and p.rsplit('.',1)[1].isdigit(): pass
            total += 1
            jv = ja_map.get(p)
            if jv is None: no_ja += 1
            elif CJK.search(jv): ja_cjk += 1
    print('%-3s CJK-non-name fields: %-5d  ja-also-CJK: %-5d  ja-missing: %d' % (lang, total, ja_cjk, no_ja))
