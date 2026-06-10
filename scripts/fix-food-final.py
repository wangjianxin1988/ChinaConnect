import json, urllib.request, random, os, time

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Get images from TheMealDB
def get_mealdb_images(count=80):
    images = set()
    attempts = 0
    while len(images) < count and attempts < count * 3:
        attempts += 1
        try:
            url = "https://www.themealdb.com/api/json/v1/1/random.php"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())
                meal = data.get('meals', [{}])[0]
                img = meal.get('strMealThumb', '')
                if img:
                    images.add(img)
        except:
            pass
    return list(images)

print("Fetching images...")
images = get_mealdb_images(80)
print(f"Got {len(images)} images")

# Test first 50
working = []
for img in images[:50]:
    try:
        req = urllib.request.Request(img, method='HEAD')
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                working.append(img)
    except:
        pass

print(f"Verified: {len(working)}")

if working:
    total = 0
    for f in sorted(os.listdir(CITIES_DIR)):
        if not f.endswith('.json') or f == 'cdn_urls.json':
            continue
        filepath = os.path.join(CITIES_DIR, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            data = json.load(fh)
        for r in data.get('restaurants', []):
            r['imageUrl'] = random.choice(working)
            total += 1
        with open(filepath, 'w', encoding='utf-8') as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
    print(f"Updated {total} restaurants")
