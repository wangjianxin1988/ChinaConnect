#!/usr/bin/env python3
"""
Add Pexels images to all restaurants that don't have imageUrl.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import random

PEXELS_API_KEY = "2Uf29HlNIP9cbdaqQRRi5lizUjwQjs7x43x6pv2pab1EtyXkHvYFY3tT"
CITIES_DIR = "D:/suoyouxiangmu/chinaconnect/src/data/cities"

def search_pexels(query: str) -> str:
    """Search Pexels for a food image"""
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=5&orientation=landscape"
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            photos = data.get("photos", [])
            if photos:
                photo = random.choice(photos)
                return f"{photo['src']['large2x']}"
    except Exception as e:
        pass
    return ""

def add_images_to_city(city_id: str):
    """Add Pexels images to restaurants in a city"""
    filepath = os.path.join(CITIES_DIR, f"{city_id}.json")
    if not os.path.exists(filepath):
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    restaurants = data.get("restaurants", [])
    updated = 0
    
    for r in restaurants:
        if r.get("imageUrl"):
            continue
        
        # Search for image based on cuisine
        cuisine = r.get("cuisine", "")
        name = r.get("name", "")
        
        # Try specific food first, then generic
        queries = [
            f"Chinese {cuisine} food",
            f"{cuisine} dish China",
            f"Chinese food {cuisine}",
            f"Chinese restaurant food",
        ]
        
        image_url = ""
        for q in queries:
            image_url = search_pexels(q)
            if image_url:
                break
            time.sleep(0.2)  # Rate limit
        
        if image_url:
            r["imageUrl"] = image_url
            updated += 1
        
        time.sleep(0.1)
    
    if updated > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    return updated

if __name__ == "__main__":
    cities = sys.argv[1:] if len(sys.argv) > 1 else [
        f.replace('.json', '') for f in os.listdir(CITIES_DIR) 
        if f.endswith('.json') and f != 'cdn_urls.json'
    ]
    
    total_updated = 0
    for city_id in cities:
        updated = add_images_to_city(city_id)
        print(f"  {city_id}: {updated} images added")
        total_updated += updated
    
    print(f"\nTotal: {total_updated} images added")
