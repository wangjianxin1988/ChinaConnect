# Combined verification: verify_data_i18n (targeted fields) + full-field cross-script scan
import sys, io, re, os, json, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
root = r"D:/suoyouxiangmu/chinaconnect"
def run(args):
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", cwd=root)
    return r.stdout + r.stderr
CJK = re.compile(r"[\u3400-\u9fff]")
KANA = re.compile(r"[\u3040-\u30ff]")
HANGUL = re.compile(r"[\uac00-\ud7af]")
CYR = re.compile(r"[\u0400-\u04ff]")
ARAB = re.compile(r"[\u0600-\u06ff]")
THAI = re.compile(r"[\u0e00-\u0e7f]")
foreign = {
  "ja": [HANGUL, CYR, ARAB, THAI], "ko": [CJK, KANA, CYR, ARAB, THAI],
  "zh-CN": [KANA, HANGUL, CYR, ARAB, THAI], "zh-TW": [KANA, HANGUL, CYR, ARAB, THAI],
  "th": [CJK, KANA, HANGUL, CYR, ARAB], "vi": [CJK, KANA, HANGUL, CYR, ARAB, THAI],
  "ru": [CJK, KANA, HANGUL, ARAB, THAI], "fr": [CJK, KANA, HANGUL, CYR, ARAB, THAI],
  "de": [CJK, KANA, HANGUL, CYR, ARAB, THAI], "ar": [CJK, KANA, HANGUL, CYR, THAI],
  "fa": [CJK, KANA, HANGUL, CYR, THAI],
}
def walk(obj, path, out):
    if isinstance(obj, str): out.append((path, obj)); return
    if isinstance(obj, list):
        for i, v in enumerate(obj): walk(v, "%s.%d" % (path, i), out)
    elif isinstance(obj, dict):
        for k, v in obj.items(): walk(v, "%s.%s" % (path, k) if path else k, out)
def scan(lang):
    d = os.path.join(root, "src/data/cities-i18n", lang)
    bad = []
    for fn in sorted(os.listdir(d)):
        if not fn.endswith(".json"): continue
        data = json.load(io.open(os.path.join(d, fn), encoding="utf-8"))
        vals = []; walk(data, "", vals)
        for p, v in vals:
            if p.endswith(".name") or p == "name": continue
            for rx in foreign[lang]:
                if rx.search(v):
                    bad.append((fn, p, v[:60])); break
    return bad
langs = sys.argv[1:] or ["ja","ko","zh-CN","zh-TW","th","vi","ru","fr","de","ar","fa"]
for lang in langs:
    out = run(["node", ".audit/verify_data_i18n.mjs", "--lang=" + lang])
    m = re.search(r"Total missing: (\d+)", out)
    vmiss = m.group(1) if m else "?"
    bad = scan(lang)
    print("== %s verify_missing=%s scan_bad=%d" % (lang, vmiss, len(bad)))
    for fn, p, v in bad[:5]:
        print("   ", fn, p, "=>", repr(v))
