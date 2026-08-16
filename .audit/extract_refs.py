import io, re
# attractions ja values
data = io.open('src/pages/[lang]/guide/attractions.astro', encoding='utf-8').read()
print('=== ATTRACTIONS (en | ja) ===')
for m in re.finditer(r'lang === "ja" \? `([^`]+)` : `([^`]+)`', data):
    ja, en = m.group(1), m.group(2)
    print(repr(en))
    print('  JA:', repr(ja))
