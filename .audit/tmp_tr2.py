# -*- coding: utf-8 -*-
import io, re, json
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# locate language section boundaries
langs = ['en', 'ja', 'ko', 'th', 'vi', 'ru', 'fr', 'de', 'ar', 'fa', 'zh']
bounds = []
for lang in langs:
    # find "  lang: {" occurrences
    for m in re.finditer(r'^  %s:\s*\{' % re.escape(lang), s, re.M):
        bounds.append((m.start(), lang))
bounds.sort()
print('bounds:', [(l, i) for i, l in bounds])
# zh-CN / zh-TW?
for pat in ['zh-CN', 'zh-TW', 'zhcn', 'zhtw', 'zh_CN']:
    print(pat, 'count:', len(re.findall(pat, s)))
