# -*- coding: utf-8 -*-
import io, pickle, re, json
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
data = pkl['data']
def strip(p): return p.split('.', 1)[1] if '.' in p else p
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
def is_underscore_leaf(p):
    leaf = p.rsplit('.', 1)[-1] if '.' in p else p
    return bool(re.fullmatch(r'_+', leaf))
report = {}
total = 0
for lang in ['ja','ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW']:
    d = {strip(p): v for p, v in data[lang].items()}
    real = {}
    for p, (v, a, b) in en.items():
        if p in d and d[p][0] == v and not keepable(v) and not is_underscore_leaf(p):
            real[p] = v
    report[lang] = real
    total += len(real)
    print('%-5s %3d' % (lang, len(real)))
print('TOTAL:', total)
json.dump(report, io.open('.audit/tr_en_identical.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
