// @ts-nocheck
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
      links: {
        "🗺️ Navigate on Amap": `https://uri.amap.com/search?keyword=${encodeURIComponent(a.nameEn || a.name)}&city=${encodeURIComponent(city.nameEn)}&callnative=1`,
      },
    })),
    topRestaurants: (city.restaurants || []).slice(0, 5).map(r => ({
      name: r.nameEn || r.name,
      cuisine: r.cuisine,
      type: r.type,
      avgPrice: `¥${r.avgPrice}`,
      links: {
        "🗺️ Navigate on Amap": `https://uri.amap.com/search?keyword=${encodeURIComponent(r.nameEn || r.name)}&city=${encodeURIComponent(city.nameEn)}&callnative=1`,
        "⭐ Reviews on Dianping": `https://www.dianping.com/search/keyword/0/0_${encodeURIComponent(r.nameEn || r.name)}`,
      },
    })),
    bestMonths: city.climate?.bestMonths || [],
    transport: city.transport,
    cityLinks: {
      "🗺️ Amap City Guide": `https://uri.amap.com/search?keyword=${encodeURIComponent(city.nameEn)}&city=${encodeURIComponent(city.nameEn)}&callnative=1`,
      "📱 Download Amap App": "https://apps.apple.com/app/apple-store/id461703208",
    },
    dataSource: webResults.length > 0 ? "Real-time from WebSearch + Local database" : "Local database",
    ...(webResults.length > 0 ? { webHighlights: webResults.slice(0, 3).map(r => ({ title: r.title, snippet: r.snippet })) } : {}),
  };
}

// ============================================
// HotelSearch Tool — ALWAYS returns 3 tiers
// ============================================

