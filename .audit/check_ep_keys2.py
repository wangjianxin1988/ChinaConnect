# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
for lang in ['en','ja']:
    m = re.search(r'^  %s: \{$' % lang, s, re.M)
    nxt = re.search(r'^  (?:ja|ko): \{$', s[m.end():], re.M)
    end = m.end() + (nxt.start() if nxt else 0)
    block = s[m.start():m.end()+ (nxt.start() if nxt else len(s)-m.end())]
    for key in ['oneTapCalls','oneTapDesc','phrases','phrasesDesc','gps','gpsDesc']:
        mm = re.search(key + r':\s*"([^"]*)"', block)
        print(lang, key, '=>', (mm.group(1) if mm else 'MISSING'))
    print()
