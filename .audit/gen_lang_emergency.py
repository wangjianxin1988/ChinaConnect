# -*- coding: utf-8 -*-
import io
src = io.open('src/pages/emergency.astro', encoding='utf-8').read()
# insert getStaticPaths after frontmatter start
header = '''---
export function getStaticPaths() {
  const langs = ["ja","ko","zh-CN","zh-TW","th","vi","ru","fr","de","ar","fa"];
  return langs.map((lang) => ({ params: { lang } }));
}

'''
body = src
# remove the BOM if present
if body.startswith('\ufeff'):
    body = body[1:]
# replace the lang line
body = body.replace('const lang = (Astro.locals.lang as Language) || "en";', 'const lang = (Astro.params.lang as string) || "en";')
# ensure type Language import still used (it is used in the const declaration type)
# pass lang to client components
body = body.replace('<QuickDial client:load />', '<QuickDial client:load lang={lang} />')
body = body.replace('<EmergencyCard client:load lang={lang} />', '<EmergencyCard client:load lang={lang} />')
body = body.replace('<GPSLocator client:load />', '<GPSLocator client:load lang={lang} />')
body = body.replace('<EmbassyLocator client:load showAll={true} lang={lang} />', '<EmbassyLocator client:load showAll={true} lang={lang} />')
out = header + body
io.open('src/pages/[lang]/emergency.astro', 'w', encoding='utf-8', newline='\n').write(out)
print('written', len(out))
