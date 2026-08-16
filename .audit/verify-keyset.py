import json
real=set(json.load(open('.audit/guide-strings.json',encoding='utf-8'))['strings'])
old=set(json.load(open('.audit/guide-strings.json.bak',encoding='utf-8'))['strings'])
print('real(5775 set) size:', len(real))
print('subset of old 8773:', real <= old)
missing_in_old = real - old
print('real keys NOT in old 8773:', len(missing_in_old))
for s in sorted(missing_in_old)[:20]: print('  MISSING:', repr(s[:80]))
# sample real keys
import itertools
cjk=[s for s in real if any('\u4e00'<=c<='\u9fff' for c in s)]
en=[s for s in real if not any('\u4e00'<=c<='\u9fff' for c in s)]
print('real CJK keys:', len(cjk), 'EN keys:', len(en))
print('CJK samples:', [s[:50] for s in cjk[:5]])
print('EN samples:', [s[:50] for s in en[:5]])
