import io, re, json

p = 'src/i18n/translations.ts'
data = io.open(p, 'r', encoding='utf-8', newline='').read()
assert '\r\n' in data, 'expected CRLF'

TITLES = {
  'en': 'Travel Guide {city} - ChinaConnect',
  'ja': '{city} 旅行ガイド - ChinaConnect',
  'ko': '{city} 여행 가이드 - ChinaConnect',
  'zh-CN': '{city} 旅游指南 - ChinaConnect',
  'zh-TW': '{city} 旅遊指南 - ChinaConnect',
  'th': 'คู่มือท่องเที่ยว {city} - ChinaConnect',
  'vi': 'Hướng dẫn du lịch {city} - ChinaConnect',
  'ru': 'Путеводитель по городу {city} - ChinaConnect',
  'fr': 'Guide de voyage {city} - ChinaConnect',
  'de': 'Reiseführer {city} - ChinaConnect',
  'ar': 'دليل السفر إلى {city} - ChinaConnect',
  'fa': 'راهنمای سفر به {city} - ChinaConnect',
}

lines = data.split('\r\n')
count = 0
for i, line in enumerate(lines):
    m = re.match(r'^  ([a-zA-Z-]+): \{$', line)
    if not m or m.group(1) not in TITLES:
        continue
    lang = m.group(1)
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
print('inserted pageTitle count:', count)
