import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
langs = {'en':1881,'ja':139840,'ko':257830,'th':377334,'vi':513490,'ru':656154,'fr':795695,'de':933137,'ar':1068924,'fa':1199510,'zh-CN':1331319,'zh-TW':1446931}
order = sorted(langs.items(), key=lambda x: x[1])
KANA = re.compile(r'[\u3040-\u30ff]')
HANGUL = re.compile(r'[\uac00-\ud7af]')
for i,(lang,start) in enumerate(order):
    end = order[i+1][1] if i+1<len(order) else len(txt)
    seg = txt[start:end]
    vals = re.findall(r':\s*"((?:[^"\\]|\\.)*)"', seg)
    kana = [v for v in vals if KANA.search(v)]
    print(f"{lang:6s} values={len(vals):5d} with_kana={len(kana):4d}")
