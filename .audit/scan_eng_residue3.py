# -*- coding: utf-8 -*-
import io, re, json, glob, os
LANGS = ['ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW']
SCRIPT = {
  'ko': r'[\uac00-\ud7af\u1100-\u11ff]', 'th': r'[\u0e00-\u0e7f]', 'ru': r'[\u0400-\u04ff]',
  'ar': r'[\u0600-\u06ff]', 'fa': r'[\u0600-\u06ff]', 'zh-CN': r'[\u3400-\u9fff]', 'zh-TW': r'[\u3400-\u9fff]',
}
STOP = {
  'vi': ['và','là','của','trong','cho','với','tại','các','một','những','được','có','không','này','đó','ở','thì','từ','đến','trên','dưới','bạn','khi','thành','khu','quận','giữa','hoặc','như','cũng','rất'],
  'fr': ['le','la','les','de','du','des','un','une','et','est','pour','dans','avec','sur','au','aux','pas','que','qui','ce','cette','vous','nous','en','à','au','sont','plus','par','ses','son','sa','ou','comme','très','depuis','pour'],
  'de': ['der','die','das','und','ist','für','mit','von','auf','zu','nicht','ein','eine','den','dem','des','im','in','an','sind','auch','als','bei','aus','nach','über','oder','sehr','werden','wird','zur','zum'],
}
BRANDS = set('''Alipay WeChat WeChat Pay Meituan Dianping DiDi Didi Amap Baidu Trip.com Ctrip Fliggy Booking.com Agoda Airbnb 12306 Google Maps Translate ChatGPT Pleco TripAdvisor Wise TransferWise Xiaohongshu RED Airalo Holafly eSIM SIM WiFi Wi-Fi UnionPay China Mobile Unicom Telecom KFC McDonald's Starbucks Huawei Xiaomi QQ Weibo Taobao JD.com Pinduoduo NetEase 163 Mail Metro Oppo Vivo Facebook Instagram Twitter YouTube WhatsApp Telegram LinkedIn iOS Android iPhone App Store Google Play Hello Mobike Hellobike Meituan Bike Didi Chuxing Didi bike Metro Line Line Beijing Transport Shouqi International Taxi Uber Lyft Grab Booking Parkview Green China World Mall Badaling Dongzhimen'''.split())
def keepable_token(t):
    if not t: return True
    if re.fullmatch(r'[A-Za-z]{1,3}\.?', t): return True
    if t in BRANDS: return True
    if re.fullmatch(r'[A-Za-z]+[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]+', t): return True
    if re.fullmatch(r'(?:[A-Za-z]+)?\d{2,}', t): return True
    return False

def is_eng_prose(v):
    v = v.strip()
    if not v or len(v) < 4: return False
    tokens = [t for t in re.split(r'[^A-Za-z]+', v) if t]
    if len(tokens) < 3: return False
    run = 0
    for t in tokens:
        if keepable_token(t):
            run = 0
        else:
            run += 1
            if run >= 3:
                letters = re.findall(r'[A-Za-z\u00c0-\u00ff\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]', v)
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

def is_pure_eng(v, lang):
    if lang in SCRIPT:
        if re.search(SCRIPT[lang], v): return False
    else:
        if any(re.search(r'\b%s\b' % re.escape(w), v.lower()) for w in STOP.get(lang, [])):
            return False
    return is_eng_prose(v)

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
            if is_pure_eng(v, lang):
                jv = ja_map.get(p)
                if jv and re.search(r'[\u3040-\u30ff\u3400-\u9fff]', jv):
                    n += 1
                    if len(examples) < 5:
                        examples.append('%s %s = %r' % (slug, p, v[:70]))
    print('== %s: %d' % (lang, n))
    for e in examples: print('   ', e)
    TOTAL += n
print('TOTAL:', TOTAL)
