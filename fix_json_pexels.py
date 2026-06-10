import subprocess, json, re, urllib.parse, random, time, os, glob

env_path = os.path.join(os.path.dirname(__file__), ".env")
key = ""
with open(env_path, 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

if not key:
    print("ERROR: No Pexels API key")
    exit(1)

print(f"Key: {key[:10]}...")

def search(q, n=10):
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(q)}&per_page={n}&orientation=landscape"
    r = subprocess.run(['curl','-s','-H',f'Authorization: {key}',url], capture_output=True, text=True, timeout=15)
    try:
        return [p['src']['large2x'] for p in json.loads(r.stdout).get('photos',[])]
    except:
        return []

# Cuisine -> Pexels search terms
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

# Get all city JSON files
json_dir = "D:/suoyouxiangmu/ChinaConnect/src/data/cities"
json_files = sorted(glob.glob(os.path.join(json_dir, "*.json")))
json_files = [f for f in json_files if "cdn_urls" not in f]

print(f"Found {len(json_files)} city JSON files")

# Step 1: Collect all cuisines from all JSON files
print("\n=== Collecting cuisines ===")
all_cuisines = set()
for jf in json_files:
    with open(jf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if 'restaurants' in data:
        for r in data['restaurants']:
            if 'cuisine' in r:
                all_cuisines.add(r['cuisine'])

print(f"Found {len(all_cuisines)} cuisine types")

# Step 2: Build image pool
print("\n=== Building image pool ===")
pool = {}
for c in sorted(all_cuisines):
    t = get_term(c)
    u = search(t, 15)
    if not u: u = search("chinese food", 10)
    pool[c] = u
    print(f"  {c}: {len(u)}")
    time.sleep(0.5)

total = sum(len(v) for v in pool.values())
print(f"\nPool: {total} images")

# Step 3: Update each JSON file
print("\n=== Updating JSON files ===")
gt = 0
for jf in json_files:
    with open(jf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'restaurants' not in data:
        continue
    
    # Backup
    with open(jf + ".bak", 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    used = set()
    updated = 0
    
    for r in data['restaurants']:
        cuisine = r.get('cuisine', 'default')
        p = pool.get(cuisine, [])
        
        new_url = None
        for u in p:
            if u not in used:
                new_url = u
                break
        if not new_url and p:
            new_url = random.choice(p)
        
        if new_url:
            used.add(new_url)
            r['imageUrl'] = new_url
            updated += 1
    
    with open(jf, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    gt += updated
    print(f"  {jf.split('/')[-1]}: {updated}")

print(f"\n=== DONE: {gt} images updated ===")
