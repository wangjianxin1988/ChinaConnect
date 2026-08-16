import re, sys
sys.stdout.reconfigure(encoding="utf-8")
for lang in ["zh-CN", "zh-TW", "ru", "th", "vi", "ar", "fa"]:
    txt = open(f"src/data/guide/overrides-{lang}.ts", encoding="utf-8").read()
    vals = {}
    for k in ["MultiHop", "Windscribe", "Wardens", "Contact Phone"]:
        m = re.search(re.escape(k) + r'"\s*:\s*"([^"]*)"', txt)
        vals[k] = m.group(1) if m else "?"
    print(f"{lang:6s} MultiHop={vals['MultiHop'][:28]!r} | Windscribe={vals['Windscribe'][:28]!r} | Wardens={vals['Wardens'][:28]!r} | Contact Phone={vals['Contact Phone'][:20]!r}")
