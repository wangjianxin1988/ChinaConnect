import json, os, random

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Verified Chinese food images from Unsplash (confirmed food, not nail art)
VERIFIED_FOOD = [
    # Chinese dumplings
    "https://images.unsplash.com/photo-8huTkVnKmOw?w=800&q=85",
    # Hotpot
    "https://images.unsplash.com/photo-x0jiDSAlwWc?w=800&q=85",
    # Schezwan Noodles
    "https://images.unsplash.com/photo-OuysQe-b72Q?w=800&q=85",
    # Crispy fried seafood
    "https://images.unsplash.com/photo-rV_CcOLU-uw?w=800&q=85",
    # Meat in sauce
    "https://images.unsplash.com/photo-kAmUyGdOZio?w=800&q=85",
    # Schezwan Noodles overhead
    "https://images.unsplash.com/photo-mzmhwa0deOI?w=800&q=85",
    # Dim sum bamboo steamer
    "https://images.unsplash.com/photo-IhR3WOLuM7M?w=800&q=85",
    # Dim sum basket
    "https://images.unsplash.com/photo-rL1EF2tZeio?w=800&q=85",
    # Dim sum dumplings
    "https://images.unsplash.com/photo--N2XYrGd2OQ?w=800&q=85",
    # Steamed buns
    "https://images.unsplash.com/photo-zF0Ry7C4xuw?w=800&q=85",
    # Spicy Sichuan chicken
    "https://images.unsplash.com/photo-ygceZwCMOlk?w=800&q=85",
    # Chicken green peppers
    "https://images.unsplash.com/photo-TCYcFgCSCZE?w=800&q=85",
    # Peking duck
    "https://images.unsplash.com/photo-tm4Y0NAUA48?w=800&q=85",
    # Roasted duck slices
    "https://images.unsplash.com/photo-ntG14vqEEP0?w=800&q=85",
    # Rice shrimp vegetables
    "https://images.unsplash.com/photo-o6Oq7rBMqVc?w=800&q=85",
    # Bowls rice shrimp
    "https://images.unsplash.com/photo-Yrr8tQYVPVM?w=800&q=85",
    # Shrimp fried rice
    "https://images.unsplash.com/photo-n58rNGvuV3o?w=800&q=85",
    # Fried seafood rice
    "https://images.unsplash.com/photo--lvFkJo7FTw?w=800&q=85",
    # Bowl shrimp rice
    "https://images.unsplash.com/photo-sIoLfa1W48E?w=800&q=85",
]

total = 0
for f in sorted(os.listdir(CITIES_DIR)):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    filepath = os.path.join(CITIES_DIR, f)
    with open(filepath, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    for r in data.get('restaurants', []):
        r['imageUrl'] = random.choice(VERIFIED_FOOD)
        total += 1
    with open(filepath, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

print(f"Updated {total} restaurants with {len(VERIFIED_FOOD)} verified food images")
