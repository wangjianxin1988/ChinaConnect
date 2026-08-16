import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
for lang, marker in [("zh-CN", '"zh-CN": {'), ("zh-TW", '"zh-TW": {')]:
    start = txt.find(marker)
    end = len(txt) if lang == "zh-TW" else txt.find('"zh-TW": {')
    seg = txt[start:end]
    hits = []
    for m in re.finditer(r'([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"', seg):
        if "・" in m.group(2) and not re.search(r'[\u3040-\u30fa\u30fc-\u30ff]', m.group(2)):
            hits.append((m.group(1), m.group(2)[:70]))
    print(lang, "middle-dot values:", len(hits))
    for k, v in hits[:15]:
        print(f"  {k}: {v}")
