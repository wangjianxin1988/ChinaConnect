# -*- coding: utf-8 -*-
import io, re, os, json, pickle, time, urllib.request

SRC = 'src/i18n/translations.ts'
KEY = os.environ['DEEPSEEK_API_KEY']
HOST = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1').rstrip('/').replace('/v1', '')
MODEL = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
TARGETS = {
    'ja': 'Japanese', 'ko': 'Korean', 'zh-CN': 'Simplified Chinese', 'zh-TW': 'Traditional Chinese (Taiwan)',
    'th': 'Thai', 'vi': 'Vietnamese', 'ru': 'Russian', 'fr': 'French', 'de': 'German',
    'ar': 'Modern Standard Arabic', 'fa': 'Modern Persian (Farsi)',
}
SCRIPT_PRESENCE = {
    'ko': re.compile(r'[\uac00-\ud7af]'), 'th': re.compile(r'[\u0e00-\u0e7f]'), 'ru': re.compile(r'[\u0400-\u04ff]'),
    'ar': re.compile(r'[\u0600-\u06ff]'), 'fa': re.compile(r'[\u0600-\u06ff]'),
    'zh-CN': re.compile(r'[\u3400-\u9fff]'), 'zh-TW': re.compile(r'[\u3400-\u9fff]'),
}

def call_chat(prompt):
    body = json.dumps({'model': MODEL, 'messages': [{'role': 'user', 'content': prompt}], 'temperature': 0.2, 'max_tokens': 8000}).encode()
    req = urllib.request.Request(HOST + '/v1/chat/completions', data=body, headers={
        'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        payload = json.loads(r.read().decode())
    return payload['choices'][0]['message']['content']

def extract_json(content):
    s = str(content or '').strip()
    s = re.sub(r'^```[a-zA-Z]*\n?', '', s)
    s = re.sub(r'\n?```\s*$', '', s)
    try: return json.loads(s)
    except Exception: pass
    m = re.search(r'\{.*\}', s, re.S)
    if m:
        try: return json.loads(m.group(0))
        except Exception: pass
    out = {}
    for k, v in re.findall(r'"k(\d+)"\s*:\s*"((?:[^"\\]|\\.)*)"', s):
        out['k' + k] = v.replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')
    return out

def esc(v):
    return v.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

def build_prompt(values, lang):
    body = '{\n' + ',\n'.join('  "k%d": "%s"' % (i, esc(v)) for i, v in enumerate(values)) + '\n}'
    return ('You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\n'
            'Translate these English SEO title/description strings into %s for the website UI.\n'
            'Input JSON:\n%s\n'
            'RULES:\n- Respond ONLY with a JSON object of the same shape (keys k0..k%d).\n'
            '- No markdown, no commentary.\n'
            '- Keep brand names (ChinaConnect) and numbers unchanged.\n'
            '- Output must be fluent, natural %s.' % (TARGETS[lang], body, len(values) - 1, TARGETS[lang]))

def translate(values, lang):
    result = {}
    remaining = list(values)
    for attempt in range(1, 5):
        if not remaining: break
        try:
            content = call_chat(build_prompt(remaining, lang))
            parsed = extract_json(content)
            new_remaining = []
            for i, v in enumerate(remaining):
                raw = parsed.get('k%d' % i)
                if isinstance(raw, str) and raw.strip() and raw != v:
                    sp = SCRIPT_PRESENCE.get(lang)
                    if sp and not sp.search(raw):
                        new_remaining.append(v)
                    else:
                        result[v] = raw.strip()
                else:
                    new_remaining.append(v)
            remaining = new_remaining
        except Exception as e:
            print('   retry %d: %s' % (attempt, e), flush=True)
        time.sleep(0.8 * attempt)
    return result

# load missing keys + en fallbacks
seo = json.load(io.open('.audit/seo_missing.json', encoding='utf-8'))
print('missing keys:', len(seo))

# parse current translations.ts to find guidePage blocks
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
langs = pkl['langs']  # [(lang, start_offset)]
END = pkl['end']
text = io.open(SRC, encoding='utf-8').read()
bom = text[0] == '\ufeff'
body = text[1:] if bom else text

# existing guidePage keys per lang (from pkl data)
def strip(p): return p.split('.', 1)[1] if '.' in p else p
existing = {lang: set(strip(k) for k in data.keys()) for lang, data in pkl['data'].items()}

# ja existing title values
ja_vals = {}
for k, (v, a, b) in pkl['data']['ja'].items():
    if k.startswith('ja.guidePage.'):
        ja_vals[strip(k)] = v

def find_guidepage_insert(body, lang_start, lang_end):
    """find offset right after 'guidePage: {' within section"""
    sec = body[lang_start:lang_end]
    m = re.search(r'\bguidePage:\s*\{', sec)
    if not m: return None
    return lang_start + m.end()

# compute insertion offsets for all langs
lang_offsets = dict(langs)
lang_order = [l for l, _ in langs]
offsets = {}
for i, (lang, st) in enumerate(langs):
    endp = lang_offsets[lang_order[i + 1]] if i + 1 < len(lang_order) else END
    off = find_guidepage_insert(body, st, endp)
    offsets[lang] = off
    print(lang, 'guidePage insert at', off)

# translations per lang
translations = {}
for lang in [l for l, _ in langs]:
    if lang == 'en':
        translations['en'] = dict(seo)
        continue
    need = {k: v for k, v in seo.items() if k not in existing[lang]}
    if not need:
        translations[lang] = {}
        continue
    # for ja, reuse existing title values where present
    vals = {}
    for k, en_v in need.items():
        key = k.split('.')[-1]
        if lang == 'ja' and key in ja_vals:
            vals[en_v] = ja_vals[key]
    todo = [en_v for en_v in need.values() if en_v not in vals]
    print('%s: %d to translate' % (lang, len(todo)), flush=True)
    got = {}
    for i in range(0, len(todo), 8):
        chunk = todo[i:i + 8]
        got.update(translate(chunk, lang))
        print('  batch %d/%d: %d' % (i // 8 + 1, (len(todo) + 7) // 8, len(got)), flush=True)
    vals.update(got)
    # map en fallback -> final value
    translations[lang] = {}
    for k, en_v in need.items():
        v = vals.get(en_v)
        if v: translations[lang][k] = v
    print('  %s resolved: %d/%d' % (lang, len(translations[lang]), len(need)), flush=True)

# build insertion text per lang
def insert_block(entries):
    lines = []
    for k, v in sorted(entries.items()):
        lines.append('      %s: "%s",' % (k.split('.')[-1], esc(v)))
    return '\n' + '\n'.join(lines) + '\n    '

# apply insertions (reverse offset order to keep offsets valid)
edits = []
for lang, off in offsets.items():
    entries = translations.get(lang) or {}
    if not entries: continue
    block = insert_block(entries)
    edits.append((off, block))
for off, block in sorted(edits, key=lambda x: -x[0]):
    body = body[:off] + block + body[off:]
with io.open(SRC, 'w', encoding='utf-8', newline='') as f:
    f.write(('\ufeff' if bom else '') + body)
print('written', SRC)
