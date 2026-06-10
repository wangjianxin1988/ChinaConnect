import subprocess, json, re, urllib.parse, random, time, os

env_path = os.path.join(os.path.dirname(__file__), ".env")
key = ""
with open(env_path, 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

if not key:
    print("ERROR: No Pexels API key in .env")
    exit(1)

print(f"Key: {key[:10]}...")

def search(q, n=10):
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(q)}&per_page={n}&orientation=landscape"
    r = subprocess.run(['curl','-s','-H',f'Authorization: {key}',url], capture_output=True, text=True, timeout=15)
    try:
        return [p['src']['large2x'] for p in json.loads(r.stdout).get('photos',[])]
    except:
        return []

CS = {
    "北京烤鸭":"peking duck","京菜":"beijing food","京菜小吃":"beijing street food",
    "北京菜":"peking duck","卤煮火烧":"chinese stew","卤味":"chinese braised food",
    "炒肝":"chinese breakfast","炸酱面":"zhajiang noodles","爆肚":"chinese street food",
    "川菜":"sichuan food spicy","川菜小吃":"sichuan street food","川式火锅":"sichuan hotpot",
    "成都小吃":"sichuan street food","重庆火锅":"chongqing hotpot","重庆小面":"spicy noodles",
    "串串香":"chinese skewers hotpot","粤菜":"cantonese dim sum","粤菜点心":"dim sum",
    "粤菜/桂林菜":"cantonese dim sum","潮汕菜":"teochew seafood","艇仔粥":"chinese congee",
    "浙菜":"zhejiang cuisine","杭帮菜":"hangzhou food","杭帮面":"chinese noodles",
    "杭帮点心":"chinese pastry","杭州小吃":"chinese snack","创意杭帮菜":"chinese fine dining",
    "本帮菜":"shanghai food","本帮点心":"shanghai dim sum","本帮面":"shanghai noodles",
    "上海菜":"xiaolongbao","台州菜":"chinese seafood","江浙菜":"dongpo pork",
    "淮扬菜":"huaiyang cuisine","苏帮菜":"suzhou cuisine","苏式面":"chinese noodle soup",
    "南京小吃":"nanjing duck","东北菜":"northeast dumplings","湘菜":"hunan spicy",
    "闽菜":"fujian seafood","鲁菜":"shandong cuisine","清真菜":"halal chinese",
    "蒙餐":"mongolian bbq","藏餐":"tibetan momo","徽菜":"anhui cuisine",
    "新疆菜":"xinjiang lamb","云南菜":"yunnan noodles","白族菜":"yunnan mushroom",
    "白族小吃":"yunnan street food","桂林米粉":"guilin rice noodles","桂林菜":"guangxi food",
    "椰子鸡":"coconut chicken","素食":"vegetarian chinese","肉夹馍":"roujiamo chinese burger",
    "牛羊肉泡馍":"xian lamb soup","陕菜":"shaanxi food","面食":"hand pulled noodles",
    "饺子":"jiaozi dumplings","台湾菜/小笼包":"taiwanese food","小吃":"chinese street food",
    "夜宵":"chinese bbq night","炖品":"chinese stew","创意法餐":"fine dining",
    "创意菜":"modern chinese","西餐":"western steak"
}

def get_term(c):
    return CS.get(c, "chinese food")

files = [
    "D:/suoyouxiangmu/ChinaConnect/src/data/food/restaurants.ts",
    "D:/suoyouxiangmu/ChinaConnect/src/data/food/cities-food-data.ts",
    "D:/suoyouxiangmu/ChinaConnect/src/data/food/sample-restaurants.ts",
]

# Build pool
print("=== Building image pool ===")
all_c = set()
for fp in files:
    try:
        with open(fp,'r',encoding='utf-8') as f: ct = f.read()
        all_c.update(re.findall(r'cuisine: "([^"]+)"', ct))
    except: pass

pool = {}
for c in sorted(all_c):
    t = get_term(c)
    u = search(t, 15)
    if not u: u = search("chinese food", 10)
    pool[c] = u
    print(f"  {c}: {len(u)}")
    time.sleep(0.5)

print(f"Pool: {sum(len(v) for v in pool.values())} total")

# Replace
print("\n=== Replacing ===")
gt = 0
for fp in files:
    try:
        with open(fp,'r',encoding='utf-8') as f: ct = f.read()
    except: continue
    with open(fp+".bak",'w',encoding='utf-8') as f: f.write(ct)
    
    cuis = re.findall(r'cuisine: "([^"]+)"', ct)
    ims = list(re.finditer(r'imageUrl: "([^"]+)"', ct))
    print(f"\n{fp.split('/')[-1]}: {len(ims)}")
    
    used = set()
    cur = 0
    pts = []
    upd = 0
    for i,m in enumerate(ims):
        c = cuis[i] if i<len(cuis) else "default"
        p = pool.get(c,[])
        nu = None
        for u in p:
            if u not in used: nu=u; break
        if not nu and p: nu=random.choice(p)
        if nu:
            used.add(nu)
            pts.append(ct[cur:m.start()])
            pts.append(f'imageUrl: "{nu}"')
            cur = m.end()
            upd += 1
    pts.append(ct[cur:])
    with open(fp,'w',encoding='utf-8') as f: f.write(''.join(pts))
    gt += upd
    print(f"  Updated: {upd}/{len(ims)}")

print(f"\n=== DONE: {gt} ===")
