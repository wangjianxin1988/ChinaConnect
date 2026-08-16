# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
for slug in ['chongqing', 'dalian', 'nanjing']:
    ja = json.load(io.open('src/data/cities-i18n/ja/%s.json' % slug, encoding='utf-8'))
    de = json.load(io.open('src/data/cities-i18n/de/%s.json' % slug, encoding='utf-8'))
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    print('==', slug)
    print('  en:', en['payment'][0].get('description'))
    print('  ja:', ja['payment'][0].get('description'))
    print('  de:', de['payment'][0].get('description'))
    print('  zh-CN:', json.load(io.open('src/data/cities-i18n/zh-CN/%s.json' % slug, encoding='utf-8'))['payment'][0].get('description'))
    print('  fr:', json.load(io.open('src/data/cities-i18n/fr/%s.json' % slug, encoding='utf-8'))['payment'][0].get('description'))
