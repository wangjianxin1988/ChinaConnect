#!/usr/bin/env python3
"""
Script to generate comprehensive city data for Beijing and Shanghai.
This script adds attractions, restaurants, hotels, cultural tips, emergency contacts, and payment methods.
"""

import json
import sys
from pathlib import Path

# Add more attractions (need 25+ total)
BEIJING_ADDITIONAL_ATTRACTIONS = [
    {
        "id": "louvre-abroad",
        "name": "中国电影博物馆",
        "nameEn": "China National Film Museum",
        "category": "cultural",
        "description": "The world's largest film museum with extensive exhibits on Chinese cinema history and interactive displays.",
        "address": "9 Hua Jia Di Village, Chaoyang District",
        "coordinates": {"lat": 39.9712, "lng": 116.5312},
        "openingHours": "09:00-16:30 (Closed Monday)",
        "ticketPrice": "Free",
        "recommendedVisitTime": "2-3 hours",
        "highlights": ["Film history exhibits", "IMAX Theater", "Film equipment collection", "Interactive displays"],
        "tips": "One of the largest film museums globally. Great for film enthusiasts. Free entry but registration required."
    },
    {
        "id": "western-yuanming",
        "name": "西洋楼遗址",
        "nameEn": "Western Mansions Ruins",
        "category": "historical",
        "description": "The iconic ruins of the Old Summer Palace's European-style palaces, built for Emperor Qianlong by Jesuit missionaries.",
        "address": "Yiheyuan Rd, Haidian District",
        "coordinates": {"lat": 39.9882, "lng": 116.4552},
        "openingHours": "07:00-20:30",
        "ticketPrice": "Included in Old Summer Palace ticket (25 CNY full)",
        "recommendedVisitTime": "1 hour",
        "highlights": ["Famous Marble Boat foundations", "European fountains", "Aqueduct ruins", "Photo spot"],
        "tips": "The most photographed part of Old Summer Palace. The marble boat (Hanhuachi) is the most famous ruin."
    },
    {
        "id": "milu-park",
        "name": "麋鹿苑",
        "nameEn": "Milu Park (Milu Deer Park)",
        "category": "nature",
        "description": "A nature reserve and conservation center for the milu deer (Pere David's deer), featuring observation platforms and educational exhibits.",
        "address": "Yuanmingyuan, Haidian District",
        "coordinates": {"lat": 40.0052, "lng": 116.2852},
        "openingHours": "09:00-16:00",
        "ticketPrice": "30 CNY",
        "recommendedVisitTime": "2-3 hours",
        "highlights": ["Milu deer watching", "Wetland ecosystem", "Bird observation", "Ecological education"],
        "tips": "Bring binoculars for wildlife viewing. Best in early morning. Located south of Old Summer Palace."
    },
    {
        "id": "beijing-university",
        "name": "北京大学",
        "nameEn": "Peking University",
        "category": "cultural",
        "description": "China's first modern national university, known for its beautiful campus with traditional Chinese architecture and lakes.",
        "address": "5 Yiheyuan Rd, Haidian District",
        "coordinates": {"lat": 39.9882, "lng": 116.4712},
        "openingHours": "Usually open to visitors (ID required)",
        "ticketPrice": "Free",
        "recommendedVisitTime": "2-3 hours",
        "highlights": ["Weiming Lake", "Tsinghua-Peking historical sites", "Traditional pavilions", "Cherry blossom avenue"],
        "tips": "Arrive early. Weekend visits recommended. Combine with a visit to Tsinghua University nearby."
    }
]

