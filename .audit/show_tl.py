# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
for slug in ['dali', 'suzhou']:
    de = json.load(io.open('src/data/cities-i18n/de/%s.json' % slug, encoding='utf-8'))
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    ja = json.load(io.open('src/data/cities-i18n/ja/%s.json' % slug, encoding='utf-8'))
    print('====', slug)
    print('de transport.local:', json.dumps(de.get('transport', {}).get('local', {}), ensure_ascii=False)[:400])
    print('en transport.local:', json.dumps(en.get('transport', {}).get('local', {}), ensure_ascii=False)[:400])
    print('ja transport.local:', json.dumps(ja.get('transport', {}).get('local', {}), ensure_ascii=False)[:400])
