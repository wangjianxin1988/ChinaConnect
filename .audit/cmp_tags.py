# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
for slug, idx in [('sanya', 3), ('shenzhen', 4), ('shanghai', 11)]:
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    ja = json.load(io.open('src/data/cities-i18n/ja/%s.json' % slug, encoding='utf-8'))
    de = json.load(io.open('src/data/cities-i18n/de/%s.json' % slug, encoding='utf-8'))
    r = de['restaurants'][idx]
    er = en['restaurants'][idx]
    jr = ja['restaurants'][idx]
    print('== %s[%d]' % (slug, idx))
    print('  en tags:', er.get('tags'))
    print('  ja tags:', jr.get('tags'))
    print('  de tags:', r.get('tags'))
    print('  en dishHighlights:', er.get('dishHighlights'))
    print('  de dishHighlights:', r.get('dishHighlights'))
