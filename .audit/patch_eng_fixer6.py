# -*- coding: utf-8 -*-
import io
p = 'scripts/fix-city-data-eng.mjs'
lines = io.open(p, encoding='utf-8').read().split('\n')
out = []
removed = 0
for l in lines:
    if l.strip() == 'if (isKeepableToken(v)) continue;' and 'CJK pass' not in l:
        removed += 1
        continue
    out.append(l)
io.open(p, 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
print('removed keepable-skip lines:', removed)
