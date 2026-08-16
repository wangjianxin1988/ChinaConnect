# -*- coding: utf-8 -*-
import io
p = 'scripts/fix-city-data-eng.mjs'
lines = io.open(p, encoding='utf-8').read().split('\n')
# find the verbatim loop: line with "if (p.includes(\"emergencyContacts\")) continue;" that is followed by "const enV"
for i, l in enumerate(lines):
    if 'p.includes("emergencyContacts")' in l and i+1 < len(lines) and 'const enV' in lines[i+1]:
        lines.insert(i+1, '      if (isKeepableToken(v)) continue;')
        print('inserted at line', i+2)
        break
io.open(p, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
print('done')
