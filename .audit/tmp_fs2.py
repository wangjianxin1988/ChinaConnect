import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('  en: {')
j = s.find('  ja: {')
seg = s[i:j]
for key in ['foodSubtitle', 'foodHighlightsSubtitle', 'localFoodHighlights', 'localFoodHighlightsDesc']:
    m = re.search(key + r': "([^"]*)"', seg)
    print('en', key, '=', m.group(1) if m else 'NOT FOUND')
