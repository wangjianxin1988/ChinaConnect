"""
Expand hotel data for all cities.
Current: 6 categories × 5 hotels = 30 per city
Target: 6 categories × 30 hotels = 180 per city

Strategy: Generate additional hotels using city-specific naming patterns,
realistic addresses, and Pexels images.
"""
import json, os, random, hashlib

# Hotel name templates by category
HOTEL_TEMPLATES = {
    "luxury": {
        "names": [
            "{city}万达文华酒店", "{city}香格里拉大酒店", "{city}希尔顿酒店",
            "{city}万豪酒店", "{city}洲际酒店", "{city}凯悦酒店",
            "{city}四季酒店", "{city}丽思卡尔顿酒店", "{city}柏悦酒店",
            "{city}半岛酒店", "{city}文华东方酒店", "{city}瑰丽酒店",
            "{city}安缦酒店", "{city}悦榕庄", "{city}索菲特酒店",
            "{city}威斯汀酒店", "{city}瑞吉酒店", "{city}华尔道夫酒店",
            "{city}费尔蒙酒店", "{city}朗廷酒店", "{city}君悦酒店",
            "{city}铂尔曼酒店", "{city}美高梅酒店", "{city}嘉里大酒店",
            "{city}JW万豪酒店", "{city}康莱德酒店", "{city}凯宾斯基酒店",
            "{city}喜来登酒店", "{city}艾美酒店", "{city}W酒店",
        ],
        "namesEn": [
            "Wanda Vista Hotel", "Shangri-La Hotel", "Hilton Hotel",
            "Marriott Hotel", "InterContinental", "Hyatt Regency",
            "Four Seasons Hotel", "The Ritz-Carlton", "Park Hyatt Hotel",
            "The Peninsula", "Mandarin Oriental", "Rosewood Hotel",
            "Aman Resort", "Banyan Tree", "Sofitel Hotel",
            "Westin Hotel", "St. Regis Hotel", "Waldorf Astoria",
            "Fairmont Hotel", "Langham Hotel", "Grand Hyatt Hotel",
            "Pullman Hotel", "MGM Grand", "Kerry Hotel",
            "JW Marriott", "Conrad Hotel", "Kempinski Hotel",
            "Sheraton Hotel", "Le Meridien", "W Hotel",
        ],
        "priceMin": (800, 3000),
        "priceMax": (2000, 8000),
        "highlights": ["五星级服务", "豪华设施", "商务首选", "行政酒廊", "SPA中心", "米其林餐厅"],
    },
    "mid_range": {
        "names": [
            "{city}全季酒店", "{city}亚朵酒店", "{city}维也纳酒店",
            "{city}如家精选酒店", "{city}汉庭优佳酒店", "{city}桔子水晶酒店",
            "{city}锦江都城酒店", "{city}首旅如家酒店", "{city}格林豪泰酒店",
            "{city}智选假日酒店", "{city}宜必思酒店", "{city}美居酒店",
            "{city}诺富特酒店", "{city}凯里亚德酒店", "{city}丽枫酒店",
            "{city}希岸酒店", "{city}潮漫酒店", "{city}ZMAX酒店",
            "{city}城际酒店", "{city}欢朋酒店", "{city}凯悦嘉轩酒店",
            "{city}假日酒店", "{city}精选酒店", "{city}精品酒店",
            "{city}雅高酒店", "{city}美爵酒店", "{city}馨乐庭酒店",
            "{city}盛捷酒店", "{city}辉盛庭酒店", "{city}奥克伍德酒店",
        ],
        "namesEn": [
            "Ji Hotel", "Atour Hotel", "Vienna Hotel",
            "Home Inn Select", "Hanting Premium", "Crystal Orange Hotel",
            "Metropolo Hotel", "BTG Homeinns", "GreenTree Inn",
            "Holiday Inn Express", "Ibis Hotel", "Mercure Hotel",
            "Novotel Hotel", "Kyriad Hotel", "Lavande Hotel",
            "Xana Hotelle", "Chaoman Hotel", "ZMAX Hotel",
            "IntercityHotel", "Hampton Hotel", "Hyatt Place",
            "Holiday Inn", "Choice Hotel", "Boutique Hotel",
            "Accor Hotel", "Grand Mercure", "Citadines Hotel",
            "Somerset Hotel", "Fraser Place", "Oakwood Hotel",
        ],
        "priceMin": (200, 600),
        "priceMax": (400, 1000),
        "highlights": ["舒适商务", "性价比高", "交通便利", "自助早餐", "免费WiFi", "停车场"],
    },
    "budget": {
        "names": [
            "{city}如家酒店", "{city}汉庭酒店", "{city}7天连锁酒店",
            "{city}锦江之星", "{city}格林豪泰", "{city}速8酒店",
            "{city}城市便捷酒店", "{city}尚客优酒店", "{city}怡莱酒店",
            "{city}海友酒店", "{city}百时快捷酒店", "{city}易佰连锁酒店",
            "{city}贝壳酒店", "{city}青年驿站", "{city}途窝酒店",
            "{city}橙客酒店", "{city}都市118酒店", "{city}骏怡连锁酒店",
            "{city}星程酒店", "{city}云上四季酒店", "{city}99旅馆连锁",
            "{city}佳驿酒店", "{city]米兰酒店", "{city}IU酒店",
            "{city}窝趣酒店", "{city}铂涛酒店", "{city}东呈酒店",
            "{city}华住酒店", "{city}亚朵轻居", "{city}轻住酒店",
        ],
        "namesEn": [
            "Home Inn", "Hanting Hotel", "7 Days Inn",
            "Jinjiang Inn", "GreenTree Inn", "Super 8 Hotel",
            "City Comfort Inn", "Thank Inn", "Elan Hotel",
            "Hi Inn", "Bestay Hotel Express", "100 Inn",
            "Shell Hotel", "Youth Hostel", "Towo Hotel",
            "Orange Hotel", "City 118", "Junyi Hotel",
            "Starway Hotel", "Cloud Hotel", "99 Inn",
            "Joy Inn", "Milan Hotel", "IU Hotel",
            "Woqu Hotel", "Plateno Hotel", "Dossen Hotel",
            "Huazhu Hotel", "Atour Light", "Qingzhu Hotel",
        ],
        "priceMin": (80, 200),
        "priceMax": (150, 350),
        "highlights": ["经济实惠", "干净整洁", "位置便利", "24小时热水", "免费WiFi", "连锁品牌"],
    },
    "hostel": {
        "names": [
            "{city}国际青年旅舍", "{city}背包客旅舍", "{city}旅行者之家",
            "{city}蜗牛青年旅舍", "{city}花生青年旅舍", "{city}蓝山青年旅舍",
            "{city}老船长青年旅舍", "{city}熊猫青年旅舍", "{city}在路上旅舍",
            "{city}拖家带口旅舍", "{city}花田青年旅舍", "{city}小熊青年旅舍",
            "{city}绿叶青年旅舍", "{city}阳光青年旅舍", "{city}星辰青年旅舍",
            "{city}彩虹旅舍", "{city}自由行旅舍", "{city}驴友之家",
            "{city}云端旅舍", "{city}海风青年旅舍", "{city}山间旅舍",
            "{city}古城旅舍", "{city}巷子青年旅舍", "{city}时光旅舍",
            "{city}梦想家旅舍", "{city}行者旅舍", "{city}风车旅舍",
            "{city}月光旅舍", "{city}花园旅舍", "{city}故事旅舍",
        ],
        "namesEn": [
            "International Youth Hostel", "Backpacker's Home", "Traveler's House",
            "Snail Youth Hostel", "Peanut Youth Hostel", "Blue Mountain Hostel",
            "Captain's Hostel", "Panda Youth Hostel", "On The Road Hostel",
            "Family Hostel", "Flower Field Hostel", "Bear Youth Hostel",
            "Green Leaf Hostel", "Sunshine Youth Hostel", "Starlight Hostel",
            "Rainbow Hostel", "Free Travel Hostel", "Friends Hostel",
            "Cloud Hostel", "Sea Breeze Hostel", "Mountain Hostel",
            "Old Town Hostel", "Alley Youth Hostel", "Time Hostel",
            "Dreamer Hostel", "Walker Hostel", "Windmill Hostel",
            "Moonlight Hostel", "Garden Hostel", "Story Hostel",
        ],
        "priceMin": (30, 80),
        "priceMax": (60, 150),
        "highlights": ["背包客首选", "社交氛围", "公共厨房", "行李寄存", "旅游咨询", "多人间可选"],
    },
    "love_hotel": {
        "names": [
            "{city}浪漫主题酒店", "{city}蜜月时光酒店", "{city}心悦情侣酒店",
            "{city}爱情海酒店", "{city}玫瑰之约酒店", "{city}月色酒店",
            "{city}星空主题酒店", "{city}童话酒店", "{city}花语酒店",
            "{city}甜蜜之家酒店", "{city}恋人酒店", "{city}倾城之恋酒店",
            "{city}爱巢酒店", "{city}粉色佳人酒店", "{city}水晶之恋酒店",
            "{city}梦幻酒店", "{city}幸福里酒店", "{city}遇见酒店",
            "{city}心动酒店", "{city}情书酒店", "{city}秘密花园酒店",
            "{city}唯爱酒店", "{city}钟情酒店", "{city}缘定酒店",
            "{city}比翼鸟酒店", "{city}心心相印酒店", "{city}执子之手酒店",
            "{city}浪漫满屋酒店", "{city}一见钟情酒店", "{city}花样年华酒店",
        ],
        "namesEn": [
            "Romance Theme Hotel", "Honeymoon Time Hotel", "Xinyue Couple Hotel",
            "Love Sea Hotel", "Rose Promise Hotel", "Moonlight Hotel",
            "Starry Sky Hotel", "Fairy Tale Hotel", "Flower Language Hotel",
            "Sweet Home Hotel", "Lover's Hotel", "Love Story Hotel",
            "Love Nest Hotel", "Pink Lady Hotel", "Crystal Love Hotel",
            "Dreamland Hotel", "Happiness Hotel", "Encounter Hotel",
            "Heartbeat Hotel", "Love Letter Hotel", "Secret Garden Hotel",
            "Only Love Hotel", "Devotion Hotel", "Destiny Hotel",
            "Lovebirds Hotel", "Heart to Heart Hotel", "Hand in Hand Hotel",
            "Full House Love Hotel", "Love at First Sight Hotel", "In the Mood Hotel",
        ],
        "priceMin": (150, 400),
        "priceMax": (300, 800),
        "highlights": ["主题房间", "浪漫氛围", "情侣首选", "特色装修", "隐私保护", "圆床浴缸"],
    },
    "esports_hotel": {
        "names": [
            "{city}电竞酒店", "{city}游戏驿站", "{city}玩家国度酒店",
            "{city}网鱼电竞酒店", "{city}竞界酒店", "{city}超神电竞酒店",
            "{city}开黑酒店", "{city}五杀酒店", "{city}MVP电竞酒店",
            "{city}峡谷酒店", "{city}召唤师酒店", "{city}吃鸡酒店",
            "{city}电竞之家", "{city}游戏蜗牛酒店", "{city}荣耀电竞酒店",
            "{city}王者酒店", "{city}星耀电竞酒店", "{city}传奇电竞酒店",
            "{city}极速电竞酒店", "{city}风暴电竞酒店", "{city}英雄酒店",
            "{city}竞技场酒店", "{city}冠军酒店", "{city}电竞星球酒店",
            "{city}次元酒店", "{city}像素酒店", "{city}电竞梦工厂",
            "{city}夜莺电竞酒店", "{city}战神酒店", "{city}电竞精英酒店",
        ],
        "namesEn": [
            "Esports Hotel", "Gaming Station", "Republic of Gamers Hotel",
            "Wangyu Esports Hotel", "Arena Hotel", "Legendary Esports Hotel",
            "Duo Queue Hotel", "Penta Kill Hotel", "MVP Esports Hotel",
            "Rift Hotel", "Summoner Hotel", "Winner Winner Hotel",
            "Esports Home", "Gaming Snail Hotel", "Glory Esports Hotel",
            "King Hotel", "Star Esports Hotel", "Legend Esports Hotel",
            "Speed Esports Hotel", "Storm Esports Hotel", "Hero Hotel",
            "Arena Hotel", "Champion Hotel", "Esports Planet Hotel",
            "Dimension Hotel", "Pixel Hotel", "Esports Dream Factory",
            "Nightingale Esports Hotel", "War God Hotel", "Esports Elite Hotel",
        ],
        "priceMin": (100, 300),
        "priceMax": (200, 500),
        "highlights": ["高配电脑", "电竞设备", "开黑首选", "机械键盘", "电竞椅", "24小时畅玩"],
    },
}

