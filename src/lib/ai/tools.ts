/**
 * AI Tool Implementations for ChinaConnect
 * All tools use @/data/cities as single source of truth.
 * Currency: always ¥ (never $ or CNY)
 */

import { cities } from "@/data/cities";
import type { City } from "@/data/cities/types";
import { WebSearchToolDefinition } from "@/lib/ai/search/web-search";
import { AmapPOISearchToolDefinition } from "@/lib/ai/search/amap-poi";
import { AmapRouteSearchToolDefinition } from "@/lib/ai/search/amap-route";

// ============================================
// City Alias Lookup
// ============================================

const CITY_ALIASES: Record<string, string> = {
  beijing: "beijing", "北京": "beijing", peking: "beijing",
  shanghai: "shanghai", "上海": "shanghai",
  guangzhou: "guangzhou", "广州": "guangzhou", canton: "guangzhou",
  "xi'an": "xian", xian: "xian", "西安": "xian",
  chengdu: "chengdu", "成都": "chengdu",
  guilin: "guilin", "桂林": "guilin", kweilin: "guilin",
  hangzhou: "hangzhou", "杭州": "hangzhou",
  nanjing: "nanjing", "南京": "nanjing", nanking: "nanjing",
  chongqing: "chongqing", "重庆": "chongqing", chungking: "chongqing",
  shenzhen: "shenzhen", "深圳": "shenzhen",
  suzhou: "suzhou", "苏州": "suzhou",
  xiamen: "xiamen", "厦门": "xiamen", amoy: "xiamen",
  qingdao: "qingdao", "青岛": "qingdao", tsingtao: "qingdao",
  kunming: "kunming", "昆明": "kunming",
  lijiang: "lijiang", "丽江": "lijiang",
  sanya: "sanya", "三亚": "sanya",
  wuhan: "wuhan", "武汉": "wuhan",
  changsha: "changsha", "长沙": "changsha",
  harbin: "harbin", "哈尔滨": "harbin",
  tianjin: "tianjin", "天津": "tianjin",
  dalian: "dalian", "大连": "dalian",
  dali: "dali", "大理": "dali",
  zhangjiajie: "zhangjiajie", "张家界": "zhangjiajie",
};

function findCity(input: string): City | null {
  if (!input) return null;
  const lower = input.toLowerCase().trim();

  // Direct alias lookup
  const slug = CITY_ALIASES[lower];
  if (slug) {
    return cities.find(c => c.slug === slug) || null;
  }

  // Fuzzy match on name/nameEn/slug
  for (const city of cities) {
    const nameEn = (city.nameEn || "").toLowerCase();
    const nameZh = city.name.toLowerCase();
    const citySlug = city.slug.toLowerCase();
    if (
      nameEn.includes(lower) ||
      nameZh.includes(lower) ||
      citySlug.includes(lower) ||
      lower.includes(nameEn) ||
      lower.includes(nameZh)
    ) {
      return city;
    }
  }
  return null;
}

// ============================================
// CitySearch Tool
// ============================================

export function CitySearch(params: { city: string }): Record<string, unknown> {
  const city = findCity(params.city);

  if (!city) {
    return {
      found: false,
      message: `City "${params.city}" not found.`,
      availableCities: cities.map(c => c.nameEn),
    };
  }

  return {
    found: true,
    city: city.nameEn,
    cityZh: city.name,
    description: city.description,
    climate: city.climate,
    topAttractions: (city.attractions || []).slice(0, 5).map(a => ({
      name: a.nameEn || a.name,
      category: a.category,
      ticketPrice: a.ticketPrice || "Free",
      duration: a.recommendedVisitTime,
    })),
    topRestaurants: (city.restaurants || []).slice(0, 5).map(r => ({
      name: r.nameEn || r.name,
      cuisine: r.cuisine,
      type: r.type,
      avgPrice: `¥${r.avgPrice}`,
    })),
    bestMonths: city.climate?.bestMonths || [],
    transport: city.transport,
  };
}

// ============================================
// HotelSearch Tool — fixed budget mapping
// ============================================

