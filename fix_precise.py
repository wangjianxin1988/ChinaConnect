#!/usr/bin/env python3
import subprocess, json, urllib.parse, time, random, glob

key = ''
with open('.env', 'r') as f:
    for line in f:
        if 'PEXELS' in line:
            key = line.split('=', 1)[1].strip()
            break

# 菜系 -> 精准搜索词映射
CUISINE_MAP = {
    # 北京特色
    'Peking Duck': 'peking duck',
    'Beijing': 'beijing food',
    'Beijing Breakfast': 'beijing breakfast',
    'Beijing Fast Food': 'beijing street food',
    'Beijing Halal': 'beijing halal food',
    'Beijing Hotpot': 'beijing hotpot',
    'Beijing Noodles': 'beijing noodles',
    'Beijing Snacks': 'beijing snacks',
    'Beijing Traditional': 'beijing traditional food',
    'Beijing Traditional Snacks': 'beijing traditional snacks',
    '炸酱面': 'zhajiang noodles',
    '炒肝': 'chinese liver stew',
    '豆汁': 'chinese fermented drink',
    '涮羊肉': 'mongolian hotpot lamb',
    '爆肚': 'chinese tripe dish',
    
    # 其他菜系
    'Cantonese': 'cantonese dim sum',
    'Contemporary Chinese': 'modern chinese food',
    'Contemporary Taiwanese': 'taiwanese food',
    'Hotpot': 'chinese hotpot',
    'Huaiyang': 'huaiyang cuisine',
    'Imperial': 'imperial chinese food',
    'Modern Beijing / Cantonese': 'modern chinese food',
    'Modern Chinese': 'modern chinese cuisine',
    'Shandong': 'shandong cuisine',
    'Shandong Fast Food': 'shandong food',
    'Shanghai': 'shanghai xiaolongbao',
    'Suzhou': 'suzhou noodles',
    'Zhejiang': 'zhejiang cuisine',
    
    # 川菜
    'Sichuan': 'sichuan spicy food',
    '川菜': 'sichuan food',
    '川式火锅': 'sichuan hotpot',
    '成都小吃': 'chengdu street food',
    '重庆火锅': 'chongqing hotpot',
    '重庆小面': 'chongqing noodles',
    '串串香': 'sichuan skewers',
    
    # 粤菜
    '粤菜': 'cantonese dim sum',
    '粤菜点心': 'dim sum',
    '潮汕菜': 'chaoshan food',
    '艇仔粥': 'chinese congee',
    
    # 江浙菜
    '浙菜': 'zhejiang cuisine',
    '杭帮菜': 'hangzhou food',
    '杭帮面': 'hangzhou noodles',
    '杭帮点心': 'hangzhou dim sum',
    '杭州小吃': 'hangzhou snacks',
    '本帮菜': 'shanghai food',
    '本帮点心': 'shanghai dim sum',
    '本帮面': 'shanghai noodles',
    '上海菜': 'shanghai food',
    '台州菜': 'taizhou seafood',
    '江浙菜': 'jiangzhe cuisine',
    '淮扬菜': 'huaiyang cuisine',
    '苏帮菜': 'suzhou cuisine',
    '苏式面': 'suzhou noodles',
    '南京小吃': 'nanjing food',
    
    # 其他地方菜
    '东北菜': 'dongbei cuisine',
    '湘菜': 'hunan spicy food',
    '闽菜': 'fujian seafood',
    '鲁菜': 'shandong cuisine',
    '清真菜': 'halal chinese food',
    '蒙餐': 'mongolian bbq',
    '藏餐': 'tibetan food',
    '徽菜': 'anhui cuisine',
    '新疆菜': 'xinjiang lamb',
    '云南菜': 'yunnan noodles',
    '白族菜': 'yunnan mushroom',
    '白族小吃': 'yunnan street food',
    '桂林米粉': 'guilin rice noodles',
    '桂林菜': 'guangxi food',
    '椰子鸡': 'coconut chicken',
    '素食': 'vegetarian chinese',
    '肉夹馍': 'roujiamo chinese burger',
    '牛羊肉泡馍': 'xian lamb soup',
    '陕菜': 'shaanxi food',
    '面食': 'chinese noodles',
    '饺子': 'chinese dumplings',
    '台湾菜/小笼包': 'taiwanese food',
    '小吃': 'chinese street food',
    '夜宵': 'chinese night food',
    '炖品': 'chinese stew',
    '创意法餐': 'french chinese fusion',
    '创意菜': 'modern chinese',
    '西餐': 'western steak',
}

def get_search_term(cuisine):
    return CUISINE_MAP.get(cuisine, 'chinese food')

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
    
    print(f'\n=== {city}: {len(data["restaurants"])} ===', flush=True)
    
    # 统计菜系
    cuisines = {}
    for r in data['restaurants']:
        c = r.get('cuisine', 'unknown')
        cuisines[c] = cuisines.get(c, 0) + 1
    
    print(f'  菜系: {len(cuisines)}种', flush=True)
    
    # 为每个菜系预取图片
    cuisine_images = {}
    for cuisine in cuisines:
        term = get_search_term(cuisine)
        img = get_image(term)
        if img:
            cuisine_images[cuisine] = img
            print(f'    {cuisine} -> {term} -> OK', flush=True)
        else:
            print(f'    {cuisine} -> {term} -> FAILED', flush=True)
        time.sleep(3)
    
    # 分配图片给餐厅
    updated = 0
    for r in data['restaurants']:
        cuisine = r.get('cuisine', 'unknown')
        if cuisine in cuisine_images:
            r['imageUrl'] = cuisine_images[cuisine]
            updated += 1
    
    # 保存
    with open(jf, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'  DONE: {updated}/{len(data["restaurants"])}', flush=True)

print('\n=== ALL DONE ===', flush=True)
