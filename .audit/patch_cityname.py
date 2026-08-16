import io
p = r'src/pages/[lang]/city/[slug].astro'
c = io.open(p, encoding='utf-8').read()
old = 'import { pruneCityEntityNames } from "@/lib/city-name";'
assert old in c
c = c.replace(old, 'import { cityDisplayName, pruneCityEntityNames } from "@/lib/city-name";')
old2 = 'const localCityName = translations[lang]?.["city." + city.slug + ".name"] ?? translations.en?.["city." + city.slug + ".name"] ?? i18nCity?.name ?? city.nameEn;'
assert old2 in c, 'localCityName line not found'
new2 = 'const localCityName = translations[lang]?.["city." + city.slug + ".name"] ?? translations.en?.["city." + city.slug + ".name"] ?? cityDisplayName(i18nCity ?? city, lang);'
c = c.replace(old2, new2)
io.open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('astro patched OK')