# Add more restaurants (need 25+ total)
BEIJING_ADDITIONAL_RESTAURANTS = [
    {
        "id": "beijing-24",
        "name": "京季",
        "nameEn": "Jing Ji",
        "type": "michelin",
        "star": 2,
        "cuisine": "Modern Chinese",
        "avgPrice": 800,
        "rating": 4.8,
        "address": "2/F, Parkview Green, 20 Fangyuan East Rd, Chaoyang",
        "coordinates": {"lat": 39.9422, "lng": 116.4682},
        "phone": "+86 10 6502 8801",
        "hours": "11:30-14:30, 18:00-22:00",
        "description": "Two Michelin starred restaurant by Chef Wang Xing offering innovative Shandong cuisine.",
        "dishHighlights": ["Braised sea cucumber", "Fried sweet and sour ribs", "Crystal shrimp dumplings"],
        "tags": ["fine-dining", "shandong", "innovative", "romantic"],
        "diamond": 0
    },
    {
        "id": "beijing-25",
        "name": "拾城一味",
        "nameEn": "Shi Cheng Yi Wei",
        "type": "local",
        "cuisine": "Beijing",
        "avgPrice": 100,
        "rating": 4.5,
        "address": "28 Sanlitun Rd, Chaoyang District",
        "coordinates": {"lat": 39.9342, "lng": 116.4462},
        "phone": "+86 10 6417 8811",
        "hours": "11:00-22:00",
        "description": "Popular local spot for authentic Beijing home-style dishes with modern decor.",
        "dishHighlights": ["Fried sauce noodles", "Pea green cake", "Bubble lamp dessert"],
        "tags": ["local", "beijing-cuisine", "casual", "modern"],
        "star": 0,
        "diamond": 0
    },
    {
        "id": "beijing-26",
        "name": "都式烧麦馆",
        "nameEn": "Du Shi Shaomai Guan",
        "type": "local",
        "cuisine": "Beijing",
        "avgPrice": 50,
        "rating": 4.6,
        "address": "58 Xinjiekou Dajie, Xicheng District",
        "coordinates": {"lat": 39.9382, "lng": 116.3782},
        "phone": "+86 10 6616 8831",
        "hours": "06:30-14:00, 17:00-20:00",
        "description": "Legendary spot for Beijing-style shaomai (steamed dumplings) since 1920s.",
        "dishHighlights": ["Pork shaomai", "Vegetarian shaomai", "Soy milk"],
        "tags": ["local", "breakfast", "historic", "must-try", "budget"],
        "star": 0,
        "diamond": 0
    },
    {
        "id": "beijing-27",
        "name": "宫宴",
        "nameEn": "Gong Yan",
        "type": "local",
        "cuisine": "Imperial",
        "avgPrice": 350,
        "rating": 4.7,
        "address": "1/F, Nanhuachi, 1 Nanluoguxiang, Dongcheng",
        "coordinates": {"lat": 39.9372, "lng": 116.4042},
        "phone": "+86 10 6405 8832",
        "hours": "11:00-14:00, 17:00-21:00",
        "description": "Upscale restaurant offering imperial court cuisine with traditional music performances.",
        "dishHighlights": ["Imperial feast", "Manchu-Han banquet", "Traditional pastries"],
        "tags": ["imperial", "cultural", "performance", "romantic"],
        "star": 0,
        "diamond": 0
    }
]

# Additional hotels for Beijing (need 15+)
BEIJING_ADDITIONAL_HOTELS = [
    {
        "name": "北京柏悦酒店",
        "nameEn": "Park Hyatt Beijing",
        "budget": "luxury",
        "priceRange": "1800-3500 CNY/night",
        "address": "2 Jianguomenwai Dajie, Chaoyang District",
        "coordinates": {"lat": 39.9092, "lng": 116.4572},
        "rating": 4.7,
        "highlights": ["Sky lobby on 59th floor", "Stunning views", "Central location", "Modern luxury"],
        "bookingTips": "Request upper floors for best views. Good for business travelers."
    }
]

