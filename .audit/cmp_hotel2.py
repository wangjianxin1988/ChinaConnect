# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
en = json.load(io.open('src/data/cities/beijing.json', encoding='utf-8'))
for idx in [7, 9, 12]:
    for lang in ['en','ja','fr','ru','de','ar','fa']:
        d = json.load(io.open('src/data/cities-i18n/%s/beijing.json' % lang, encoding='utf-8')) if lang != 'en' else en
        h = d['hotels'][idx]
        print('%s[%d] %-4s = %s' % ('hotels', idx, lang, h.get('nameEn','')[:44]))
    print()