export function HotelSearch(params: { city: string; budget?: string }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.`, hotels: [] };

  let hotels = city.hotels || [];

  if (params.budget) {
    // Map "medium" → "mid" (the actual budget value in city data)
    const budgetMap: Record<string, string[]> = {
      low: ["budget"],
      medium: ["mid", "budget"],
      high: ["luxury", "mid"],
      budget: ["budget"],
      mid: ["mid"],
      midRange: ["mid"],
      luxury: ["luxury"],
    };
    const targets = budgetMap[params.budget] || [params.budget];
    hotels = hotels.filter(h => targets.includes(h.budget));
  }

  return {
    city: city.nameEn,
    hotels: hotels.slice(0, 10).map(h => ({
      name: h.name,
      nameEn: h.nameEn,
      budget: h.budget,
      priceRange: h.priceRange,
      rating: h.rating,
      address: h.address,
      highlights: h.highlights,
      bookingTips: h.bookingTips,
    })),
    totalResults: Math.min(hotels.length, 10),
  };
}

// ============================================
// FoodSearch Tool
// ============================================

export function FoodSearch(params: { city: string; cuisine?: string; budget?: string }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.`, restaurants: [] };

  let restaurants = city.restaurants || [];

  if (params.budget) {
    const budgetMap: Record<string, (r: { avgPrice: number; type: string }) => boolean> = {
      low: r => r.avgPrice <= 80,
      medium: r => r.avgPrice > 80 && r.avgPrice <= 300,
      high: r => r.avgPrice > 300,
    };
    const filter = budgetMap[params.budget];
    if (filter) restaurants = restaurants.filter(filter);
  }

  if (params.cuisine) {
    const cuisineLower = params.cuisine.toLowerCase();
    const filtered = restaurants.filter(r =>
      r.cuisine?.toLowerCase().includes(cuisineLower)
    );
    if (filtered.length > 0) restaurants = filtered;
  }

  return {
    city: city.nameEn,
    budget: params.budget || "all",
    restaurants: restaurants.slice(0, 15).map(r => ({
      name: r.name,
      nameEn: r.nameEn,
      type: r.type === "michelin" ? "⭐ Michelin" : r.type === "blackpearl" ? "💎 Black Pearl" : "🏠 Local",
      cuisine: r.cuisine,
      avgPrice: `¥${r.avgPrice}`,
      highlights: r.dishHighlights,
      rating: r.rating,
      address: r.address,
    })),
  };
}

// ============================================
// TransportSearch Tool — uses city transport data
// ============================================

export function TransportSearch(params: { from: string; to: string }): Record<string, unknown> {
  const fromCity = findCity(params.from);
  const toCity = findCity(params.to);

  // Try to find transport info from city data
  const results: Array<{ type: string; from: string; to: string; duration: string; price: string; tips: string }> = [];

  // Search in transport.arrival for the destination city
  if (toCity?.transport?.arrival) {
    for (const t of toCity.transport.arrival) {
      const fromLower = params.from.toLowerCase();
      if (
        (t.from || "").toLowerCase().includes(fromLower) ||
        fromLower.includes((t.from || "").toLowerCase())
      ) {
        results.push({
          type: t.type,
          from: t.from || params.from,
          to: toCity.nameEn,
          duration: t.duration || "Varies",
          price: t.price || "Check booking platform",
          tips: t.tips || "",
        });
      }
    }
  }

  // Reverse: search in fromCity's transport.arrival
  if (results.length === 0 && fromCity?.transport?.arrival) {
    for (const t of fromCity.transport.arrival) {
      const toLower = params.to.toLowerCase();
      if (
        (t.to || "").toLowerCase().includes(toLower) ||
        toLower.includes((t.to || "").toLowerCase())
      ) {
        results.push({
          type: t.type,
          from: fromCity.nameEn,
          to: t.to || params.to,
          duration: t.duration || "Varies",
          price: t.price || "Check booking platform",
          tips: t.tips || "",
        });
      }
    }
  }

  // Generic fallback if no specific route found
  if (results.length === 0) {
    results.push(
      {
        type: "train",
        from: fromCity?.nameEn || params.from,
        to: toCity?.nameEn || params.to,
        duration: "Check 12306.cn",
        price: "Varies by class",
        tips: "Book via 12306 app or website. High-speed rail connects most major cities.",
      },
      {
        type: "flight",
        from: fromCity?.nameEn || params.from,
        to: toCity?.nameEn || params.to,
        duration: "Check Ctrip/Qunar",
        price: "Varies by airline",
        tips: "Check Ctrip, Qunar, or airline websites for domestic flights.",
      },
    );
  }

  return {
    from: fromCity?.nameEn || params.from,
    to: toCity?.nameEn || params.to,
    options: results,
  };
}

