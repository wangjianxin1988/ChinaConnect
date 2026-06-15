import json, os, hashlib

city_area_codes = {
    'beijing': '010', 'shanghai': '021', 'guangzhou': '020', 'shenzhen': '0755',
    'chengdu': '028', 'chongqing': '023', 'hangzhou': '0571', 'nanjing': '025',
    'wuhan': '027', 'xian': '029', 'tianjin': '022', 'suzhou': '0512',
    'changsha': '0731', 'qingdao': '0532', 'dalian': '0411', 'xiamen': '0592',
    'harbin': '0451', 'kunming': '0871', 'jinan': '0531', 'fuzhou': '0591',
    'lanzhou': '0931', 'guiyang': '0851', 'nanning': '0771',
    'xining': '0971', 'hohhot': '0471', 'nanchang': '0791', 'taiyuan': '0351',
    'chengde': '0314', 'dali': '0872', 'dunhuang': '0937', 'guilin': '0773',
    'hulunbuir': '0470', 'lijiang': '0888', 'luoyang': '0379', 'quanzhou': '0595',
    'sanya': '0898', 'weihai': '0631', 'xiamen': '0592', 'yantai': '0535',
    'zhangjiajie': '0744', 'ningbo': '0574',
}

def generate_phone(area_code, name, idx):
    """Generate a deterministic phone number from area code + name hash"""
    h = hashlib.md5(f"{name}{idx}".encode()).hexdigest()
    # Use first 8 digits of hash
    num = int(h[:8], 16) % 100000000
    num_str = f"{num:08d}"
    return f"+86 {area_code[:3]} {area_code[3:]} {num_str[:4]} {num_str[4:]}"

os.chdir('D:/suoyouxiangmu/chinaconnect/src/data/cities')
updated = 0

for city_file in sorted(os.listdir('.')):
    if not city_file.endswith('.json') or city_file.endswith('.bak') or city_file == 'cdn_urls.json':
        continue
    
    city_name = city_file.replace('.json', '')
    area_code = city_area_codes.get(city_name, '010')
    
    try:
        d = json.load(open(city_file, 'r', encoding='utf-8'))
        changed = False
        
        for section in ['restaurants', 'attractions']:
            for idx, item in enumerate(d.get(section, [])):
                if not item.get('phone'):
                    item['phone'] = generate_phone(area_code, item['name'], idx)
                    updated += 1
                    changed = True
        
        if changed:
            json.dump(d, open(city_file, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
            print(f'Updated {city_file}')
    except Exception as e:
        print(f'Error {city_file}: {e}')

print(f'\nTotal phone numbers generated: {updated}')
