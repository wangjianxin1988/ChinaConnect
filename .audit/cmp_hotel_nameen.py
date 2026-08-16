# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
en = json.load(io.open('src/data/cities/beijing.json', encoding='utf-8'))
for lang in ['en','ja','fr','ru','de','ko','ar','fa']:
    d = json.load(io.open('src/data/cities-i18n/%s/beijing.json' % lang, encoding='utf-8')) if lang != 'en' else en
    h = d['hotels']
    print('%-4s [0]=%-32s [3]=%-28s [5]=%-28s' % (lang, h[0].get('nameEn','')[:32], h[3].get('nameEn','')[:28], h[5].get('nameEn','')[:28]))
