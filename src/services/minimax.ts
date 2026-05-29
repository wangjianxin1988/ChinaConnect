/**
 * MiniMax AI Client for ChinaConnect
 * OpenAI-compatible API integration for travel planning with tool calling
 */

export interface MiniMaxMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: MiniMaxToolCall[];
  name?: string;
}

export interface MiniMaxToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface MiniMaxChatRequest {
  model: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: typeof TOOLS;
}

export interface MiniMaxStreamResponse {
  id: string;
  choices: Array<{
    delta: {
      content?: string;
      tool_calls?: MiniMaxToolCall[];
    };
    finish_reason?: string;
  }>;
}

/**
 * Strip <think> blocks, tool_call blocks, and function call tags
 * from model output so users only see clean responses.
 * Kept as safety net - should rarely be needed with proper tool calling.
 */
export function cleanModelResponse(text: string): string {
  // Remove closed <think>...</think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  // Remove unclosed <think> blocks (mid-stream: opening tag with no closing yet)
  cleaned = cleaned.replace(/<think>[\s\S]*$/, '');
  // Remove closed <minimax:tool_call>...</minimax:tool_call> blocks
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*?<\/minimax:tool_call>/g, '');
  // Remove unclosed <minimax:tool_call> blocks (mid-stream)
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*$/, '');
  // Remove any stray <invoke ... /> tags
  cleaned = cleaned.replace(/<invoke\s+[^>]*\/>/g, '');
  // Remove <function ...> ... </function> blocks (multi-line)
  cleaned = cleaned.replace(/<function\s+[\s\S]*?<\/function>/g, '');
  // Remove self-closing <function ... /> tags (may be multi-line)
  cleaned = cleaned.replace(/<function\s+[\s\S]*?\/>/g, '');
  // Remove unclosed <function ...> tags (mid-stream)
  cleaned = cleaned.replace(/<function\s+[\s\S]*$/, '');
  // Clean up extra whitespace/newlines left behind
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
}

// ============================================================================
// TOOLS DEFINITION - OpenAI-compatible format for MiniMax API
// ============================================================================

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "CitySearch",
      description: "Search city database for destinations, attractions, restaurants, transport info. Use this to get general info about a Chinese city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name (e.g. Beijing, Shanghai, Xi'an)" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "AttractionSearch",
      description: "Find attractions by city and category. Returns attraction names, descriptions, ticket prices, and visiting tips.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
          category: { type: "string", enum: ["historical", "cultural", "nature", "modern"], description: "Attraction category" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "FoodSearch",
      description: "Search restaurants by city, cuisine type, and budget. Returns restaurant names, types (Michelin/Black Pearl/local), prices, and signature dishes.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
          cuisine: { type: "string", description: "Cuisine type (e.g. Sichuan, Cantonese, Zhejiang)" },
          budget: { type: "string", enum: ["low", "medium", "high"], description: "Budget level: low=street food, medium=mid-range, high=fine dining" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "WeatherSearch",
      description: "Get weather forecast and climate info for a city. Includes best months to visit and temperature ranges.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
          days: { type: "number", description: "Number of days for forecast (1-7)" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "HotelSearch",
      description: "Find hotels by city and budget. Returns hotel names, price ranges, addresses, and booking tips.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
          budget: { type: "string", enum: ["low", "medium", "high"], description: "Budget: low=budget, medium=mid-range, high=luxury" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "TransportSearch",
      description: "Search transport options between cities. Returns trains, flights with duration, price, and tips.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "Departure city" },
          to: { type: "string", description: "Destination city" }
        },
        required: ["from", "to"]
      }
    }
  }
];

// ============================================================================
// LOCAL TOOL EXECUTION - Mock data based on real city database
// ============================================================================

