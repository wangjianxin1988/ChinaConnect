import json, sys, re
sys.stdout.reconfigure(encoding="utf-8")
ko = json.load(open("src/data/cities-i18n/ko/qingdao.json", encoding="utf-8"))
ja = json.load(open("src/data/cities-i18n/ja/qingdao.json", encoding="utf-8"))
def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, f"{path}.{k}")
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        yield path, o
cjk = re.compile(r'[\u3400-\u9fff]{2,}')
ko_cjk = [(p, v) for p, v in walk(ko) if cjk.search(v)]
print("ko qingdao CJK fields:", len(ko_cjk))
for p, v in ko_cjk[:25]:
    print(f"  {p}: {v[:70]}")
