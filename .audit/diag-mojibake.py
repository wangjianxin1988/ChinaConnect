import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
print("replacement char count:", txt.count("\ufffd"))
print("byte-order/other odd:", txt.count("\ufffd") + len(re.findall(r'[\ud800-\udfff]', txt)))
# sample contexts
for m in re.finditer(r'.{30}\ufffd.{30}', txt):
    print(repr(m.group(0)))
    if m.start() > 200000: break
