# -*- coding: utf-8 -*-
import io, re, json, glob, os
LANGS = ['ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW']
KEEP = re.compile(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&"\'":;~!?#\[\]{}@<>]')
BRANDS = set('''Alipay WeChat WeChat Pay Meituan Dianping DiDi Didi Amap Baidu Trip.com Ctrip Fliggy Booking.com Agoda Airbnb 12306 Google Google Maps Google Translate ChatGPT Pleco TripAdvisor Wise TransferWise Xiaohongshu RED Airalo Holafly eSIM SIM WiFi Wi-Fi UnionPay China Mobile China Unicom China Telecom KFC McDonald's Starbucks Huawei Xiaomi QQ Weibo Taobao JD.com Pinduoduo NetEase 163 Mail Metro Now Nihao China Oppo Vivo GitHub Facebook Instagram Twitter YouTube WhatsApp Telegram LinkedIn WeChat Pay HK App Store Google Play Android iOS iPhone Hello Mobike Hellobike Meituan Bike Didi Chuxing Didi bike Metro Line Line Beijing Transport Shouqi International Taxi Uber Lyft Grab'''.split())
def keepable(v):
    t = v.strip()
    if not t: return True
    if re.fullmatch(r'[\d\s.,¥$€£₩₹₽+\-()/%×·&\'":;~!?]+', t): return True
    if re.fullmatch(r'^(?:https?://|tel:|mailto:).*', t): return True
    if re.fullmatch(r'[A-Z0-9]{2,7}', t): return True
    if t in BRANDS: return True
    if re.fullmatch(r'[\w.+-]+@[\w-]+\.[\w.-]+', t) and len(t) <= 64: return True
    if re.fullmatch(r'[a-z][a-zA-Z0-9]{1,3}', t): return True
    if re.fullmatch(r'[A-Za-z][\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]+', t): return True
    return False

def norm(v):
    return re.sub(r'[^a-z0-9\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]', '', v.lower())

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
        en_fp = 'src/data/cities/%s.json' % slug
        ja_fp = 'src/data/cities-i18n/ja/%s.json' % slug
        if not os.path.exists(en_fp) or not os.path.exists(ja_fp): continue
        en_map = {p: v for p, v in walk(json.load(io.open(en_fp, encoding='utf-8')))}
        ja_map = {p: v for p, v in walk(json.load(io.open(ja_fp, encoding='utf-8')))}
        for p, v in walk(data):
            if p.endswith('.nameEn') or p == 'name' or p.endswith('.name'): continue
            if keepable(v): continue
            ev = en_map.get(p)
            jv = ja_map.get(p)
            if not ev or not jv: continue
            # ja must be a translation (differs from en and has Japanese)
            if norm(jv) == norm(ev): continue
            if not re.search(r'[\u3040-\u30ff\u3400-\u9fff]', jv): continue
            # target identical to en => residue
            if norm(v) == norm(ev):
                n += 1
                if len(examples) < 6:
                    examples.append('%s %s = %r' % (slug, p, v[:80]))
    print('== %s: %d' % (lang, n))
    for e in examples: print('   ', e)
    TOTAL += n
print('TOTAL:', TOTAL)
