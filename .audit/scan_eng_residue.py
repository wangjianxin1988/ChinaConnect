# -*- coding: utf-8 -*-
import io, re, json, glob, os
LANGS = ['ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW']
JA_NONASCII = re.compile(r'[\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]')
# English-ish heuristic: >= 3 consecutive [a-zA-Z] words OR contains '¥' with english, and mostly ascii letters
def is_english(v):
    v = v.strip()
    if not v: return False
    words = re.findall(r"[A-Za-z][A-Za-z'\-]+", v)
    # keepable: pure brands/numbers/short codes
    ascii_letters = len(re.findall(r'[A-Za-z]', v))
    if len(words) < 2: return False
    # exclude values that are mostly URL/phone/email/placeholders
    if re.fullmatch(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&"\'":;~!?#A-Za-z\[\]{}]+', v):
        # too permissive; require prose-like: at least 5 letters total
        if ascii_letters < 8: return False
    return True

def walk(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, path + '.' + k if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, '%s[%d]' % (path, i))
    elif isinstance(o, str):
        yield path, o

TOTAL = 0
for lang in LANGS:
    n = 0
    for fp in sorted(glob.glob('src/data/cities-i18n/%s/*.json' % lang)):
        slug = os.path.basename(fp)[:-5]
        data = json.load(io.open(fp, encoding='utf-8'))
        ja_fp = 'src/data/cities-i18n/ja/%s.json' % slug
        ja_data = json.load(io.open(ja_fp, encoding='utf-8')) if os.path.exists(ja_fp) else {}
        ja_map = {p: v for p, v in walk(ja_data)}
        for p, v in walk(data):
            if is_english(v):
                jv = ja_map.get(p)
                if jv and JA_NONASCII.search(jv) and not is_english(jv):
                    n += 1
                    if n <= 8:
                        print('%s %s %s = %r  | ja=%r' % (lang, slug, p, v[:60], jv[:40]))
    print('== %s english-residue fields (ja non-ascii): %d' % (lang, n))
    TOTAL += n
print('TOTAL:', TOTAL)
