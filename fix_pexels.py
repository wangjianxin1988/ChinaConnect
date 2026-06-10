import re, urllib.request, urllib.parse, json, random, time, os

# Read API key from .env
API_KEY = None
with open("D:/suoyouxiangmu/ChinaConnect/.env", 'r') as f:
    for line in f:
        if 'PEXELS_API_KEY' in line:
            API_KEY = line.strip().split('=', 1)[1]
            break

if not API_KEY:
    print("ERROR: No Pexels API key found")
    exit(1)

print(f"API Key loaded: {API_KEY[:10]}...")

# Cuisine -> Pexels search terms
CUISINE_SEARCH = {
    "北京烤鸭": ["peking duck", "roasted duck", "chinese roast duck"],
    "京菜": ["beijing food", "beijing noodles", "chinese pancake"],
    "卤煮": ["chinese stew", "chinese offal", "beijing street food"],
    "川菜": ["sichuan food", "mapo tofu", "kung pao chicken"],
    "火锅": ["chinese hotpot", "sichuan hotpot", "spicy hotpot"],
    "粤菜": ["cantonese dim sum", "char siu", "dim sum"],
    "浙菜": ["zhejiang cuisine", "dongpo pork", "chinese seafood"],
    "上海菜": ["shanghai noodles", "xiaolongbao", "shanghai food"],
    "东北菜": ["dongbei cuisine", "northeast dumplings", "stewed dishes"],
    "新疆菜": ["xinjiang lamb", "big plate chicken", "chinese skewers"],
    "云南菜": ["yunnan noodles", "crossing bridge noodles", "yunnan mushroom"],
    "湘菜": ["hunan cuisine", "stinky tofu", "chinese spicy food"],
    "闽菜": ["fujian noodles", "oyster omelette", "seafood noodles"],
    "鲁菜": ["shandong cuisine", "chinese braised dishes", "seafood chinese"],
    "清真": ["halal food", "chinese muslim food", "lamb soup"],
    "蒙餐": ["mongolian food", "mongolian bbq", "mongolian hotpot"],
    "藏餐": ["tibetan food", "yak meat", "tibetan momo"],
    "徽菜": ["anhui cuisine", "hui cuisine", "braised pork"],
    "default": ["chinese food", "chinese cuisine", "asian food", "chinese restaurant", "chinese cooking"]
}

def get_search_term(cuisine, index):
    for key, terms in CUISINE_SEARCH.items():
        if key in cuisine:
            return terms[index % len(terms)]
    terms = CUISINE_SEARCH["default"]
    return terms[index % len(terms)]

def search_pexels(query, count=10):
    try:
        url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page={count}&orientation=landscape"
        req = urllib.request.Request(url, headers={"Authorization": API_KEY})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        return [p['src']['large2x'] for p in data.get('photos', [])]
    except Exception as e:
        print(f"  [ERR] {query}: {e}")
        return []

# Step 1: Collect all unique cuisines and build image pool
print("\n=== 构建图片池 ===")
files = [
    "D:/suoyouxiangmu/ChinaConnect/src/data/food/restaurants.ts",
    "D:/suoyouxiangmu/ChinaConnect/src/data/food/cities-food-data.ts",
    "D:/suoyouxiangmu/ChinaConnect/src/data/food/sample-restaurants.ts",
]

all_cuisines = set()
for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        cuisines = re.findall(r'cuisine: "([^"]+)"', content)
        all_cuisines.update(cuisines)
    except:
        pass

print(f"找到 {len(all_cuisines)} 种菜系: {', '.join(sorted(all_cuisines))}")

# Build image pool per cuisine
image_pool = {}
for cuisine in sorted(all_cuisines):
    search_term = get_search_term(cuisine, 0)
    urls = search_pexels(search_term, count=20)
    if urls:
        image_pool[cuisine] = urls
        print(f"  {cuisine} ({search_term}): {len(urls)} images")
    else:
        # Fallback to default
        urls = search_pexels("chinese food", count=10)
        image_pool[cuisine] = urls
        print(f"  {cuisine}: fallback -> {len(urls)} images")
    time.sleep(0.5)

print(f"\n图片池总容量: {sum(len(v) for v in image_pool.values())} images")

# Step 2: Replace images in each file
print("\n=== 替换图片 ===")
total_updated = 0

for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        continue
    
    # Backup
    with open(fpath + ".bak", 'w', encoding='utf-8') as f:
        f.write(content)
    
    cuisines = re.findall(r'cuisine: "([^"]+)"', content)
    image_matches = list(re.finditer(r'imageUrl: "([^"]+)"', content))
    
    print(f"\n{fpath.split('/')[-1]}: {len(image_matches)} images")
    
    # Track used URLs to avoid duplicates within a file
    used_urls = set()
    cursor = 0
    new_content = ""
    updated = 0
    
    for i, match in enumerate(image_matches):
        cuisine = cuisines[i] if i < len(cuisines) else "default"
        pool = image_pool.get(cuisine, image_pool.get("default", []))
        
        # Find unused URL from pool
        new_url = None
        for url in pool:
            if url not in used_urls:
                new_url = url
                break
        
        if not new_url and pool:
            # All used, pick random
            new_url = random.choice(pool)
        
        if new_url:
            used_urls.add(new_url)
            new_content += content[cursor:match.start()] + f'imageUrl: "{new_url}"'
            cursor = match.end()
            updated += 1
        else:
            new_content += content[cursor:match.end()]
            cursor = match.end()
    
    new_content += content[cursor:]
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    total_updated += updated
    print(f"  更新: {updated}/{len(image_matches)}")

print(f"\n=== 全部完成: {total_updated} images updated ===")
