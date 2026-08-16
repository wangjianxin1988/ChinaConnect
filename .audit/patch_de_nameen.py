# -*- coding: utf-8 -*-
import io
p = 'scripts/fix-de-nameen.mjs'
s = io.open(p, encoding='utf-8').read()
old = """    if (!(p.endsWith(".nameEn") || p === "nameEn")) continue;
    if (p.includes("emergencyContacts")) continue;"""
new = """    if (!(p.endsWith(".nameEn") || p === "nameEn")) continue;
    if (p.includes("emergencyContacts")) continue;
    if (p.includes("hotels.")) continue;   // hotels keep nameEn unchanged (all langs)
    if (p === "nameEn") continue;           // city name stays romanized"""
assert old in s, 'old block not found'
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched OK')