// ============================================
// VisaInfo Tool
// ============================================

const VISA_DATA: Record<string, { visaType: string; duration: string; requirements: string[]; notes: string[] }> = {
  "United States": {
    visaType: "L (Tourism/Business)",
    duration: "30-90 days",
    requirements: ["Passport (6+ months validity)", "Visa application form", "Recent photo", "Flight itinerary", "Hotel booking"],
    notes: ["Interview required", "Apply 1 month in advance", "10-year multiple entry available"],
  },
  "United Kingdom": {
    visaType: "L (Tourism)",
    duration: "30-60 days",
    requirements: ["Passport", "Visa application form", "Photo", "Itinerary"],
    notes: ["Interview required", "Apply 6 weeks in advance"],
  },
  Japan: {
    visaType: "L (Tourism)",
    duration: "15-30 days",
    requirements: ["Passport", "Application form", "Photo", "Travel documents"],
    notes: ["Group tours may have simplified processing"],
  },
  "South Korea": {
    visaType: "L (Tourism)",
    duration: "30 days",
    requirements: ["Passport", "Application", "Photo", "Itinerary", "Accommodation proof"],
    notes: ["Jeju Island is visa-free for most nationalities"],
  },
  Australia: {
    visaType: "L (Tourism)",
    duration: "30-90 days",
    requirements: ["Passport", "Application form", "Photo", "Flight bookings", "Hotel reservations"],
    notes: ["Processing 5-10 business days"],
  },
  default: {
    visaType: "L (Tourism)",
    duration: "30-60 days",
    requirements: ["Passport", "Visa application form", "Photo", "Itinerary"],
    notes: ["Check with local Chinese embassy for exact requirements", "Some nationalities have visa-free entry"],
  },
};

export function VisaInfo(params: { nationality?: string }): Record<string, unknown> {
  const nat = params.nationality || "default";
  const data = VISA_DATA[nat] || VISA_DATA.default;

  return {
    nationality: nat,
    visaType: data.visaType,
    duration: data.duration,
    requirements: data.requirements,
    notes: data.notes,
  };
}

// ============================================
// TranslationHelper Tool
// ============================================

const COMMON_PHRASES: Record<string, Record<string, string>> = {
  en: {
    hello: "你好 (nǐ hǎo)",
    thank_you: "谢谢 (xiè xiè)",
    please: "请 (qǐng)",
    sorry: "对不起 (duì bu qǐ)",
    help: "救命 (jiù mìng)",
    hospital: "医院 (yī yuàn)",
    police: "警察 (jǐng chá)",
    food: "吃的 (chī de)",
    water: "水 (shuǐ)",
    how_much: "多少钱？(duō shǎo qián?)",
    where: "在哪里？(zài nǎ lǐ?)",
    ticket: "票 (piào)",
    metro: "地铁 (dì tiě)",
    airport: "机场 (jī chǎng)",
    train_station: "火车站 (huǒ chē zhàn)",
    bill: "买单 (mǎi dān)",
    delicious: "好吃 (hǎo chī)",
  },
};

export function TranslationHelper(params: { text: string; targetLang?: string; sourceLang?: string }): Record<string, unknown> {
  const key = params.text.toLowerCase().trim().replace(/\s+/g, "_");
  const phrases = COMMON_PHRASES.en;

  if (phrases[key]) {
    return {
      original: params.text,
      translated: phrases[key],
      sourceLang: "en",
      targetLang: "zh",
      confidence: 1.0,
    };
  }

  return {
    original: params.text,
    translated: `[Translation: ${params.text}]`,
    sourceLang: params.sourceLang || "auto",
    targetLang: params.targetLang || "zh",
    confidence: 0.5,
    note: "For accurate translations, use an external translation API.",
  };
}

