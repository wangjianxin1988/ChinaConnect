import json, os, random, urllib.request

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Collect all current URLs
all_urls = set()
for f in os.listdir(CITIES_DIR):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    with open(os.path.join(CITIES_DIR, f), 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    for r in data.get('restaurants', []):
        url = r.get('imageUrl', '')
        if url:
            all_urls.add(url)

print(f"Testing {len(all_urls)} unique URLs...")

# Test each URL
verified = []
for url in all_urls:
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                verified.append(url)
    except:
        pass

print(f"Verified: {len(verified)}/{len(all_urls)}")

# Update all restaurants
total = 0
for f in sorted(os.listdir(CITIES_DIR)):
    if not f.endswith('.json') or f == 'cdn_urls.json':
        continue
    filepath = os.path.join(CITIES_DIR, f)
    with open(filepath, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    for r in data.get('restaurants', []):
        r['imageUrl'] = random.choice(verified)
        total += 1
    with open(filepath, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

print(f"Updated {total} restaurants")
