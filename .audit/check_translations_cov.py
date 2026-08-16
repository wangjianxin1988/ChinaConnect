# -*- coding: utf-8 -*-
import io, re, sys
sys.path.insert(0, '.')
data = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# extract all data-i18n keys used across astro pages
import glob, os
KEYS = set()
for f in glob.glob('src/pages/**/*.astro', recursive=True):
    d = io.open(f, encoding='utf-8', errors='replace').read()
    for m in re.finditer(r'data-i18n(?:-title|-placeholder|-aria)?="([^"]+)"', d):
        KEYS.add(m.group(1))
print('total data-i18n keys used:', len(KEYS))

# parse translations.ts roughly: find language blocks
LANGS = ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
# Extract per-lang objects is complex; instead check key presence per lang via regex on the source
missing = {}
for key in sorted(KEYS):
    # build a path regex: look for lang: { ... key: ... } — approximate: search key near lang marker
    found = {l: False for l in LANGS}
    # crude: split file by lang top-level? translations object likely: const translations: Record<Language, ...> = { en: {...}, ja: {...} }
    # find top-level lang blocks
    # We'll just check each key string appears in file near each lang by splitting at top-level
    # simpler: count occurrences of key string inside each lang block
    for l in LANGS:
        # find the lang block boundaries heuristically
        pass
    missing[key] = []
for key in sorted(KEYS):
    # global presence check per lang via marker search: key appears N times; assume each lang block once
    cnt = data.count('"' + key + '"') + data.count("'" + key + "'")
    if cnt < 12:
        missing[key] = cnt
print('keys with <12 occurrences:', len(missing))
for k, c in list(missing.items())[:80]:
    print(' ', c, k)