// ============================================
// WeatherInfo Tool — uses city climate data
// ============================================

export function WeatherInfo(params: { city: string }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.` };

  return {
    city: city.nameEn,
    cityZh: city.name,
    climate: city.climate?.type || "Unknown",
    bestMonths: city.climate?.bestMonths || [],
    avgSummerTemp: city.climate?.avgSummerTemp || "N/A",
    avgWinterTemp: city.climate?.avgWinterTemp || "N/A",
    tips: city.climate?.tips || "",
  };
}

// ============================================
// EmergencyInfo Tool — uses city emergency data
// ============================================

export function EmergencyInfo(params: { city?: string }): Record<string, unknown> {
  const result: Record<string, unknown> = {
    emergencyNumbers: [
      { service: "Ambulance", number: "120", note: "Emergency medical services" },
      { service: "Police", number: "110", note: "Public security" },
      { service: "Fire", number: "119", note: "Fire and rescue" },
      { service: "Traffic Accident", number: "122", note: "Road traffic emergencies" },
    ],
    hospitals: [] as unknown[],
    policeStations: [] as unknown[],
    tips: [
      "Keep your phone charged at all times",
      "Save your hotel address in Chinese on your phone",
      "Download offline translation for emergencies",
      "Know the nearest hospital to your hotel",
    ],
  };

  if (params.city) {
    const city = findCity(params.city);
    if (city?.emergencyContacts) {
      result.hospitals = city.emergencyContacts
        .filter(e => e.type === "hospital")
        .map(e => ({
          name: e.nameEn || e.name,
          phone: e.phone,
          address: e.address,
          notes: e.notes,
        }));
      result.policeStations = city.emergencyContacts
        .filter(e => e.type === "police")
        .map(e => ({
          name: e.nameEn || e.name,
          phone: e.phone,
          address: e.address,
        }));
    }
  }

  return result;
}

// ============================================
// SubwayRoute Tool — uses city transport.local data
// ============================================

export function SubwayRoute(params: { city: string; from?: string; to?: string }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.` };

  const metroLines = city.transport?.local?.metro || [];

  return {
    city: city.nameEn,
    metroSystem: metroLines.length > 0 ? "Available" : "Limited or unavailable",
    lines: metroLines,
    from: params.from || "Any",
    to: params.to || "Any",
    tips: [
      "Use the MetroMan or Amap app for real-time subway navigation",
      "Most metro stations have English signage",
      "Single journey tickets: ¥2-10 depending on distance",
      "Alipay/WeChat Pay QR codes work at most stations",
    ],
    cost: "¥2-10 per trip",
  };
}

// ============================================
// BudgetCalculator Tool
// ============================================

export function BudgetCalculator(params: {
  city: string;
  days?: number;
  budgetLevel?: string;
  travelers?: number;
}): Record<string, unknown> {
  const city = findCity(params.city);
  const days = params.days || 3;
  const level = params.budgetLevel || "midRange";
  const travelers = params.travelers || 1;

  // Budget estimates per person per day
  const budgetEstimates: Record<string, { accommodation: number; food: number; transport: number; attractions: number }> = {
    budget: { accommodation: 200, food: 100, transport: 50, attractions: 50 },
    midRange: { accommodation: 500, food: 200, transport: 100, attractions: 100 },
    luxury: { accommodation: 1500, food: 500, transport: 200, attractions: 200 },
  };

  const est = budgetEstimates[level] || budgetEstimates.midRange;
  const perDay = est.accommodation + est.food + est.transport + est.attractions;
  const total = perDay * days * travelers;

  return {
    city: city?.nameEn || params.city,
    days,
    budgetLevel: level,
    travelers,
    currency: "¥",
    breakdown: {
      accommodation: `¥${est.accommodation}/night`,
      food: `¥${est.food}/day`,
      transport: `¥${est.transport}/day`,
      attractions: `¥${est.attractions}/day`,
      perDay: `¥${perDay}/person`,
      total: `¥${total.toLocaleString()}`,
    },
    tips: [
      "Budget varies by city — Beijing/Shanghai are more expensive",
      "Street food can significantly reduce food costs",
      "Metro is the most cost-effective transport",
      "Book attractions online for discounts",
    ],
  };
}

