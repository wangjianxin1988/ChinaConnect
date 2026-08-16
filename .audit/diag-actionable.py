import json, sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
CJK = re.compile(r'[\u3400-\u9fff]')
langs = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa"]
base = "src/data/cities-i18n"
def walk(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, f"{path}.{k}" if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        yield path, o
def fields(d):
    return dict(walk(d))
for lang in langs:
    action = 0
    files = 0
    for fn in sorted(os.listdir(os.path.join(base, lang))):
        if not fn.endswith(".json"): continue
        slug = fn[:-5]
        ko_f = fields(json.load(open(os.path.join(base, lang, fn), encoding="utf-8")))
        ja_f = fields(json.load(open(os.path.join(base, "ja", fn), encoding="utf-8")))
        for p, v in ko_f.items():
            if not CJK.search(v): continue
            ja_v = ja_f.get(p)
            if ja_v is None: continue
            # if ja also contains CJK (proper noun preserved) -> skip
            if CJK.search(ja_v): continue
            action += 1
        if action: files += 1
    print(f"{lang:6s} actionable_CJK_fields={action:6d} files_affected={files}")
