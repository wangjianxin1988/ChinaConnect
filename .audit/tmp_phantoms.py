# -*- coding: utf-8 -*-
import io, os, json, re
def find_numeric_keys(o, path='', out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items():
            if re.fullmatch(r'\d+', k):
                out.append((path + '.' + k, type(v).__name__, str(v)[:50]))
            else:
                find_numeric_keys(v, path + '.' + k if path else k, out)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            find_numeric_keys(v, '%s[%d]' % (path, i), out)
    return out

for lang in ['ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW','ja']:
    base = 'src/data/cities-i18n/%s' % lang
    total = 0
    for fn in sorted(os.listdir(base)):
        d = json.loads(io.open(os.path.join(base, fn), encoding='utf-8').read())
        total += len(find_numeric_keys(d))
    print('%-5s phantom keys: %d' % (lang, total))
