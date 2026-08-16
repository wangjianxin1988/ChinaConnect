import sys, json
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(".audit/guide-strings.json", encoding="utf-8"))
print("keys:", list(d.keys()))
for k, v in d.items():
    if isinstance(v, dict):
        print(k, "-> dict len", len(v), "sample:", list(v.items())[:2])
    else:
        print(k, "->", repr(v)[:200])
