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
import { executeWebSearch } from "@/lib/ai/search/web-search";
import { executeAmapPOISearch } from "@/lib/ai/search/amap-poi";
import { fetchWeather } from "@/services/weather-api";

// ============================================
// City Coordinates (for weather API)
// ============================================

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  beijing: { lat: 39.9042, lng: 116.4074 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  guangzhou: { lat: 23.1291, lng: 113.2644 },
  xian: { lat: 34.3416, lng: 108.9398 },
  chengdu: { lat: 30.5728, lng: 104.0668 },
  guilin: { lat: 25.2736, lng: 110.2900 },
  hangzhou: { lat: 30.2741, lng: 120.1551 },
  nanjing: { lat: 32.0603, lng: 118.7969 },
  chongqing: { lat: 29.5630, lng: 106.5516 },
  shenzhen: { lat: 22.5431, lng: 114.0579 },
  suzhou: { lat: 31.2990, lng: 120.5853 },
  xiamen: { lat: 24.4798, lng: 118.0894 },
  qingdao: { lat: 36.0671, lng: 120.3826 },
  kunming: { lat: 25.0389, lng: 102.7183 },
  lijiang: { lat: 26.8721, lng: 100.2299 },
  sanya: { lat: 18.2528, lng: 109.5120 },
  wuhan: { lat: 30.5928, lng: 114.3055 },
  changsha: { lat: 28.2282, lng: 112.9388 },
  harbin: { lat: 45.8038, lng: 126.5350 },
  tianjin: { lat: 39.3434, lng: 117.3616 },
  dalian: { lat: 38.9140, lng: 121.6147 },
  dali: { lat: 25.6065, lng: 100.2676 },
  zhangjiajie: { lat: 29.1170, lng: 110.4793 },
};

