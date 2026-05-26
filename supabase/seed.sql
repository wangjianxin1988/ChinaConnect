-- ============================================================
-- ChinaConnect Seed Data
-- 6 MVP Cities: Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin
-- ============================================================

-- ============================================================
-- CITIES SEED DATA
-- ============================================================

INSERT INTO cities (id, name_en, name_zh, slug, country, province, lat, lng, population, timezone, description, description_zh, cover_image_url, climate, best_season, cost_level, airport_code, high_speed_rail_available) VALUES
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Beijing',
    '北京',
    'beijing',
    'China',
    'Beijing',
    39.9042,
    116.4074,
    21540000,
    'Asia/Shanghai',
    'The capital of China, a city where ancient history meets modern marvels. Home to the Forbidden City, Great Wall, and countless cultural treasures.',
    '中国的首都，古老历史与现代奇迹交融的城市。故宫、长城以及无数文化遗产的所在地。',
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
    'Humid continental',
    ARRAY['Spring', 'Autumn'],
    4,
    'PEK',
    true
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Shanghai',
    '上海',
    'shanghai',
    'China',
    'Shanghai',
    31.2304,
    121.4737,
    24280000,
    'Asia/Shanghai',
    'China''s largest city and global financial hub. A dazzling blend of colonial architecture, modern skyscrapers, and vibrant street culture.',
    '中国最大的城市和全球金融中心。殖民建筑、现代摩天大楼与充满活力的街头文化交相辉映。',
    'https://images.unsplash.com/photo-1537531383496-f4749c8dc2bc',
    'Humid subtropical',
    ARRAY['Spring', 'Autumn'],
    5,
    'PVG',
    true
),
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Guangzhou',
    '广州',
    'guangzhou',
    'China',
    'Guangdong',
    23.1291,
    113.2644,
    15300000,
    'Asia/Shanghai',
    'The birthplace of Cantonese culture and Southern Chinese commerce. Known for its incredible food scene and rich trading history.',
    '岭南文化和华南商业的发源地。以卓越的美食文化和丰富的贸易历史闻名。',
    'https://images.unsplash.com/photo-1541320841170-a8d55f05f3d8',
    'Humid subtropical',
    ARRAY['Autumn', 'Winter'],
    3,
    'CAN',
    true
),
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    "Xi''an",
    '西安',
    'xian',
    'China',
    'Shaanxi',
    34.3416,
    108.9398,
    13000000,
    'Asia/Shanghai',
    'Ancient capital of China and home to the Terracotta Army. One of the oldest cities in China with over 3,000 years of history.',
    '中国古代首都，兵马俑的所在地。中国最古老的城市之一，拥有超过3000年历史。',
    'https://images.unsplash.com/photo-1591017311415-35c5a5a0e6f2',
    'Humid continental',
    ARRAY['Spring', 'Autumn'],
    2,
    'XIY',
    true
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Chengdu',
    '成都',
    'chengdu',
    'China',
    'Sichuan',
    30.5728,
    104.0668,
    21400000,
    'Asia/Shanghai',
    'Capital of Sichuan province and gateway to the giant panda base. Famous for spicy cuisine, tea culture, and relaxed lifestyle.',
    '四川省省会，大熊猫基地的门户。以麻辣美食、茶文化和悠闲生活方式闻名。',
    'https://images.unsplash.com/photo-1584255598329-83603e2b57d9',
    'Humid subtropical',
    ARRAY['Spring', 'Autumn'],
    2,
    'CTU',
    true
),
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'Guilin',
    '桂林',
    'guilin',
    'China',
    'Guangxi',
    25.2744,
    110.2900,
    5300000,
    'Asia/Shanghai',
    'Famous for its karst landscape and Li River cruises. One of China''s most scenic destinations with limestone peaks rising from rice paddies.',
    '以喀斯特地貌和漓江游船闻名。中国最风景秀丽的旅游目的地之一，石灰岩山峰从稻田中拔地而起。',
    'https://images.unsplash.com/photo-1530789253408-6b4e98e0e6e7',
    'Humid subtropical',
    ARRAY['Spring', 'Autumn'],
    2,
    'KWL',
    true
);

-- ============================================================
-- ATTRACTIONS SEED DATA
-- ============================================================

