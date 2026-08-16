# -*- coding: utf-8 -*-
import io, json, re
CJK = re.compile(r'[\u3400-\u9fff]')
ko = json.loads(io.open('src/data/cities-i18n/ko/beijing.json', encoding='utf-8').read())
ja = json.loads(io.open('src/data/cities-i18n/ja/beijing.json', encoding='utf-8').read())

# find the content fields with Chinese glosses in ko
def find_paths(o, path='', out=None):
    if out is None: out = []
    if isinstance(o, str):
        if CJK.search(o): out.append((path, o[:90]))
    elif isinstance(o, list):
        for i, v in enumerate(o): find_paths(v, '%s[%d]' % (path, i), out)
    elif isinstance(o, dict):
        for k, v in o.items(): find_paths(v, '%s.%s' % (path, k) if path else k, out)
    return out

ko_content = [x for x in find_paths(ko) if 'content' in x[0]]
print('ko content CJK fields:', len(ko_content))
for p, v in ko_content[:6]:
    print('  KO', p, '=', v)
    # look up ja
    parts = re.sub(r'\[(\d+)\]', r'.\1', p).split('.')
    cur = ja
    try:
        for part in parts:
            cur = cur[int(part)] if part.isdigit() else cur[part]
        print('     JA =', str(cur)[:90])
    except Exception as e:
        print('     JA = <missing>', e)