export async function HotelSearch(params: { city: string; budget?: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;

  // Helper: search Amap for a specific hotel tier
  async function searchAmapTier(keywords: string): Promise<Array<{ name: string; address: string; rating?: string; cost?: string; tel?: string }>> {
    try {
      const result = await executeAmapPOISearch({ keywords, city: cityName, type: "hotel", pageSize: 5 });
      if (result.success && result.pois.length > 0) {
        return result.pois.map(p => ({ name: p.name, address: p.address, rating: p.rating, cost: p.cost, tel: p.tel }));
      }
    } catch { /* ignore */ }
    return [];
  }

  // Search all 3 tiers in parallel
  const [budgetAmap, midAmap, luxuryAmap] = await Promise.all([
    searchAmapTier("经济型酒店"),
    searchAmapTier("商务酒店"),
    searchAmapTier("五星级酒店"),
  ]);

  // Static data by tier
  const staticHotels = (city?.hotels || []).map(h => ({
    name: h.nameEn || h.name, budget: h.budget, priceRange: h.priceRange,
    rating: h.rating, address: h.address, highlights: h.highlights,
    bookingTips: h.bookingTips, source: "local" as const,
  }));

  const staticBudget = staticHotels.filter(h => h.budget === "budget");
  const staticMid = staticHotels.filter(h => h.budget === "mid");
  const staticLuxury = staticHotels.filter(h => h.budget === "luxury");

  // Merge + add links per tier
  function withLinks(hotel: { name: string; address?: string; rating?: string; cost?: string; tel?: string; budget?: string; priceRange?: string; source?: string }) {
    return {
      ...hotel,
      links: {
        "🗺️ Amap Navigation": `https://uri.amap.com/search?keyword=${encodeURIComponent(hotel.name)}&city=${encodeURIComponent(cityName)}&callnative=1`,
        "📱 Trip.com": `https://hotels.ctrip.com/hotels/list?city=${encodeURIComponent(cityName.toLowerCase())}`,
        "🌐 Booking.com": `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}&lang=en-us`,
      },
    };
  }

  const budgetHotels = [
    ...budgetAmap.map(h => withLinks({ ...h, source: "amap", budget: "budget" })),
    ...staticBudget.map(h => withLinks(h)),
  ].slice(0, 3);

  const midHotels = [
    ...midAmap.map(h => withLinks({ ...h, source: "amap", budget: "mid" })),
    ...staticMid.map(h => withLinks(h)),
  ].slice(0, 3);

  const luxuryHotels = [
    ...luxuryAmap.map(h => withLinks({ ...h, source: "amap", budget: "luxury" })),
    ...staticLuxury.map(h => withLinks(h)),
  ].slice(0, 3);

  // If a specific budget was requested, still return all 3 but mark the preferred one
  const preferred = params.budget || "all";

  return {
    city: cityName,
    preferred,
    priceTiers: {
      budget: {
        label: "💚 Budget (经济型)",
        priceRange: "¥80-250/night",
        hotels: budgetHotels.length > 0 ? budgetHotels : [{ name: "Search more on Trip.com", note: "No budget hotels found in database" }],
      },
      midRange: {
        label: "💛 Mid-range (商务型)",
        priceRange: "¥250-700/night",
        hotels: midHotels.length > 0 ? midHotels : [{ name: "Search more on Trip.com", note: "No mid-range hotels found in database" }],
      },
      luxury: {
        label: "❤️ Luxury (豪华型)",
        priceRange: "¥700-3000+/night",
        hotels: luxuryHotels.length > 0 ? luxuryHotels : [{ name: "Search more on Trip.com", note: "No luxury hotels found in database" }],
      },
    },
    allResults: [...budgetHotels, ...midHotels, ...luxuryHotels],
    dataSource: (budgetAmap.length + midAmap.length + luxuryAmap.length) > 0 ? "Real-time from Amap (高德地图)" : "Local database",
    bookingLinks: {
      "📱 Trip.com Hotel List": `https://hotels.ctrip.com/hotels/list?city=${encodeURIComponent(cityName.toLowerCase())}`,
      "🌐 Booking.com": `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}&lang=en-us`,
      "🏨 Agoda": `https://www.agoda.com/search?city=${encodeURIComponent(cityName)}&lang=en-us`,
    },
  };
}

// ============================================
// FoodSearch Tool — RICH categories + 3 tiers
// ============================================

export async function FoodSearch(params: { city: string; cuisine?: string; budget?: string }): Promise<Record<string, unknown>> {
  const city = findCity(params.city);
  const cityName = city?.nameEn || params.city;

  // Helper: search Amap for a specific food category
  async function searchFood(keywords: string, pageSize = 5): Promise<Array<{ name: string; address: string; rating?: string; cost?: string; tel?: string }>> {
    try {
      const result = await executeAmapPOISearch({ keywords, city: cityName, type: "restaurant", pageSize });
      if (result.success && result.pois.length > 0) {
        return result.pois.map(p => ({ name: p.name, address: p.address, rating: p.rating, cost: p.cost, tel: p.tel }));
      }
    } catch { /* ignore */ }
    return [];
  }

  // Search multiple food categories in parallel
  const [mainFood, bubbleTea, fruitShops, streetFood] = await Promise.all([
    searchFood(params.cuisine ? `${params.cuisine}餐厅` : "美食餐厅", 8),
    searchFood("奶茶", 4),
    searchFood("水果店", 3),
    searchFood("小吃", 5),
  ]);

  // Static data
  const staticRestaurants = (city?.restaurants || []).map(r => ({
    name: r.nameEn || r.name,
    type: r.type === "michelin" ? "⭐ Michelin" : r.type === "blackpearl" ? "💎 Black Pearl" : "🏠 Local",
    cuisine: r.cuisine, avgPrice: `¥${r.avgPrice}`, highlights: r.dishHighlights,
    rating: r.rating, address: r.address, source: "local" as const,
  }));

  // Helper: add links
  function withFoodLinks(item: { name: string; address?: string; rating?: string; cost?: string; tel?: string; cuisine?: string; avgPrice?: string; type?: string; source?: string }) {
    return {
      ...item,
      links: {
        "🗺️ Amap Navigation": `https://uri.amap.com/search?keyword=${encodeURIComponent(item.name)}&city=${encodeURIComponent(cityName)}&callnative=1`,
        "⭐ Dianping Reviews": `https://www.dianping.com/search/keyword/0/0_${encodeURIComponent(item.name)}`,
      },
    };
  }

  // Categorize main food by price tier
  const budgetFood = mainFood.filter(h => !h.cost || parseCost(h.cost) <= 60).slice(0, 3);
  const midFood = mainFood.filter(h => { const c = parseCost(h.cost); return c > 60 && c <= 200; }).slice(0, 3);
  const luxuryFood = mainFood.filter(h => parseCost(h.cost) > 200).slice(0, 3);
  // If filtering left nothing, just use all
  const allMainFood = mainFood.map(h => withFoodLinks({ ...h, source: "amap" as const }));

  // Merge budget tiers from static
  const staticBudget = staticRestaurants.filter(r => parseInt(r.avgPrice.replace("¥", "")) <= 60).slice(0, 3);
  const staticMid = staticRestaurants.filter(r => { const p = parseInt(r.avgPrice.replace("¥", "")); return p > 60 && p <= 200; }).slice(0, 3);
  const staticLuxury = staticRestaurants.filter(r => parseInt(r.avgPrice.replace("¥", "")) > 200).slice(0, 3);

  // If budgetFood/midFood/luxuryFood are empty from Amap, use static
  const budgetResults = budgetFood.length > 0
    ? budgetFood.map(h => withFoodLinks({ ...h, source: "amap" as const }))
    : staticBudget.map(h => withFoodLinks(h));
  const midResults = midFood.length > 0
    ? midFood.map(h => withFoodLinks({ ...h, source: "amap" as const }))
    : staticMid.map(h => withFoodLinks(h));
  const luxuryResults = luxuryFood.length > 0
    ? luxuryFood.map(h => withFoodLinks({ ...h, source: "amap" as const }))
    : staticLuxury.map(h => withFoodLinks(h));

  const totalAmapCount = mainFood.length + bubbleTea.length + fruitShops.length + streetFood.length;

  return {
    city: cityName,
    cuisine: params.cuisine || "all",
    categories: {
      restaurants: {
        budget: { label: "💚 Budget (¥15-60/person)", items: budgetResults },
        midRange: { label: "💛 Mid-range (¥60-200/person)", items: midResults },
        luxury: { label: "❤️ Luxury (¥200+/person)", items: luxuryResults },
        all: allMainFood,
      },
      drinks: {
        bubbleTea: bubbleTea.map(h => withFoodLinks({ ...h, source: "amap" as const })),
        note: "Popular chains: Heytea (喜茶), Nayuki (奈雪), Mixue (蜜雪冰城), Chagee (霸王茶姬)",
      },
      streetFood: streetFood.map(h => withFoodLinks({ ...h, source: "amap" as const })),
      freshFruit: fruitShops.map(h => withFoodLinks({ ...h, source: "amap" as const })),
    },
    allResults: [...allMainFood, ...bubbleTea.map(h => withFoodLinks({ ...h, source: "amap" as const })), ...streetFood.map(h => withFoodLinks({ ...h, source: "amap" as const })), ...fruitShops.map(h => withFoodLinks({ ...h, source: "amap" as const })), ...staticRestaurants.map(h => withFoodLinks(h))],
    dataSource: totalAmapCount > 0 ? "Real-time from Amap (高德地图)" : "Local database",
    dianpingLink: `https://www.dianping.com/${encodeURIComponent(cityName.toLowerCase())}/food`,
    meituanLink: `https://www.meituan.com/s/${encodeURIComponent(cityName)}美食`,
  };
}

/** Parse cost string to number, default 100 if unparseable */
function parseCost(cost?: string): number {
  if (!cost) return 100;
  const num = parseInt(cost.replace(/[^0-9]/g, ""));
  return isNaN(num) ? 100 : num;
}

// ============================================
// TransportSearch Tool — MANDATORY real-time + links
// ============================================

export async function TransportSearch(params: { from: string; to: string }): Promise<Record<string, unknown>> {
  const fromCity = findCity(params.from);
  const toCity = findCity(params.to);
  const fromName = fromCity?.nameEn || params.from;
  const toName = toCity?.nameEn || params.to;

  // ALWAYS search for real-time data (mandatory, not optional)
  let webResults: Array<{ title: string; snippet: string; url?: string }> = [];
  try {
    const search = await executeWebSearch({
      query: `${fromName} to ${toName} China train high-speed rail flight schedule price 2026`,
      maxResults: 5,
    });
    if (search.success) webResults = search.results;
  } catch {
    // Retry with simpler query
    try {
      const search2 = await executeWebSearch({
        query: `${fromName} ${toName} 火车 航班`,
        maxResults: 3,
      });
      if (search2.success) webResults = search2.results;
    } catch { /* give up */ }
  }

  // Static data from city database
  const results: Array<{ type: string; from: string; to: string; duration: string; price: string; tips: string }> = [];

  if (toCity?.transport?.arrival) {
    for (const t of toCity.transport.arrival) {
      if ((t.from || "").toLowerCase().includes(params.from.toLowerCase()) ||
          params.from.toLowerCase().includes((t.from || "").toLowerCase())) {
        results.push({
          type: t.type, from: t.from || params.from, to: toName,
          duration: t.duration || "Varies", price: t.price || "Check 12306.cn", tips: t.tips || "",
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
          duration: t.duration || "Varies", price: t.price || "Check 12306.cn", tips: t.tips || "",
        });
      }
    }
  }

  // Always provide structured options even without static data
  if (results.length === 0) {
    results.push(
      { type: "🚄 High-speed Train", from: fromName, to: toName, duration: "4-6 hours (typical)", price: "¥400-900 (2nd/1st class)", tips: "Book 15 days in advance on 12306" },
      { type: "✈️ Flight", from: fromName, to: toName, duration: "2-3 hours", price: "¥500-2000 (economy/business)", tips: "Check Trip.com or Qunar for best prices" },
      { type: "🚗 Driving", from: fromName, to: toName, duration: "Check Amap for route", price: "Fuel + tolls estimate on Amap", tips: "Requires Chinese driver's license" },
    );
  }

  // Comprehensive booking links (ALWAYS included)
  const links = {
    "🚄 12306 Official Train Booking": "https://www.12306.cn/index/",
    "🚄 Trip.com Trains": `https://trains.ctrip.com/webapp/train/list?ticketType=0&dStation=${encodeURIComponent(fromName)}&aStation=${encodeURIComponent(toName)}`,
    "✈️ Trip.com Flights": `https://flights.ctrip.com/online/list/oneway-${encodeURIComponent(fromName)}-${encodeURIComponent(toName)}`,
    "✈️ Qunar Flights": `https://flight.qunar.com/site/oneway_list.htm?searchDepartureAirport=${encodeURIComponent(fromName)}&searchArrivalAirport=${encodeURIComponent(toName)}`,
    "🗺️ Amap Driving Route": `https://uri.amap.com/route/plan?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}&mode=car&callnative=1`,
    "🗺️ Amap Transit Route": `https://uri.amap.com/route/plan?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}&mode=bus&callnative=1`,
  };

  // Local transport info
  const localTransport: Record<string, unknown> = {};
  const targetCity = toCity || fromCity;
  if (targetCity?.transport?.local) {
    const local = targetCity.transport.local;
    if (local.metro) localTransport.metro = local.metro;
    if (local.bus) localTransport.bus = local.bus;
    localTransport.tips = [
      "Download Amap (高德地图) for real-time transit navigation",
      "Metro runs ~5:30 AM to ~11:00 PM in most cities",
      "Taxi: start ¥10-13, use DiDi app (滴滴) or Amap to hail",
    ];
  }

  // Web search results as supplemental info
  const webInfo = webResults.length > 0
    ? webResults.slice(0, 3).map(r => ({ title: r.title, snippet: r.snippet, url: r.url }))
    : [];

  return {
    from: fromName,
    to: toName,
    options: results,
    links,
    localTransport,
    proTips: [
      "🚄 Book train tickets 15 days in advance on 12306.cn (official)",
      "✈️ Use Trip.com or Qunar for English interface flight booking",
      "🚗 Self-driving requires a Chinese driver's license (international not accepted)",
      "🚇 Metro + walking is the most convenient for city exploration",
      "📱 Download Amap (高德地图) — China's best navigation app",
    ],
    dataSource: webResults.length > 0 ? "Real-time from WebSearch + Local database" : "Local database",
    ...(webInfo.length > 0 ? { webInfo } : {}),
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
          links: {
            "🌤️ OpenMeteo Forecast": `https://open-meteo.com/en/docs#latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`,
            "📊 Weather Dashboard": `https://open-meteo.com/en/docs#latitude=${coords.lat}&longitude=${coords.lng}`,
          },
          dataSource: "Real-time from OpenMeteo API",
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
      description: "Search for hotels in a Chinese city. Returns 3 price tiers (budget/mid/luxury) with real-time Amap data and booking links. Call this tool once — it automatically returns all 3 tiers.",
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
      description: "Search for food in a Chinese city. Returns multiple categories: restaurants (3 tiers: budget/mid/luxury), bubble tea shops, street food snacks, fruit shops. Each with real-time Amap data, addresses, and navigation links.",
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
      description: "Search for transport options between two Chinese cities. Returns train, flight, and driving options with specific price ranges (never 'Varies'), real-time WebSearch data, and comprehensive booking links (12306, Trip.com, Qunar, Amap navigation).",
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
