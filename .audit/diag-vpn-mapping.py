import re, sys
sys.stdout.reconfigure(encoding="utf-8")
for lang in ["fr", "de", "ko"]:
    txt = open(f"src/data/guide/overrides-{lang}.ts", encoding="utf-8").read()
    print("=====", lang)
    # find all entries near these keys: check raw line order
    lines = txt.split("\n")
    for i, ln in enumerate(lines):
        if any(k in ln for k in ["MultiHop", "Windscribe", "Wardens", "Contact Phone"]):
            print("  ", ln.strip()[:100])
