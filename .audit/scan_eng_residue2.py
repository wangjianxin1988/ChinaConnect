# -*- coding: utf-8 -*-
import io, re, json, glob, os
LANGS = ['ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW']
KEEP = re.compile(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&"\'":;~!?#\[\]{}@<>]')
BRANDS = set('''Alipay WeChat WeChat Pay Meituan Dianping DiDi Didi Amap Baidu Trip.com Ctrip Fliggy Booking.com Agoda Airbnb 12306 Google Google Maps Translate ChatGPT Pleco TripAdvisor Wise TransferWise Xiaohongshu RED Airalo Holafly eSIM SIM WiFi Wi-Fi UnionPay China Mobile Unicom Telecom KFC McDonald's Starbucks Huawei Xiaomi QQ Weibo Taobao JD.com Pinduoduo NetEase 163 Mail Metro Oppo Vivo GitHub Facebook Instagram Twitter YouTube WhatsApp Telegram LinkedIn iOS Android iPhone App Store Google Play Hello Mobike Hellobike Meituan Bike Didi Chuxing Didi bike Metro Line Line Beijing Transport Shouqi International Taxi Uber Lyft Grab Booking'''.split())
def keepable_token(t):
    if not t: return True
    if re.fullmatch(r'[A-Za-z]{1,3}\.?', t): return True  # short codes / abbreviations
    if t in BRANDS: return True
    if re.fullmatch(r'[A-Za-z]+[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]+', t): return True  # mixed translit
    if re.fullmatch(r'(?:[A-Za-z]+)?\d{2,}', t): return True
    return False

def is_eng_prose(v):
    v = v.strip()
    if not v or len(v) < 4: return False
    # words: sequences of ascii letters
    tokens = [t for t in re.split(r'[^A-Za-z]+', v) if t]
    if len(tokens) < 3: return False
    # require a non-keepable run of >= 3 english words
    run = 0
    for t in tokens:
        if keepable_token(t):
            run = 0
        else:
            run += 1
            if run >= 3:
                # check that value is predominantly ascii (>= 60% letters are ascii)
                letters = re.findall(r'[A-Za-z\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]', v)
                if not letters: return False
                ascii_n = sum(1 for c in letters if 'a' <= c.lower() <= 'z')
                return ascii_n / len(letters) >= 0.6
    return False

def walk(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, path + '.' + k if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, '%s[%d]' % (path, i))
    elif isinstance(o, str):
        yield path, o

TOTAL = 0
for lang in LANGS:
    n = 0; examples = []
    for fp in sorted(glob.glob('src/data/cities-i18n/%s/*.json' % lang)):
        slug = os.path.basename(fp)[:-5]
        data = json.load(io.open(fp, encoding='utf-8'))
        ja_fp = 'src/data/cities-i18n/ja/%s.json' % slug
        if not os.path.exists(ja_fp): continue
        ja_map = {p: v for p, v in walk(json.load(io.open(ja_fp, encoding='utf-8')))}
        for p, v in walk(data):
            if p.endswith('.nameEn'): continue
            if is_eng_prose(v):
                jv = ja_map.get(p)
                if jv and is_eng_prose(jv) is False and re.search(r'[\u3040-\u30ff\u3400-\u9fff]', jv):
                    n += 1
                    if len(examples) < 6:
                        examples.append('%s %s = %r | ja=%r' % (slug, p, v[:70], jv[:40]))
    print('== %s: %d' % (lang, n))
    for e in examples: print('   ', e)
    TOTAL += n
print('TOTAL:', TOTAL)
