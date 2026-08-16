# -*- coding: utf-8 -*-
import io, re
path = 'src/i18n/components-strings.ts'
data = io.open(path, encoding='utf-8').read()
pat = re.compile(r'^(\s+)(zh-CN|zh-TW)(:)', re.M)
fixed = pat.sub(lambda m: m.group(1) + '"' + m.group(2) + '"' + m.group(3), data)
io.open(path, 'w', encoding='utf-8', newline='\n').write(fixed)
print('fixed keys:', len(pat.findall(data)))