-- Beijing Attractions
INSERT INTO attractions (city_id, name_en, name_zh, slug, type, lat, lng, address, rating, price_min, opening_hours, description, description_zh, tags, avg_visit_duration) VALUES
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Forbidden City',
    '故宫',
    'forbidden-city',
    'landmark',
    39.9163,
    116.3972,
    '4 Jingshan Front St, Dongcheng District',
    4.80,
    60,
    '{"mon": "08:30-17:00", "tue": "08:30-17:00", "wed": "08:30-17:00", "thu": "08:30-17:00", "fri": "08:30-17:00", "sat": "08:30-17:00", "sun": "08:30-17:00"}',
    'The imperial palace complex from the Ming and Qing dynasties. A UNESCO World Heritage Site with 980 buildings and 72 hectares of grounds.',
    '明清时期的皇家宫殿建筑群。联合国教科文组织世界遗产，拥有980座建筑和72公顷的土地。',
    ARRAY['UNESCO', 'History', 'Architecture'],
    240
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Great Wall Mutianyu Section',
    '慕田峪长城',
    'great-wall-mutianyu',
    'nature',
    40.4319,
    116.5700,
    'Mutianyu, Huairou District',
    4.75,
    45,
    '{"daily": "07:30-18:00"}',
    'One of the best-preserved sections of the Great Wall with 22 watchtowers. Features restored battlements and stunning mountain views.',
    '保存最完好的长城段落之一，拥有22座敌楼。以修复的垛口和壮观的山景著称。',
    ARRAY['UNESCO', 'History', 'Outdoor'],
    180
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Temple of Heaven',
    '天坛',
    'temple-of-heaven',
    'temple',
    39.8829,
    116.4066,
    '1 Tiantan Rd, Dongcheng District',
    4.60,
    34,
    '{"daily": "08:00-17:00"}',
    'UNESCO World Heritage Site where emperors performed annual ceremonies. Features the iconic Circular Altar and Imperial Vault of Heaven.',
    '皇帝举行年度仪式的世界遗产地标。以标志性的圆丘和皇穹宇著称。',
    ARRAY['UNESCO', 'History', 'Architecture'],
    120
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Summer Palace',
    '颐和园',
    'summer-palace',
    'park',
    39.9998,
    116.2748,
    '19 Kunlun Rd, Haidian District',
    4.70,
    30,
    '{"daily": "06:30-20:00"}',
    'Imperial garden from 1750 featuring Kunming Lake and Longevity Hill. The largest royal garden in existence with stunning natural scenery.',
    '1750年建造的皇家园林，以昆明湖和万寿山为特色。现存最大的皇家园林，自然风光秀丽。',
    ARRAY['UNESCO', 'History', 'Garden'],
    180
);

-- Shanghai Attractions
INSERT INTO attractions (city_id, name_en, name_zh, slug, type, lat, lng, address, rating, price_min, opening_hours, description, description_zh, tags, avg_visit_duration) VALUES
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'The Bund',
    '外滩',
    'the-bund',
    'landmark',
    31.2400,
    121.4918,
    'Zhongshan E Rd, Huangpu District',
    4.70,
    0,
    '{"daily": "00:00-24:00"}',
    'Shanghai''s iconic waterfront promenade with colonial-era buildings on one side and modern skyscrapers on the other.',
    '上海标志性的滨水大道，一侧是殖民时期的建筑，另一侧是现代摩天大楼。',
    ARRAY['Architecture', 'Night View', 'Free'],
    90
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Yu Garden',
    '豫园',
    'yu-garden',
    'park',
    31.2282,
    121.4892,
    '218 Anren St, Huangpu District',
    4.55,
    30,
    '{"daily": "09:00-17:00"}',
    'Classical Chinese garden from the Ming dynasty with pavilions, rockeries, and lotus ponds. Located in the old city center.',
    '明代古典园林，拥有亭台、假山和荷花池。位于老城中心。',
    ARRAY['UNESCO', 'History', 'Garden'],
    120
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Shanghai Tower',
    '上海中心大厦',
    'shanghai-tower',
    'landmark',
    31.2357,
    121.5018,
    '501 Yincheng Central Rd, Pudong',
    4.50,
    180,
    '{"daily": "08:30-22:00"}',
    'China''s tallest building at 632m with the world''s highest observation deck at 118th floor.',
    '中国最高建筑，高632米，拥有世界上最高的118层观景台。',
    ARRAY['Skyline', 'Modern', 'Views'],
    90
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Nanjing Road',
    '南京路步行街',
    'nanjing-road',
    'shopping',
    31.2360,
    121.4730,
    'Nanjing E Rd, Huangpu District',
    4.30,
    0,
    '{"daily": "00:00-24:00"}',
    'The world''s longest shopping street with over 600 shops. From People''s Square to the Bund.',
    '世界最长的商业街，拥有600多家商店。从人民广场到外滩。',
    ARRAY['Shopping', 'Free', 'Walking'],
    120
);