/** Get coordinates for any city — hardcoded first, then OpenMeteo geocoding fallback */
async function getCityCoords(cityName: string): Promise<{ lat: number; lng: number } | null> {
  const key = cityName.toLowerCase().trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Alias check
  const slug = CITY_ALIASES[key];
  if (slug && CITY_COORDS[slug]) return CITY_COORDS[slug];
  // Try OpenMeteo geocoding (free, works worldwide)
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en`,
      { signal: AbortSignal.timeout(5000) },
    );
    const data = await res.json();
    if (data.results?.[0]) {
      return { lat: data.results[0].latitude, lng: data.results[0].longitude };
    }
  } catch { /* ignore */ }
  return null;
}

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

export async function CitySearch(params: { city: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;

  // Try real-time WebSearch for up-to-date city info
  let webResults: Array<{ title: string; snippet: string; url: string }> = [];
  try {
    const search = await executeWebSearch({ query: `${cityName} China travel guide top attractions food 2026`, maxResults: 5 });
    if (search.success && search.results.length > 0) {
      webResults = search.results;
    }
  } catch { /* fall through */ }

  if (!city) {
    // City not in static DB — return web results only
    if (webResults.length > 0) {
      return {
        found: true,
        city: cityName,
        source: "web",
        webOverview: webResults.map(r => ({ title: r.title, snippet: r.snippet, url: r.url })),
        note: "City not in local database. Data from real-time web search.",
      };
    }
    return {
      found: false,
      message: `City "${params.city}" not found.`,
      availableCities: cities.map(c => c.nameEn),
    };
  }

  // Merge static + real-time data
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
    ...(webResults.length > 0 ? { webHighlights: webResults.slice(0, 3).map(r => ({ title: r.title, snippet: r.snippet })) } : {}),
  };
}

// ============================================
// HotelSearch Tool — fixed budget mapping
// ============================================

export async function HotelSearch(params: { city: string; budget?: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;

  // Try Amap POI search for real-time hotel data
  let amapHotels: Array<{ name: string; address: string; rating?: string; cost?: string; tel?: string }> = [];
  try {
    const keywords = params.budget === "luxury" ? "五星级酒店" : params.budget === "budget" ? "经济型酒店" : "酒店";
    const result = await executeAmapPOISearch({ keywords, city: cityName, type: "hotel", pageSize: 10 });
    if (result.success && result.pois.length > 0) {
      amapHotels = result.pois.map(p => ({
        name: p.name,
        address: p.address,
        rating: p.rating,
        cost: p.cost,
        tel: p.tel,
      }));
    }
  } catch { /* fall through */ }

  // Static data as supplement
  let staticHotels = (city?.hotels || []).map(h => ({
    name: h.nameEn || h.name,
    budget: h.budget,
    priceRange: h.priceRange,
    rating: h.rating,
    address: h.address,
    highlights: h.highlights,
    bookingTips: h.bookingTips,
    source: "local" as const,
  }));

  if (params.budget) {
    const budgetMap: Record<string, string[]> = {
      low: ["budget"], medium: ["mid", "budget"], high: ["luxury", "mid"],
      budget: ["budget"], mid: ["mid"], midRange: ["mid"], luxury: ["luxury"],
    };
    const targets = budgetMap[params.budget] || [params.budget];
    staticHotels = staticHotels.filter(h => targets.includes(h.budget));
  }

  // Merge: Amap results first, then static
  const merged = [
    ...amapHotels.map(h => ({ ...h, source: "amap" as const })),
    ...staticHotels,
  ];

  return {
    city: cityName,
    totalResults: merged.length,
    hotels: merged.slice(0, 10),
    ...(amapHotels.length > 0 ? { note: "Real-time hotel data from Amap (高德地图)" } : {}),
  };
}

// ============================================
// FoodSearch Tool
// ============================================

export async function FoodSearch(params: { city: string; cuisine?: string; budget?: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;

  // Try Amap POI search for real-time restaurant data
  let amapRestaurants: Array<{ name: string; address: string; rating?: string; cost?: string; tel?: string }> = [];
  try {
    const keywords = params.cuisine ? `${params.cuisine}餐厅` : "美食";
    const result = await executeAmapPOISearch({ keywords, city: cityName, type: "restaurant", pageSize: 10 });
    if (result.success && result.pois.length > 0) {
      amapRestaurants = result.pois.map(p => ({
        name: p.name,
        address: p.address,
        rating: p.rating,
        cost: p.cost,
        tel: p.tel,
      }));
    }
  } catch { /* fall through */ }

  // Static data as supplement
  let staticRestaurants = (city?.restaurants || []).map(r => ({
    name: r.nameEn || r.name,
    type: r.type === "michelin" ? "⭐ Michelin" : r.type === "blackpearl" ? "💎 Black Pearl" : "🏠 Local",
    cuisine: r.cuisine,
    avgPrice: `¥${r.avgPrice}`,
    highlights: r.dishHighlights,
    rating: r.rating,
    address: r.address,
    source: "local" as const,
  }));

  if (params.budget) {
    const budgetMap: Record<string, (r: { avgPrice: string }) => boolean> = {
      low: r => parseInt(r.avgPrice.replace("¥", "")) <= 80,
      medium: r => { const p = parseInt(r.avgPrice.replace("¥", "")); return p > 80 && p <= 300; },
      high: r => parseInt(r.avgPrice.replace("¥", "")) > 300,
    };
    const filter = budgetMap[params.budget];
    if (filter) staticRestaurants = staticRestaurants.filter(filter);
  }

  if (params.cuisine) {
    const cuisineLower = params.cuisine.toLowerCase();
    const filtered = staticRestaurants.filter(r => r.cuisine?.toLowerCase().includes(cuisineLower));
    if (filtered.length > 0) staticRestaurants = filtered;
  }

  // Merge: Amap results first, then static
  const merged = [
    ...amapRestaurants.map(r => ({ ...r, source: "amap" as const })),
    ...staticRestaurants,
  ];

  return {
    city: cityName,
    budget: params.budget || "all",
    totalResults: merged.length,
    restaurants: merged.slice(0, 15),
    ...(amapRestaurants.length > 0 ? { note: "Real-time restaurant data from Amap (高德地图)" } : {}),
  };
}

// ============================================
// TransportSearch Tool — uses city transport data
// ============================================

export async function TransportSearch(params: { from: string; to: string }): Promise<Record<string, unknown>> {
  const fromCity = findCity(params.from);
  const toCity = findCity(params.to);
  const fromName = fromCity?.nameEn || params.from;
  const toName = toCity?.nameEn || params.to;

  // Try WebSearch for real-time transport info
  let webResults: Array<{ title: string; snippet: string }> = [];
  try {
    const search = await executeWebSearch({
      query: `train flight ${fromName} to ${toName} China schedule price 2026`,
      maxResults: 5,
    });
    if (search.success) webResults = search.results;
  } catch { /* fall through */ }

  // Static data
  const results: Array<{ type: string; from: string; to: string; duration: string; price: string; tips: string }> = [];

  if (toCity?.transport?.arrival) {
    for (const t of toCity.transport.arrival) {
      if ((t.from || "").toLowerCase().includes(params.from.toLowerCase()) ||
          params.from.toLowerCase().includes((t.from || "").toLowerCase())) {
        results.push({
          type: t.type, from: t.from || params.from, to: toName,
          duration: t.duration || "Varies", price: t.price || "Check booking platform", tips: t.tips || "",
        });
      }
    }
  }

  if (results.length === 0 && fromCity?.transport?.arrival) {
    for (const t of fromCity.transport.arrival) {
      if ((t.to || "").toLowerCase().includes(params.to.toLowerCase()) ||
          params.to.toLowerCase().includes((t.to || "").toLowerCase())) {
        results.push({
          type: t.type, from: fromName, to: t.to || params.to,
          duration: t.duration || "Varies", price: t.price || "Check booking platform", tips: t.tips || "",
        });
      }
    }
  }

  if (results.length === 0) {
    results.push(
      { type: "train", from: fromName, to: toName, duration: "Check 12306.cn", price: "Varies by class",
        tips: "Book via 12306 app or website. High-speed rail connects most major cities." },
      { type: "flight", from: fromName, to: toName, duration: "Check Ctrip/Qunar", price: "Varies by airline",
        tips: "Check Ctrip, Qunar, or airline websites for domestic flights." },
    );
  }

  return {
    from: fromName,
    to: toName,
    options: results,
    ...(webResults.length > 0 ? { webInfo: webResults.slice(0, 3).map(r => ({ title: r.title, snippet: r.snippet })) } : {}),
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

export async function WeatherInfo(params: { city: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;

  // Try OpenMeteo API for real-time weather
  try {
    const coords = await getCityCoords(params.city);
    if (coords) {
      const weatherData = await fetchWeather(cityName, coords.lat, coords.lng);
      if (weatherData.source === "api") {
        return {
          city: cityName,
          cityZh: city?.name || cityName,
          source: "real-time (OpenMeteo)",
          current: {
            temp: `${weatherData.current.temp}°C`,
            feelsLike: `${weatherData.current.feelsLike}°C`,
            humidity: `${weatherData.current.humidity}%`,
            windSpeed: `${weatherData.current.windSpeed} km/h`,
            description: weatherData.current.description,
            main: weatherData.current.main,
          },
          forecast: weatherData.forecast.map(d => ({
            date: d.date,
            day: d.dayName,
            tempRange: `${d.tempMin}°C ~ ${d.tempMax}°C`,
            weather: d.description,
            rainChance: `${Math.round(d.pop * 100)}%`,
          })),
          ...(city?.climate ? { climate: { type: city.climate.type, bestMonths: city.climate.bestMonths, tips: city.climate.tips } } : {}),
        };
      }
    }
  } catch { /* fall through to static */ }

  // Fallback to static climate data
  if (!city) return { error: `City "${params.city}" not found.` };

  return {
    city: city.nameEn,
    cityZh: city.name,
    source: "static (climate data)",
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

export async function NearbyPOI(params: { city: string; type?: string; near?: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;
  const type = params.type || "attraction";

  // Try Amap POI search for real-time data
  let amapResults: Array<{ name: string; address: string; rating?: string; cost?: string; tel?: string }> = [];
  try {
    const keywords = type === "restaurant" ? "美食" : type === "hotel" ? "酒店" : "景点";
    const result = await executeAmapPOISearch({ keywords, city: cityName, type, pageSize: 5 });
    if (result.success && result.pois.length > 0) {
      amapResults = result.pois.map(p => ({
        name: p.name, address: p.address, rating: p.rating, cost: p.cost, tel: p.tel,
      }));
    }
  } catch { /* fall through */ }

  // Static fallback
  let staticResults: Array<Record<string, unknown>> = [];
  if (type === "restaurant") {
    staticResults = (city?.restaurants || []).slice(0, 5).map(r => ({
      name: r.nameEn || r.name, cuisine: r.cuisine, avgPrice: `¥${r.avgPrice}`, type: r.type, rating: r.rating,
    }));
  } else if (type === "hotel") {
    staticResults = (city?.hotels || []).slice(0, 5).map(h => ({
      name: h.nameEn || h.name, budget: h.budget, priceRange: h.priceRange, rating: h.rating,
    }));
  } else {
    staticResults = (city?.attractions || []).slice(0, 5).map(a => ({
      name: a.nameEn || a.name, category: a.category, ticketPrice: a.ticketPrice || "Free", duration: a.recommendedVisitTime,
    }));
  }

  const merged = [
    ...amapResults.map(r => ({ ...r, source: "amap" as const })),
    ...staticResults.map(r => ({ ...r, source: "local" as const })),
  ];

  return {
    city: cityName,
    type,
    near: params.near || "City center",
    totalResults: merged.length,
    results: merged.slice(0, 10),
    ...(amapResults.length > 0 ? { note: "Real-time POI data from Amap (高德地图)" } : {}),
  };
}

// ============================================
// Tool Registry — maps MiniMax function names to implementations
// ============================================

export const TOOL_REGISTRY: Record<string, (params: Record<string, string>) => Record<string, unknown> | Promise<Record<string, unknown>>> = {
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
export async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  const tool = TOOL_REGISTRY[name];
  if (!tool) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
  try {
    const result = await tool(args);
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
