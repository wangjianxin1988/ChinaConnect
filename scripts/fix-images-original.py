import json, os, random, subprocess

CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

# Collect all verified Unsplash URLs from original git data
cities = ["beijing", "shanghai", "chengdu", "guangzhou", "xian", "hangzhou", 
          "chongqing", "nanjing", "suzhou", "wuhan", "changsha", "xiamen",
          "qingdao", "kunming", "lijiang", "dali", "sanya", "guilin",
          "zhangjiajie", "shenzhen", "tianjin", "harbin", "dalian", "jinan",
          "luoyang", "fuzhou", "quanzhou", "lanzhou", "xining", "dunhuang",
          "chengde", "hulunbuir", "weihai", "yantai", "ningbo"]

all_urls = set()
for city in cities:
    try:
        result = subprocess.run(
            ["git", "show", f"faec1b4:src/data/cities/{city}.json"],
            capture_output=True, text=True, cwd="D:/suoyouxiangmu/chinaconnect"
        )
        import re
        urls = re.findall(r'https://images\.unsplash\.com/[^"]+', result.stdout)
        for url in urls:
            # Normalize URL
            base = url.split('?')[0]
            all_urls.add(base + "?w=800&q=85")
    except:
        pass

verified_urls = list(all_urls)
print(f"Collected {len(verified_urls)} verified Unsplash URLs from original data")

# Verify they still work
import urllib.request
working = []
for url in verified_urls[:50]:  # Test first 50
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                working.append(url)
    except:
        pass

print(f"Verified {len(working)} still working")

# Use working URLs for all restaurants
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
