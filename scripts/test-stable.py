import urllib.request, time

candidates = [
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=85",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=85",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=85",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=85",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=85",
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=85",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85",
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=85",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=85",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=85",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=85",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=85",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=85",
    "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=800&q=85",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85",
]

print("Testing URLs...")
stable = []
for url in candidates:
    ok = 0
    for attempt in range(2):
        req = urllib.request.Request(url, method='HEAD')
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    ok += 1
        except:
            pass
        time.sleep(0.1)
    if ok == 2:
        stable.append(url)
        print(f"  STABLE: {url.split('/')[-1][:20]}...")
    else:
        print(f"  UNSTABLE: {url.split('/')[-1][:20]}... ({ok}/2)")

print(f"\nStable URLs: {len(stable)}/{len(candidates)}")
