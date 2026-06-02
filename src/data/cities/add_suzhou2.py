import json

with open('suzhou.json','r',encoding='utf-8') as f:
    data = json.load(f)

new_attractions = [
    {
        "id": "kezhang-garden",
        "name": "可园",
        "nameEn": "Ke Garden",
        "category": "park",
        "description": "苏州唯一的书院式园林，始建于清代，园内有学古堂、浩歌亭等建筑。与沧浪亭隔街相望，小巧精致，是文人读书讲学之所。",
        "address": "苏州市姑苏区沧浪亭街",
        "coordinates": {"lat": 31.2889, "lng": 120.6243},
        "openingHours": "07:30-17:30",
        "ticketPrice": "25元",
        "recommendedVisitTime": "1小时",
        "highlights": ["书院式园林", "学古堂", "古树名木", "沧浪亭对景"],
        "tips": "游客很少，可以安静欣赏。建议和沧浪亭一起游览。",
        "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=85"
    }
]

data["attractions"].extend(new_attractions)
with open("suzhou.json","w",encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"suzhou: {len(data['attractions'])} attractions total ({len(new_attractions)} added)")
