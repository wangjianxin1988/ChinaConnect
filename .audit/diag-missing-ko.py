import json, sys, re
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
en = dict(walk(json.load(open("src/data/cities/qingdao.json", encoding="utf-8"))))
ko = dict(walk(json.load(open("src/data/cities-i18n/ko/qingdao.json", encoding="utf-8"))))
ja = dict(walk(json.load(open("src/data/cities-i18n/ja/qingdao.json", encoding="utf-8"))))
missing_in_ko = [p for p in en if p not in ko and CJK.search(str(en[p]))]
print("EN fields missing in ko JSON with CJK:", len(missing_in_ko))
for p in missing_in_ko[:20]:
    print(f"  {p}: {str(en[p])[:60]}")
print()
missing_in_ja = [p for p in en if p not in ja and CJK.search(str(en[p]))]
print("EN fields missing in ja JSON with CJK:", len(missing_in_ja))
