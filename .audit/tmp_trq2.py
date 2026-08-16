# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
langs = ['en', 'ja', 'ko', 'th', 'vi', 'ru', 'fr', 'de', 'ar', 'fa']
bounds = []
for lang in langs:
    for m in re.finditer(r'^  %s:\s*\{' % re.escape(lang), s, re.M):
        bounds.append((m.start(), lang))
bounds.sort()
ends = {}
for i, (start, lang) in enumerate(bounds):
    if i + 1 < len(bounds):
        ends[lang] = bounds[i+1][0]
    else:
        rest = s[start:]
        m = re.search(r'\n\};', rest)
        ends[lang] = start + m.start() if m else len(s)

def parse(text):
    pairs = re.findall(r'([A-Za-z0-9_]+):\s*"((?:[^"\\]|\\.)*)"', text)
    return {k: v.replace('\\n','\n').replace('\\"','"') for k, v in pairs}

en = parse(s[bounds[0][0]:ends['en']])
for i, (start, lang) in enumerate(bounds):
    if lang == 'en': continue
    d = parse(s[start:ends[lang]])
    identical = {k: d[k] for k in en if k in d and d[k] == en[k]}
    # also: values that look English (latin-only, 3+ words, no placeholder-braces only) but not necessarily identical
    print('%-4s total_keys=%4d  identical_to_en=%4d' % (lang, len(d), len(identical)))
    if lang in ('ko', 'fa'):
        for k, v in list(identical.items())[:12]:
            print('     %s = %s' % (k, v[:70]))
