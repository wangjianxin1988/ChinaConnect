# .audit/analyze_ja_js.py — analyze ja-js-scan.json for English / simplified-Chinese residue
import re, json, sys
sys.stdout.reconfigure(encoding="utf-8")

data = json.load(open(r"D:\suoyouxiangmu\chinaconnect\.audit\ja-js-scan.json", encoding="utf-8"))

def en_tokens(text):
    # english words length>=2, not inside japanese text runs
    words = re.findall(r"[A-Za-z][A-Za-z'\u2019-]{1,}", text)
    # filter common brand / romanized japanese (romaji) that is acceptable
    return words

def han_count(text):
    # simplified chinese detection: CJK chars that are not kana
    return len(re.findall(r"[\u4e00-\u9fff]", text))

def kana_count(text):
    return len(re.findall(r"[\u3040-\u30ff]", text))

# words that are acceptable in English even on ja pages (brands, romanized names, tech terms)
ALLOW = set("""China ChinaConnect ChinaGuide AI CN CNY RMB WeChat Alipay Beijing Shanghai Xi'an Shenzhen Guangzhou Chengdu Hangzhou Chongqing Suzhou Wuhan Chengde Dalian Dali Dunhuang Fuzhou Guilin Harbin Hulunbuir Jinan Kunming Lanzhou Lijiang Luoyang Nanjing Ningbo Qingdao Quanzhou Sanya Tianjin Weihai Xiamen Xining Yantai Zhangjiajie Changsha Google Maps App Store QR Meituan Dianping TripAdvisor CTrip Bilibili Xiaohongshu RedNote Douyin Klook KKday TikTok Wifi Sim esim eSIM SIM VPN Weixin API ID PDF IMEI SOS Gps GPS NFC Apple iOS Android Metro Train Subway Bus Taxi Hotel D1 S class S-class A class A-class D class D-class T1 T2 T3 T5 POS Yuan km min mins h hotel hotels xian beijing shanghai guangzhou shenzhen chengdu hangzhou chongqing suzhou wuhan suzhouhang chongqing ChinaDaily China Post
EN ENUS JA JAJP
""".split())

STOP = set("""the a an and or of to in for on at by with from as is are was were be been being it its this that these those not no so but if then than when where which who whom whose while during between among through across over under above below into onto within without about after before up down out off per via vs e g i e etc such more most less all any some other others each every both neither either only also very too just still yet already always never often usually sometimes once twice can could may might must shall should will would do does did done have has had having get got gets getting make made makes making take took takes taking use used uses using see saw seen sees find found finds finding give gave given gives keep kept keeps keeping let lets left put puts set sets show showed shown shows tell told tells ask asked asks need needs needed work works worked working look looks looked looking help helps helped want wants wanted go goes went gone going come came comes coming know knew known knows think thought thinks call called calls calling open opens opened opening book books booked booking pay paid pays paying visit visits visited visiting travel travels traveled travelling eat eats ate eating stay stays stayed staying find finder time day week month year hour minute night morning afternoon evening today tomorrow yesterday now here there where why how what when who which place places city cities country countries people person world china chinese food restaurant restaurants hotel hotels attraction attractions area areas tour tours guide guides trip trips route routes map maps app apps phone number numbers address addresses name names price prices ticket tickets tip tips info information more menu menus local international credit card cards cash payment payments transport transportation accommodation metro subway bus taxi bike walking flight flights airport airports train station stations terminal terminals line lines stop stops route routes minute minutes fare fares network networks signal signals data package packages plan plans price prices total total price avg average rating ratings review reviews photos photo images image distance duration open closed opening hours address directions location locations national emergency contact contacts police ambulance fire traffic accident embassy consulate service services support help center centre customer hotline number numbers call calling dial
""".split())

# english tokens that appear inside a longer japanese sentence (mixed) — treat as residue if freq high

rows = []
for url, d in data.items():
    text = d.get("text", "")
    if text.startswith("__ERR__"):
        rows.append((url, 9999, 0, text[:80]))
        continue
    toks = en_tokens(text)
    # remove allowed + stopwords
    bad = [t for t in toks if t.lower() not in {x.lower() for x in ALLOW} and t.lower() not in {x.lower() for x in STOP}]
    freq = {}
    for t in bad:
        freq[t.lower()] = freq.get(t.lower(), 0) + 1
    # weighted: each distinct bad word counts, but cap repetitive noise
    score = len(set(freq)) + sum(1 for v in freq.values() if v >= 3)
    han = han_count(text)
    rows.append((url, score, han, f"{len(set(freq))} distinct en words, {han} han chars"))

rows.sort(key=lambda r: -r[1])
print("=== top residue pages (by distinct english words) ===")
for url, score, han, info in rows[:50]:
    print(f"{score:4d} han={han:4d}  {url}   {info}")
