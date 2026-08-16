# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# find all language keys at top level of the translations object
for m in re.finditer(r'^\s{2}([a-zA-Z-]+):\s*\{', s, re.M):
    print(m.group(1))
