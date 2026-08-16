# -*- coding: utf-8 -*-
import io, re, json
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
print('LEN', len(s))
# find the top-level structure - look for language object definitions
m = re.findall(r'^\s{2}([a-zA-Z-]+):\s*\{', s, re.M)
print('top-level keys sample:', m[:40])
