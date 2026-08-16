import json, sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
CJK = re.compile(r'[\u3400-\u9fff]')
langs = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa"]
base = "src/data/cities-i18n"
for lang in langs:
    counts = {"ticketPrice": 0, "climate.type": 0, "climate.tips": 0, "name": 0, "attractions.name": 0, "restaurants.name": 0}
    for fn in sorted(os.listdir(os.path.join(base, lang))):
        if not fn.endswith(".json"): continue
        d = json.load(open(os.path.join(base, lang, fn), encoding="utf-8"))
        if CJK.search(str(d.get("name", ""))): counts["name"] += 1
        cl = d.get("climate") or {}
        if CJK.search(str(cl.get("type", ""))): counts["climate.type"] += 1
        if CJK.search(str(cl.get("tips", ""))): counts["climate.tips"] += 1
        for a in d.get("attractions", []):
            if CJK.search(str(a.get("ticketPrice", ""))): counts["ticketPrice"] += 1
            if CJK.search(str(a.get("name", ""))): counts["attractions.name"] += 1
        for r in d.get("restaurants", []):
            if CJK.search(str(r.get("name", ""))): counts["restaurants.name"] += 1
    print(f"{lang:6s}", counts)