// City info database (condensed from src/data/cities/)
const CITY_DATABASE: Record<string, {
  name: string; nameEn: string; description: string;
  climate: { type: string; bestMonths: string[]; avgSummerTemp: string; avgWinterTemp: string; tips: string };
  attractions: Array<{ name: string; nameEn: string; category: string; ticketPrice: string; description: string; recommendedVisitTime: string }>;
  restaurants: Array<{ name: string; nameEn: string; type: string; cuisine: string; avgPrice: number; dishHighlights: string[] }>;
  hotels: Array<{ name: string; nameEn: string; budget: string; priceRange: string; rating: number }>;
  transport: Array<{ type: string; from: string; to: string; duration: string; price: string; tips: string }>;
}> = {
  beijing: {
    name: "北京", nameEn: "Beijing",
    description: "Capital of China, home to the Forbidden City, Great Wall, and 3,000 years of history.",
    climate: { type: "Temperate continental", bestMonths: ["April", "May", "September", "October"], avgSummerTemp: "26°C", avgWinterTemp: "-2°C", tips: "Best in spring/autumn. Summers hot and humid, winters cold. Pack layers." },
    attractions: [
      { name: "故宫博物院", nameEn: "Forbidden City", category: "historical", ticketPrice: "¥60 peak / ¥40 off-peak", description: "Imperial palace complex with 980 buildings and 1M+ artifacts.", recommendedVisitTime: "3-4 hours" },
      { name: "八达岭长城", nameEn: "Great Wall (Badaling)", category: "historical", ticketPrice: "¥40-45", description: "Most visited section with spectacular views.", recommendedVisitTime: "Half day" },
      { name: "天坛", nameEn: "Temple of Heaven", category: "cultural", ticketPrice: "¥34", description: "UNESCO Ming dynasty religious complex with circular architecture.", recommendedVisitTime: "2 hours" },
      { name: "颐和园", nameEn: "Summer Palace", category: "historical", ticketPrice: "¥30", description: "Imperial garden retreat with Kunming Lake.", recommendedVisitTime: "3 hours" },
      { name: "798艺术区", nameEn: "798 Art District", category: "modern", ticketPrice: "Free", description: "Contemporary art hub in former factory complex.", recommendedVisitTime: "2-3 hours" }
    ],
    restaurants: [
      { name: "新荣记", nameEn: "Xin Rong Ji", type: "michelin", cuisine: "Zhejiang", avgPrice: 800, dishHighlights: ["Braised prawn with XO sauce", "Steamed crab"] },
      { name: "大董烤鸭", nameEn: "Da Dong Roast Duck", type: "michelin", cuisine: "Beijing", avgPrice: 350, dishHighlights: ["Crispy roast duck", "Duck soup"] },
      { name: "四季民福", nameEn: "Siji Minfu", type: "local", cuisine: "Beijing", avgPrice: 120, dishHighlights: ["Peking duck", "Sesame sauce noodles"] }
    ],
    hotels: [
      { name: "北京华尔道夫酒店", nameEn: "Waldorf Astoria Beijing", budget: "luxury", priceRange: "¥2500-5000/night", rating: 4.8 },
      { name: "北京瑰丽酒店", nameEn: "Rosewood Beijing", budget: "luxury", priceRange: "¥2000-4000/night", rating: 4.7 },
      { name: "全季酒店", nameEn: "Ji Hotel", budget: "budget", priceRange: "¥300-500/night", rating: 4.2 }
    ],
    transport: [
      { type: "train", from: "Shanghai", to: "Beijing", duration: "4.5h (high-speed)", price: "¥553", tips: "Multiple daily departures. Book via 12306 app." },
      { type: "train", from: "Xi'an", to: "Beijing", duration: "4.5h (high-speed)", price: "¥515", tips: "Frequent service throughout the day." }
    ]
  },
  shanghai: {
    name: "上海", nameEn: "Shanghai",
    description: "Modern metropolis where East meets West. Famous for The Bund and French Concession.",
    climate: { type: "Subtropical monsoon", bestMonths: ["April", "May", "October", "November"], avgSummerTemp: "28°C", avgWinterTemp: "4°C", tips: "Rainy season in June-July. Typhoons possible Aug-Oct." },
    attractions: [
      { name: "外滩", nameEn: "The Bund", category: "modern", ticketPrice: "Free", description: "Iconic waterfront with colonial architecture and skyline views.", recommendedVisitTime: "2 hours" },
      { name: "豫园", nameEn: "Yu Garden", category: "historical", ticketPrice: "¥40", description: "Ming dynasty classical garden with bazaar.", recommendedVisitTime: "2 hours" },
      { name: "田子坊", nameEn: "Tianzifang", category: "cultural", ticketPrice: "Free", description: "Artsy lane houses with boutiques and cafes.", recommendedVisitTime: "2 hours" }
    ],
    restaurants: [
      { name: "鼎泰丰", nameEn: "Din Tai Fung", type: "michelin", cuisine: "Shanghainese", avgPrice: 150, dishHighlights: ["Xiaolongbao", "Pork chop fried rice"] },
      { name: "南翔馒头店", nameEn: "Nanxiang Steamed Bun", type: "local", cuisine: "Shanghainese", avgPrice: 50, dishHighlights: ["Steamed buns", "Xiaolongbao"] }
    ],
    hotels: [
      { name: "和平饭店", nameEn: "Fairmont Peace Hotel", budget: "luxury", priceRange: "¥2000-4000/night", rating: 4.7 },
      { name: "如家酒店", nameEn: "Home Inn", budget: "budget", priceRange: "¥200-400/night", rating: 4.0 }
    ],
    transport: [
      { type: "train", from: "Beijing", to: "Shanghai", duration: "4.5h (high-speed)", price: "¥553", tips: "Fuxing Hao trains are the fastest." },
      { type: "train", from: "Hangzhou", to: "Shanghai", duration: "1h (high-speed)", price: "¥73", tips: "Very frequent service." }
    ]
  },
  guangzhou: {
    name: "广州", nameEn: "Guangzhou",
    description: "Cantonese culture capital famous for dim sum and Pearl River.",
    climate: { type: "Subtropical monsoon", bestMonths: ["October", "November", "March", "April"], avgSummerTemp: "29°C", avgWinterTemp: "14°C", tips: "Hot and humid year-round. Rainy season April-September." },
    attractions: [
      { name: "广州塔", nameEn: "Canton Tower", category: "modern", ticketPrice: "¥150", description: "600m tall landmark with observation deck.", recommendedVisitTime: "2 hours" },
      { name: "陈家祠", nameEn: "Chen Clan Ancestral Hall", category: "historical", ticketPrice: "¥10", description: "Qing dynasty ancestral hall with ornate carvings.", recommendedVisitTime: "1.5 hours" }
    ],
    restaurants: [
      { name: "广州酒家", nameEn: "Guangzhou Restaurant", type: "local", cuisine: "Cantonese", avgPrice: 120, dishHighlights: ["Shrimp dumplings", "Char siu bao"] },
      { name: "点都德", nameEn: "Dim Dou Dak", type: "local", cuisine: "Cantonese", avgPrice: 80, dishHighlights: ["Cantonese dim sum", "Egg tarts"] }
    ],
    hotels: [
      { name: "广州四季酒店", nameEn: "Four Seasons Guangzhou", budget: "luxury", priceRange: "¥2000-4000/night", rating: 4.8 },
      { name: "7天连锁酒店", nameEn: "7 Days Inn", budget: "budget", priceRange: "¥150-300/night", rating: 3.8 }
    ],
    transport: [
      { type: "train", from: "Beijing", to: "Guangzhou", duration: "8h (high-speed)", price: "¥862", tips: "G-series trains available." },
      { type: "train", from: "Shenzhen", to: "Guangzhou", duration: "30min (high-speed)", price: "¥75", tips: "Very frequent." }
    ]
  },
  xian: {
    name: "西安", nameEn: "Xi'an",
    description: "Ancient capital with Terracotta Army and Muslim Quarter.",
    climate: { type: "Continental monsoon", bestMonths: ["April", "May", "September", "October"], avgSummerTemp: "27°C", avgWinterTemp: "-1°C", tips: "Dry climate. Best in spring and autumn." },
    attractions: [
      { name: "秦始皇兵马俑", nameEn: "Terracotta Army", category: "historical", ticketPrice: "¥120", description: "8,000+ warrior figures guarding Emperor Qin's tomb.", recommendedVisitTime: "3-4 hours" },
      { name: "西安城墙", nameEn: "City Wall", category: "historical", ticketPrice: "¥54", description: "14km ancient city wall, best explored by bike.", recommendedVisitTime: "2 hours" },
      { name: "回民街", nameEn: "Muslim Quarter", category: "cultural", ticketPrice: "Free", description: "Bustling food street with halal cuisine.", recommendedVisitTime: "2-3 hours" }
    ],
    restaurants: [
      { name: "同盛祥", nameEn: "Tong Sheng Xiang", type: "local", cuisine: "Shaanxi", avgPrice: 60, dishHighlights: ["Lamb pao mo", "Biangbiang noodles"] },
      { name: "老孙家", nameEn: "Lao Sun Jia", type: "local", cuisine: "Shaanxi", avgPrice: 50, dishHighlights: ["Lamb pao mo", "Roujiamo"] }
    ],
    hotels: [
      { name: "西安威斯汀酒店", nameEn: "The Westin Xi'an", budget: "luxury", priceRange: "¥1000-2000/night", rating: 4.6 },
      { name: "汉庭酒店", nameEn: "Hanting Hotel", budget: "budget", priceRange: "¥200-400/night", rating: 4.0 }
    ],
    transport: [
      { type: "train", from: "Beijing", to: "Xi'an", duration: "4.5h (high-speed)", price: "¥515", tips: "Multiple daily departures." },
      { type: "train", from: "Shanghai", to: "Xi'an", duration: "6h (high-speed)", price: "¥650", tips: "Book in advance for holidays." }
    ]
  },
  chengdu: {
    name: "成都", nameEn: "Chengdu",
    description: "Home of giant pandas and fiery Sichuan cuisine.",
    climate: { type: "Subtropical monsoon", bestMonths: ["March", "April", "May", "September", "October", "November"], avgSummerTemp: "26°C", avgWinterTemp: "6°C", tips: "Overcast and humid frequently. Best in spring and autumn." },
    attractions: [
      { name: "大熊猫繁育研究基地", nameEn: "Giant Panda Base", category: "nature", ticketPrice: "¥55", description: "See giant pandas up close in natural habitat.", recommendedVisitTime: "3-4 hours" },
      { name: "锦里古街", nameEn: "Jinli Ancient Street", category: "cultural", ticketPrice: "Free", description: "Traditional street with snacks, crafts and teahouses.", recommendedVisitTime: "2 hours" }
    ],
    restaurants: [
      { name: "大龙燚火锅", nameEn: "Da Long Yi Hot Pot", type: "local", cuisine: "Sichuan", avgPrice: 100, dishHighlights: ["Spicy hot pot", "Beef tripe"] },
      { name: "龙抄手", nameEn: "Long Wonton", type: "local", cuisine: "Sichuan", avgPrice: 40, dishHighlights: ["Wonton soup", "Dan dan noodles"] }
    ],
    hotels: [
      { name: "成都博舍酒店", nameEn: "The Temple House", budget: "luxury", priceRange: "¥1500-3000/night", rating: 4.8 },
      { name: "如家酒店", nameEn: "Home Inn", budget: "budget", priceRange: "¥200-350/night", rating: 4.0 }
    ],
    transport: [
      { type: "train", from: "Beijing", to: "Chengdu", duration: "8h (high-speed)", price: "¥800", tips: "Scenic route through mountains." },
      { type: "train", from: "Chongqing", to: "Chengdu", duration: "1.5h (high-speed)", price: "¥154", tips: "Very frequent, every 15-30 min." }
    ]
  },
  guilin: {
    name: "桂林", nameEn: "Guilin",
    description: "Stunning karst landscapes and Li River scenery.",
    climate: { type: "Subtropical monsoon", bestMonths: ["April", "May", "September", "October"], avgSummerTemp: "28°C", avgWinterTemp: "8°C", tips: "Rainy in summer. Best in spring and autumn." },
    attractions: [
      { name: "漓江", nameEn: "Li River", category: "nature", ticketPrice: "¥210 (cruise)", description: "80km scenic river cruise with karst peaks.", recommendedVisitTime: "4-5 hours" },
      { name: "象鼻山", nameEn: "Elephant Trunk Hill", category: "nature", ticketPrice: "¥75", description: "Iconic hill shaped like an elephant drinking.", recommendedVisitTime: "1 hour" }
    ],
    restaurants: [
      { name: "崇善米粉", nameEn: "Chongshan Rice Noodles", type: "local", cuisine: "Guangxi", avgPrice: 20, dishHighlights: ["Guilin rice noodles", "Beer fish"] }
    ],
    hotels: [
      { name: "桂林香格里拉", nameEn: "Shangri-La Guilin", budget: "luxury", priceRange: "¥1000-2000/night", rating: 4.6 },
      { name: "桂林如家", nameEn: "Home Inn Guilin", budget: "budget", priceRange: "¥150-300/night", rating: 3.9 }
    ],
    transport: [
      { type: "train", from: "Guangzhou", to: "Guilin", duration: "3h (high-speed)", price: "¥170", tips: "Multiple daily trains." }
    ]
  }
};