-- Guangzhou Attractions
INSERT INTO attractions (city_id, name_en, name_zh, slug, type, lat, lng, address, rating, price_min, opening_hours, description, description_zh, tags, avg_visit_duration) VALUES
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Canton Tower',
    '广州塔',
    'canton-tower',
    'landmark',
    23.1184,
    113.3214,
    '1 Yuejiang W Rd, Haizhu District',
    4.45,
    150,
    '{"daily": "09:30-22:00"}',
    'The second-tallest TV tower in China at 600m. Known as the "Slim Waist" for its elegant shape.',
    '中国第二高电视塔，高600米。因优雅的外形被称为"小蛮腰"。',
    ARRAY['Skyline', 'Night View', 'Views'],
    90
),
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Shangxiajiu Pedestrian Street',
    '上下九步行街',
    'shangxiajiu',
    'shopping',
    23.1379,
    113.2596,
    'Shangxiajiu St, Liwan District',
    4.20,
    0,
    '{"daily": "00:00-24:00"}',
    'Historic commercial street with Cantonese architecture. Famous for traditional snacks and local brands.',
    '拥有岭南建筑风格的历史商业街。以传统小吃和本地品牌闻名。',
    ARRAY['Shopping', 'Food', 'Free'],
    90
),
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Chen Clan Ancestral Hall',
    '陈家祠',
    'chen-clan-ancestral-hall',
    'museum',
    23.1313,
    113.2485,
    '34 Enlong Li, Liwan District',
    4.50,
    10,
    '{"daily": "09:00-17:30"}',
    'Traditional clan hall from Qing dynasty showcasing exquisite Guangdong architecture and crafts.',
    '清代传统宗祠，展示精美的岭南建筑和工艺。',
    ARRAY['History', 'Architecture', 'Culture'],
    90
);

-- Xi'an Attractions
INSERT INTO attractions (city_id, name_en, name_zh, slug, type, lat, lng, address, rating, price_min, opening_hours, description, description_zh, tags, avg_visit_duration) VALUES
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'Terracotta Army',
    '秦始皇兵马俑',
    'terracotta-army',
    'museum',
    34.3843,
    109.2784,
    'Linfeng District, Xi''an',
    4.85,
    120,
    '{"daily": "08:30-18:00"}',
    'UNESCO World Heritage Site with over 8,000 life-sized terracotta warriors. One of the greatest archaeological discoveries of the 20th century.',
    '拥有8000多尊真人大小的兵马俑的联合国遗产地。20世纪最伟大的考古发现之一。',
    ARRAY['UNESCO', 'History', 'Museum'],
    180
),
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'City Wall',
    '西安城墙',
    'xian-city-wall',
    'landmark',
    34.2633,
    108.9472,
    'Zhongshuan Area, Xincheng District',
    4.60,
    54,
    '{"daily": "08:00-22:00"}',
    'Complete Ming dynasty city wall with 14km circumference. You can rent a bike to ride along the top.',
    '完整的明代城墙，周长14公里。可以租自行车在城墙上骑行。',
    ARRAY['History', 'Cycling', 'Architecture'],
    150
),
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'Big Wild Goose Pagoda',
    '大雁塔',
    'big-wild-goose-pagoda',
    'temple',
    34.2177,
    108.9637,
    '1 Shaanxi Temple, Yanta District',
    4.50,
    25,
    '{"daily": "08:00-17:30"}',
    'Tang dynasty Buddhist pagoda built in 652 AD. The oldest and largest pagoda in China with 7 stories.',
    '652年建造的唐代佛塔。中国最古老最大的佛塔，共7层。',
    ARRAY['History', 'Buddhism', 'Architecture'],
    90
);

