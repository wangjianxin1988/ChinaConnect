import json, urllib.request, urllib.parse, random, os, time

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Read Pexels key
with open("D:/suoyouxiangmu/chinaconnect/.env") as f:
    for line in f:
        if line.startswith('VITE_PEXELS_API_KEY'):
            KEY = line.strip().split('=', 1)[1]
            break

# City-specific food search queries
CITY_FOOD = {
    "beijing": ["Peking duck Beijing", "Beijing dumplings", "Beijing noodles"],
    "shanghai": ["Shanghai dumplings xiaolongbao", "Shanghai noodles", "Shanghai street food"],
    "guangzhou": ["Cantonese dim sum", "Guangzhou congee", "Cantonese roast goose"],
    "chengdu": ["Sichuan hotpot Chengdu", "Sichuan mapo tofu", "Chengdu street food"],
    "xian": ["Xi'an lamb paomo", "Xi'an roujiamo", "Xi'an noodles biangbiang"],
    "hangzhou": ["Hangzhou West Lake fish", "Hangzhou dongpo pork", "Hangzhou tea"],
    "chongqing": ["Chongqing hotpot", "Chongqing noodles xiaomian", "Chongqing spicy chicken"],
    "nanjing": ["Nanjing salted duck", "Nanjing duck blood soup", "Nanjing dumplings"],
    "suzhou": ["Suzhou squirrel fish", "Suzhou noodles", "Suzhou dim sum"],
    "wuhan": ["Wuhan hot dry noodles", "Wuhan doupi", "Wuhan street food"],
    "changsha": ["Changsha stinky tofu", "Changsha spicy crayfish", "Hunan cuisine"],
    "xiamen": ["Xiamen seafood", "Xiamen satay noodles", "Xiamen oyster omelette"],
    "qingdao": ["Qingdao seafood", "Qingdao beer", "Qingdao dumplings"],
    "kunming": ["Yunnan crossing bridge noodles", "Kunming mushrooms", "Yunnan rice noodles"],
    "lijiang": ["Lijiang baba bread", "Yunnan food", "Lijiang yak meat"],
    "dali": ["Dali erkuai", "Yunnan goat cheese", "Dali rice noodles"],
    "sanya": ["Hainan chicken rice", "Sanya seafood", "Hainan coconut"],
    "guilin": ["Guilin rice noodles", "Guilin beer fish", "Guangxi food"],
    "zhangjiajie": ["Hunan smoked meat", "Zhangjiajie wild food", "Hunan pickled fish"],
    "shenzhen": ["Shenzhen seafood", "Cantonese food", "Shenzhen dim sum"],
    "tianjin": ["Tianjin jianbing", "Tianjin mahua", "Tianjin baozi"],
    "harbin": ["Harbin sausages", "Harbin borscht", "Northeast dumplings"],
    "dalian": ["Dalian seafood", "Dalian grilled fish", "Liaoning food"],
    "jinan": ["Jinan把子肉", "Shandong cuisine", "Jinan sweet foam"],
    "luoyang": ["Luoyang water banquet", "Luoyang beef soup", "Henan noodles"],
    "fuzhou": ["Fuzhou fish balls", "Fuzhou buddha jumps wall", "Fujian food"],
    "quanzhou": ["Quanzhou noodle soup", "Quanzhou vinegar meat", "Minnan food"],
    "lanzhou": ["Lanzhou beef noodles", "Lanzhou lamb", "Gansu food"],
    "xining": ["Xining hand-grabbed lamb", "Qinghai food", "Tibetan yak butter tea"],
    "dunhuang": ["Dunhuang yellow noodles", "Dunhuang lamb", "Silk Road food"],
    "chengde": ["Chengde roast lamb", "Imperial food", "Hebei cuisine"],
    "hulunbuir": ["Mongolian hotpot", "Inner Mongolia lamb", "Mongolian milk tea"],
    "weihai": ["Weihai seafood", "Shandong dumplings", "Weihai fish"],
    "yantai": ["Yantai seafood", "Yantai apples", "Shandong cuisine"],
    "ningbo": ["Ningbo tangyuan", "Ningbo seafood", "Zhejiang food"],
}

def search_pexels(query, count=3):
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page={count}&orientation=landscape"
    req = urllib.request.Request(url, headers={'Authorization': KEY})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return [p['src']['large'] for p in data.get('photos', [])]
    except Exception as e:
        print(f"  Error for '{query}': {e}")
        return []

print("Fetching city-specific food images from Pexels...")

# Collect images per city
city_images = {}
for city, queries in CITY_FOOD.items():
    images = []
    for q in queries:
        images.extend(search_pexels(q, 3))
        time.sleep(0.3)  # Rate limit
    city_images[city] = list(set(images))
    print(f"  {city}: {len(city_images[city])} images")

# Update restaurants with city-specific images
total = 0
for f in sorted(os.listdir(CITIES_DIR)):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    
    city_id = f.replace('.json', '')
    images = city_images.get(city_id, [])
    
    if not images:
        print(f"  WARNING: No images for {city_id}")
        continue
    
    filepath = os.path.join(CITIES_DIR, f)
    with open(filepath, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    
    for r in data.get('restaurants', []):
        r['imageUrl'] = random.choice(images)
        total += 1
    
    with open(filepath, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    
    print(f"  {city_id}: updated with {len(images)} images")

print(f"\nTotal: {total} restaurants updated with city-specific food images")