# City district names
CITY_DISTRICTS = {
    "beijing": ["朝阳区", "海淀区", "东城区", "西城区", "丰台区", "顺义区"],
    "shanghai": ["浦东新区", "黄浦区", "静安区", "徐汇区", "长宁区", "虹口区"],
    "guangzhou": ["天河区", "越秀区", "海珠区", "荔湾区", "白云区", "番禺区"],
    "shenzhen": ["南山区", "福田区", "罗湖区", "宝安区", "龙岗区", "龙华区"],
    "chengdu": ["锦江区", "青羊区", "武侯区", "成华区", "金牛区", "高新区"],
    "chongqing": ["渝中区", "江北区", "南岸区", "沙坪坝区", "九龙坡区", "渝北区"],
    "hangzhou": ["西湖区", "上城区", "拱墅区", "滨江区", "萧山区", "余杭区"],
    "nanjing": ["玄武区", "秦淮区", "鼓楼区", "建邺区", "栖霞区", "雨花台区"],
    "wuhan": ["武昌区", "江岸区", "江汉区", "洪山区", "汉阳区", "东湖高新区"],
    "xian": ["碑林区", "莲湖区", "新城区", "雁塔区", "未央区", "长安区"],
}

# Default districts for cities not listed above
DEFAULT_DISTRICTS = ["市中心", "商业区", "火车站附近", "景区附近", "新区", "老城区"]