-- Chengdu Attractions
INSERT INTO attractions (city_id, name_en, name_zh, slug, type, lat, lng, address, rating, price_min, opening_hours, description, description_zh, tags, avg_visit_duration) VALUES
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Giant Panda Base',
    '成都大熊猫繁育研究基地',
    'chengdu-panda-base',
    'nature',
    30.7388,
    104.1525,
    '26 Xiongmao Ave, Chenghua District',
    4.80,
    55,
    '{"daily": "07:30-18:00"}',
    'The largest giant panda research base in the world with over 80 pandas. Best visited in the morning when pandas are most active.',
    '世界上最大的大熊猫研究基地，拥有80多只大熊猫。最佳参观时间为早晨，此时熊猫最活跃。',
    ARRAY['Wildlife', 'Conservation', 'Family'],
    180
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'People''s Park',
    '人民公园',
    'chengdu-peoples-park',
    'park',
    30.6634,
    104.0624,
    '12 Guanjing St, Qingyang District',
    4.40,
    0,
    '{"daily": "06:00-22:00"}',
    'Chengdu''s most beloved park with teahouses, ancient banyan trees, and the famous matchmaking corner.',
    '成都最受喜爱的公园，有茶馆、古老榕树和著名的相亲角。',
    ARRAY['Culture', 'Teahouse', 'Free'],
    90
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Jinsha Site Museum',
    '金沙遗址博物馆',
    'jinsha-museum',
    'museum',
    30.6976,
    104.0567,
    '2 Jinsha Rd, Qingyang District',
    4.55,
    70,
    '{"daily": "08:00-18:00"}',
    'Archaeological site of the ancient Shu kingdom from 3000 years ago. Features the famous Sun and Moon symbolic gold mask.',
    '3000年前的古蜀王国考古遗址。以著名的太阳和月亮符号金面具著称。',
    ARRAY['History', 'Archaeology', 'Culture'],
    120
);

-- Guilin Attractions
INSERT INTO attractions (city_id, name_en, name_zh, slug, type, lat, lng, address, rating, price_min, opening_hours, description, description_zh, tags, avg_visit_duration) VALUES
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'Li River Cruise',
    '漓江游船',
    'li-river-cruise',
    'nature',
    25.2776,
    110.2944,
    'Zhongshan南路, Guilin',
    4.75,
    210,
    '{"daily": "08:00-16:00"}',
    'World-famous scenic cruise through karst mountains. The 83km journey from Guilin to Yangshuo is considered one of the most beautiful river trips in the world.',
    '穿越喀斯特山脉的世界著名观光游船。从桂林到阳朔的83公里旅程被认为是世界上最美丽的河流之旅之一。',
    ARRAY['Scenic', 'Nature', 'Boat'],
    300
),
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'Elephant Trunk Hill',
    '象鼻山',
    'elephant-trunk-hill',
    'landmark',
    25.2621,
    110.2972,
    'Ring Rd, Guilin',
    4.50,
    55,
    '{"daily": "06:30-18:30"}',
    'Iconic karst formation that resembles an elephant drinking from the river. Guilin''s most recognized landmark.',
    '形似大象喝水的标志性喀斯特地貌。桂林最受认可的标志性景点。',
    ARRAY['Scenic', 'Nature', 'Photo'],
    90
),
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'Reed Flute Cave',
    '芦笛岩',
    'reed-flute-cave',
    'nature',
    25.3213,
    110.3388,
    'Canton Fair 1st Rd, Guilin',
    4.60,
    120,
    '{"daily": "08:00-17:30"}',
    'Magnificent limestone cave with 70 million years of geological history. Features colorful lighting and impressive stalactites.',
    '拥有7000万年地质历史的壮观石灰岩洞穴。以彩色灯光和壮观的钟乳石著称。',
    ARRAY['Nature', 'Cave', 'Geology'],
    90
);

-- ============================================================
-- RESTAURANTS SEED DATA
-- ============================================================

