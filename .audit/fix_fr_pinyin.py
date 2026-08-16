# -*- coding: utf-8 -*-
import io, re

p = r"src/data/guide/overrides-fr.ts"
s = io.open(p, encoding="utf-8").read()
fixes = {
    "wǒ guòmǐn jiānguǒ": "Je suis allergique aux noix",
    "wǒ guòmǐn jīdàn": "Je suis allergique aux œufs",
    "wǒ bù chī ròu, dàn, nǎi": "Je ne mange ni viande, ni œufs, ni produits laitiers",
    "bù yào là": "Sans épices, s\u2019il vous plaît",
    "shǎo yóu": "Moins d\u2019huile, s\u2019il vous plaît",
    "wēi là": "Légèrement épicé",
    "qǐng gěi wǒ shūcài": "Je voudrais des légumes",
    "mǐfàn": "Riz",
    "bù yào wèijīng": "Sans glutamate, s\u2019il vous plaît",
    "qǐng dài wǒ qù...": "Emmenez-moi à..., s\u2019il vous plaît",
}
pattern = re.compile(r'^(\s*")((?:[^"\\]|\\.)*)("\s*:\s*")((?:[^"\\]|\\.)*)(",\s*)$', re.M)
changed = 0
def repl(m):
    global changed
    key = m.group(2)
    if key in fixes:
        val = fixes[key].replace("\\", "\\\\").replace('"', '\\"')
        changed += 1
        return m.group(1) + key + m.group(3) + val + m.group(5)
    return m.group(0)
s2 = pattern.sub(repl, s)
assert changed == 10, "expected 10 replacements, got %d" % changed
io.open(p, "w", encoding="utf-8", newline="\n").write(s2)
print("fr fixes applied:", changed)

p2 = r"scripts/lib/translation-accept.mjs"
s = io.open(p2, encoding="utf-8").read()
adds = ['"MultiHop"', '"Windscribe"', '"Wardens"']
anchor = '"NordVPN"'
assert anchor in s
for a in adds:
    if a not in s:
        s = s.replace(anchor, anchor + ", " + a, 1)
        anchor = a
io.open(p2, "w", encoding="utf-8", newline="\n").write(s)
print("BRAND_TOKENS updated")