# Additional cultural tips for Beijing (need 15+)
BEIJING_ADDITIONAL_CULTURAL_TIPS = [
    {
        "category": "greeting",
        "title": "Beijing Dialect",
        "content": "The Beijing dialect (北京话) has distinct pronunciation and many colloquial expressions. 'Ye' (也) and 'zai' (再) are pronounced with a trailing 'r' sound. Learning basic phrases is appreciated.",
        "importance": "medium"
    },
    {
        "category": "weather",
        "title": "Sandstorm Season",
        "content": "Beijing experiences sandstorms in spring (March-April). Check air quality indices (AQI) before going outside. Wear masks outdoors and keep windows closed during heavy sandstorms.",
        "importance": "high"
    },
    {
        "category": "communication",
        "title": "English Accessibility",
        "content": "English signage is common at major tourist attractions and hotels. However, at local markets, small restaurants, and public transport, English may be limited. Translation apps are helpful.",
        "importance": "medium"
    },
    {
        "category": "dining",
        "title": "Beijing Roast Duck Culture",
        "content": "Peking duck is Beijing's most famous dish. Popular restaurants include Quanjude (est. 1864), Bianyifang (est. 1855), and Da Dong. Each has its own preparation style.",
        "importance": "high"
    },
    {
        "category": "architecture",
        "title": "Hutong Heritage",
        "content": "Hutongs (胡同) are traditional alleyways forming historic Beijing neighborhoods. Walking or cycling through hutongs offers insight into traditional Beijing life.",
        "importance": "high"
    },
    {
        "category": "taboo",
        "title": "Censorship Awareness",
        "content": "Internet access in Beijing is restricted. VPNs are commonly used but may be unreliable. Plan accordingly for accessing international services.",
        "importance": "high"
    },
    {
        "category": "shopping",
        "title": "Silk Market Culture",
        "content": "The Silk Market (Xizhushui) and other markets offer bargaining opportunities. Start at 30-50% of asking price. Quality varies - check carefully before purchasing.",
        "importance": "medium"
    },
    {
        "category": "transportation",
        "title": "Peak Hours",
        "content": "Beijing traffic peaks 7-9am and 5-8pm. Public transport is recommended. Metro Line 1, 2, and 10 are most useful for tourists.",
        "importance": "medium"
    },
    {
        "category": "greeting",
        "title": "Beijing Nicknames",
        "content": "Locals may use Beijing-specific terms like 'dageda' (大哥大) for older men or 'jie jie' (姐姐) for women. 'Er' suffix is common: 'Beijing'er'.",
        "importance": "low"
    }
]

# Additional emergency contacts for Beijing
BEIJING_ADDITIONAL_EMERGENCY = [
    {
        "type": "embassy",
        "name": "德国驻华大使馆",
        "nameEn": "German Embassy Beijing",
        "phone": "+86 10 8532 9000",
        "address": "9 Sanlitun Dongzhimenwai Rd, Chaoyang District",
        "coordinates": {"lat": 39.9532, "lng": 116.4492},
        "notes": "For German citizens: 24h emergency line available"
    },
    {
        "type": "embassy",
        "name": "法国驻华大使馆",
        "nameEn": "French Embassy Beijing",
        "phone": "+86 10 8532 8000",
        "address": "60 Tianzelu Rd, Chaoyang District",
        "coordinates": {"lat": 39.9542, "lng": 116.4552},
        "notes": "For French citizens: consular services and emergency assistance"
    },
    {
        "type": "embassy",
        "name": "加拿大驻华大使馆",
        "nameEn": "Canadian Embassy Beijing",
        "phone": "+86 10 5139 4000",
        "address": "10 Chaoyangmenwai Dajie, Chaoyang District",
        "coordinates": {"lat": 39.9512, "lng": 116.4412},
        "notes": "24h emergency line for Canadian citizens"
    },
    {
        "type": "tourist-helpline",
        "name": "北京旅游投诉热线",
        "nameEn": "Beijing Tourist Complaint Hotline",
        "phone": "12345",
        "address": "Citywide coverage",
        "notes": "For tourist complaints, refunds, and emergency assistance"
    },
    {
        "type": "embassy",
        "name": "俄罗斯驻华大使馆",
        "nameEn": "Russian Embassy Beijing",
        "phone": "+86 10 6532 2000",
        "address": "4 Dongzhimen Beizhan, Dongcheng District",
        "coordinates": {"lat": 39.9532, "lng": 116.4292},
        "notes": "For Russian citizens: consular services available"
    },
    {
        "type": "embassy",
        "name": "意大利驻华大使馆",
        "nameEn": "Italian Embassy Beijing",
        "phone": "+86 10 8532 7600",
        "address": "1 Sanlitun Dongzhimenwai Rd, Chaoyang District",
        "coordinates": {"lat": 39.9522, "lng": 116.4492},
        "notes": "For Italian citizens: emergency assistance available"
    }
]

# Additional payment methods for Beijing
BEIJING_ADDITIONAL_PAYMENT = [
    {
        "method": "UnionPay",
        "icon": "unionpay",
        "description": "China's domestic card network, widely accepted at ATMs and merchants",
        "howToUse": [
            "Works at any ATM accepting UnionPay cards",
            "Accepted at most stores, hotels, and restaurants",
            "International cards often work with UnionPay terminals"
        ],
        "tips": [
            "Can withdraw RMB directly from international cards",
            "Widely accepted at all banks",
            "Lower fees than credit cards for cash withdrawals"
        ]
    },
    {
        "method": "Foreign Exchange",
        "icon": "exchange",
        "description": "Currency exchange at banks and exchange offices",
        "howToUse": [
            "Official exchange counters at airports",
            "Bank branches with exchange services",
            "Major hotels often have exchange services"
        ],
        "tips": [
            "Airport exchange counters offer poor rates",
            "Bank of China and ICBC give better rates",
            "Bring passport for all exchanges"
        ]
    }
]

