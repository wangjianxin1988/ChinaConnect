# -*- coding: utf-8 -*-
import io
p = '.gitignore'
s = io.open(p, encoding='utf-8').read()
if '.audit/*.pkl' not in s:
    s += '\n# Audit caches\n.audit/*.pkl\n.audit/__pycache__/\n'
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
    print('gitignore updated')
else:
    print('already present')
