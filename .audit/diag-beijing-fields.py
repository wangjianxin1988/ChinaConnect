import sys, json
sys.stdout.reconfigure(encoding="utf-8")
for lang in ["ja", "ko", "fr", "th"]:
    d = json.load(open(f"src/data/cities-i18n/{lang}/beijing.json", encoding="utf-8"))
    # find power / climate / flights fields
    print("====", lang)
    print("climate:", repr(d.get("climate"))[:100])
    print("power:", repr(d.get("power"))[:150])
    print("voltage:", repr(d.get("voltage"))[:100])
    fl = d.get("flights")
    if isinstance(fl, dict):
        for k, v in list(fl.items())[:3]:
            print("flight", k, ":", repr(v)[:120])
    elif isinstance(fl, list):
        for v in fl[:2]:
            print("flight:", repr(v)[:150])
