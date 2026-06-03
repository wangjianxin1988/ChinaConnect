import json

# Mapping: attraction ID -> new Unsplash CDN URL
replacements = {
    "mulan-mountain": "https://images.unsplash.com/photo-1615529162924-f8605388461d?w=800&q=85",
    "changchong-temple": "https://images.unsplash.com/photo-1609949887579-f5ab3c4d51c8?w=800&q=85",
    "tanhualin": "https://images.unsplash.com/photos/red-chinese-lanterns-hang-in-an-old-alley-jJLdZQYxIbE?w=800&q=85",
    "wuhan-moon-city": "https://images.unsplash.com/photos/traditional-chinese-garden-with-flowering-trees-and-pond-ihniIvlPrpA?w=800&q=85",
    "wuhan-revolutionary-memorial": "https://images.unsplash.com/photos/grand-colonial-building-with-arched-walkways-and-columns-zCyzJvyiH70?w=800&q=85",
    "wuhan-yongling-tomb": "https://images.unsplash.com/photos/ancient-tomb-carved-into-a-large-rock-face-ImNFeYy7FDQ?w=800&q=85",
    "hubei-museum": "https://images.unsplash.com/photos/a-group-of-people-walking-around-a-museum-ZIgvEKmNuMM?w=800&q=85",
    "wuhan-uni": "https://images.unsplash.com/photos/modern-building-with-people-walking-outside-sA5l7DimlqY?w=800&q=85",
    "hubu-alley": "https://images.unsplash.com/photos/hallway-with-red-chinese-lanterns-C5ROwO8mStg?w=800&q=85",
    "yangtze-bridge": "https://images.unsplash.com/photos/photographer-captures-a-bright-illuminated-bridge-at-night-oJqR8YK8Gnk?w=800&q=85",
    "wuhan-food": "https://images.unsplash.com/photos/busy-city-street-and-river-at-night-iA4BLkicqrY?w=800&q=85",
    "wuhan-night": "https://images.unsplash.com/photos/lighted-city-skyline-during-night-bIkRZwv7CZg?w=800&q=85",
    "wuhan-botanical": "https://images.unsplash.com/photos/a-lush-botanical-garden-with-a-water-feature-jZz2mpt4Avw?w=800&q=85",
    "wuhan-zoo": "https://images.unsplash.com/photos/wildlife-photography-of-black-and-white-panda-A57EhRpsvyI?w=800&q=85",
    "wuhan-science": "https://images.unsplash.com/photos/modern-building-with-unique-architecture-by-the-water-Nj91sae6Akg?w=800&q=85",
    "mulan-tianchi": "https://images.unsplash.com/photos/waterfalls-between-mountain-during-daytime-BYDq4QBu5sE?w=800&q=85",
    "wuhan-art": "https://images.unsplash.com/photos/people-take-pictures-of-art-at-the-gallery-AqLy57W4l8I?w=800&q=85",
    "huazhong-uni": "https://images.unsplash.com/photos/a-tall-white-tower-sitting-next-to-a-parking-lot-ycMdVBQAD8o?w=800&q=85",
    "wuchang-riverside": "https://images.unsplash.com/photos/gmrBq0rWF-U?w=800&q=85",
    "cailinji": "https://images.unsplash.com/photos/a-close-up-of-a-pile-of-uncooked-noodles-U2NxJnlD53o?w=800&q=85",
    "wuhan-metro": "https://images.unsplash.com/photos/an-urban-passage-leads-into-an-open-corridor-GwJSMgqNiwM?w=800&q=85",
    "wuhan-park": "https://images.unsplash.com/photos/lotus-pond-with-traditional-pavilion-and-trees-QNEqU1PtTds?w=800&q=85",
    "wh-bridge2": "https://images.unsplash.com/photos/a-large-bridge-over-a-river-with-a-city-in-the-background-iSfnCnUxABc?w=800&q=85",
    "wh-street": "https://images.unsplash.com/photos/a-nighttime-street-scene-with-neon-signs-and-people-8Wv5iBrblGg?w=800&q=85",
    "wh-hankou": "https://images.unsplash.com/photos/chinese-architecture-with-colorful-details-and-red-doors-FDvbKFipQcw?w=800&q=85",
    "wh-garden": "https://images.unsplash.com/photos/a-chinese-pagoda-sits-in-front-of-a-lake-hvd1uscg4ik?w=800&q=85",
}

with open("src/data/cities/wuhan.json", "r", encoding="utf-8") as f:
    data = json.load(f)

fixed_count = 0
for attr in data["attractions"]:
    if attr["id"] in replacements:
        old_url = attr.get("image", "")
        new_url = replacements[attr["id"]]
        attr["image"] = new_url
        fixed_count += 1
        print(f"Fixed: {attr['id']} ({attr['name']})")

# Check for duplicate URLs
all_urls = [a["image"] for a in data["attractions"]]
url_counts = {}
for url in all_urls:
    url_counts[url] = url_counts.get(url, 0) + 1

dupes = {url: count for url, count in url_counts.items() if count > 1}
if dupes:
    print(f"\nWARNING: Found {len(dupes)} duplicate URLs:")
    for url, count in dupes.items():
        ids = [a["id"] for a in data["attractions"] if a["image"] == url]
        print(f"  {url} (used by: {', '.join(ids)})")
else:
    print("\nNo duplicate URLs found!")

print(f"\nTotal fixed: {fixed_count}")

with open("src/data/cities/wuhan.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("File saved successfully!")
