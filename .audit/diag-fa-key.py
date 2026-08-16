import re, sys
sys.stdout.reconfigure(encoding="utf-8")
key = "Verify guide credentials"
for lang in ["ja", "ko", "ar", "de", "th", "zh-CN"]:
    p = f"src/data/guide/overrides-{lang}.ts"
    if lang == "ja":
        p = "src/data/guide/ja-overrides.ts"
    try:
        txt = open(p, encoding="utf-8").read()
    except FileNotFoundError:
        print(lang, "file missing"); continue
    m = re.search(re.escape(key) + r'"\s*:\s*"([^"]*)"', txt)
    print(lang, ":", m.group(1) if m else "NOT FOUND")
