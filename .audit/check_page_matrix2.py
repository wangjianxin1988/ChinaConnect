# -*- coding: utf-8 -*-
import io, os
LANGS = ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
slugs = sorted(f[:-5] for f in os.listdir('src/data/cities') if f.endswith('.json'))
GUIDE = ['accommodation','attractions','communication','cultural-warnings','departure','dining',
         'emergency-procedures','index','payment','scam-prevention','transparency','transport','visa',
         'business/company-registration','business/etiquette','business/expo-calendar','business/index',
         'business/invitation-letter','business/translation']
SECTIONS = ['transport','payment','sim','apps','culture','emergency']
def expected():
    urls = ['', 'cities/', 'attractions/', 'emergency', 'ai', 'scenic-spots/', 'food/']
    for g in GUIDE: urls.append('guide/' + g)
    for slug in slugs:
        urls.append('city/%s/' % slug)
        urls.append('city/%s/food/' % slug)
        urls.append('city/%s/hotels/' % slug)
        urls.append('city/%s/attractions/' % slug)
        for s in SECTIONS: urls.append('city/%s/%s/' % (slug, s))
    return urls
def has(dist, url):
    p = os.path.join(dist, url)
    if url.endswith('/') or os.path.isdir(p):
        return os.path.exists(os.path.join(p, 'index.html')) or (url == '' and os.path.exists(os.path.join(dist, 'index.html')))
    return os.path.exists(p) or os.path.exists(p + '.html') or os.path.exists(os.path.join(p, 'index.html'))
# EN at root
missing_en = [u for u in expected() if not has('dist', u)]
print('en (root) missing:', len(missing_en))
for m in missing_en[:15]: print('   ', repr(m))
# others
for lang in [l for l in LANGS if l != 'en']:
    missing = [u for u in expected() if not has(os.path.join('dist', lang), u)]
    print('%-6s missing=%d' % (lang, len(missing)))
