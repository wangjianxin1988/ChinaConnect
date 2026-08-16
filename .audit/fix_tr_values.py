# -*- coding: utf-8 -*-
import io, os, re, sys, json, time, pickle, urllib.request

SRC = 'src/i18n/translations.ts'
KEY = os.environ['DEEPSEEK_API_KEY']
HOST = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1').rstrip('/').replace('/v1', '')
MODEL = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
TARGETS = {
    'ja': 'Japanese', 'ko': 'Korean', 'zh-CN': 'Simplified Chinese', 'zh-TW': 'Traditional Chinese (Taiwan)',
    'th': 'Thai', 'vi': 'Vietnamese', 'ru': 'Russian', 'fr': 'French', 'de': 'German',
    'ar': 'Modern Standard Arabic', 'fa': 'Modern Persian (Farsi)',
}
SCRIPT_RE = {
    'ja': re.compile(r'[\u3040-\u30ff]'), 'ko': re.compile(r'[\uac00-\ud7af]'),
    'th': re.compile(r'[\u0e00-\u0e7f]'), 'ru': re.compile(r'[\u0400-\u04ff]'),
    'ar': re.compile(r'[\u0600-\u06ff]'), 'fa': re.compile(r'[\u0600-\u06ff]'),
    'zh-CN': re.compile(r'[\u3400-\u9fff]'), 'zh-TW': re.compile(r'[\u3400-\u9fff]'),
}
args = sys.argv[1:]
only_lang = next((a.split('=')[1] for a in args if a.startswith('--lang=')), None)
dry = '--dry-run' in args
limit = None
lm = next((a.split('=')[1] for a in args if a.startswith('--limit=')), None)
if lm: limit = int(lm)

pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
data = pkl['data']
bom = pkl['bom']
LANGS = pkl['langs']  # list of (lang, start_offset_in_body)
END = pkl['end']
text = io.open(SRC, encoding='utf-8').read()
body = text[1:] if bom else text
lang_offsets = dict(LANGS)
lang_order = [l for l, _ in LANGS]

def strip(p):
    return p.split('.', 1)[1] if '.' in p else p

en = {strip(p): v for p, v in data['en'].items()}

BRAND = set("""Alipay WeChat WeChat Pay Meituan Dianping DiDi Didi Amap Baidu Trip.com Ctrip Fliggy Booking.com Agoda Airbnb 12306 Google Google Maps Google Translate ChatGPT Pleco TripAdvisor Wise TransferWise Xiaohongshu RED Airalo Holafly eSIM SIM WiFi Wi-Fi UnionPay China Mobile China Unicom China Telecom KFC McDonald's Starbucks Huawei Xiaomi QQ Weibo Taobao JD.com Pinduoduo NetEase 163 Mail Metro Now Nihao China Oppo Vivo GitHub Facebook Instagram Twitter YouTube WhatsApp Telegram LinkedIn WeChat Pay HK App Store Google Play Android iOS iPhone""".split())
def keepable(v):
    t = v.strip()
    if not t: return True
    if re.fullmatch(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&\'":;~!?]+', t): return True
    if re.fullmatch(r'^(?:https?://|tel:|mailto:).*', t): return True
    if re.fullmatch(r'[A-Z0-9]{2,7}', t): return True
    if t in BRAND: return True
    if re.fullmatch(r'[\w.+-]+@[\w-]+\.[\w.-]+', t) and len(t) <= 64: return True
    if re.fullmatch(r'[a-z][a-zA-Z0-9]{1,3}', t): return True
    return False

def call_chat(prompt):
    body_data = json.dumps({'model': MODEL, 'messages': [{'role': 'user', 'content': prompt}], 'temperature': 0.2, 'max_tokens': 8000}).encode()
    req = urllib.request.Request(HOST + '/v1/chat/completions', data=body_data, headers={
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

def build_prompt(values, lang, retry):
    body_s = '{\n' + ',\n'.join('  "k%d": "%s"' % (i, esc(v)) for i, v in enumerate(values)) + '\n}'
    extra = ('Your previous output was REJECTED because it was identical to the input or still English. '
             'Translate EVERY value into %s with ZERO English words.' % TARGETS[lang]) if retry else ''
    return ('You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\n'
            'Translate these UI strings from English into %s for the website UI.\n%s\n'
            'Input JSON:\n%s\n'
            'RULES:\n- Respond ONLY with a JSON object of the same shape (keys k0..k%d) where EVERY value is %s.\n'
            '- No markdown, no commentary, no explanations.\n'
            '- Keep placeholders like {city}, {count} and HTML tags unchanged.\n'
            '- Keep brand names (Google, Alipay, WeChat, etc.) and numbers/URLs unchanged.\n'
            '- Output must be fluent, natural %s.' % (TARGETS[lang], extra, body_s, len(values) - 1, TARGETS[lang], TARGETS[lang]))

def translate_batch(values, lang):
    result = {}
    remaining = list(values)
    for attempt in range(1, 5):
        if not remaining: break
        try:
            content = call_chat(build_prompt(remaining, lang, attempt > 1))
            parsed = extract_json(content)
            new_remaining = []
            for i, v in enumerate(remaining):
                raw = parsed.get('k%d' % i)
                if isinstance(raw, str) and raw.strip() and raw != v:
                    sr = SCRIPT_RE.get(lang)
                    if sr and not sr.search(raw):
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

jobs = {}
for lang, d in data.items():
    if lang == 'en': continue
    if only_lang and lang != only_lang: continue
    dstripped = {strip(p): v for p, v in d.items()}
    todo = []
    for p, (v, a, b) in en.items():
        leaf = p.rsplit('.', 1)[-1] if '.' in p else p
        if re.fullmatch(r'_+', leaf):
            continue
        if p in dstripped and dstripped[p][0] == v and not keepable(v):
            todo.append((p, dstripped[p][1], dstripped[p][2]))
    jobs[lang] = todo
    print('%s: %d jobs' % (lang, len(todo)))

total_done = 0
for lang, todo in jobs.items():
    if limit and total_done >= limit: break
    if not todo: continue
    st = lang_offsets[lang]
    idx = lang_order.index(lang)
    endp = lang_offsets[lang_order[idx + 1]] if idx + 1 < len(lang_order) else END
    srcs = []
    for (p, a, b) in todo:
        srcv = en[p][0]
        if srcv not in srcs: srcs.append(srcv)
    print('%s: translating %d unique values in %d batches' % (lang, len(srcs), (len(srcs) + 7) // 8), flush=True)
    mapping = {}
    for i in range(0, len(srcs), 8):
        chunk = srcs[i:i+8]
        got = translate_batch(chunk, lang)
        mapping.update(got)
        print('  [%s] batch %d/%d: %d/%d' % (lang, i // 8 + 1, (len(srcs) + 7) // 8, len(got), len(chunk)), flush=True)
    if dry:
        ok = sum(1 for (p, a, b) in todo if mapping.get(en[p][0]))
        print('  dry: %d/%d would be replaced' % (ok, len(todo)))
        total_done += len(todo)
        continue
    edits = []
    for (p, a, b) in todo:
        newval = mapping.get(en[p][0])
        if not newval: continue
        edits.append((st + a, st + b, '"' + esc(newval) + '"'))
    edits.sort(key=lambda x: x[0], reverse=True)
    for s0, e0, new in edits:
        body = body[:s0] + new + body[e0:]
    total_done += len(todo)
print('DONE total jobs processed:', total_done)
if not dry:
    with open(SRC, 'w', encoding='utf-8') as f:
        f.write(('\ufeff' if bom else '') + body)
    print('written', SRC)