-- Beijing Restaurants
INSERT INTO restaurants (city_id, name_en, name_zh, slug, cuisine, cuisine_zh, price_range, address, rating, avg_cost, opening_hours, description, description_zh, tags) VALUES
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Quanjude Roast Duck',
    '全聚德烤鸭',
    'quanjude',
    'Peking Duck',
    '北京烤鸭',
    4,
    '14 Qianmen St, Dongcheng District',
    4.50,
    250,
    '{"daily": "10:30-22:00"}',
    'The most famous Peking duck restaurant chain since 1864. Traditional wood-fired roasting method.',
    '1864年创立的最著名北京烤鸭连锁店。传统木火烤制方法。',
    ARRAY['Peking Duck', 'Traditional', 'Historic']
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Donghuamen Night Market',
    '东华门夜市',
    'donghuamen-night-market',
    'Street Food',
    '街头小吃',
    1,
    'Donghuamen St, Dongcheng District',
    4.20,
    50,
    '{"daily": "17:00-23:00"}',
    'Famous night market near the Forbidden City with various Chinese street foods and snacks.',
    '故宫附近以各种中式街头小吃闻名的夜市。',
    ARRAY['Street Food', 'Night Market', 'Local']
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Haidilao Hotpot',
    '海底捞火锅',
    'haidilao-beijing',
    'Hotpot',
    '火锅',
    3,
    'Wangfujing Area',
    4.60,
    150,
    '{"daily": "24 hours"}',
    'Famous chain with exceptional service. Offers DIY manicures and games while waiting.',
    '以卓越服务闻名的连锁店。等位时提供免费美甲和游戏。',
    ARRAY['Hotpot', 'Service', 'Popular']
);

-- Shanghai Restaurants
INSERT INTO restaurants (city_id, name_en, name_zh, slug, cuisine, cuisine_zh, price_range, address, rating, avg_cost, opening_hours, description, description_zh, tags) VALUES
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Din Tai Fung',
    '鼎泰丰',
    'din-tai-fung-shanghai',
    'Taiwanese',
    '台式',
    4,
    'Shanghai Centre, 1376 Nanjing W Rd',
    4.65,
    180,
    '{"daily": "11:00-21:30"}',
    'World-renowned xiaolongbao (soup dumpling) restaurant from Taiwan. Consistently ranked as one of the world''s best.',
    '来自台湾的世界知名小笼包（汤包）餐厅。持续被评为世界最佳餐厅之一。',
    ARRAY['Xiaolongbao', 'Michelin', 'Popular']
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'South Malan Restaurant',
    '南马来西亚路餐厅',
    'south-malan',
    'Shanghainese',
    '沪菜',
    3,
    'South Malan Rd, Huangpu District',
    4.40,
    100,
    '{"daily": "11:00-14:00, 17:00-21:00"}',
    'Classic Shanghainese cuisine in an old shikumen house. Known for red-braised pork and scallion oil noodles.',
    '老石库门建筑中的经典沪菜。以红烧肉和葱油拌面著称。',
    ARRAY['Shanghainese', 'Historic', 'Local']
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Jade Garden',
    '玉花园',
    'jade-garden-shanghai',
    'Cantonese',
    '粤菜',
    4,
    'Xujiahui, Pudong',
    4.55,
    300,
    '{"daily": "11:00-14:30, 18:00-22:00"}',
    'Michelin-starred dim sum in elegant surroundings. Famous for har gow and phoenix claws.',
    '优雅环境中的米其林星级点心店。以虾饺和凤爪著称。',
    ARRAY['Dim Sum', 'Michelin', 'Cantonese']
);

-- Chengdu Restaurants
INSERT INTO restaurants (city_id, name_en, name_zh, slug, cuisine, cuisine_zh, price_range, address, rating, avg_cost, opening_hours, description, description_zh, tags) VALUES
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Shu Daxia',
    '蜀大侠火锅',
    'shu-daxia',
    'Sichuan Hotpot',
    '四川火锅',
    3,
    'Jinjiang District',
    4.60,
    100,
    '{"daily": "10:00-23:00"}',
    'Popular Sichuan hotpot chain with excellent mala (spicy numbing) broth. Great atmosphere with indoor seating.',
    '以优质麻辣汤底著称的四川火锅连锁。室内环境氛围佳。',
    ARRAY['Hotpot', 'Sichuan', 'Spicy']
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Bai Jia Da Yuan',
    '白家大院',
    'bai-jia-da-yuan',
    'Sichuan',
    '川菜',
    4,
    'Wuhou District',
    4.70,
    200,
    '{"daily": "11:00-21:30"}',
    'Traditional Sichuan restaurant in a classical Chinese garden. Famous for gongbao chicken and mapo tofu.',
    '古典中式园林中的传统川菜馆。以宫保鸡丁和麻婆豆腐著称。',
    ARRAY['Sichuan', 'Traditional', 'Garden']
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Jian Chang Li',
    '建设路小吃街',
    'jian-chang-li',
    'Street Food',
    '街头小吃',
    1,
    'Jianshe Rd, Chenghua District',
    4.30,
    40,
    '{"daily": "17:00-24:00"}',
    'The most famous street food area in Chengdu with dozens of local specialties. Known for spiced chicken feet and rabbit head.',
    '成都最著名的美食街，拥有数十种本地特色小吃。以麻辣鸡爪和兔头著称。',
    ARRAY['Street Food', 'Night Market', 'Local']
);

