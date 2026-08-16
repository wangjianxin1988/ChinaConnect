# -*- coding: utf-8 -*-
import io
p = r'src/pages/[lang]/emergency.astro'
s = io.open(p, encoding='utf-8').read()
if not s.startswith('---'):
    s = '---\n' + s
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print('prefixed, head:', repr(s[:80]))
