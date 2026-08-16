# -*- coding: utf-8 -*-
import io
p = 'scripts/fix-de-nameen.mjs'
s = io.open(p, encoding='utf-8').read()
old = 'if (p.includes("hotels.")) continue;   // hotels keep nameEn unchanged (all langs)'
new = 'if (p.startsWith("hotels")) continue;  // hotels keep nameEn unchanged (all langs)'
assert old in s
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched')
