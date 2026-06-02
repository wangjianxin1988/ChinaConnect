import json

with open('guilin.json','r',encoding='utf-8') as f:
    data = json.load(f)

new_attractions = [
    {
        "id": "lijiang-national-park",
        "name": "漓江国家公园",
        "nameEn": "Lijiang National Park",
        "category": "nature",
        "description": "以漓江为核心的国家级风景名胜区，涵盖桂林至阳朔的漓江两岸精华景观。公园内山青水秀、洞奇石美，是桂林山水的集中展示区。",
        "address": "桂林市灵川县至阳朔县",
        "coordinates": {"lat": 25.1535, "lng": 110.3535},
        "openingHours": "全天开放",
        "ticketPrice": "免费（部分景点收费）",
        "recommendedVisitTime": "1天",
        "highlights": ["漓江精华段", "喀斯特地貌", "田园风光", "徒步线路"],
        "tips": "建议安排一整天游览。可以徒步漓江精华段，从杨堤到兴坪。",
        "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=85"
    },
    {
        "id": "aishan-village",
        "name": "石头城",
        "nameEn": "Aishan Stone Village",
        "category": "street",
        "description": "阳朔县葡萄镇的古老石头村落，整座村庄由石头砌成，石屋、石墙、石板路保存完好。是摄影爱好者和文艺青年的打卡圣地。",
        "address": "桂林市阳朔县葡萄镇",
        "coordinates": {"lat": 24.8335, "lng": 110.3935},
        "openingHours": "全天开放",
        "ticketPrice": "免费",
        "recommendedVisitTime": "2小时",
        "highlights": ["石头建筑", "田园风光", "摄影打卡", "古朴村落"],
        "tips": "游客较少，适合喜欢安静的旅行者。自驾或骑行前往。",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85"
    }
]

data["attractions"].extend(new_attractions)
with open("guilin.json","w",encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"guilin: {len(data['attractions'])} attractions total ({len(new_attractions)} added)")