-- Xi'an Restaurants
INSERT INTO restaurants (city_id, name_en, name_zh, slug, cuisine, cuisine_zh, price_range, address, rating, avg_cost, opening_hours, description, description_zh, tags) VALUES
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'De Fa Chang',
    '德发长饺子馆',
    'de-fa-chang',
    'Dumplings',
    '饺子',
    3,
    'Bell Tower Area',
    4.50,
    80,
    '{"daily": "10:00-22:00"}',
    'Famous for handmade dumplings since 1921. Offers over 100 varieties including the famous "Eight Treasures" dumplings.',
    '自1921年起以手工饺子闻名。提供超过100种饺子，包括著名的"八宝"饺子。',
    ARRAY['Dumplings', 'Traditional', 'Historic']
),
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'Luo Yang Pin Pa Mo',
    '洛阳烩面馆',
    'luo-yang-pa-mo',
    'Shaanxi',
    '陕西菜',
    2,
    'South Street, Beilin District',
    4.40,
    40,
    '{"daily": "07:00-21:00"}',
    'Local favorite for hand-pulled noodles in rich mutton broth. Simple atmosphere but amazing food.',
    '以羊肉汤底的拉面著称的本地人喜爱之选。环境简单但食物美味。',
    ARRAY['Noodles', 'Local', 'Budget']
);

-- Guangzhou Restaurants
INSERT INTO restaurants (city_id, name_en, name_zh, slug, cuisine, cuisine_zh, price_range, address, rating, avg_cost, opening_hours, description, description_zh, tags) VALUES
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Lai Wah Heen',
    '丽华轩',
    'lai-wah-heen',
    'Cantonese',
    '粤菜',
    5,
    'China Hotel, 18 Liuhua Rd',
    4.75,
    400,
    '{"daily": "11:30-14:30, 18:00-22:30"}',
    'Michelin two-star Cantonese restaurant with elegant decor. Famous for bird''s nest and abalone dishes.',
    '环境优雅的米其林二星粤菜馆。以燕窝和鲍鱼菜品著称。',
    ARRAY['Michelin', 'Cantonese', 'Upscale']
),
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Bai Sha Ling',
    '白沙岭',
    'bai-sha-ling',
    'Dim Sum',
    '点心',
    3,
    'Tianhe District',
    4.60,
    120,
    '{"daily": "06:30-15:00, 17:30-22:00"}',
    'Local dim sum institution popular since 1963. Famous for har gow, siu mai and egg tarts.',
    '自1963年起受欢迎的本地点心店。以虾饺、烧麦和蛋挞著称。',
    ARRAY['Dim Sum', 'Local', 'Traditional']
);

-- Guilin Restaurants
INSERT INTO restaurants (city_id, name_en, name_zh, slug, cuisine, cuisine_zh, price_range, address, rating, avg_cost, opening_hours, description, description_zh, tags) VALUES
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'Shan Hu Lake Restaurant',
    '杉湖酒家',
    'shan-hu-lake',
    'Guilin',
    '桂林菜',
    3,
    'Ronghu Lake Area',
    4.40,
    80,
    '{"daily": "10:00-21:30"}',
    'Lakefront restaurant serving local Guilin specialties. Famous for Guilin rice noodles and beer fish.',
    '湖畔餐厅，供应当地桂林特色菜。以桂林米粉和啤酒鱼著称。',
    ARRAY['Local', 'Lake View', 'Specialty']
);

-- ============================================================
-- EMERGENCY INFO SEED DATA
-- ============================================================

