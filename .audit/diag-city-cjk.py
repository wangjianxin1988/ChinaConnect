import json, sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
CJK = re.compile(r'[\u3400-\u9fff]+')
langs = ["ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]
base = "src/data/cities-i18n"
for lang in langs:
    total = 0
    files = 0
    for fn in sorted(os.listdir(os.path.join(base, lang))):
        if not fn.endswith(".json"): continue
        d = json.load(open(os.path.join(base, lang, fn), encoding="utf-8"))
        s = json.dumps(d, ensure_ascii=False)
        n = len(CJK.findall(s))
        if n:
            total += n
            files += 1
    print(f"{lang:6s} CJK-runs total={total:6d} files_with_cjk={files}")