# Pexels image URLs for hotels
PEXELS_HOTEL_IMAGES = [
    "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/261395/pexels-photo-261395.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/258154/pexels-phone-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
]

# City area codes
CITY_PHONES = {
    "beijing": "010", "shanghai": "021", "guangzhou": "020", "shenzhen": "0755",
    "chengdu": "028", "chongqing": "023", "hangzhou": "0571", "nanjing": "025",
    "wuhan": "027", "xian": "029", "tianjin": "022", "suzhou": "0512",
    "changsha": "0731", "qingdao": "0532", "dalian": "0411", "xiamen": "0592",
    "harbin": "0451", "kunming": "0871", "jinan": "0531", "fuzhou": "0591",
    "lanzhou": "0931", "guiyang": "0851", "nanning": "0771",
    "xining": "0971", "chengde": "0314", "dali": "0872", "dunhuang": "0937",
    "guilin": "0773", "hulunbuir": "0470", "lijiang": "0888", "luoyang": "0379",
    "quanzhou": "0595", "sanya": "0898", "weihai": "0631", "yantai": "0535",
    "zhangjiajie": "0744", "ningbo": "0574",
}

# City Chinese names
CITY_NAMES = {
    "beijing": "北京", "shanghai": "上海", "guangzhou": "广州", "shenzhen": "深圳",
    "chengdu": "成都", "chongqing": "重庆", "hangzhou": "杭州", "nanjing": "南京",
    "wuhan": "武汉", "xian": "西安", "tianjin": "天津", "suzhou": "苏州",
    "changsha": "长沙", "qingdao": "青岛", "dalian": "大连", "xiamen": "厦门",
    "harbin": "哈尔滨", "kunming": "昆明", "jinan": "济南", "fuzhou": "福州",
    "lanzhou": "兰州", "guiyang": "贵阳", "nanning": "南宁",
    "xining": "西宁", "chengde": "承德", "dali": "大理", "dunhuang": "敦煌",
    "guilin": "桂林", "hulunbuir": "呼伦贝尔", "lijiang": "丽江", "luoyang": "洛阳",
    "quanzhou": "泉州", "sanya": "三亚", "weihai": "威海", "yantai": "烟台",
    "zhangjiajie": "张家界", "ningbo": "宁波",
}

