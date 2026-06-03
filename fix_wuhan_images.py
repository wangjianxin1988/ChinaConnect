#!/usr/bin/env python3
import json
import subprocess
import sys
import time
import urllib.request
import urllib.parse
import ssl

FILE = "D:/suoyouxiangmu/chinaconnect/src/data/cities/wuhan.json"

# Read the JSON
with open(FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# Collect all image URLs to check
images = []
# coverImage
if "coverImage" in data:
    images.append(("coverImage", data["coverImage"]))
# attractions
for i, attr in enumerate(data.get("attractions", [])):
    if "image" in attr:
        images.append(("attractions", i, attr["image"]))

print(f"Total images to check: {len(images)}")

# Check each image URL using curl
def check_url(url):
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "--max-time", "10", url],
            capture_output=True, text=True, timeout=15
        )
        code = result.stdout.strip()
        return int(code) if code.isdigit() else 0
    except:
        return 0

# Search Unsplash for a replacement image
def search_unsplash(query):
    # Use Unsplash source which redirects to a random photo
    # We'll try multiple approaches
    search_url = f"https://unsplash.com/s/photos/{urllib.parse.quote(query)}"
    
    # Use the Unsplash source API for random images based on query
    # This is a public endpoint that doesn't need an API key
    unsplash_source_url = f"https://source.unsplash.com/featured/800x600/?{urllib.parse.quote(query)}"
    
    # Check if the source URL works
    code = check_url(unsplash_source_url)
    if code == 200:
        return unsplash_source_url
    
    # Alternative: use specific photo IDs that we know work
    # These are curated Unsplash photos related to Chinese landmarks
    return None

# Known good Unsplash photo IDs for various categories
WORKING_PHOTOS = {
    "yellow crane tower": "https://images.unsplash.com/photo-1583168803160-cb95a8ee9e56?w=800&q=85",
    "wuhan university": "https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=800&q=85",
    "cherry blossom": "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=85",
    "yangtze river": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85",
    "bridge": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=85",
    "east lake": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=85",
    "lake": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=85",
    "museum": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=85",
    "temple": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=85",
    "buddhist temple": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=85",
    "pavilion": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=85",
    "mountain": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85",
    "riverside": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=85",
    "shopping street": "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=85",
    "nightlife": "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=85",
    "tech hub": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=85",
    "taoist temple": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=85",
    "garden": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=85",
    "botanical garden": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=85",
    "park": "https://images.unsplash.com/photo-1518639192441-8fce0a09e07d?w=800&q=85",
    "urban park": "https://images.unsplash.com/photo-1518639192441-8fce0a09e07d?w=800&q=85",
    "colonial architecture": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=85",
    "historic street": "https://images.unsplash.com/photo-1518639192441-8fce0a09e07d?w=800&q=85",
    "cultural district": "https://images.unsplash.com/photo-1518639192441-8fce0a09e07d?w=800&q=85",
    "pedestrian street": "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=85",
    "amusement park": "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=85",
    "marine": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
    "ocean world": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
    "rafting": "https://images.unsplash.com/photo-1530866495591-2e7ef5f3d2f5?w=800&q=85",
    "farm": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=85",
    "countryside": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=85",
    "tomb": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85",
    "archaeological": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85",
    "revolutionary": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85",
    "food": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85",
    "chinese food": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=85",
    "street food": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85",
    "noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=85",
    "night view": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
    "city night": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
    "zoo": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&q=85",
    "science museum": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85",
    "art museum": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85",
    "university": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=85",
    "riverside": "https://images.unsplash.com/photo-1470004914212-250457992478?w=800&q=85",
    "bamboo": "https://images.unsplash.com/photo-1518639192441-8fce0a09e07d?w=800&q=85",
    "metro": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=85",
    "subway": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=85",
    "lotus": "https://images.unsplash.com/photo-1474557157379-8aa74a6ef581?w=800&q=85",
    "statue": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85",
}

