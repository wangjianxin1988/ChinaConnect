import json, sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
CJK = re.compile(r'[\u3400-\u9fff]')
def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, f"{path}.{k}" if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        yield path, o
samples = {"description": [], "highlights": [], "tips": [], "content": []}
for fn in sorted(os.listdir("src/data/cities-i18n/ko")):
    if not fn.endswith(".json"): continue
    d = json.load(open(os.path.join("src/data/cities-i18n/ko", fn), encoding="utf-8"))
    for p, v in walk(d):
        f = p.split(".")[-1].split("[")[0]
        if f in samples and CJK.search(v) and len(samples[f]) < 6:
            samples[f].append((fn, p, v))
for f, lst in samples.items():
    print("=====", f)
    for fn, p, v in lst:
        print(f"  {fn} {p}: {v[:80]}")