# SHANGHAI ADDITIONS

# Additional attractions for Shanghai (need 25+)
SHANGHAI_ADDITIONAL_ATTRACTIONS = [
    {
        "id": "qibao-ancient",
        "name": "七宝古镇",
        "nameEn": "Qibao Ancient Town",
        "category": "cultural",
        "description": "A historic water town with traditional architecture, street food, and crafts just 30 minutes from central Shanghai.",
        "address": "Qibao Town, Minhang District",
        "coordinates": {"lat": 31.168, "lng": 121.3445},
        "openingHours": "全天 ( shops 09:00-21:00)",
        "ticketPrice": "Free (some attractions may charge)",
        "recommendedVisitTime": "3-4 hours",
        "highlights": ["Historic streets", "Qibao noodles", "Traditional crafts", "Waterfront views"],
        "tips": "Take Metro Line 9 to Qibao. Famous for Qibao noodles and traditional snacks. Great for a half-day trip."
    },
    {
        "id": "shanghai-oceanarium",
        "name": "上海海洋水族馆",
        "nameEn": "Shanghai Ocean Aquarium",
        "category": "cultural",
        "description": "One of the largest aquariums in the world with over 400 species of marine life and a 155-meter underwater tunnel.",
        "address": "1388 Yincheng Middle Rd, Pudong",
        "coordinates": {"lat": 31.2412, "lng": 121.5435},
        "openingHours": "09:00-17:30",
        "ticketPrice": "180 CNY",
        "recommendedVisitTime": "2-3 hours",
        "highlights": ["Underwater tunnel", "Amazon exhibit", "Beluga whale viewing", "Jellyfish gallery"],
        "tips": "Located next to Oriental Pearl Tower. Great for families. Book tickets online for discounts."
    },
    {
        "id": "waigaoqiao-free",
        "name": "外高桥自由贸易试验区",
        "nameEn": "Waigaoqiao Free Trade Zone",
        "category": "modern",
        "description": "China's first free trade zone with international shopping centers and import goods at duty-free prices.",
        "address": "Waigaoqiao, Pudong",
        "coordinates": {"lat": 31.3185, "lng": 121.5785},
        "openingHours": "Shops 09:00-20:00",
        "ticketPrice": "Free",
        "recommendedVisitTime": "2-3 hours",
        "highlights": ["Imported goods", "Electronics shopping", "Wine and cosmetics", "Duty-free prices"],
        "tips": "Take Metro Line 6 to Waigaoqiao South. Good for electronics and imported goods. Bring passport."
    },
    {
        "id": "changning-longhua",
        "name": "龙华古寺",
        "nameEn": "Longhua Temple",
        "category": "cultural",
        "description": "Shanghai's largest and most authentic Buddhist temple, dating back to the Three Kingdoms period.",
        "address": "2853 Longhua Rd, Xuhui District",
        "coordinates": {"lat": 31.1825, "lng": 121.4485},
        "openingHours": "07:00-17:00",
        "ticketPrice": "10 CNY",
        "recommendedVisitTime": "1-2 hours",
        "highlights": ["Five-story pagoda", "2,000 Buddhist statues", "Bamboo grove", "Bonsai garden"],
        "tips": "One of Shanghai's oldest temples. Metro Line 11 to Longhua station. Beautiful at cherry blossom season."
    }
]

