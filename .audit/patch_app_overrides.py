# -*- coding: utf-8 -*-
import io
p = 'src/i18n/app-overrides.ts'
s = io.open(p, encoding='utf-8').read()
old = '          const prefix = EXPORT_PREFIX[exportName] ?? "";'
new = '          const prefix = (EXPORT_PREFIX as Record<string, string>)[exportName] ?? "";'
assert old in s
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched app-overrides.ts')
