#!/usr/bin/env python3
import subprocess, json, urllib.parse, time, random, glob

key = ''
with open('.env', 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

# 菜系 -> 精准搜索词
CUISINE_MAP = {
    'Peking Duck': 'peking duck', 'Beijing': 'beijing food',
    'Beijing Breakfast': 'beijing breakfast', 'Beijing Fast Food': 'beijing street food',
    'Beijing Halal': 'beijing halal food', 'Beijing Hotpot': 'beijing hotpot',
    'Beijing Noodles': 'beijing noodles', 'Beijing Snacks': 'beijing snacks',
    'Beijing Traditional': 'beijing traditional food', 'Beijing Traditional Snacks': 'beijing traditional snacks',
    '炸酱面': 'zhajiang noodles', '炒肝': 'chinese liver stew', '豆汁': 'chinese fermented drink',
    '涮羊肉': 'mongolian hotpot lamb', '爆肚': 'chinese tripe dish',
    'Cantonese': 'cantonese dim sum', 'Hotpot': 'chinese hotpot',
    'Imperial': 'imperial chinese food', 'Shandong': 'shandong cuisine',
    'Shanghai': 'shanghai xiaolongbao', 'Zhejiang': 'zhejiang cuisine',
    'Sichuan': 'sichuan spicy food', '川菜': 'sichuan food', '川式火锅': 'sichuan hotpot',
    '串串香': 'sichuan skewers', '粤菜': 'cantonese dim sum', '浙菜': 'zhejiang cuisine',
    '杭帮菜': 'hangzhou food', '本帮菜': 'shanghai food', '东北菜': 'dongbei cuisine',
    '湘菜': 'hunan spicy food', '闽菜': 'fujian seafood', '新疆菜': 'xinjiang lamb',
    '云南菜': 'yunnan noodles', '饺子': 'chinese dumplings', '小吃': 'chinese street food',
    'Hunan': 'hunan spicy food', 'Crayfish': 'chinese crayfish',
    '小龙虾': 'chinese crayfish', '剁椒鱼头': 'hunan fish head',
    '口味虾': 'spicy crayfish', '臭豆腐': 'chinese stinky tofu',
    '糖油粑粑': 'chinese fried dough',
    'Sichuan hot pot': 'sichuan hotpot', '回锅肉': 'sichuan twice cooked pork',
    '担担面': 'dan dan noodles', '火锅': 'chinese hotpot',
    '麻婆豆腐': 'mapo tofu', '龙抄手': 'chinese wonton',
    'Rice Noodles': 'chinese rice noodles',
    'Seafood': 'chinese seafood', 'Dumplings': 'chinese dumplings',
    'Noodles': 'chinese noodles', 'Dessert': 'chinese dessert',
    'BBQ': 'chinese bbq', 'Hot Pot': 'chinese hotpot',
    'Local': 'chinese local food', 'Halal': 'halal chinese food',
    'Various': 'chinese food', 'Grilled': 'chinese grilled food',
    'Mongolian': 'mongolian food', 'Manchu': 'manchu cuisine',
    'Bai Specialty': 'bai cuisine yunnan', 'Yunnan Specialty': 'yunnan food',
    'Vegetarian': 'vegetarian chinese', 'Tea House': 'chinese tea house',
}

def get_search_term(cuisine):
    return CUISINE_MAP.get(cuisine, 'chinese food')

def get_images(term, count=1):
    """获取指定数量的图片"""
    images = []
    for page in range(1, (count // 3) + 2):
        url = f'https://api.pexels.com/v1/search?query={urllib.parse.quote(term)}&per_page=3&orientation=landscape&page={page}'
        r = subprocess.run(['curl','-s','-H',f'Authorization: {key}',url], capture_output=True, text=True, timeout=15)
        try:
            photos = json.loads(r.stdout).get('photos', [])
            for p in photos:
                images.append(p['src']['large2x'])
                if len(images) >= count:
                    return images
        except:
            pass
        time.sleep(2)
    return images

# 处理所有城市
json_files = sorted(glob.glob('src/data/cities/*.json'))
json_files = [f for f in json_files if 'cdn_urls' not in f]

print(f'处理 {len(json_files)} 个城市', flush=True)

for jf in json_files:
    city = jf.split('\\')[-1].split('/')[-1].replace('.json','')
    
    with open(jf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'restaurants' not in data:
        continue
    
    # 统计每个菜系的餐厅数量
    cuisine_count = {}
    for r in data['restaurants']:
        c = r.get('cuisine', 'unknown')
        cuisine_count[c] = cuisine_count.get(c, 0) + 1
    
    print(f'\n=== {city}: {len(data["restaurants"])} restaurants, {len(cuisine_count)} cuisines ===', flush=True)
    
    # 为每个菜系获取足够多的图片
    cuisine_images = {}
    for cuisine, count in cuisine_count.items():
        term = get_search_term(cuisine)
        images = get_images(term, count)
        if images:
            cuisine_images[cuisine] = images
            print(f'  {cuisine}: {len(images)} images ({term})', flush=True)
        else:
            print(f'  {cuisine}: FAILED ({term})', flush=True)
        time.sleep(2)
    
    # 分配图片给餐厅（每家不同）
    updated = 0
    for r in data['restaurants']:
        cuisine = r.get('cuisine', 'unknown')
        if cuisine in cuisine_images and cuisine_images[cuisine]:
            r['imageUrl'] = cuisine_images[cuisine].pop(0)
            updated += 1
    
    # 保存
    with open(jf, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'  DONE: {updated}/{len(data["restaurants"])}', flush=True)

print('\n=== ALL DONE ===', flush=True)
