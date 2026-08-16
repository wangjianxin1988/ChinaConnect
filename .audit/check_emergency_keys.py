# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
for key in ['oneTapCalls','oneTapDesc','phrases','phrasesDesc','gps','gpsDesc']:
    vals = re.findall(key + r':\s*"([^"]*)"', s)
    print('%-12s en=%r | ja=%r' % (key, vals[0] if vals else None, vals[1] if len(vals) > 1 else None))
