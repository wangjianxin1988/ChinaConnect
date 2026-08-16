import re, sys, json
sys.stdout.reconfigure(encoding="utf-8")
key = "在车站查看英文线路图"
d = json.load(open(".audit/guide-strings.json", encoding="utf-8"))
print("guide-strings type:", type(d).__name__, "len:", len(d))
if isinstance(d, dict):
    print("key in guide-strings:", key in d)
    if key in d:
        print("source value:", repr(d[key]))
txt = open("src/data/guide/ja-overrides.ts", encoding="utf-8").read()
m = re.search(re.escape(key) + r'"\s*:\s*"([^"]*)"', txt)
print("ja value:", m.group(1) if m else "NOT FOUND in ja-overrides")
th = open("src/data/guide/overrides-th.ts", encoding="utf-8").read()
m2 = re.search(re.escape(key) + r'"\s*:\s*"([^"]*)"', th)
print("th value:", m2.group(1) if m2 else "NOT FOUND in overrides-th")
