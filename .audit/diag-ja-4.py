import re, sys
sys.stdout.reconfigure(encoding="utf-8")
keys = ["MultiHop", "Windscribe", "Wardens", "Contact Phone"]
for key in keys:
    print("=====", key)
    for lang in ["ja", "fr", "de", "ko"]:
        p = f"src/data/guide/overrides-{lang}.ts"
        if lang == "ja":
            p = "src/data/guide/overrides-ja.ts"
        try:
            txt = open(p, encoding="utf-8").read()
        except FileNotFoundError:
            continue
        m = re.search(re.escape(key) + r'"\s*:\s*"([^"]*)"', txt)
        print(f"  {lang}: {m.group(1) if m else 'NOT FOUND'}")
