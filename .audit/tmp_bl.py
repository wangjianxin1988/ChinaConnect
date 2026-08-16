import io
s = io.open('src/layouts/BaseLayout.astro', encoding='utf-8').read()
print('LEN', len(s))
for kw in ['__I18N__', 'translations', 'data-i18n', 'i18n(', 't(']:
    i = s.find(kw)
    print('====', kw, 'at', i)
    if i >= 0:
        print(s[max(0,i-300):i+500].replace('\n', ' ')[:800])
