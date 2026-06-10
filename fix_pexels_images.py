import re, urllib.request, urllib.parse, json, random, time

API_KEY = "2Uf2...n  # Censored

# 菜系 -> Pexels搜索词映射
CUISINE_SEARCH = {
    "京菜": ["peking duck", "beijing noodles", "chinese pancake"],
    "北京烤鸭": ["peking duck", "roasted duck", "chinese roast duck"],
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

def search_pexels(query):
    try:
        url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=5&orientation=landscape"
        req = urllib.request.Request(url, headers={"Authorization": API_KEY})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        if data.get('photos'):
            photo = random.choice(data['photos'])
            return photo['src']['large2x']
        return None
    except Exception as e:
        print(f"  [WARN] Pexels failed for '{query}': {e}")
        return None

# 处理restaurants.ts
file_path = "D:/suoyouxiangmu/ChinaConnect/src/data/food/restaurants.ts"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 备份
with open(file_path + ".bak", 'w', encoding='utf-8') as f:
    f.write(content)

# 提取所有cuisine
cuisines = re.findall(r'cuisine: "([^"]+)"', content)
print(f"找到 {len(cuisines)} 家餐厅")

# 找到所有imageUrl位置
image_pattern = r'imageUrl: "([^"]+)"'
matches = list(re.finditer(image_pattern, content))
print(f"找到 {len(matches)} 个imageUrl")

updated = 0
for i, match in enumerate(matches):
    if i >= len(cuisines):
        break
    
    cuisine = cuisines[i]
    search_term = get_search_term(cuisine, i)
    image_url = search_pexels(search_term)
    
    if image_url:
        old_url = match.group(1)
        content = content.replace(f'imageUrl: "{old_url}"', f'imageUrl: "{image_url}"', 1)
        updated += 1
        print(f"  [{i+1}/{len(matches)}] {cuisine} -> {search_term}")
    
    time.sleep(0.5)

# 保存
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n=== restaurants.ts 完成: {updated}/{len(matches)} ===")
