import json, random, os

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"
PROXY_PREFIX = "https://images.weserv.nl/?url="

# Get current TheMealDB URLs
current_urls = set()
for f in os.listdir(CITIES_DIR):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    with open(os.path.join(CITIES_DIR, f), 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    for r in data.get('restaurants', []):
        url = r.get('imageUrl', '')
        if url and 'themealdb' in url:
            current_urls.add(url)

print(f"Found {len(current_urls)} TheMealDB URLs")

# Convert to proxy URLs
proxy_urls = []
for url in current_urls:
    clean_url = url.replace("https://", "").replace("http://", "")
    proxy_url = PROXY_PREFIX + clean_url + "&w=800&h=600&fit=cover"
    proxy_urls.append(proxy_url)

print(f"Created {len(proxy_urls)} proxy URLs")

# Update all restaurants
total = 0
for f in sorted(os.listdir(CITIES_DIR)):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    filepath = os.path.join(CITIES_DIR, f)
    with open(filepath, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    for r in data.get('restaurants', []):
        r['imageUrl'] = random.choice(proxy_urls)
        total += 1
    with open(filepath, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

print(f"Updated {total} restaurants with proxy URLs")
