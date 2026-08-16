import io, json
d = json.loads(io.open('.audit/ja-bad-keys.json', encoding='utf-8').read())
print('bad', d['bad'])
for x in d['badKeys']:
    print('KEY:', repr(x['key']))
    print('VAL:', repr(x['value']))
