# -*- coding: utf-8 -*-
import io, json, re
CJK = re.compile(r'[\u3400-\u9fff]')
def getv(data, path):
    parts = re.sub(r'\[(\d+)\]', r'.\1', path).split('.')
    cur = data
    for part in parts:
        if part.isdigit(): cur = cur[int(part)]
        else: cur = cur[part]
        if cur is None: return None
    return cur

checks = [
    ('fr', 'chengdu.json', 'attractions.36.address'),
    ('fr', 'changsha.json', 'attractions.32.highlights.0'),
    ('de', 'changsha.json', 'restaurants.4.dishHighlights.1'),
    ('de', 'chongqing.json', 'restaurants.20.dishHighlights.0'),
    ('ko', 'shanghai.json', 'attractions.5.address'),
    ('vi', 'chongqing.json', 'attractions.35.highlights.0'),
    ('ru', 'yantai.json', 'restaurants.26.cuisine'),
    ('fr', 'changsha.json', 'attractions.29.recommendedVisitTime'),
]
for lang, fn, path in checks:
    t = json.loads(io.open('src/data/cities-i18n/%s/%s' % (lang, fn), encoding='utf-8').read())
    j = json.loads(io.open('src/data/cities-i18n/ja/%s' % fn, encoding='utf-8').read())
    tv, jv = getv(t, path), getv(j, path)
    print('%-3s %-12s %-38s TV=%r  JA=%r' % (lang, fn, path, tv, jv))
