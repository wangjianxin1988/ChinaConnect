import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
KANA = re.compile(r'[\u3040-\u30ff]')
# parse ko block
start = txt.find("\n  ko: {")
end = txt.find("\n  th: {", start)
ko_seg = txt[start:end]
# find key: "value" pairs with path context (walk back to nearest section)
items = []
for m in re.finditer(r'\n(\s*)([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"', ko_seg):
    val = m.group(3)
    if KANA.search(val):
        items.append((m.group(2), val))
print("kana values in ko:", len(items))
for k, v in items:
    print(f"  {k}: {v[:60]}")
