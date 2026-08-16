# -*- coding: utf-8 -*-
import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
langs = [('en', 1882), ('ja', 140114), ('ko', 258310), ('th', 377811), ('vi', 516392), ('ru', 661683), ('fr', 806973), ('de', 956827), ('ar', 1103461), ('fa', 1240452), ('zh-CN', 1379011), ('zh-TW', 1491906)]
starts = [x[1] for x in langs] + [len(s)]
# find translations object close
m = re.search(r'\n\};', s[1491906:])
end = 1491906 + m.start()
print('translations obj end:', end)

def parse(text):
    pairs = re.findall(r'([A-Za-z0-9_]+):\s*"((?:[^"\\]|\\.)*)"', text)
    return {k: v.replace('\\n','\n').replace('\\"','"') for k, v in pairs}

en = parse(s[1882:140114])
for i, (lang, st) in enumerate(langs):
    endp = starts[i+1] if i+1 < len(starts) else end
    d = parse(s[st:endp])
    identical = {k: d[k] for k in en if k in d and d[k] == en[k]}
    print('%-5s total=%4d identical_to_en=%3d' % (lang, len(d), len(identical)))
