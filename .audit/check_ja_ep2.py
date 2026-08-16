# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
langs = ['en','ja','ko','th','vi','ru','fr','de','ar','fa']
pos = {}
for lang in langs:
    m = re.search(r'^  %s: \{$' % lang, s, re.M)
    pos[lang] = m.start() if m else -1
order = sorted(pos.items(), key=lambda x: x[1])
print('order:', [l for l, p in order])
# ja block = between ja and ko
ja_start = pos['ja']; ko_start = pos['ko']
ja_block = s[ja_start:ko_start]
ep = ja_block.find('emergencyPage')
print('emergencyPage in ja:', ep >= 0)
if ep >= 0:
    # extract until next top-level key (6-space indent keys)
    seg = ja_block[ep:ja_block.find('\n  ko:')]
    # find emergencyPage block end (next 4-space key)
    print(seg[:1000])
