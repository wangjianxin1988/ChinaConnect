# -*- coding: utf-8 -*-
import io, os, json, re
LANGS = ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
slugs = sorted(f[:-5] for f in os.listdir('src/data/cities') if f.endswith('.json'))
GUIDE = ['accommodation','attractions','communication','cultural-warnings','departure','dining',
         'emergency-procedures','index','payment','scam-prevention','transparency','transport','visa',
         'business/company-registration','business/etiquette','business/expo-calendar','business/index',
         'business/invitation-letter','business/translation']
SECTIONS = ['transport','payment','sim','apps','culture','emergency']

def expected(lang):
    urls = ['', 'cities/', 'attractions/', 'emergency', 'ai', 'scenic-spots/', 'food/']
    for g in GUIDE: urls.append('guide/' + g)
    for slug in slugs:
        urls.append('city/%s/' % slug)
        urls.append('city/%s/food/' % slug)
        urls.append('city/%s/hotels/' % slug)
        urls.append('city/%s/attractions/' % slug)
        for s in SECTIONS: urls.append('city/%s/%s/' % (slug, s))
    return urls

def has(dist, lang, url):
    p = os.path.join('dist', lang, url)
    if os.path.isdir(p): return os.path.exists(os.path.join(p, 'index.html'))
    if url.endswith('/'): return os.path.exists(os.path.join(p, 'index.html'))
    return os.path.exists(p) or os.path.exists(p + '/index.html') or os.path.exists(p + '.html')

for lang in LANGS:
    missing = []
    for u in expected(lang):
        if not has(lang, lang, u):
            missing.append(u)
    print('%-6s expected=%d missing=%d' % (lang, len(expected(lang)), len(missing)))
    for m in missing[:10]: print('     ', m)
