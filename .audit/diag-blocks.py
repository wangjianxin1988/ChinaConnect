import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# detect all language block headers including quoted ones
pattern = re.compile(r'\n(\s*)(["\']?)([a-zA-Z-]{2,10})\2\s*:\s*\{')
langs = {}
for m in pattern.finditer(txt):
    langs.setdefault(m.group(3), m.start())
print("lang blocks:", {k: v for k, v in sorted(langs.items(), key=lambda x: x[1])})