-- Beijing Emergency
INSERT INTO emergency_info (city_id, type, name, name_zh, phone, phone_international, address, opening_hours, is_24h) VALUES
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'police',
    'Beijing Police Tourist Hotline',
    '北京公安旅游热线',
    '110',
    '+86-10-110',
    'Downtown Beijing',
    '24 hours',
    true
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'hospital',
    'Peking Union Medical College Hospital',
    '北京协和医院',
    '+86-10-6915-5614',
    '+86-10-6915-5614',
    '1 Shuaifuyuan, Dongcheng District',
    '24 hours',
    true
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'tourist_police',
    'Beijing Tourist Police Station',
    '北京旅游警察大队',
    '+86-10-6513-0123',
    '+86-10-6513-0123',
    'Near Tiananmen Square',
    '08:00-20:00',
    false
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'embassy',
    'US Embassy Beijing',
    '美国驻华大使馆',
    '+86-10-8531-3000',
    '+86-10-8531-3000',
    '55 Anjialou Rd, Chaoyang District',
    'Mon-Fri 08:30-17:00',
    false
);

-- Shanghai Emergency
INSERT INTO emergency_info (city_id, type, name, name_zh, phone, phone_international, address, opening_hours, is_24h) VALUES
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'police',
    'Shanghai Police Tourist Hotline',
    '上海公安旅游热线',
    '110',
    '+86-21-110',
    'Downtown Shanghai',
    '24 hours',
    true
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'hospital',
    'Ruijin Hospital',
    '瑞金医院',
    '+86-21-6437-0039',
    '+86-21-6437-0039',
    '197 Ruijin 2nd Rd, Huangpu District',
    '24 hours',
    true
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'tourist_police',
    'Shanghai Tourist Police',
    '上海旅游警察',
    '+86-21-6322-8123',
    '+86-21-6322-8123',
    'Nanjing E Rd',
    '09:00-17:00',
    false
);

-- Chengdu Emergency
INSERT INTO emergency_info (city_id, type, name, name_zh, phone, phone_international, address, opening_hours, is_24h) VALUES
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'hospital',
    'West China Hospital',
    '华西医院',
    '+86-28-8542-2114',
    '+86-28-8542-2114',
    '37 Guo Xue Xiang, Wuhou District',
    '24 hours',
    true
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'police',
    'Chengdu Tourist Police',
    '成都旅游警察',
    '+86-28-8691-6110',
    '+86-28-8691-6110',
    'Chunxi Rd',
    '09:00-21:00',
    false
);

-- ============================================================
-- PRICE REFERENCES SEED DATA
-- ============================================================

-- Beijing Price References
INSERT INTO price_references (city_id, item_type, item_name, item_name_zh, local_price_min, local_price_max, tourist_price_min, tourist_price_max, currency, unit, notes) VALUES
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'food',
    'Street food/snack',
    '街头小吃',
    10,
    30,
    15,
    50,
    'CNY',
    'per serving',
    'Tourist areas usually 20-50% more expensive'
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'food',
    'Peking Duck meal',
    '北京烤鸭套餐',
    150,
    400,
    200,
    500,
    'CNY',
    'per person',
    'Quanjude is the most famous but also most expensive'
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'transport',
    'Subway (single ride)',
    '地铁单程',
    3,
    10,
    3,
    10,
    'CNY',
    'per ride',
    'Same price for tourists as locals'
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'attraction',
    'Forbidden City ticket',
    '故宫门票',
    40,
    60,
    40,
    60,
    'CNY',
    'per person',
    'Students and seniors get discount, foreigners pay same as locals'
),
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'attraction',
    'Great Wall Mutianyu',
    '慕田峪长城',
    40,
    60,
    40,
    80,
    'CNY',
    'per person',
    'Includes cable car if you take it'
);

-- Shanghai Price References
INSERT INTO price_references (city_id, item_type, item_name, item_name_zh, local_price_min, local_price_max, tourist_price_min, tourist_price_max, currency, unit, notes) VALUES
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'food',
    'Dim sum meal',
    '点心套餐',
    60,
    150,
    80,
    200,
    'CNY',
    'per person',
    'Mid-range dim sum restaurants'
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'food',
    'Xiaolongbao (10 pcs)',
    '小笼包（10个）',
    30,
    60,
    40,
    80,
    'CNY',
    'per order',
    'Din Tai Fung is at the higher end'
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'transport',
    'Metro single ride',
    '地铁单程',
    3,
    9,
    3,
    9,
    'CNY',
    'per ride',
    'Same for tourists'
);

