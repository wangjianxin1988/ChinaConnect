import subprocess, json, urllib.parse, random, time, os, glob, shutil

key = ''
with open('.env', 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

def search(q, n=10):
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(q)}&per_page={n}&orientation=landscape"
    r = subprocess.run(['curl','-s','-H',f'Authorization: {key}',url], capture_output=True, text=True, timeout=15)
    try:
        return [p['src']['large2x'] for p in json.loads(r.stdout).get('photos',[])]
    except:
        return []

# Get all city JSON files
json_dir = "src/data/cities"
json_files = sorted(glob.glob(os.path.join(json_dir, "*.json")))
json_files = [f for f in json_files if "cdn_urls" not in f and "beijing" not in f]

print(f"Processing {len(json_files)} cities (beijing already done)")

# Cache for cuisine -> images
cache = {}

for jf in json_files:
    city = jf.split('/')[-1].replace('.json','')
    
    with open(jf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'restaurants' not in data or not data['restaurants']:
        print(f"  {city}: no restaurants, skip")
        continue
    
    cuisines = set(r.get('cuisine','') for r in data['restaurants'])
    
    # Get images for each cuisine
    pool = {}
    for c in sorted(cuisines):
        if c in cache:
            pool[c] = cache[c]
        else:
            term = c.replace('菜','').replace('式','')
            urls = search(f'chinese {term} food', 10)
            if not urls: urls = search('chinese food', 5)
            pool[c] = urls
            cache[c] = urls
            time.sleep(0.3)
    
    # Update
    used = set()
    updated = 0
    for r in data['restaurants']:
        c = r.get('cuisine', '')
        p = pool.get(c, [])
        nu = None
        for u in p:
            if u not in used: nu = u; break
        if not nu and p: nu = random.choice(p)
        if nu:
            used.add(nu)
            r['imageUrl'] = nu
            updated += 1
    
    # Save
    shutil.copy2(jf, jf + '.bak')
    with open(jf, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  {city}: {updated}/{len(data['restaurants'])}")

print("\n=== DONE ===")
