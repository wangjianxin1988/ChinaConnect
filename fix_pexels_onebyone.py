import subprocess, json, urllib.parse, time, random, glob, os

key = ''
with open('.env', 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

# Reliable search terms
TERMS = [
    'peking duck food', 'beijing food chinese', 'chinese breakfast',
    'chinese street food', 'chinese hotpot', 'chinese restaurant food',
    'noodles', 'hotpot', 'fried rice', 'ramen', 'burger', 'chinese cuisine',
]

def get_image(term):
    url = f'https://api.pexels.com/v1/search?query={urllib.parse.quote(term)}&per_page=3&orientation=landscape'
    r = subprocess.run(['curl','-s','-H',f'Authorization: {key}',url], capture_output=True, text=True, timeout=15)
    try:
        photos = json.loads(r.stdout).get('photos', [])
        if photos:
            return random.choice(photos)['src']['large2x']
    except:
        pass
    return None

# Get all city JSON files (skip beijing, already done)
json_dir = 'src/data/cities'
json_files = sorted(glob.glob(os.path.join(json_dir, '*.json')))
json_files = [f for f in json_files if 'cdn_urls' not in f and 'beijing' not in f]

print(f'Processing {len(json_files)} cities')

for jf in json_files:
    city = jf.split('/')[-1].replace('.json','')
    
    with open(jf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'restaurants' not in data or not data['restaurants']:
        print(f'\n{city}: no restaurants, skip')
        continue
    
    print(f'\n=== {city}: {len(data["restaurants"])} restaurants ===')
    
    updated = 0
    for i, r in enumerate(data['restaurants']):
        term = random.choice(TERMS)
        img = get_image(term)
        if img:
            r['imageUrl'] = img
            updated += 1
            if (i+1) % 10 == 0:
                print(f'  [{i+1}/{len(data["restaurants"])}] {updated} OK')
        time.sleep(3)
    
    with open(jf, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'  DONE: {updated}/{len(data["restaurants"])}')

print('\n=== ALL DONE ===')