# Map attraction IDs to search terms
ATTRACTION_SEARCH = {
    "yellow-crane-tower": "yellow crane tower",
    "wuhan-university": "wuhan university cherry blossom",
    "yangtze-river-bridge": "yangtze river bridge",
    "east-lake": "lake landscape",
    "hubei-provincial-museum": "museum interior",
    "guiyuan-temple": "buddhist temple",
    "qingchuan-pavilion": "pavilion architecture",
    "mulan-mountain": "mountain landscape",
    "hankou-riverside": "riverside city",
    "jianghan-road": "shopping street night",
    "masion-de-liberte": "nightlife urban",
    "_OPTICAL_VALLEY": "tech hub modern",
    "changchong-temple": "taoist temple",
    "mopanshan": "garden landscape",
    "tanhualin": "historic street cultural",
    "zhongshan-park": "urban park",
    "baotong-temple": "buddhist temple",
    "liverpool-road": "colonial architecture",
    "wuhan-insect-kingdom": "nature butterfly",
    "hanstreet": "shopping canal",
    "wuhan-moon-city": "lake bridge",
    "wuhan-sea-world": "ocean marine",
    "wuhan-museum": "museum",
    "wuhan-botanical-garden": "botanical garden",
    "wuhan-revolutionary-memorial": "revolutionary",
    "wuhan-shengrihua-yuan": "farm countryside",
    "wuhan-yongling-tomb": "archaeological tomb",
    "wuhan-xiaoyao Park": "amusement park",
    "wuhan-furong-valley": "rafting river",
    "yellow-crane": "yellow crane tower",
    "hubei-museum": "museum artifacts",
    "wuhan-uni": "university campus",
    "hubu-alley": "street food alley",
    "yangtze-bridge": "bridge river",
    "wuhan-food": "chinese food noodles",
    "wuhan-night": "city night skyline",
    "wuhan-botanical": "botanical garden",
    "wuhan-zoo": "zoo animals",
    "wuhan-science": "science museum",
    "mulan-tianchi": "mountain lake",
    "wuhan-art": "art museum",
    "huazhong-uni": "university campus",
    "wuchang-riverside": "riverside",
    "cailinji": "noodles restaurant",
    "wuhan-metro": "metro subway",
    "wuhan-park": "park garden",
    "wh-bridge2": "bridge river",
    "wh-street": "street shopping",
    "wh-hankou": "colonial architecture",
    "wh-garden": "park garden",
}

# Find working Unsplash images using direct search
def find_working_unsplash(query):
    """Try to find a working Unsplash image for the given query."""
    # First try the source.unsplash.com endpoint
    source_url = f"https://source.unsplash.com/800x600/?{urllib.parse.quote(query)}"
    code = check_url(source_url)
    if code == 200:
        # Follow redirects to get the final URL
        try:
            result = subprocess.run(
                ["curl", "-s", "-L", "-o", "/dev/null", "-w", "%{url_effective}", "--max-time", "10", source_url],
                capture_output=True, text=True, timeout=15
            )
            final_url = result.stdout.strip()
            if "images.unsplash.com" in final_url:
                return final_url
        except:
            pass
        return source_url
    
    return None

# Check all images and find replacements for 404s
print("\n=== Checking all image URLs ===")
failed_images = []
for img_info in images:
    if img_info[0] == "coverImage":
        url = img_info[1]
        code = check_url(url)
        print(f"coverImage: {code} - {url[:80]}...")
        if code == 404:
            failed_images.append(("coverImage", None, url))
    else:
        section, idx, url = img_info
        attr = data[section][idx]
        attr_id = attr.get("id", "unknown")
        code = check_url(url)
        print(f"{attr_id}: {code} - {url[:80]}...")
        if code == 404:
            failed_images.append((section, idx, url))

print(f"\n=== Found {len(failed_images)} images with 404 status ===")

# Fix each failed image
print("\n=== Fixing 404 images ===")
replacements = []
for section, idx, old_url in failed_images:
    if section == "coverImage":
        attr_id = "coverImage"
        query = "wuhan city skyline"
    else:
        attr = data[section][idx]
        attr_id = attr.get("id", "unknown")
        query = ATTRACTION_SEARCH.get(attr_id, "wuhan china")
    
    print(f"\nSearching for replacement for {attr_id} (query: {query})...")
    
    # Try multiple search terms
    new_url = None
    search_terms = [query]
    
    # Add fallback terms
    if "wuhan" not in query:
        search_terms.append(f"wuhan {query}")
    
    for term in search_terms:
        new_url = find_working_unsplash(term)
        if new_url:
            break
        time.sleep(0.5)
    
    if new_url:
        replacements.append((section, idx, old_url, new_url, attr_id))
        print(f"  Found: {new_url[:80]}...")
    else:
        print(f"  No replacement found, will use fallback")
        # Use a known working fallback
        fallback = "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85"
        replacements.append((section, idx, old_url, fallback, attr_id))

# Apply replacements
print("\n=== Applying replacements ===")
for section, idx, old_url, new_url, attr_id in replacements:
    if section == "coverImage":
        data["coverImage"] = new_url
        print(f"Updated coverImage: {new_url[:80]}...")
    else:
        data[section][idx]["image"] = new_url
        print(f"Updated {attr_id}: {new_url[:80]}...")

# Save the updated JSON
print(f"\n=== Saving to {FILE} ===")
with open(FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n=== Verifying all images ===")
# Verify all images are now working
all_ok = True
for img_info in images:
    if img_info[0] == "coverImage":
        url = data["coverImage"]
        code = check_url(url)
        if code != 200:
            print(f"WARNING: coverImage still not 200: {code}")
            all_ok = False
    else:
        section, idx, _ = img_info
        attr = data[section][idx]
        url = attr["image"]
        code = check_url(url)
        if code != 200:
            print(f"WARNING: {attr.get('id')} still not 200: {code}")
            all_ok = False

if all_ok:
    print("\n✓ All images are now working (HTTP 200)")
else:
    print("\n⚠ Some images may still have issues")

print("\nDone!")
