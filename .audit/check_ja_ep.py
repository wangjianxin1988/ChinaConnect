# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# find ja section start
langs = ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
positions = {}
for lang in langs:
    i = s.find('"%s": {' % lang)
    positions[lang] = i
print('ja section pos:', positions['ja'], '| zh-TW pos:', positions['zh-TW'])
ja_block = s[positions['ja']:positions['zh-TW']]
ep = ja_block.find('emergencyPage')
print('emergencyPage in ja section:', ep >= 0)
if ep >= 0:
    print(ja_block[ep:ep+900])
