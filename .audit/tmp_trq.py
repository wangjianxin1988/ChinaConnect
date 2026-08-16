# -*- coding: utf-8 -*-
import io, re, json
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# language section ranges using the 2-space indent keys
langs = ['en', 'ja', 'ko', 'th', 'vi', 'ru', 'fr', 'de', 'ar', 'fa']
bounds = []
for lang in langs:
    for m in re.finditer(r'^  %s:\s*\{' % re.escape(lang), s, re.M):
        bounds.append((m.start(), lang))
bounds.sort()
# find end of each section: the next 2-space key line, or closing "};"
ends = {}
for i, (start, lang) in enumerate(bounds):
    if i + 1 < len(bounds):
        ends[lang] = bounds[i+1][0]
    else:
        # last lang (fa): find the line "};" that closes the translations object
        rest = s[start:]
        m = re.search(r'\n\};', rest)
        ends[lang] = start + m.start() if m else len(s)
print('ends:', ends)

def count_english_vals(text):
    # match key: "value" pairs
    pairs = re.findall(r'([A-Za-z0-9_]+):\s*"((?:[^"\\]|\\.)*)"', text)
    cnt = 0
    examples = []
    for k, v in pairs:
        vv = v.replace('\\n', ' ').replace('\\"', '"')
        # English-only: ASCII letters only, no CJK/other scripts, 3+ words, and not placeholder-only
        if not re.search(r'[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]', vv):
            words = re.findall(r'[A-Za-z]{2,}', vv)
            if len(words) >= 3 and vv.strip():
                cnt += 1
                if len(examples) < 6:
                    examples.append('%s: %s' % (k, vv[:70]))
    return cnt, examples

for i, (start, lang) in enumerate(bounds):
    text = s[start:ends[lang]]
    cnt, ex = count_english_vals(text)
    print('%-4s english-ish values: %d   %s' % (lang, cnt, ' | '.join(ex)))
