import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# find all language blocks with any indent variant
pattern = re.compile(r'\n(\s{2,})([a-zA-Z-]{2,10}): \{')
langs = {}
for m in pattern.finditer(txt):
    langs.setdefault(m.group(2), m.start())
print("all blocks:", sorted(langs.keys()))
targets = ["climate", "electricity", "durationLabel", "frequencyLabel", "priceLabel", "esimRecommended", "mapLayerDesc", "foodSubtitle"]
# For ko: slice from ko block start to next block
start = langs.get("ko")
ends = sorted([v for k, v in langs.items() if v > start])
end = ends[0] if ends else len(txt)
ko_seg = txt[start:end]
for key in targets:
    m = re.search(r'\n\s*' + re.escape(key) + r'\s*:\s*"([^"]*)"', ko_seg)
    if m:
        print("ko", key, "=>", m.group(1)[:70])
    else:
        # maybe nested under cityPage
        m2 = re.search(r'cityPage:\s*\{' + r'[\s\S]*?' + re.escape(key) + r'\s*:\s*"([^"]*)"', ko_seg)
        print("ko", key, "=> (nested?)", m2.group(1)[:70] if m2 else "NOT FOUND")