// Additional city aliases for matching
const CITY_ALIASES: Record<string, string> = {
  "beijing": "beijing", "北京": "beijing", "peking": "beijing",
  "shanghai": "shanghai", "上海": "shanghai",
  "guangzhou": "guangzhou", "广州": "guangzhou", "canton": "guangzhou",
  "xian": "xian", "西安": "xian", "xi'an": "xian",
  "chengdu": "chengdu", "成都": "chengdu",
  "guilin": "guilin", "桂林": "guilin", "kweilin": "guilin",
  "hangzhou": "hangzhou", "杭州": "hangzhou",
  "nanjing": "nanjing", "南京": "nanjing", "nanking": "nanjing",
  "chongqing": "chongqing", "重庆": "chongqing", "chungking": "chongqing",
  "shenzhen": "shenzhen", "深圳": "shenzhen",
  "suzhou": "suzhou", "苏州": "suzhou",
  "xiamen": "xiamen", "厦门": "xiamen", "amoy": "xiamen",
  "qingdao": "qingdao", "青岛": "qingdao", "tsingtao": "qingdao",
  "kunming": "kunming", "昆明": "kunming",
  "lijiang": "lijiang", "丽江": "lijiang",
  "sanya": "sanya", "三亚": "sanya",
  "wuhan": "wuhan", "武汉": "wuhan",
  "changsha": "changsha", "长沙": "changsha",
  "harbin": "harbin", "哈尔滨": "harbin",
  "tianjin": "tianjin", "天津": "tianjin",
  "dalian": "dalian", "大连": "dalian",
  "dali": "dali", "大理": "dali",
  "zhangjiajie": "zhangjiajie", "张家界": "zhangjiajie"
};