// ============================================
// RouteOptimizer Tool
// ============================================

export function RouteOptimizer(params: { city: string; attractions?: string[]; days?: number }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.` };

  const attractions = city.attractions || [];
  const days = params.days || 1;
  const perDay = Math.ceil(attractions.length / days);

  const optimizedDays = [];
  for (let d = 0; d < days; d++) {
    const dayAttractions = attractions.slice(d * perDay, (d + 1) * perDay);
    optimizedDays.push({
      day: d + 1,
      theme: d === 0 ? "Historical & Cultural" : d === 1 ? "Modern & Local Life" : "Nature & Leisure",
      stops: dayAttractions.map((a, i) => ({
        name: a.nameEn || a.name,
        order: i + 1,
        suggestedTime: `${9 + i * 2}:00`,
        duration: a.recommendedVisitTime || "2 hours",
      })),
    });
  }

  return {
    city: city.nameEn,
    optimizedDays,
    tips: [
      "Group nearby attractions together to minimize travel time",
      "Visit popular spots early morning to avoid crowds",
      "Keep buffer time between attractions",
    ],
  };
}

// ============================================
// CulturalTips Tool
// ============================================

export function CulturalTips(params: { city: string }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.` };

  const tips = city.culturalTips || [];

  // Add generic China tips if city has none
  const allTips = tips.length > 0 ? tips : [
    { title: "Tipping", content: "Tipping is not expected in China, but appreciated at high-end hotels.", importance: "medium" as const },
    { title: "Bargaining", content: "Bargaining is expected at markets but not in malls or restaurants.", importance: "medium" as const },
    { title: "Chopstick Etiquette", content: "Never stick chopsticks upright in rice — it resembles funeral incense.", importance: "high" as const },
  ];

  return {
    city: city.nameEn,
    tips: allTips,
  };
}

// ============================================
// PaymentGuide Tool
// ============================================

export function PaymentGuide(params: { city?: string }): Record<string, unknown> {
  return {
    methods: [
      {
        name: "WeChat Pay",
        description: "China's most popular mobile payment. Link bank card to use.",
        setup: "Download WeChat → Me → Wallet → Add bank card",
        tips: ["Widely accepted everywhere", "Works for taxis, restaurants, shops"],
      },
      {
        name: "Alipay",
        description: "Another major mobile payment platform.",
        setup: "Download Alipay → Add bank card",
        tips: ["Similar coverage to WeChat Pay", "Has English interface option"],
      },
      {
        name: "Cash",
        description: "Keep some cash as backup for small vendors.",
        setup: "Exchange at banks or ATM",
        tips: ["Needed for some street vendors", "Small bills preferred"],
      },
      {
        name: "Credit Cards",
        description: "Accepted at large malls, hotels, and upscale restaurants.",
        setup: "Ensure card allows foreign transactions",
        tips: ["Visa/Mastercard accepted at major venues", "Not widely accepted at small shops"],
      },
    ],
    generalTips: [
      "Set up Alipay or WeChat Pay before arriving — most places are cashless",
      "Foreign tourists can now link international credit cards to Alipay",
      "Keep ¥200-500 cash backup for emergencies",
    ],
  };
}

// ============================================
// CrowdLevel Tool
// ============================================

export function CrowdLevel(params: { city: string; attraction?: string; month?: string }): Record<string, unknown> {
  const city = findCity(params.city);

  // Peak seasons
  const peakMonths = ["January", "February", "May", "October"]; // CNY, Labor Day, National Day
  const month = params.month || new Date().toLocaleString("en", { month: "long" });
  const isPeak = peakMonths.includes(month);

  return {
    city: city?.nameEn || params.city,
    attraction: params.attraction || "General",
    month,
    level: isPeak ? "high" : "moderate",
    tips: isPeak
      ? [
          "Major holidays (CNY, May Day, National Day) are extremely crowded",
          "Book tickets and hotels well in advance",
          "Visit popular attractions early morning (before 9 AM)",
          "Consider less-visited alternatives",
        ]
      : [
          "Off-peak travel offers better prices and fewer crowds",
          "Weekends are still busier than weekdays",
          "Early morning is best for popular spots",
        ],
    bestTimes: ["Early morning (8-9 AM)", "Late afternoon (4-5 PM)", "Weekdays"],
  };
}

