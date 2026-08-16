# -*- coding: utf-8 -*-
import io, re, json, glob, os
CJK = re.compile(r'[\u3400-\u9fff]')
KEEP = re.compile(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&"\'":;~!?#\[\]{}@<>]')
def walk(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, path + '.' + k if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, '%s[%d]' % (path, i))
    elif isinstance(o, str):
        yield path, o
for lang in ['vi', 'ru']:
    print('====', lang)
    n = 0
    for fp in sorted(glob.glob('src/data/cities-i18n/%s/*.json' % lang)):
        slug = os.path.basename(fp)[:-5]
        data = json.load(io.open(fp, encoding='utf-8'))
        for p, v in walk(data):
            if not CJK.search(v): continue
            if p.endswith('.name') or p == 'name': continue
            if p.endswith('.nameEn'): continue
            if re.fullmatch(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&"\'":;~!?#\[\]{}@<>]+', v): continue
            n += 1
            print('  %s %s = %r' % (slug, p, v[:80]))
    print('  total:', n)
