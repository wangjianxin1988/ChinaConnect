import sys, re, json
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# Find language block boundaries: lines like "  ko: {" at 4-space indent
langs = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]
boundaries = {}
for m in re.finditer(r'\n\s{2}([a-z-]{2,5}): \{', txt):
    if m.group(1) in langs and m.group(1) not in boundaries:
        boundaries[m.group(1)] = m.start()
# sort by position
order = sorted(boundaries.items(), key=lambda x: x[1])
print("blocks:", [(l, i) for l, i in order])
def block_range(lang):
    for j, (l, i) in enumerate(order):
        if l == lang:
            end = order[j+1][1] if j+1 < len(order) else len(txt)
            return txt[i:end]
    return ""
KANA = re.compile(r'[\u3040-\u30ff]')
HANGUL = re.compile(r'[\uac00-\ud7af]')
CYR = re.compile(r'[\u0400-\u04ff]')
ARAB = re.compile(r'[\u0600-\u06ff]')
THAI = re.compile(r'[\u0e00-\u0e7f]')
CJK = re.compile(r'[\u3400-\u9fff]')
for lang, _ in order:
    seg = block_range(lang)
    # count string values containing kana (ja script) - excluding pure brand
    vals = re.findall(r'"((?:[^"\\]|\\.)*)"', seg)
    kana_vals = [v for v in vals if KANA.search(v) and not HANGUL.search(v)]
    print(f"{lang:6s} values={len(vals):5d} kana_vals={len(kana_vals):5d}")
