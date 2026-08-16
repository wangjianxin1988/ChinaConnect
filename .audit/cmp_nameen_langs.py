# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
en = json.load(io.open('src/data/cities/beijing.json', encoding='utf-8'))
for lang in ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']:
    d = json.load(io.open('src/data/cities-i18n/%s/beijing.json' % lang, encoding='utf-8')) if lang != 'en' else en
    a = d['attractions']
    print('%-5s [0]=%-20s [7]=%-20s [29]=%-22s' % (lang, a[0].get('nameEn','')[:20], a[7].get('nameEn','')[:20], a[29].get('nameEn','')[:22]))