// ============================================
// NearbyPOI Tool
// ============================================

export function NearbyPOI(params: { city: string; type?: string; near?: string }): Record<string, unknown> {
  const city = findCity(params.city);
  if (!city) return { error: `City "${params.city}" not found.` };

  const type = params.type || "attraction";

  if (type === "restaurant") {
    return {
      city: city.nameEn,
      type: "restaurant",
      near: params.near || "City center",
      results: (city.restaurants || []).slice(0, 5).map(r => ({
        name: r.nameEn || r.name,
        cuisine: r.cuisine,
        avgPrice: `¥${r.avgPrice}`,
        type: r.type,
        rating: r.rating,
      })),
    };
  }

  if (type === "hotel") {
    return {
      city: city.nameEn,
      type: "hotel",
      near: params.near || "City center",
      results: (city.hotels || []).slice(0, 5).map(h => ({
        name: h.nameEn || h.name,
        budget: h.budget,
        priceRange: h.priceRange,
        rating: h.rating,
      })),
    };
  }

  // Default: attractions
  return {
    city: city.nameEn,
    type: "attraction",
    near: params.near || "City center",
    results: (city.attractions || []).slice(0, 5).map(a => ({
      name: a.nameEn || a.name,
      category: a.category,
      ticketPrice: a.ticketPrice || "Free",
      duration: a.recommendedVisitTime,
    })),
  };
}

// ============================================
// Tool Registry — maps MiniMax function names to implementations
// ============================================

export const TOOL_REGISTRY: Record<string, (params: Record<string, string>) => Record<string, unknown>> = {
  CitySearch: (p) => CitySearch({ city: p.city }),
  HotelSearch: (p) => HotelSearch({ city: p.city, budget: p.budget }),
  FoodSearch: (p) => FoodSearch({ city: p.city, cuisine: p.cuisine, budget: p.budget }),
  TransportSearch: (p) => TransportSearch({ from: p.from, to: p.to }),
  VisaInfo: (p) => VisaInfo({ nationality: p.nationality }),
  TranslationHelper: (p) => TranslationHelper({ text: p.text, targetLang: p.targetLang, sourceLang: p.sourceLang }),
  WeatherInfo: (p) => WeatherInfo({ city: p.city }),
  EmergencyInfo: (p) => EmergencyInfo({ city: p.city }),
  SubwayRoute: (p) => SubwayRoute({ city: p.city, from: p.from, to: p.to }),
  BudgetCalculator: (p) => BudgetCalculator({ city: p.city, days: Number(p.days) || 3, budgetLevel: p.budgetLevel, travelers: Number(p.travelers) || 1 }),
  RouteOptimizer: (p) => RouteOptimizer({ city: p.city, attractions: p.attractions ? p.attractions.split(",") : undefined, days: Number(p.days) || 1 }),
  CulturalTips: (p) => CulturalTips({ city: p.city }),
  PaymentGuide: (p) => PaymentGuide({ city: p.city }),
  CrowdLevel: (p) => CrowdLevel({ city: p.city, attraction: p.attraction, month: p.month }),
  NearbyPOI: (p) => NearbyPOI({ city: p.city, type: p.type, near: p.near }),
};

/**
 * Execute a tool by name with the given arguments.
 * Used by MiniMaxClient to process tool calls.
 */
export function executeTool(name: string, args: Record<string, string>): string {
  const tool = TOOL_REGISTRY[name];
  if (!tool) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
  try {
    const result = tool(args);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({ error: `Tool execution failed: ${String(error)}` });
  }
}

// ============================================
// MiniMax API Tool Definitions (OpenAI-compatible)
// ============================================

/**
 * Local tool definitions (from city database).
 * Format: OpenAI-compatible function tools for MiniMax API.
 */