os.chdir('D:/suoyouxiangmu/chinaconnect/src/data/hotels')

for fname in sorted(os.listdir('.')):
    if not fname.endswith('-hotels.ts') or fname.endswith('.bak'):
        continue
    
    city = fname.replace('-hotels.ts', '')
    city_zh = CITY_NAMES.get(city, city.title())
    area_code = CITY_PHONES.get(city, "010")
    districts = CITY_DISTRICTS.get(city, DEFAULT_DISTRICTS)
    
    # Read existing file
    content = open(fname, 'r', encoding='utf-8').read()
    
    # Extract existing hotel IDs to avoid duplicates
    import re
    existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', content))
    
    # Count existing hotels per category
    cat_counts = {}
    for cat in re.findall(r'"category":\s*"([^"]+)"', content):
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    
    # Generate new hotels for categories that need more
    new_hotels = []
    for cat, template in HOTEL_TEMPLATES.items():
        existing = cat_counts.get(cat, 0)
        needed = max(0, 30 - existing)
        
        for i in range(needed):
            idx = existing + i
            name_zh = template["names"][i % len(template["names"])].replace("{city}", city_zh)
            name_en = template["namesEn"][i % len(template["namesEn"])]
            
            hotel_id = f"{city}-{cat}-{idx+1:03d}"
            if hotel_id in existing_ids:
                continue
            
            district = districts[i % len(districts)]
            
            # Generate deterministic price from ID hash
            h = hashlib.md5(hotel_id.encode()).hexdigest()
            price_factor = int(h[:4], 16) / 65536
            
            price_min = int(template["priceMin"][0] + price_factor * (template["priceMin"][1] - template["priceMin"][0]))
            price_max = int(template["priceMax"][0] + price_factor * (template["priceMax"][1] - template["priceMax"][0]))
            
            # Generate phone
            phone_num = int(h[4:12], 16) % 100000000
            phone = f"+86 {area_code} {phone_num:08d}"[:20]
            
            # Pick image
            img_idx = int(h[:2], 16) % len(PEXELS_HOTEL_IMAGES)
            image = PEXELS_HOTEL_IMAGES[img_idx]
            
            # Pick highlights
            hl = template["highlights"]
            highlights = [hl[i % len(hl)], hl[(i+1) % len(hl)], hl[(i+2) % len(hl)]]
            
            rating = round(3.5 + price_factor * 1.5, 1)
            
            new_hotels.append({
                "id": hotel_id,
                "name": name_zh,
                "nameEn": name_en,
                "category": cat,
                "priceMin": price_min,
                "priceMax": price_max,
                "city": city,
                "cityZh": city_zh,
                "district": district,
                "address": f"{district}{random.randint(1,200)}号",
                "rating": rating,
                "image": image,
                "phone": phone,
                "highlights": highlights,
            })
    
    if not new_hotels:
        print(f'{city}: already has enough hotels')
        continue
    
    # Insert new hotels into the file
    # Find the closing of the array
    insert_point = content.rfind('];')
    if insert_point == -1:
        print(f'{city}: could not find array end')
        continue
    
    # Build insertion text
    insert_lines = []
    for h in new_hotels:
        insert_lines.append('  {')
        for k, v in h.items():
            if isinstance(v, list):
                insert_lines.append(f'    "{k}": {json.dumps(v, ensure_ascii=False)},')
            elif isinstance(v, str):
                insert_lines.append(f'    "{k}": "{v}",')
            elif isinstance(v, (int, float)):
                insert_lines.append(f'    "{k}": {v},')
        insert_lines.append('  },')
    
    insert_text = '\n'.join(insert_lines) + '\n'
    
    new_content = content[:insert_point] + insert_text + content[insert_point:]
    
    # Update the comment at the top
    total_new = sum(cat_counts.get(c, 0) for c in HOTEL_TEMPLATES) + len(new_hotels)
    new_content = re.sub(
        r'Total: \d+ hotels.*',
        f'Total: {total_new} hotels (6 categories × 30+ hotels)',
        new_content
    )
    
    open(fname, 'w', encoding='utf-8').write(new_content)
    print(f'{city}: added {len(new_hotels)} hotels (total: {total_new})')

print('\nDone!')
