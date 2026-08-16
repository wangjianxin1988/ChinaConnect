import io, os, glob, re
for p in ['src/i18n/translations.ts']:
    s = io.open(p, encoding='utf-8').read()
    for m in re.finditer(r'zh-CN|zh-TW', s):
        print(p, m.start(), ':', re.sub(r'\s+', ' ', s[max(0,m.start()-80):m.end()+80])[:160])
