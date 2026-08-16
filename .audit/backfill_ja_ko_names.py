# Backfill ja nameJa and ko nameKo from EMERGENCY_NAMES_L10N after generation.
import io, json, re, os, sys

dict_path = 'src/data/emergency/emergency-names-l10n.ts'
src = io.open(dict_path, encoding='utf-8').read()
# parse per-lang blocks
def parse_lang_block(src, lang):
    m = re.search(r'"%s": \{([\s\S]*?)\n  \},' % re.escape(lang), src)
    if not m:
        return {}
    out = {}
    for km in re.finditer(r'^\s*("(?:[^"\\]|\\.)*"):\s*("(?:[^"\\]|\\.)*"),?\s*$', m.group(1), re.M):
        try:
            out[json.loads(km.group(1))] = json.loads(km.group(2))
        except Exception:
            pass
    return out

ja = parse_lang_block(src, 'ja')
ko = parse_lang_block(src, 'ko')
print('dict ja keys:', len(ja), 'ko keys:', len(ko))

base = 'src/data/cities-i18n'
for lang, d in [('ja', ja), ('ko', ko)]:
    changed_files = 0
    total = 0
    applied = 0
    for fn in os.listdir(os.path.join(base, lang)):
        if not fn.endswith('.json'):
            continue
        p = os.path.join(base, lang, fn)
        data = json.loads(io.open(p, encoding='utf-8').read())
        dirty = False
        for c in data.get('emergencyContacts', []):
            total += 1
            en = c.get('nameEn') or ''
            val = d.get(en)
            if val:
                key = 'nameJa' if lang == 'ja' else 'nameKo'
                if c.get(key) != val:
                    c[key] = val
                    dirty = True
                    applied += 1
        if dirty:
            io.open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
            changed_files += 1
    print('%s: total=%d applied=%d changed_files=%d' % (lang, total, applied, changed_files))
print('DONE')
