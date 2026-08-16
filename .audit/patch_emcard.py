import io
p = r'src/components/city/EmergencyCard.tsx'
c = io.open(p, encoding='utf-8').read()
old = 'import { ct } from "@/i18n/components-strings";'
assert old in c
c = c.replace(old, old + '\nimport { EMERGENCY_NAMES_L10N } from "@/data/emergency/emergency-names-l10n";')
old2 = '  const displayName = isCJK && contact.name\n    ? contact.name\n    : (localised || contact.nameEn || contact.name);'
assert old2 in c, 'block not found'
new2 = '  const displayName = isCJK && contact.name\n    ? contact.name\n    : (localised || EMERGENCY_NAMES_L10N[lang]?.[contact.nameEn] || contact.nameEn || contact.name);'
c = c.replace(old2, new2)
io.open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('patched OK')