export const LOCAL_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "CitySearch",
      description: "Search for a Chinese city and get its overview, top attractions, restaurants, climate, and transport info.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name in English or Chinese, e.g. 'Beijing', '上海'." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "HotelSearch",
      description: "Search for hotels in a Chinese city filtered by budget level.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Shanghai'." },
          budget: { type: "string", description: "Budget level: 'budget', 'mid', 'luxury', 'low', 'medium', 'high'." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "FoodSearch",
      description: "Search for restaurants in a Chinese city, optionally filtered by cuisine type and budget.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Chengdu'." },
          cuisine: { type: "string", description: "Cuisine type, e.g. 'Sichuan', 'Cantonese', 'hotpot'." },
          budget: { type: "string", description: "Budget: 'low', 'medium', 'high'." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "TransportSearch",
      description: "Search for transport options (train, flight) between two Chinese cities.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "Departure city, e.g. 'Beijing'." },
          to: { type: "string", description: "Arrival city, e.g. 'Shanghai'." },
        },
        required: ["from", "to"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "VisaInfo",
      description: "Get China visa information for a given nationality.",
      parameters: {
        type: "object",
        properties: {
          nationality: { type: "string", description: "Country name, e.g. 'United States', 'Japan'." },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "TranslationHelper",
      description: "Translate common travel phrases to Chinese with pinyin pronunciation.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to translate, e.g. 'hello', 'how_much', 'food'." },
          targetLang: { type: "string", description: "Target language code, default 'zh'." },
          sourceLang: { type: "string", description: "Source language code, default 'auto'." },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "WeatherInfo",
      description: "Get climate and weather information for a Chinese city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Guangzhou'." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "EmergencyInfo",
      description: "Get emergency numbers (ambulance 120, police 110, fire 119) and hospital contacts for a city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name (optional), e.g. 'Beijing'." },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "SubwayRoute",
      description: "Get metro/subway information for a Chinese city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Shanghai'." },
          from: { type: "string", description: "Starting station (optional)." },
          to: { type: "string", description: "Destination station (optional)." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "BudgetCalculator",
      description: "Calculate estimated travel budget for a Chinese city trip.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Beijing'." },
          days: { type: "number", description: "Number of days (default 3)." },
          budgetLevel: { type: "string", description: "Budget level: 'budget', 'midRange', 'luxury'." },
          travelers: { type: "number", description: "Number of travelers (default 1)." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "RouteOptimizer",
      description: "Create an optimized multi-day sightseeing itinerary for a city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Xian'." },
          attractions: { type: "string", description: "Comma-separated attraction names (optional)." },
          days: { type: "number", description: "Number of days (default 1)." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "CulturalTips",
      description: "Get cultural etiquette tips for visiting a Chinese city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Chengdu'." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "PaymentGuide",
      description: "Get information about payment methods in China (WeChat Pay, Alipay, cash, credit cards).",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name (optional)." },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "CrowdLevel",
      description: "Check expected crowd levels for a city/attraction in a given month.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Hangzhou'." },
          attraction: { type: "string", description: "Specific attraction name (optional)." },
          month: { type: "string", description: "Month name, e.g. 'October'." },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "NearbyPOI",
      description: "Find nearby points of interest (restaurants, hotels, attractions) in a city from the local database.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name, e.g. 'Guilin'." },
          type: { type: "string", description: "POI type: 'attraction', 'restaurant', 'hotel'." },
          near: { type: "string", description: "Nearby landmark or area (optional)." },
        },
        required: ["city"],
      },
    },
  },
];

/**
 * Search tool definitions (real-time API-powered).
 * These wrap external APIs (AnySearch, Amap).
 */
export const SEARCH_TOOL_DEFINITIONS = [
  WebSearchToolDefinition,
  AmapPOISearchToolDefinition,
  AmapRouteSearchToolDefinition,
];

/**
 * All tool definitions combined — pass this array to MiniMax API's `tools` parameter.
 * Format: OpenAI-compatible function tools (type: "function").
 *
 * @example
 * ```ts
 * const response = await fetch(MINIMAX_URL, {
 *   method: "POST",
 *   body: JSON.stringify({
 *     model: "MiniMax-Text-01",
 *     messages: [...],
 *     tools: ALL_TOOL_DEFINITIONS,
 *   }),
 * });
 * ```
 */
export const ALL_TOOL_DEFINITIONS = [...LOCAL_TOOL_DEFINITIONS, ...SEARCH_TOOL_DEFINITIONS];
