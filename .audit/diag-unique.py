import json, sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
CJK_RE = re.compile(r'[\u3400-\u9fff]')
KANA_RE = re.compile(r'[\u3040-\u30fa\u30fc-\u30ff]')
LATIN_RE = re.compile(r'[A-Za-z]')
def walk(o, path=""):
    out = {}
    if isinstance(o, list):
        for i, v in enumerate(o):
            out.update(walk(v, f"{path}[{i}]"))
    elif isinstance(o, dict):
        for k, v in o.items():
            out.update(walk(v, f"{path}.{k}" if path else k))
    elif isinstance(o, str):
        out[path] = o
    return out
def proper(s):
    return CJK_RE.search(s) and not KANA_RE.search(s) and not LATIN_RE.search(s)
LANGS = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa"]
for lang in LANGS:
    unique_ja = set()
    d = os.path.join("src/data/cities-i18n", lang)
    jd = os.path.join("src/data/cities-i18n", "ja")
    for fn in os.listdir(d):
        if not fn.endswith(".json"): continue
        t = walk(json.load(open(os.path.join(d, fn), encoding="utf-8")))
        ja_f = walk(json.load(open(os.path.join(jd, fn), encoding="utf-8")))
        for p, v in t.items():
            if not CJK_RE.search(v): continue
            if len(v) < 40 and re.fullmatch(r'[\u3400-\u9fff0-9\s.,¥$€£%()（）\-+·、，。！？；：""\'\']*', v): continue
            ja_v = ja_f.get(p)
            if ja_v is None or proper(ja_v): continue
            unique_ja.add(ja_v)
    print(f"{lang:6s} unique_ja_sources={len(unique_ja)}")