# Additional restaurants for Shanghai (need 25+)
SHANGHAI_ADDITIONAL_RESTAURANTS = [
    {
        "id": "shanghai-22",
        "name": "荷唐·铜锣湾",
        "nameEn": "He Tang Tong Luo Wan",
        "type": "local",
        "cuisine": "Cantonese",
        "avgPrice": 200,
        "rating": 4.6,
        "address": "66 Changle Rd, Xuhui District",
        "coordinates": {"lat": 31.213, "lng": 121.452},
        "phone": "+86 21 6433 5577",
        "hours": "11:00-14:30, 17:00-22:00",
        "description": "Popular spot serving authentic Cantonese dim sum and seafood in a modern setting.",
        "dishHighlights": ["Steamed dumplings", "Egg tarts", "Shark fin soup"],
        "tags": ["cantonese", "dim-sum", "casual", "popular"],
        "star": 0,
        "diamond": 0
    },
    {
        "id": "shanghai-23",
        "name": "阿娘面馆",
        "nameEn": "A Niang Noodles",
        "type": "local",
        "cuisine": "Shanghai",
        "avgPrice": 40,
        "rating": 4.6,
        "address": "137 Huangpu Rd, Huangpu District",
        "coordinates": {"lat": 31.233, "lng": 121.482},
        "phone": "+86 21 6320 4428",
        "hours": "11:00-20:00",
        "description": "Legendary hole-in-the-wall spot for Shanghai-style large intestines stew noodles since 1970s.",
        "dishHighlights": ["Large intestines stew noodles", "Fried noodles", "Soy braised pork"],
        "tags": ["local", "noodles", "historic", "must-try", "budget"],
        "star": 0,
        "diamond": 0
    },
    {
        "id": "shanghai-24",
        "name": "上海老站",
        "nameEn": "Shanghai Lao Zhan",
        "type": "local",
        "cuisine": "Shanghai",
        "avgPrice": 150,
        "rating": 4.7,
        "address": "560 Yangzhou Rd, Hongkou District",
        "coordinates": {"lat": 31.258, "lng": 121.469},
        "phone": "+86 21 6543 2978",
        "hours": "11:00-14:00, 17:00-21:00",
        "description": "Historic rotary restaurant in a converted train station serving authentic Shanghai cuisine.",
        "dishHighlights": ["Braised pork belly", "Steamed fish", "Red wine chicken"],
        "tags": ["local", "shanghai-cuisine", "historic", "unique"],
        "star": 0,
        "diamond": 0
    },
    {
        "id": "shanghai-25",
        "name": "福和慧",
        "nameEn": "Fu He Hui",
        "type": "michelin",
        "star": 1,
        "cuisine": "Vegetarian",
        "avgPrice": 600,
        "rating": 4.8,
        "address": "1 Y，立兴大楼, 172 Fuxing Middle Rd, Xuhui",
        "coordinates": {"lat": 31.215, "lng": 121.447},
        "phone": "+86 21 6073 2220",
        "hours": "11:00-14:00, 18:00-21:00",
        "description": "One Michelin star vegetarian restaurant offering creative plant-based fine dining.",
        "dishHighlights": ["Seasonal vegetable tasting menu", "Buddhist cuisine", "Artful presentations"],
        "tags": ["fine-dining", "vegetarian", "creative", "healthy"],
        "diamond": 0
    }
]

# Additional hotels for Shanghai
SHANGHAI_ADDITIONAL_HOTELS = [
    {
        "name": "上海外滩悦榕庄",
        "nameEn": "Banyan Tree Shanghai On The Bund",
        "budget": "luxury",
        "priceRange": "3500-6000 CNY/night",
        "address": "20 Funing Rd, Huangpu District",
        "coordinates": {"lat": 31.242, "lng": 121.496},
        "rating": 4.8,
        "highlights": ["Riverside location", "Chinese-inspired design", "Rooftop bar", "Luxurious spa"],
        "bookingTips": "Request river-view rooms. Best for romantic getaways."
    },
    {
        "name": "上海新天地安达仕酒店",
        "nameEn": "Andaz Shanghai Xintiandi",
        "budget": "mid",
        "priceRange": "1200-2000 CNY/night",
        "address": "88 Taicang Rd, Huangpu District",
        "coordinates": {"lat": 31.224, "lng": 121.471},
        "rating": 4.6,
        "highlights": ["Xintiandi location", "Modern design", "Rooftop bar", "Central location"],
        "bookingTips": "Great for nightlife. Book weekend packages."
    }
]

