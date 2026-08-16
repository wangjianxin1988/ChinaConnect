# -*- coding: utf-8 -*-
import io, json, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# de pattern -> German translation (semantics follow ja standard)
PATS = [
    (r'^Air-conditioned$', 'Klimatisiert'),
    (r'^Single ride: (.+)$', r'Einzelfahrt: \1'),
    (r'^Most attractions (.+)$', r'Die meisten Sehenswürdigkeiten: \1'),
    (r'^Starting fare: (.+)$', r'Grundpreis: \1'),
    (r'^Taxi to Xizhou: (.+)$', r'Taxi nach Xizhou: \1'),
    (r'^To attractions (.+)$', r'Zu den Sehenswürdigkeiten: \1'),
    (r'^To Shaolin (.+)$', r'Nach Shaolin: \1'),
    (r'^Unlock: (.+)$', r'Entsperren: \1'),
    (r'^Within city (.+)$', r'Innerhalb der Stadt: \1'),
    (r'^Within old town: (.+)$', r'In der Altstadt: \1'),
    (r'^Shantang Street boat: (.+)$', r'Boot auf der Shantang-Straße: \1'),
    (r'^Universal in (.+)$', r'In \1 überall akzeptiert'),
]

def walk(o, pathStr=""):
    out = {}
    if isinstance(o, list):
        for i, v in enumerate(o):
            out.update(walk(v, "%s[%d]" % (pathStr, i)))
    elif isinstance(o, dict):
        for k, v in o.items():
            out.update(walk(v, "%s.%s" % (pathStr, k) if pathStr else k))
    elif isinstance(o, str):
        out[pathStr] = o
    return out

def norm(v):
    return re.sub(r'[^a-z0-9\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]', '', str(v).lower())

base = 'src/data/cities-i18n/de'
fixed = 0
changed_files = set()
for fn in sorted(os.listdir(base)):
    if not fn.endswith('.json'): continue
    slug = fn[:-5]
    fp = os.path.join(base, fn)
    target = json.load(io.open(fp, encoding='utf-8'))
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    ja = json.load(io.open('src/data/cities-i18n/ja/%s' % fn, encoding='utf-8'))
    ef = walk(en); jf = walk(ja)
    for p, v in walk(target).items():
        if not isinstance(v, str) or not re.search('[A-Za-z]', v): continue
        ev = ef.get(p); jv = jf.get(p)
        if not isinstance(ev, str) or not isinstance(jv, str): continue
        if norm(v) != norm(ev): continue
        if norm(jv) == norm(ev): continue
        if not re.search('[\u3040-\u30ff\u3400-\u9fff]', jv): continue
        for pat, repl in PATS:
            m = re.match(pat, v)
            if m:
                new = re.sub(pat, repl, v)
                if new != v:
                    # apply via setPath on the raw object
                    tokens = []
                    for part in p.split('.'):
                        mm = re.match(r'^([^[]*)((?:\[\d+\])*)$', part)
                        key = mm.group(1)
                        if key: tokens.append(key)
                        for b in mm.group(2).split(']'):
                            if b and b.startswith('['):
                                tokens.append(int(b[1:]))
                    cur = target
                    for i, t in enumerate(tokens):
                        if i == len(tokens) - 1:
                            if isinstance(cur, list): cur[t] = new
                            else: cur[t] = new
                        else:
                            cur = cur[t] if isinstance(cur, list) else cur[t]
                    fixed += 1
                    changed_files.add(fn)
                break
    if fn in changed_files:
        io.open(fp, 'w', encoding='utf-8').write(json.dumps(target, ensure_ascii=False, indent=2))
print('fixed fields:', fixed)
print('changed files:', len(changed_files))
