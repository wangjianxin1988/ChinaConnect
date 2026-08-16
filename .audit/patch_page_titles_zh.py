import io, re, json

p = 'src/i18n/translations.ts'
data = io.open(p, 'r', encoding='utf-8', newline='').read()
lines = data.split('\r\n')

TITLES = {
  'zh-CN': '{city} 旅游指南 - ChinaConnect',
  'zh-TW': '{city} 旅遊指南 - ChinaConnect',
}

# find quoted lang sections
count = 0
for i, line in enumerate(lines):
    m = re.match(r'^  ("[a-zA-Z-]+"): \{$', line)
    if not m:
        continue
    lang = m.group(1).strip('"')
    if lang not in TITLES:
        continue
    j = i + 1
    while j < len(lines) and not re.match(r'^  \},$', lines[j]):
        if re.match(r'^    cityPage: \{$', lines[j]):
            if lines[j + 1].startswith('      pageTitle:'):
                print(lang, 'already has pageTitle, skip')
                break
            new_line = '      pageTitle: ' + json.dumps(TITLES[lang], ensure_ascii=False) + ','
            lines.insert(j + 1, new_line)
            count += 1
            break
        j += 1

io.open(p, 'w', encoding='utf-8', newline='').write('\r\n'.join(lines))
print('inserted zh pageTitle count:', count)
