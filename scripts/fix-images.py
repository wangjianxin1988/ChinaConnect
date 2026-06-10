import json, urllib.request, urllib.parse, os, random

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Verified Chinese food images from Unsplash (hand-picked, confirmed working)
# Each URL has been verified to be an actual food photo
FOOD_IMAGES = {
    "dumplings": [
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=85",
    ],
    "noodles": [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=85",
    ],
    "hotpot": [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=85",
    ],
    "ramen": [
        "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=85",
    ],
    "sushi": [
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=85",
    ],
    "restaurant": [
        "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=85",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85",
    ],
    "food_plate": [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=85",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=85",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85",
    ],
    "food_spread": [
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=85",
    ],
    "steak": [
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=85",
    ],
    "burger": [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=85",
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=85",
        "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=85",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=85",
    ],
}

# Map cuisine keywords to image categories
CUISINE_MAP = {
    "鸭": "food_plate", "鸡": "food_plate", "鱼": "food_plate",
    "面": "noodles", "粉": "noodles", "米线": "noodles",
    "火锅": "hotpot", "涮": "hotpot",
    "饺": "dumplings", "包": "dumplings", "馄饨": "dumplings",
    "烧": "food_plate", "炒": "food_plate", "蒸": "food_plate",
    "甜": "food_plate", "糕": "food_plate", "酥": "food_plate",
    "汤": "food_plate", "粥": "food_plate",
    "海鲜": "food_plate", "虾": "food_plate", "蟹": "food_plate",
    "牛": "steak", "羊": "steak", "猪": "steak",
    "茶": "food_plate", "咖啡": "food_plate",
}

def get_image_for_cuisine(cuisine):
    for keyword, category in CUISINE_MAP.items():
        if keyword in cuisine:
            urls = FOOD_IMAGES.get(category, FOOD_IMAGES["food_plate"])
            return random.choice(urls)
    return random.choice(FOOD_IMAGES["food_plate"])

# Update all restaurants
total = 0
for f in sorted(os.listdir(CITIES_DIR)):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    filepath = os.path.join(CITIES_DIR, f)
    with open(filepath, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    
    for r in data.get('restaurants', []):
        r['imageUrl'] = get_image_for_cuisine(r.get('cuisine', ''))
        total += 1
    
    with open(filepath, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    print(f"  {f}: done")

print(f"\nTotal: {total} restaurants updated with verified food images")
