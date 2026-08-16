# -*- coding: utf-8 -*-
# Revert underscore-leaf values in ko section to EN (dead keys, avoid garbage translation)
import io, pickle, re
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
data = pkl['data']
bom = pkl['bom']
LANGS = pkl['langs']
END = pkl['end']
SRC = 'src/i18n/translations.ts'
text = io.open(SRC, encoding='utf-8').read()
body = text[1:] if bom else text
lang_offsets = dict(LANGS)
lang_order = [l for l, _ in LANGS]
def strip(p): return p.split('.', 1)[1] if '.' in p else p
en = {strip(p): v for p, v in data['en'].items()}
def esc(v): return v.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
lang = 'ko'
st = lang_offsets[lang]
idx = lang_order.index(lang)
endp = lang_offsets[lang_order[idx+1]] if idx+1 < len(lang_order) else END
edits = []
for p, (v, a, b) in data[lang].items():
    sp = strip(p)
    leaf = sp.rsplit('.', 1)[-1] if '.' in sp else sp
    if re.fullmatch(r'_+', leaf) and sp in en and en[sp][0] != v:
        edits.append((st + a, st + b, '"' + esc(en[sp][0]) + '"'))
print('ko revert edits:', len(edits))
edits.sort(key=lambda x: x[0], reverse=True)
for s0, e0, new in edits:
    body = body[:s0] + new + body[e0:]
with open(SRC, 'w', encoding='utf-8') as f:
    f.write(('\ufeff' if bom else '') + body)
print('reverted')
