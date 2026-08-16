# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# find the translations object start
m = re.search(r'export const translations.*?=\s*\{', s, re.S)
print('translations start:', m.start() if m else None)
# all top-level keys: lines at 2-space indent, either bare or quoted
keys = [(mm.start(), mm.group(1)) for mm in re.finditer(r'^  ("?[a-zA-Z0-9-]+"?):\s*\{', s, re.M)]
for pos, k in keys:
    print(pos, k)
