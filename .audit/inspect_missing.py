import io, re
for f in ['src/pages/attractions/index.astro','src/pages/contact.astro','src/pages/privacy.astro','src/pages/terms.astro']:
    data = io.open(f, encoding='utf-8', errors='replace').read()
    di18n = len(re.findall(r'data-i18n', data))
    print('===', f, 'len', len(data), 'data-i18n:', di18n)
    # show first 300 chars
    print(data[:250].replace(chr(10),' '))
    print()
