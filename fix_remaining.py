#!/usr/bin/env python3
import subprocess, json, urllib.parse, time, random, glob, sys

key = ''
with open('.env', 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

TERMS = ['peking duck food', 'chinese breakfast', 'chinese street food', 'chinese hotpot', 'noodles', 'hotpot', 'fried rice', 'ramen', 'burger', 'chinese cuisine']

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

# Get remaining cities
json_files = sorted(glob.glob('src/data/cities/*.json'))
json_files = [f for f in json_files if 'cdn_urls' not in f and 'beijing' not in f and 'shanghai' not in f]

print(f'Remaining: {len(json_files)} cities', flush=True)

for jf in json_files:
    city = jf.split('\\')[-1].split('/')[-1].replace('.json','')
    
    with open(jf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'restaurants' not in data:
        print(f'{city}: no data, skip', flush=True)
        continue
    
    total = len(data['restaurants'])
    print(f'\n=== {city}: {total} ===', flush=True)
    
    updated = 0
    for i, r in enumerate(data['restaurants']):
        term = random.choice(TERMS)
        img = get_image(term)
        if img:
            r['imageUrl'] = img
            updated += 1
        if (i+1) % 10 == 0:
            print(f'  [{i+1}/{total}] {updated} OK', flush=True)
        time.sleep(3)
    
    with open(jf, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'  DONE: {updated}/{total}', flush=True)

print('\n=== ALL DONE ===', flush=True)