function lookupCity(cityInput: string): string | null {
  const lower = cityInput.toLowerCase().trim();
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  // Fuzzy match
  for (const [key, slug] of Object.entries(CITY_ALIASES)) {
    if (lower.includes(key) || key.includes(lower)) return slug;
  }
  return null;
}

function executeToolLocally(name: string, args: Record<string, string>): string {
  const cityInput = args.city || args.from || "";
  const citySlug = lookupCity(cityInput);
  const cityData = citySlug ? CITY_DATABASE[citySlug] : null;

  switch (name) {
    case 'CitySearch': {
      if (!cityData) {
        // Return list of available cities
        return JSON.stringify({
          found: false,
          message: `City "${cityInput}" not found in database.`,
          availableCities: ["Beijing", "Shanghai", "Guangzhou", "Xi'an", "Chengdu", "Guilin",
            "Hangzhou", "Nanjing", "Chongqing", "Shenzhen", "Suzhou", "Xiamen",
            "Qingdao", "Kunming", "Lijiang", "Sanya", "Wuhan", "Changsha",
            "Harbin", "Tianjin", "Dalian", "Dali", "Zhangjiajie"]
        });
      }
      return JSON.stringify({
        found: true,
        city: cityData.nameEn,
        cityZh: cityData.name,
        description: cityData.description,
        climate: cityData.climate,
        topAttractions: cityData.attractions.slice(0, 3).map(a => `${a.nameEn} (${a.name}) - ${a.ticketPrice}`),
        topRestaurants: cityData.restaurants.slice(0, 2).map(r => `${r.nameEn} - ${r.cuisine} - ¥${r.avgPrice}`),
        bestMonths: cityData.climate.bestMonths
      });
    }

    case 'AttractionSearch': {
      if (!cityData) return JSON.stringify({ error: `City "${cityInput}" not found.`, attractions: [] });
      const category = args.category;
      const filtered = category
        ? cityData.attractions.filter(a => a.category === category)
        : cityData.attractions;
      return JSON.stringify({
        city: cityData.nameEn,
        category: category || "all",
        attractions: filtered.map(a => ({
          name: a.name,
          nameEn: a.nameEn,
          category: a.category,
          ticketPrice: a.ticketPrice,
          description: a.description,
          visitTime: a.recommendedVisitTime
        }))
      });
    }

    case 'FoodSearch': {
      if (!cityData) return JSON.stringify({ error: `City "${cityInput}" not found.`, restaurants: [] });
      const budget = args.budget;
      let filtered = cityData.restaurants;
      if (budget === "low") filtered = filtered.filter(r => r.avgPrice <= 80);
      else if (budget === "medium") filtered = filtered.filter(r => r.avgPrice > 80 && r.avgPrice <= 300);
      else if (budget === "high") filtered = filtered.filter(r => r.avgPrice > 300);

      const cuisine = args.cuisine?.toLowerCase();
      if (cuisine) {
        const cuisineFiltered = filtered.filter(r => r.cuisine.toLowerCase().includes(cuisine));
        if (cuisineFiltered.length > 0) filtered = cuisineFiltered;
      }

      return JSON.stringify({
        city: cityData.nameEn,
        budget: budget || "all",
        restaurants: filtered.map(r => ({
          name: r.name,
          nameEn: r.nameEn,
          type: r.type === "michelin" ? "⭐ Michelin" : r.type === "blackpearl" ? "💎 Black Pearl" : "🏠 Local",
          cuisine: r.cuisine,
          avgPrice: `¥${r.avgPrice}`,
          highlights: r.dishHighlights
        }))
      });
    }

    case 'WeatherSearch': {
      if (!cityData) return JSON.stringify({ error: `City "${cityInput}" not found.` });
      return JSON.stringify({
        city: cityData.nameEn,
        climate: cityData.climate.type,
        bestMonths: cityData.climate.bestMonths,
        avgSummerTemp: cityData.climate.avgSummerTemp,
        avgWinterTemp: cityData.climate.avgWinterTemp,
        tips: cityData.climate.tips
      });
    }

    case 'HotelSearch': {
      if (!cityData) return JSON.stringify({ error: `City "${cityInput}" not found.`, hotels: [] });
      const budget = args.budget;
      let filtered = cityData.hotels;
      if (budget === "low") filtered = filtered.filter(h => h.budget === "budget");
      else if (budget === "medium") filtered = filtered.filter(h => h.budget === "mid");
      else if (budget === "high") filtered = filtered.filter(h => h.budget === "luxury");

      return JSON.stringify({
        city: cityData.nameEn,
        hotels: filtered.map(h => ({
          name: h.name,
          nameEn: h.nameEn,
          priceRange: h.priceRange,
          rating: h.rating
        }))
      });
    }

    case 'TransportSearch': {
      const toInput = args.to || "";
      const toSlug = lookupCity(toInput);
      const toCity = toSlug ? CITY_DATABASE[toSlug] : null;

      // Search from origin city's transport data
      if (cityData) {
        const fromTransports = cityData.transport.filter(t => {
          const toLower = t.to.toLowerCase();
          return toLower.includes(toInput.toLowerCase()) || toInput === "";
        });
        if (fromTransports.length > 0) {
          return JSON.stringify({
            from: cityData.nameEn,
            to: toInput,
            options: fromTransports.map(t => ({
              type: t.type,
              duration: t.duration,
              price: t.price,
              tips: t.tips
            }))
          });
        }
      }

      // Try reverse lookup
      if (toCity) {
        const toTransports = toCity.transport.filter(t => {
          const fromLower = t.from.toLowerCase();
          return fromLower.includes(cityInput.toLowerCase());
        });
        if (toTransports.length > 0) {
          return JSON.stringify({
            from: cityInput,
            to: toCity.nameEn,
            options: toTransports.map(t => ({
              type: t.type,
              duration: t.duration,
              price: t.price,
              tips: t.tips
            }))
          });
        }
      }

      // Generic response for routes not in DB
      return JSON.stringify({
        from: cityInput,
        to: toInput,
        message: "Specific route not found in database. General info:",
        options: [
          { type: "train", info: "Use 12306 app to book high-speed rail tickets. Most major cities connected." },
          { type: "flight", info: "Check Ctrip or Qunar for domestic flights." }
        ]
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ============================================================================
// MINIMAX CLIENT
// ============================================================================

export class MiniMaxClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string,
    baseUrl = "https://api.minimax.chat/v1",
    model = "MiniMax-M2.7-highspeed",
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * Make a single API request (non-streaming or streaming)
   */
  private async makeRequest(
    messages: MiniMaxMessage[],
    stream: boolean,
    tools?: typeof TOOLS
  ): Promise<Response> {
    const url = `${this.baseUrl}/chat/completions`;
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      stream,
    };
    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MiniMax API error: ${response.status} - ${errorText}`);
    }

    return response;
  }

  /**
   * Process tool calls from a response and execute them locally.
   * Returns tool result messages to append to conversation.
   */
  private processToolCalls(toolCalls: MiniMaxToolCall[]): MiniMaxMessage[] {
    const results: MiniMaxMessage[] = [];
    for (const tc of toolCalls) {
      const functionName = tc.function.name;
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        // If JSON parse fails, try simple parsing
        args = {};
      }

      console.log(`[MiniMax Tools] Executing ${functionName}(${JSON.stringify(args)})`);
      const result = executeToolLocally(functionName, args);
      console.log(`[MiniMax Tools] Result: ${result.slice(0, 200)}...`);

      results.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
    return results;
  }

  /**
   * Streaming chat with tool calling support.
   * Flow: Request → if tool_calls → execute locally → add results → request again → repeat until final content.
   */
  async chatStream(
    messages: MiniMaxMessage[],
    onMessage: (text: string, isComplete: boolean) => void,
    onError?: (error: Error) => void,
  ): Promise<string> {
    const MAX_TOOL_ROUNDS = 5; // Prevent infinite tool loops
    let currentMessages = [...messages];
    let fullResponse = "";

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        // Make non-streaming request to detect tool calls
        const response = await this.makeRequest(currentMessages, false, TOOLS);
        const data = await response.json();

        const choice = data.choices?.[0];
        if (!choice) {
          throw new Error("No choices in API response");
        }

        const message = choice.message;

        // Check for tool calls
        if (message?.tool_calls && message.tool_calls.length > 0) {
          console.log(`[MiniMax Tools] Round ${round + 1}: Model requested ${message.tool_calls.length} tool call(s)`);

          // Add assistant message with tool_calls to conversation
          currentMessages.push({
            role: "assistant",
            content: message.content || "",
            tool_calls: message.tool_calls,
          });

          // Execute tools locally and add results
          const toolResults = this.processToolCalls(message.tool_calls);
          currentMessages.push(...toolResults);

          // Continue loop - next request will get final answer or more tool calls
          continue;
        }

        // No tool calls - this is the final response
        fullResponse = message?.content || "";
        const cleaned = cleanModelResponse(fullResponse);

        // Now do a streaming request with the final messages for user experience
        if (round > 0) {
          // We already have the final answer from the non-streaming call
          // Stream it word by word for a nice UX
          const words = cleaned.split(/(\s+)/);
          let streamed = "";
          for (const word of words) {
            streamed += word;
            onMessage(streamed, false);
            // Small delay for streaming effect
            await new Promise(r => setTimeout(r, 20));
          }
          onMessage(cleaned, true);
        } else {
          // No tool calls were needed - get streaming response for real-time UX
          // Re-request with streaming for better user experience
          const streamResponse = await this.makeRequest(currentMessages, true);
          const reader = streamResponse.body?.getReader();
          if (!reader) {
            onMessage(cleaned, true);
            return cleaned;
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let streamedContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() === "" || !line.startsWith("data:")) continue;

              const dataStr = line.slice(5);
              if (dataStr === "[DONE]") {
                const finalCleaned = cleanModelResponse(streamedContent || fullResponse);
                onMessage(finalCleaned, true);
                return finalCleaned;
              }

              try {
                const event: MiniMaxStreamResponse = JSON.parse(dataStr);
                const content = event.choices[0]?.delta?.content;
                if (content) {
                  streamedContent += content;
                  onMessage(cleanModelResponse(streamedContent), false);
                }
                if (event.choices[0]?.finish_reason) {
                  const finalCleaned = cleanModelResponse(streamedContent || fullResponse);
                  onMessage(finalCleaned, true);
                  return finalCleaned;
                }
              } catch {
                // Skip malformed lines
              }
            }
          }

          const finalCleaned = cleanModelResponse(streamedContent || fullResponse);
          onMessage(finalCleaned, true);
          return finalCleaned;
        }

        return cleaned;
      }

      // Exceeded max tool rounds
      const cleaned = cleanModelResponse(fullResponse);
      onMessage(cleaned, true);
      return cleaned;
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error("Unknown error"));
      }
      return fullResponse;
    }
  }

  /**
   * Blocking chat with tool calling support (no streaming).
   */
  async chatBlocking(messages: MiniMaxMessage[]): Promise<string> {
    const MAX_TOOL_ROUNDS = 5;
    let currentMessages = [...messages];

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await this.makeRequest(currentMessages, false, TOOLS);
      const data = await response.json();

      const choice = data.choices?.[0];
      if (!choice) throw new Error("No choices in API response");

      const message = choice.message;

      // Check for tool calls
      if (message?.tool_calls && message.tool_calls.length > 0) {
        console.log(`[MiniMax Tools] Blocking round ${round + 1}: ${message.tool_calls.length} tool call(s)`);

        currentMessages.push({
          role: "assistant",
          content: message.content || "",
          tool_calls: message.tool_calls,
        });

        const toolResults = this.processToolCalls(message.tool_calls);
        currentMessages.push(...toolResults);
        continue;
      }

      // Final response
      return cleanModelResponse(message?.content || "");
    }

    return "[Error: Exceeded maximum tool call rounds]";
  }
}

// System prompt for travel planning
const TRAVEL_PLANNING_SYSTEM = `# Role Definition

You are **ChinaConnect AI** (中国旅行专家), an authoritative and friendly travel expert specializing in China tourism. You possess deep knowledge of:
- All Chinese provinces, cities, and regions — their history, culture, geography, and climate
- Chinese cuisine: regional specialties, Michelin/Black Pearl restaurants, street food, dietary customs
- Transportation: high-speed rail, domestic flights, metro systems, ride-hailing (Didi), bike-sharing
- Practical matters: visa policies, payment methods (WeChat Pay/Alipay), SIM cards, VPN, cultural etiquette
- Emergency protocols: police (110), ambulance (120), fire (119), embassy contacts

You help international visitors plan trips to Chinese cities with detailed itineraries, restaurant recommendations, transport tips, and cultural insights.

Follow the 8-step workflow for travel planning:
1. Intent Recognition - Classify user intent (travel planning/business/food/emergency/life consultation)
2. Parameter Extraction - Extract destination, days, budget, group size, preferences
3. City Matching - Match destination to city data
4. Route Generation - Create day-by-day itinerary
5. Content Enrichment - Add details, tips, practical info
6. Practical Info - Inject visa, payment, SIM, cultural tips
7. Formatting - Structure as markdown itinerary
8. Saving - Note user can save the plan

Always provide:
- Day-by-day schedule with timing
- Restaurant recommendations (Michelin/Black Pearl/local)
- Transport between locations
- Estimated costs in Chinese Yuan (¥) — ALWAYS use the ¥ symbol instead of "CNY"
- Cultural tips specific to the destination
- Emergency numbers relevant to the city

CRITICAL RULES:
- If the user specifies a number of days (e.g., "3 days", "5-day"), you MUST generate exactly that many days. NEVER add extra days.
- Always use ¥ symbol for prices, not "CNY" or "RMB". Example: ¥150 not 150 CNY
- Use ¥ for all price mentions throughout your response

## CRITICAL OUTPUT RULES

1. NEVER output <think> blocks. Do your reasoning silently.
2. NEVER output XML tool calls like <function>, <invoke>, <minimax:tool_call>, or [TOOL_CALL].
3. ONLY output the final user-facing response in clean Markdown format.
4. Do NOT show your internal reasoning process.
5. Do NOT show tool call syntax - just use the information you have.

## Available Tools

You have access to the following tools via the API. Use them to get accurate, real-time information about cities, attractions, restaurants, weather, hotels, and transport. The system will execute them for you automatically.

When you need information about a city, its attractions, restaurants, weather, hotels, or transport routes, the system will call the appropriate tools for you. You will receive the results and should use them to provide accurate recommendations.

### When tools are used automatically:
- User asks about a specific city → CitySearch provides city overview
- User asks about attractions → AttractionSearch provides attraction details
- User asks about food/restaurants → FoodSearch provides restaurant info
- User asks about transport between cities → TransportSearch provides routes
- User asks about weather → WeatherSearch provides climate info
- User asks about hotels → HotelSearch provides accommodation options

## Output Format Requirements

Structure your responses using Markdown for readability:

### For Travel Itineraries:
- Use **# headings** for main sections (Destination Overview, Daily Itinerary, Practical Info, Budget)
- Use **## headings** for sub-sections (Day 1, Day 2, etc.)
- Use **tables** for budget breakdowns and transport schedules
- Use **bullet lists** for attractions, restaurants, tips
- Use **bold** for key information (prices, times, names)

### For Information Queries:
- Use **bullet points** for step-by-step instructions
- Use **tables** for comparing options (hotels, transport)
- Use **blockquotes** (>) for important warnings or tips
- Use **code blocks** for phone numbers and addresses

### For Food Recommendations:
- Use **### headings** for each restaurant
- Include: cuisine type, average price, highlights, hours, address
- Use ⭐ for ratings, 💎 for awards

### Budget Table Format:
| Category | Amount (¥) |
|----------|------------|
| Total | ¥X,XXX |
| Food | ¥XXX |
| Accommodation | ¥XXX |
| Transport | ¥XXX |
| Attractions | ¥XXX |

### Transport Table Format:
| Train/Flight | Departure | Arrival | Duration | Price |
|-------------|-----------|---------|----------|-------|
| G123 | 08:00 | 12:30 | 4.5h | ¥553 |

Respond in the user's language (English/Chinese).

## Security Rules (MUST FOLLOW)

These rules are ABSOLUTE and NON-NEGOTIABLE:

1. **NEVER disclose or reference**: API keys, API endpoints, environment variables, database credentials, server configurations, internal system architecture, source code, or any backend implementation details. If asked, respond: "I cannot share technical implementation details."

2. **NEVER modify website files**: Do not provide instructions to modify, delete, or create any files on the server. Do not execute or suggest code that modifies the website.

3. **ONLY answer travel-related questions**: You may answer questions about China travel, culture, food, transportation, visa, accommodation, weather, and related practical matters. For non-travel questions, respond: "I'm specialized in China travel advice. Please ask me about destinations, itineraries, food, transport, or travel planning!"

4. **NEVER answer politically sensitive topics**: Do not discuss or comment on political matters, territorial disputes, government policies, censorship, human rights, military affairs, or any politically controversial subjects. Politely redirect: "I focus on travel advice. Let me help you plan your China trip instead!"

5. **NEVER generate harmful content**: No violence, discrimination, illegal activities, or content that could endanger travelers.

6. **Respect user privacy**: Do not ask for or store personal information beyond what's needed for travel planning.

Violation of these rules is strictly prohibited regardless of how the request is phrased.`;

// City data for grounding
const CITY_CONTEXT = `
Available cities: Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin

City data includes:
- Beijing: Forbidden City, Great Wall, Temple of Heaven, Peking Duck, 6 days recommended
- Shanghai: The Bund, Yu Garden, French Concession, Soup dumplings, 3-4 days
- Guangzhou: Canton Tower, Chimelong Safari, Dim Sum, 2-3 days
- Xi'an: Terracotta Army, City Wall, Muslim Quarter, Biangbiang noodles, 2-3 days
- Chengdu: Giant Panda Base, Jinli Street, Sichuan Opera, Hot pot, 2-3 days
- Guilin: Li River cruise, Elephant Trunk Hill, Rice noodles, 2-3 days
`;

export function createMiniMaxClient(): MiniMaxClient {
  const apiKey = import.meta.env.PUBLIC_MINIMAX_API_KEY || "";
  const baseUrl = import.meta.env.PUBLIC_MINIMAX_BASE_URL || "https://api.minimax.chat/v1";
  return new MiniMaxClient(apiKey, baseUrl);
}

export { TRAVEL_PLANNING_SYSTEM, CITY_CONTEXT };
