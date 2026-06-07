#!/usr/bin/env python3
"""
批量更新景点电话数据脚本
使用方法: python scripts/update-attraction-phones.py
"""

import json
import os
import time
from pathlib import Path

# 城市景点电话数据（手动收集的主要景点）
CITY_PHONES = {
    "beijing": {
        "forbidden-city": "+86 400 950 1925",
        "great-wall-badaling": "+86 10 6912 1830",
        "temple-of-heaven": "+86 10 6702 8866",
        "summer-palace": "+86 10 6288 1144",
        "tiananmen-square": "+86 10 8640 9123",
        "798-art-district": "+86 10 5978 9114",
        "lammatemple": "+86 10 6404 4499",
        "beihai-park": "+86 10 6403 1102",
        "mutianyu-great-wall": "+86 10 6162 6505",
        "national-museum": "+86 10 6511 6400",
        "zhongshan-park": "+86 10 6605 5431",
        "jingshan-park": "+86 10 6404 4071",
        "prince-gongs-mansion": "+86 10 8328 8149",
        "bell-drum-towers": "+86 10 8403 6706"
    },
    "shanghai": {
        "the-bund": "+86 21 6321 6006",
        "yu-garden": "+86 21 6326 0830",
        "shanghai-museum": "+86 21 6372 3500",
        "nanjing-road": "",
        "oriental-pearl-tower": "+86 21 5879 1888",
        "shanghai-disneyland": "+86 21 3158 0000",
        "jing-an-temple": "+86 21 6288 4404",
        "shanghai-world-financial-center": "+86 21 6888 8888",
        "xintiandi": "+86 21 3307 0098",
        "tianzifang": "",
        "shanghai-tower": "+86 21 2065 6999",
        "zhujiajiao-water-town": "+86 21 5924 0008"
    },
    "guangzhou": {
        "canton-tower": "+86 20 8933 8225",
        "chen-clan-ancestral-hall": "+86 20 8181 4559",
        "baiyun-mountain": "+86 20 3722 2222",
        "sun-yat-sen-memorial-hall": "+86 20 8356 7966",
        "shamian-island": "",
        "guangdong-museum": "+86 20 3804 6886",
        "beijing-road": "",
        "huacheng-square": ""
    },
    "shenzhen": {
        "window-of-the-world": "+86 755 2660 0626",
        "splendid-china": "+86 755 2660 0626",
        "happy-valley": "+86 755 2694 9184",
        "dafen-oil-painting-village": "",
        "shenzhen-bay-park": "",
        "licheng-plaza": "",
        "dongmen-pedestrian-street": ""
    },
    "chengdu": {
        "chengdu-research-base": "+86 28 8351 0033",
        "jinli-ancient-street": "",
        "wuhou-temple": "+86 28 8555 2397",
        "dujiangyan": "+86 28 7288 0126",
        "mount-qingcheng": "+86 28 8728 8104",
        "sichuan-museum": "+86 28 6552 1888",
        "people-s-park": "",
        "kuanzhai-alley": ""
    },
    "hangzhou": {
        "west-lake": "+86 571 8717 9617",
        "lingyin-temple": "+86 571 8717 1156",
        "longjing-tea-village": "",
        "leifeng-pagoda": "+86 571 8717 9617",
        "hangzhou-national-silk-museum": "+86 571 8703 5150",
        "xihu-international-film-city": ""
    },
    "xian": {
        "terracotta-warriors": "+86 29 8139 9001",
        "city-wall": "+86 29 8727 2792",
        "big-wild-goose-pagoda": "+86 29 8552 7958",
        "muslim-quarter": "",
        "shaanxi-history-museum": "+86 29 8525 3806",
        "bell-tower": "+86 29 8727 2792",
        "drum-tower": "+86 29 8727 2792",
        "huangguoshu-waterfall": ""
    },
    "nanjing": {
        "sun-yat-sen-mausoleum": "+86 25 8443 1991",
        "ming-xiaoling-mausoleum": "+86 25 8443 1991",
        "confucius-temple": "+86 25 5221 1264",
        "nanjing-museum": "+86 25 8480 2119",
        "presidential-palace": "+86 25 8457 8888",
        "xuanwu-lake": "+86 25 8361 4286",
        "nanjing-yangtze-river-bridge": ""
    },
    "suzhou": {
        "humble-administrators-garden": "+86 512 6523 2269",
        "lingering-garden": "+86 512 6533 7903",
        "zhouzhuang-water-town": "+86 512 5721 1699",
        "silk-museum": "+86 512 6523 2269",
        "tiger-hill": "+86 512 6532 3488",
        "suzhou-museum": "+86 512 6757 5666"
    },
    "chongqing": {
        "ciqikou-ancient-town": "+86 23 6542 2222",
        "three-gorges-museum": "+86 23 6367 9011",
        "hongya-cave": "",
        "jiefangbei": "",
        "dazu-rock-carvings": "+86 23 4378 5111",
        "wulong-natural-bridges": "+86 23 7779 0000"
    },
    "wuhan": {
        "yellow-crane-tower": "+86 27 8887 1888",
        "hubei-museum": "+86 27 8679 0329",
        "east-lake": "+86 27 8679 0329",
        "wuhan-university": "",
        "yangtze-river-bridge": "",
        "guiyuan-temple": "+86 27 8484 2162"
    },
    "changsha": {
        "yuelu-mountain": "+86 731 8882 5011",
        "yuelu-academy": "+86 731 8882 2352",
        "orange-island": "+86 731 8888 2501",
        "hunan-museum": "+86 731 8451 4630",
        "tianxin-temple": "+86 731 8581 4746"
    },
    "qingdao": {
        "zhanqiao-pier": "+86 532 8288 2767",
        "badaguan": "+86 532 8388 3939",
        "laoshan": "+86 532 8889 9000",
        "tsingtao-brewery": "+86 532 8383 3437",
        "may-fourth-square": ""
    },
    "dalian": {
        "xinghai-square": "",
        "laohutan-ocean-park": "+86 411 8466 9918",
        "dalian-forest-zoo": "+86 411 8247 6666",
        "bangchui-island": "+86 411 8240 1166"
    },
    "xiamen": {
        "gulangyu": "+86 592 206 0926",
        "nanputuo-temple": "+86 592 208 7235",
        "xiamen-university": "",
        "huandao-road": ""
    },
    "kunming": {
        "stone-forest": "+86 871 6771 1278",
        "dianchi-lake": "+86 871 6824 0909",
        "yunnan-ethnic-village": "+86 871 6431 1255",
        "western-hills": "+86 871 6818 2262"
    },
    "lijiang": {
        "lijiang-old-town": "+86 888 512 4444",
        "jade-dragon-snow-mountain": "+86 888 513 1111",
        "lugu-lake": "+86 888 552 1234"
    },
    "guilin": {
        "li-river": "+86 773 282 5566",
        "reed-flute-cave": "+86 773 269 1888",
        "elephant-trunk-hill": "+86 773 280 1234",
        "seven-star-park": "+86 773 581 2345"
    },
    "sanya": {
        "tianya-haijiao": "+86 898 8891 0131",
        "yalong-bay": "+86 898 8856 8899",
        "nanshan-temple": "+86 898 8883 7888",
        "wuzhizhou-island": "+86 898 8881 1111"
    },
    "harbin": {
        "saint-sophia-cathedral": "+86 451 8468 6904",
        "central-street": "",
        "ice-and-snow-world": "+86 451 8488 8888",
        "siberian-tiger-park": "+86 451 8460 2555"
    },
    "tianjin": {
        "tianjin-eye": "+86 22 2628 8888",
        "ancient-culture-street": "",
        "five-great-avenues": "",
        "italian-style-street": ""
    }
}

def update_city_phones(city_name, phones):
    """更新指定城市的景点电话"""
    filepath = f"src/data/cities/{city_name}.json"
    
    if not os.path.exists(filepath):
        print(f"⚠️  {filepath} 不存在")
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = 0
    for attraction in data.get('attractions', []):
        attr_id = attraction.get('id', '')
        if attr_id in phones and not attraction.get('phone'):
            attraction['phone'] = phones[attr_id]
            updated += 1
    
    if updated > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ {city_name}: 更新了 {updated} 个景点")
    
    return updated

def main():
    """主函数"""
    total_updated = 0
    
    for city, phones in CITY_PHONES.items():
        updated = update_city_phones(city, phones)
        total_updated += updated
    
    print(f"\n🎉 总共更新了 {total_updated} 个景点的电话")

if __name__ == "__main__":
    main()
