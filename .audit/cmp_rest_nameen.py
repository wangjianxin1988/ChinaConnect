# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
en = json.load(io.open('src/data/cities/beijing.json', encoding='utf-8'))
for lang in ['en','ja','fr','ru','de','ko','th','ar','fa']:
    d = json.load(io.open('src/data/cities-i18n/%s/beijing.json' % lang, encoding='utf-8')) if lang != 'en' else en
    r = d['restaurants']
    print('%-4s [9]=%-22s [15]=%-22s [18]=%-22s' % (lang, r[9].get('nameEn','')[:22], r[15].get('nameEn','')[:22], r[18].get('nameEn','')[:22]))
