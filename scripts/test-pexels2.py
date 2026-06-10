import json, urllib.request, urllib.parse

with open('D:/suoyouxiangmu/chinaconnect/.env') as f:
    for line in f:
        if line.startswith('VITE_PEXELS_API_KEY'):
            KEY = line.strip().split('=', 1)[1]
            break

print(f"Key: {KEY[:10]}...{KEY[-5:]} (len={len(KEY)})")

url = 'https://api.pexels.com/v1/search?query=Chinese+food+dumplings&per_page=3&orientation=landscape'
req = urllib.request.Request(url, headers={'Authorization': KEY})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
        print(f"Total results: {data.get('total_results', 0)}")
        for p in data.get('photos', []):
            print(f"  {p['id']}: {p['src']['large'][:60]}...")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
