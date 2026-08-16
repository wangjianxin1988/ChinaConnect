import io
p = r'.audit/scan_pages_client.mjs'
c = io.open(p, encoding='utf-8').read()
old = "    const lang = path.startsWith(\"/\") ? (path.split(\"/\")[1] || \"en\") : \"en\";"
assert old in c
new = "    const first = path.startsWith(\"/\") ? (path.split(\"/\")[1] || \"\") : \"\";\n    const lang = LANGS.includes(first) ? first : \"en\";"
c = c.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('patched OK')
