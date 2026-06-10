import json, urllib.request, random, os

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Test multiple free food image APIs
def test_foodish():
    """Foodish API - random food images"""
    try:
        url = "https://foodish-api.herokuapp.com/images/biryani/biryani1.jpg"
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except:
        return False

def test_themealdb():
    """TheMealDB - free meal images"""
    try:
        url = "https://www.themealdb.com/api/json/v1/1/random.php"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            meal = data.get('meals', [{}])[0]
            img = meal.get('strMealThumb', '')
            return bool(img)
    except:
        return False

def get_mealdb_images(count=50):
    """Get random meal images from TheMealDB"""
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
                    images.add(img + '/preview')  # Add /preview for smaller size
        except:
            pass
    return list(images)

print("Testing food image APIs...")
print("Foodish:", "OK" if test_foodish() else "FAIL")
print("TheMealDB:", "OK" if test_themealdb() else "FAIL")

print("\nFetching images from TheMealDB...")
images = get_mealdb_images(50)
print(f"Got {len(images)} images")

if images:
    # Update all restaurants
    total = 0
    for f in sorted(os.listdir(CITIES_DIR)):
        if not f.endswith('.json') or f == 'cdn_urls.json':
            continue
        filepath = os.path.join(CITIES_DIR, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            data = json.load(fh)
        for r in data.get('restaurants', []):
            r['imageUrl'] = random.choice(images)
            total += 1
        with open(filepath, 'w', encoding='utf-8') as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
    print(f"Updated {total} restaurants")
else:
    print("No images available")
