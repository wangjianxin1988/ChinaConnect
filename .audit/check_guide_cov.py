# -*- coding: utf-8 -*-
import io, re, json, glob, os

strings = json.load(io.open('.audit/guide-strings.json', encoding='utf-8'))['strings']
print('source strings:', len(strings))
missing_set = set(strings)
for f in sorted(glob.glob('src/data/guide/overrides-*.ts')):
    s = io.open(f, encoding='utf-8').read()
    # extract all string literal keys in the map (lines like "key": value)
    keys = re.findall(r'\n\s*"((?:[^"\\]|\\.)*)"\s*:', s)
    # unescape
    keys = [k.replace('\\"', '"').replace('\\\\', '\\') for k in keys]
    keyset = set(keys)
    miss = [k for k in strings if k not in keyset]
    extra = [k for k in keyset if k not in strings and len(k) > 3]
    print('%-22s keys=%d  missing=%d  extra=%d' % (os.path.basename(f), len(keyset), len(miss), len(extra)))
    if miss:
        print('   missing samples:', miss[:5])
    if extra:
        print('   extra samples:', extra[:5])