# Additional cultural tips for Shanghai
SHANGHAI_ADDITIONAL_CULTURAL_TIPS = [
    {
        "category": "language",
        "title": "Wu Dialect Family",
        "content": "Shanghainese belongs to the Wu dialect family, significantly different from Mandarin. Common phrases: 'ni' (你) = you, 'wo' (我) = I, 'na' (那) = that. Tone differences make it almost unintelligible to non-speakers.",
        "importance": "medium"
    },
    {
        "category": "fashion",
        "title": "Haipai Fashion",
        "content": "Shanghai pioneered the modern qipao (旗袍) in the 1920s-30s. Today, the city remains China's fashion capital, with Shanghai Fashion Week and numerous designers blending Eastern and Western styles.",
        "importance": "medium"
    },
    {
        "category": "environment",
        "title": "Air Quality",
        "content": "Air quality can be poor, especially in winter. Check AQI before outdoor activities. Major international hotels have air purifiers. Masks recommended during heavy pollution.",
        "importance": "high"
    },
    {
        "category": "greeting",
        "title": "Shanghai Greetings",
        "content": "While Mandarin 'ni hao' is universal, Shanghainese greeting 'nong hao' (侬好) means 'hello' in the local dialect. Locals appreciate when visitors try local phrases.",
        "importance": "low"
    },
    {
        "category": "dining",
        "title": "Dim Sum Culture",
        "content": "Shanghai dim sum differs from Cantonese style. Try local specialties like shengjian bao (pan-fried soup dumplings), xiaolongbao, and crab roe dishes.",
        "importance": "high"
    },
    {
        "category": "architecture",
        "title": "Art Deco Legacy",
        "content": "Shanghai has one of the world's largest collections of Art Deco architecture, second only to Miami. Many buildings along the Bund feature this 1920s-30s style.",
        "importance": "medium"
    }
]

# Additional emergency contacts for Shanghai
SHANGHAI_ADDITIONAL_EMERGENCY = [
    {
        "type": "embassy",
        "name": "英国驻上海总领事馆",
        "nameEn": "UK Consulate General Shanghai",
        "phone": "+86 21 6279 7650",
        "address": "20/F, Westgate Mall, 8 Century Ave, Pudong",
        "coordinates": {"lat": 31.2385, "lng": 121.5005},
        "notes": "For UK citizens: 24h consular emergency line"
    },
    {
        "type": "embassy",
        "name": "日本驻上海总领事馆",
        "nameEn": "Japan Consulate General Shanghai",
        "phone": "+86 21 6278 0980",
        "address": "8 Wanzheng Rd, Hongkou District",
        "coordinates": {"lat": 31.252, "lng": 121.4725},
        "notes": "Japanese citizens: emergency line +86 21 6278 8830"
    },
    {
        "type": "embassy",
        "name": "韩国驻上海总领事馆",
        "nameEn": "Korea Consulate General Shanghai",
        "phone": "+86 21 6212 2080",
        "address": "458 West Nanjing Rd, Jing'an",
        "coordinates": {"lat": 31.237, "lng": 121.4585},
        "notes": "For Korean citizens: consular services and emergency assistance"
    },
    {
        "type": "hospital",
        "name": "上海华山医院",
        "nameEn": "Huashan Hospital",
        "phone": "+86 21 5288 9999",
        "address": "12 Middle Wulumuqi Rd, Jing'an District",
        "coordinates": {"lat": 31.228, "lng": 121.4455},
        "notes": "Top neurology and neurosurgery hospital in China"
    },
    {
        "type": "tourist-helpline",
        "name": "旅游紧急求助",
        "nameEn": "Tourist Emergency Assistance",
        "phone": "12308",
        "address": "Citywide coverage",
        "notes": "24h tourist emergency hotline for foreign visitors"
    }
]

# Additional payment methods for Shanghai
SHANGHAI_ADDITIONAL_PAYMENT = [
    {
        "method": "UnionPay",
        "icon": "unionpay",
        "description": "China's domestic card network, essential for ATM withdrawals and widely accepted",
        "howToUse": [
            "Works at all UnionPay ATMs",
            "Accepted at most merchants in Shanghai",
            "International cards with UnionPay logo work"
        ],
        "tips": [
            "Best for withdrawing RMB with lower fees",
            "Widely available at all banks and ATMs",
            "Works at supermarkets and convenience stores"
        ]
    },
    {
        "method": "Apple Pay / Google Pay",
        "icon": "applepay",
        "description": "Increasingly accepted at modern venues, convenience stores, and international chains",
        "howToUse": [
            "Works at 7-Eleven, FamilyMart, all major convenience stores",
            "Works at Starbucks, some restaurants",
            "Add international card to Apple Wallet"
        ],
        "tips": [
            "Most reliable foreign payment option after cards",
            "Works offline which is helpful",
            "Not universal but growing rapidly"
        ]
    }
]

