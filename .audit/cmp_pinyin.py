import io, re, json
vi = io.open('.audit/vi-bad-keys.json', encoding='utf-8').read()
badkeys = [x['key'] for x in json.loads(vi)['badKeys']]
print('bad keys:', len(badkeys))
for f in ['ja','ko','th','ru','de','fr','zh-CN']:
    data = io.open('src/data/guide/overrides-%s.ts' % f, encoding='utf-8').read()
    pat = re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$', re.M)
    m = {x.group(1):x.group(2) for x in pat.finditer(data)}
    print('===', f, '===')
    for k in badkeys:
        print(' ', k[:45], '=>', m.get(k, '<MISSING>')[:60])
