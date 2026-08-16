import json, sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
CJK = re.compile(r'[\u3400-\u9fff]')
base = "src/data/cities-i18n/ko"
def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, f"{path}.{k}" if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        yield path, o
hits = {}
for fn in sorted(os.listdir(base)):
    if not fn.endswith(".json"): continue
    d = json.load(open(os.path.join(base, fn), encoding="utf-8"))
    for p, v in walk(d):
        if CJK.search(v):
            hits.setdefault(p.split(".")[-1].split("[")[0], 0)
            hits[p.split(".")[-1].split("[")[0]] += 1
print("ko field-name -> CJK counts:")
for k, v in sorted(hits.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")
