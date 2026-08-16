import io
p = '.audit/parse_translations.py'
s = io.open(p, encoding='utf-8').read()
# store value span (k2, j2) instead of (key_start i, j2)
s = s.replace('                    out[path] = (val, i, j2)', '                    out[path] = (val, k2, j2)')
s = s.replace('                    out[path] = (val, i, j2)\n                    i = j2\n                else:\n                    i = k2\n            else:\n                i = j', '                    out[path] = (val, k2, j2)\n                    i = j2\n                else:\n                    i = k2\n            else:\n                i = j')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched parser')