def update_beijing_data(filepath):
    """Update Beijing city data with additional entries"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Add new attractions
    existing_attraction_ids = {a['id'] for a in data['attractions']}
    for attr in BEIJING_ADDITIONAL_ATTRACTIONS:
        if attr['id'] not in existing_attraction_ids:
            data['attractions'].append(attr)

    # Add new restaurants
    existing_restaurant_ids = {r['id'] for r in data['restaurants']}
    for rest in BEIJING_ADDITIONAL_RESTAURANTS:
        if rest['id'] not in existing_restaurant_ids:
            data['restaurants'].append(rest)

    # Add new hotels
    existing_hotel_names = {h['nameEn'] for h in data['hotels']}
    for hotel in BEIJING_ADDITIONAL_HOTELS:
        if hotel['nameEn'] not in existing_hotel_names:
            data['hotels'].append(hotel)

    # Add new cultural tips
    for tip in BEIJING_ADDITIONAL_CULTURAL_TIPS:
        data['culturalTips'].append(tip)

    # Add new emergency contacts
    existing_emergency_types = {(e['type'], e['nameEn']) for e in data['emergencyContacts']}
    for emergency in BEIJING_ADDITIONAL_EMERGENCY:
        key = (emergency['type'], emergency['nameEn'])
        if key not in existing_emergency_types:
            data['emergencyContacts'].append(emergency)

    # Add new payment methods
    existing_payment_methods = {p['method'] for p in data['payment']}
    for payment in BEIJING_ADDITIONAL_PAYMENT:
        if payment['method'] not in existing_payment_methods:
            data['payment'].append(payment)

    # Write updated data
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Print summary
    print("Beijing Data Updated:")
    print(f"  Attractions: {len(data['attractions'])}")
    print(f"  Restaurants: {len(data['restaurants'])}")
    print(f"  Hotels: {len(data['hotels'])}")
    print(f"  Cultural Tips: {len(data['culturalTips'])}")
    print(f"  Emergency Contacts: {len(data['emergencyContacts'])}")
    print(f"  Payment Methods: {len(data['payment'])}")

def update_shanghai_data(filepath):
    """Update Shanghai city data with additional entries"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Add new attractions
    existing_attraction_ids = {a['id'] for a in data['attractions']}
    for attr in SHANGHAI_ADDITIONAL_ATTRACTIONS:
        if attr['id'] not in existing_attraction_ids:
            data['attractions'].append(attr)

    # Add new restaurants
    existing_restaurant_ids = {r['id'] for r in data['restaurants']}
    for rest in SHANGHAI_ADDITIONAL_RESTAURANTS:
        if rest['id'] not in existing_restaurant_ids:
            data['restaurants'].append(rest)

    # Add new hotels
    existing_hotel_names = {h['nameEn'] for h in data['hotels']}
    for hotel in SHANGHAI_ADDITIONAL_HOTELS:
        if hotel['nameEn'] not in existing_hotel_names:
            data['hotels'].append(hotel)

    # Add new cultural tips
    for tip in SHANGHAI_ADDITIONAL_CULTURAL_TIPS:
        data['culturalTips'].append(tip)

    # Add new emergency contacts
    existing_emergency_types = {(e['type'], e['nameEn']) for e in data['emergencyContacts']}
    for emergency in SHANGHAI_ADDITIONAL_EMERGENCY:
        key = (emergency['type'], emergency['nameEn'])
        if key not in existing_emergency_types:
            data['emergencyContacts'].append(emergency)

    # Add new payment methods
    existing_payment_methods = {p['method'] for p in data['payment']}
    for payment in SHANGHAI_ADDITIONAL_PAYMENT:
        if payment['method'] not in existing_payment_methods:
            data['payment'].append(payment)

    # Write updated data
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Print summary
    print("\nShanghai Data Updated:")
    print(f"  Attractions: {len(data['attractions'])}")
    print(f"  Restaurants: {len(data['restaurants'])}")
    print(f"  Hotels: {len(data['hotels'])}")
    print(f"  Cultural Tips: {len(data['culturalTips'])}")
    print(f"  Emergency Contacts: {len(data['emergencyContacts'])}")
    print(f"  Payment Methods: {len(data['payment'])}")

if __name__ == "__main__":
    base_path = Path(__file__).parent
    beijing_path = base_path / "beijing.json"
    shanghai_path = base_path / "shanghai.json"

    if beijing_path.exists():
        update_beijing_data(beijing_path)
    else:
        print(f"Error: {beijing_path} not found")

    if shanghai_path.exists():
        update_shanghai_data(shanghai_path)
    else:
        print(f"Error: {shanghai_path} not found")