-- Chengdu Price References
INSERT INTO price_references (city_id, item_type, item_name, item_name_zh, local_price_min, local_price_max, tourist_price_min, tourist_price_max, currency, unit, notes) VALUES
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'food',
    'Hotpot meal',
    '火锅套餐',
    80,
    200,
    100,
    250,
    'CNY',
    'per person',
    'Two-person pot is most common for tourists'
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'food',
    'Mapo tofu + rice',
    '麻婆豆腐+米饭',
    15,
    30,
    20,
    40,
    'CNY',
    'per meal',
    'Local restaurants near tourist sites may charge more'
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'attraction',
    'Panda Base ticket',
    '大熊猫基地门票',
    55,
    55,
    55,
    55,
    'CNY',
    'per person',
    'Free for children under 1.2m'
);

-- Xi'an Price References
INSERT INTO price_references (city_id, item_type, item_name, item_name_zh, local_price_min, local_price_max, tourist_price_min, tourist_price_max, currency, unit, notes) VALUES
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'food',
    'Roujiamo (Chinese hamburger)',
    '肉夹馍',
    8,
    15,
    10,
    20,
    'CNY',
    'per piece',
    'Classic street food, best from small local shops'
),
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'attraction',
    'Terracotta Army ticket',
    '兵马俑门票',
    120,
    120,
    120,
    120,
    'CNY',
    'per person',
    'Same price for foreigners and locals since 2020'
);

-- Guangzhou Price References
INSERT INTO price_references (city_id, item_type, item_name, item_name_zh, local_price_min, local_price_max, tourist_price_min, tourist_price_max, currency, unit, notes) VALUES
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'food',
    'Morning tea (dim sum)',
    '早茶点心',
    50,
    150,
    60,
    200,
    'CNY',
    'per person',
    'Lai Wah Heen is the famous spot but many local options'
),
(
    'a1b2c3d4-0003-0000-0000-000000000003',
    'food',
    'Braised chicken feet',
    '豉汁凤爪',
    20,
    40,
    25,
    50,
    'CNY',
    'per order',
    'Classic Cantonese dim sum dish'
);

-- Guilin Price References
INSERT INTO price_references (city_id, item_type, item_name, item_name_zh, local_price_min, local_price_max, tourist_price_min, tourist_price_max, currency, unit, notes) VALUES
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'transport',
    'Li River cruise (Guilin to Yangshuo)',
    '漓江游船',
    210,
    210,
    210,
    270,
    'CNY',
    'per person',
    'Four-star boat, five-star costs more'
),
(
    'a1b2c3d4-0006-0000-0000-000000000006',
    'food',
    'Guilin rice noodles',
    '桂林米粉',
    5,
    15,
    8,
    25,
    'CNY',
    'per bowl',
    'Best from small local shops, usually breakfast food'
);

-- ============================================================
-- SCAM REPORTS SEED DATA (common awareness)
-- ============================================================

INSERT INTO scam_reports (city_id, type, title, description, severity, is_verified, status, upvotes) VALUES
(
    'a1b2c3d4-0001-0000-0000-000000000001',
    'taxi',
    'Fake taxi meters in Beijing',
    'Some unregistered taxis use manipulated meters to overcharge. Always insist on using the meter or use Didi app.',
    'medium',
    true,
    'verified',
    45
),
(
    'a1b2c3d4-0002-0000-0000-000000000002',
    'market',
    'Jade shop scams near Yuyuan Garden',
    'Aggressive vendors sell fake jade at inflated prices. Never buy from street vendors near tourist spots.',
    'high',
    true,
    'verified',
    67
),
(
    'a1b2c3d4-0005-0000-0000-000000000005',
    'restaurant',
    'Menu price switching in Chunxi Road',
    'Some restaurants show different prices on the menu vs what you are charged. Always check your bill carefully.',
    'medium',
    true,
    'verified',
    32
),
(
    'a1b2c3d4-0004-0000-0000-000000000004',
    'taxi',
    'Tuk-tuk scams near Big Wild Goose Pagoda',
    'Tuk-tuk drivers claim the pagoda is closed and take you to tea houses or souvenir shops instead.',
    'medium',
    true,
    'verified',
    28
);