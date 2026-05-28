/**
 * AI Tool Implementations for ChinaConnect
 * Tools used by the ReAct engine during planning
 */

import { cities } from "@/data/cities";
import type { City } from "@/data/cities/beijing";

// ============================================
// City Database Tool
// ============================================

export function getCityDatabase(params: {
  city_name?: string;
  language?: string;
  include_attractions?: boolean;
  include_food?: boolean;
  include_transport?: boolean;
}):
  | {
      city: unknown;
      attractions: unknown[];
      restaurants: unknown[];
      transport: unknown;
    }
  | { error: string } {
  const {
    city_name,
    include_attractions = true,
    include_food = true,
    include_transport = true,
  } = params;

  if (!city_name) {
    return { error: "city_name is required" };
  }

  const city = findCity(city_name);

  if (!city) {
    return { error: `City "${city_name}" not found in database` };
  }

  const result: {
    city: unknown;
    attractions: unknown[];
    restaurants: unknown[];
    transport: unknown;
  } = {
    city: {
      name_en: city.nameEn || city.name,
      name_zh: city.name,
      population: city.population,
      timezone: city.timezone,
      climate: city.climate,
      highlights: city.highlights,
      description: city.description,
    },
    attractions: [],
    restaurants: [],
    transport: null,
  };

  if (include_attractions && city.attractions) {
    result.attractions = city.attractions.map((a) => ({
      id: a.id,
      name_en: a.nameEn || a.name,
      name_zh: a.name,
      category: a.category,
      description: a.description,
      ticket_price: a.ticketPrice,
      opening_hours: a.openingHours,
      duration: a.recommendedVisitTime,
      highlights: a.highlights,
      tips: a.tips,
      coordinates: a.coordinates,
    }));
  }

  if (include_food && city.restaurants) {
    result.restaurants = city.restaurants.map((r) => ({
      id: r.id,
      name_en: r.nameEn || r.name,
      name_zh: r.name,
      type: r.type,
      star: r.star,
      diamond: r.diamond,
      cuisine: r.cuisine,
      avg_price: r.avgPrice,
      rating: r.rating,
      highlights: r.dishHighlights,
      hours: r.hours,
      address: r.address,
    }));
  }

  if (include_transport && city.transport) {
    result.transport = city.transport;
  }

  return result;
}

// ============================================
// Weather Tool (Simulated)
// ============================================

export function getWeatherData(
  cityName: string,
  days = 5,
): {
  location: { city: string; coordinates?: { lat: number; lng: number } };
  forecast: unknown[];
} {
  const city = findCity(cityName);

  const conditions = ["sunny", "partly_cloudy", "cloudy", "rainy"];
  const forecast = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const baseTemp = city?.climate?.avgSummerTemp
      ? Number.parseInt(String(city.climate.avgSummerTemp))
      : 25;
    const variance = Math.floor(Math.random() * 6) - 3;

    forecast.push({
      date: date.toISOString().split("T")[0],
      weather: {
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        temperature_c: {
          min: baseTemp + variance - 5,
          max: baseTemp + variance + 3,
        },
        humidity_percent: 40 + Math.floor(Math.random() * 30),
        wind_kmh: 5 + Math.floor(Math.random() * 15),
        uv_index: 5 + Math.floor(Math.random() * 4),
      },
      travel_advisory: {
        good_for_outdoor: true,
        warnings: [],
        recommendations: ["Bring sunscreen", "Stay hydrated"],
      },
    });
  }

  return {
    location: {
      city: city?.nameEn || cityName,
      coordinates: city?.coordinates,
    },
    forecast,
  };
}

// ============================================
// Hotel Search Tool (Simulated)
// ============================================

export function searchHotels(params: {
  city: string;
  price_range?: { min: number; max: number };
  star_rating?: number[];
  location_preference?: string;
  budget_level?: "budget" | "medium" | "luxury";
  user_rating_min?: number;
  language?: string;
}): { hotels: unknown[]; filters_applied: unknown; total_results: number } {
  const city = findCity(params.city);

  if (!city?.hotels) {
    return { hotels: [], filters_applied: params, total_results: 0 };
  }

  let hotels = [...city.hotels];

  // Filter by budget level
  if (params.budget_level) {
    const budgetMap: Record<string, string[]> = {
      budget: ["budget"],
      medium: ["mid", "budget"],
      luxury: ["luxury", "mid"],
    };
    const target = budgetMap[params.budget_level] || ["mid"];
    hotels = hotels.filter((h) => target.includes(h.budget));
  }

  // Filter by price range
  if (params.price_range) {
    hotels = hotels.filter((h) => {
      const priceMatch = h.priceRange.match(/(\d+)-(\d+)/);
      if (!priceMatch) return true;
      const min = Number.parseInt(priceMatch[1]);
      return min >= (params.price_range!.min || 0) && min <= (params.price_range!.max || 99999);
    });
  }

  // Filter by rating
  if (params.user_rating_min) {
    hotels = hotels.filter((h) => h.rating >= params.user_rating_min!);
  }

  const result = hotels.slice(0, 10).map((h) => ({
    name_en: h.nameEn,
    name_zh: h.name,
    star_rating: h.budget === "luxury" ? 5 : h.budget === "mid" ? 4 : 3,
    user_rating: h.rating,
    price_per_night_cny: h.priceRange.split("-")[0]?.replace(/[^0-9]/g, "") || "?",
    price_range: h.priceRange,
    location: {
      address: h.address,
      nearest_metro: h.nearestMetro || undefined,
    },
    highlights: h.highlights,
    booking_tips: h.bookingTips,
  }));

  return {
    hotels: result,
    filters_applied: params,
    total_results: result.length,
  };
}

// ============================================
// Transport Search Tool
// ============================================

export function searchTransport(params: {
  from_city: string;
  to_city: string;
  date: string;
  transport_type?: "train" | "flight" | "all";
  time_preference?: "morning" | "afternoon" | "evening" | "any";
  passengers?: { adults: number; children: number; infants: number };
}): { trains: unknown[]; flights: unknown[]; error?: string } {
  // Simulated transport data for demonstration
  const trainTypes = ["G", "D"]; // High-speed

  const trains = [];

  if (params.transport_type !== "flight") {
    // Generate sample high-speed trains
    const times = ["08:00", "09:30", "11:00", "13:00", "14:30", "16:00", "18:00"];
    for (const time of times.slice(0, 4)) {
      const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
      trains.push({
        train_number: `${type}${Math.floor(Math.random() * 900 + 100)}`,
        train_type: "high_speed",
        from_station: params.from_city,
        to_station: params.to_city,
        departure_time: time,
        arrival_time: calculateArrival(time, 3 + Math.random() * 2),
        duration_hours: +(3 + Math.random() * 2).toFixed(1),
        distance_km: Math.floor(800 + Math.random() * 800),
        prices: {
          second_class: Math.floor(300 + Math.random() * 200),
          first_class: Math.floor(500 + Math.random() * 300),
          business_class: Math.floor(1000 + Math.random() * 500),
        },
        availability: ["high", "moderate", "low"][Math.floor(Math.random() * 3)],
        booking_url: "https://www.12306.cn",
      });
    }
  }

  const flights = [];

  if (params.transport_type !== "train") {
    const airlines = ["Air China", "China Eastern", "China Southern", "Xiamen Air"];
    const times = ["07:00", "10:30", "13:00", "16:00", "19:00"];
    for (const time of times.slice(0, 2)) {
      flights.push({
        flight_number: `${airlines[Math.floor(Math.random() * airlines.length)].slice(0, 2)}${Math.floor(Math.random() * 9000 + 1000)}`,
        airline: airlines[Math.floor(Math.random() * airlines.length)],
        from_airport: "PEK",
        to_airport: "PVG",
        departure_time: time,
        arrival_time: calculateArrival(time, 2 + Math.random()),
        duration_hours: +(2 + Math.random()).toFixed(1),
        prices: {
          economy: Math.floor(600 + Math.random() * 400),
          business: Math.floor(2000 + Math.random() * 1500),
        },
        availability: ["high", "moderate", "low"][Math.floor(Math.random() * 3)],
        booking_url: "https://www.ctrip.com",
      });
    }
  }

  return { trains, flights };
}

// ============================================
// Translation Tool
// ============================================

const TRANSLATIONS: Record<string, Record<string, string>> = {
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
  },
  zh: {
    hello: "Hello",
    thank_you: "Thank you",
    please: "Please",
    sorry: "Sorry",
    help: "Help!",
    hospital: "Hospital",
    police: "Police",
    food: "Food",
    water: "Water",
    how_much: "How much?",
    where: "Where?",
  },
};

export function translateText(
  text: string,
  targetLang: string,
  sourceLang = "auto",
): {
  original_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  confidence: number;
} {
  // Use built-in translations for common phrases
  const key = text.toLowerCase().trim();
  const translations = TRANSLATIONS[targetLang] || TRANSLATIONS.en;

  // Check if we have a direct translation
  if (translations[key]) {
    return {
      original_text: text,
      translated_text: translations[key],
      source_lang: targetLang === "en" ? "zh" : "en",
      target_lang: targetLang,
      confidence: 1.0,
    };
  }

  // For other text, return a placeholder response
  return {
    original_text: text,
    translated_text: `[Translation to ${targetLang} would appear here. For accurate translations, use an external translation API.]`,
    source_lang: sourceLang === "auto" ? "detected" : sourceLang,
    target_lang: targetLang,
    confidence: 0.5,
  };
}

// ============================================
// Map Service Tool
// ============================================

export function getMapData(cityName: string): {
  locations: unknown[];
  route?: unknown;
  map_url?: string;
  error?: string;
} {
  const city = findCity(cityName);

  if (!city) {
    return { error: `City "${cityName}" not found`, locations: [] };
  }

  const locations = [];

  // Add city center
  locations.push({
    name: city.nameEn || city.name,
    type: "city_center",
    coordinates: city.coordinates,
    formatted_address: `${city.name}, China`,
  });

  // Add attractions
  if (city.attractions) {
    for (const attr of city.attractions.slice(0, 10)) {
      locations.push({
        name: attr.nameEn || attr.name,
        type: "attraction",
        coordinates: attr.coordinates,
        category: attr.category,
      });
    }
  }

  // Add restaurants
  if (city.restaurants) {
    for (const rest of city.restaurants.slice(0, 5)) {
      locations.push({
        name: rest.nameEn || rest.name,
        type: "restaurant",
        coordinates: rest.coordinates,
        cuisine: rest.cuisine,
      });
    }
  }

  return {
    locations,
    route: {
      geojson: {
        type: "FeatureCollection",
        features: locations.map((l: { coordinates?: { lat: number; lng: number } }) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [l.coordinates?.lng || 0, l.coordinates?.lat || 0],
          },
        })),
      },
      total_distance_km: 15,
      estimated_duration_minutes: 45,
    },
    map_url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${cityName} China`)}`,
  };
}

// ============================================
// Emergency Info Tool
// ============================================

export function getEmergencyInfo(cityName?: string): {
  emergency_numbers: unknown[];
  hospitals: unknown[];
  police_stations: unknown[];
  embassies: unknown[];
} {
  const result = {
    emergency_numbers: [
      { service: "Ambulance", number: "120", note: "Emergency medical services" },
      { service: "Police", number: "110", note: "Public security" },
      { service: "Fire", number: "119", note: "Fire and rescue" },
      { service: "Traffic Accident", number: "122", note: "Road traffic emergencies" },
    ],
    hospitals: [],
    police_stations: [],
    embassies: [
      { country: "United States", phone: "+86 10 8531 3000", address: "Beijing" },
      { country: "United Kingdom", phone: "+86 10 8529 6600", address: "Beijing" },
      { country: "Canada", phone: "+86 10 5139 4000", address: "Beijing" },
      { country: "Australia", phone: "+86 10 8529 6600", address: "Beijing" },
      { country: "Japan", phone: "+86 10 6513 0300", address: "Beijing" },
      { country: "South Korea", phone: "+86 10 6501 6081", address: "Beijing" },
    ],
  };

  // Add city-specific info if available
  if (cityName) {
    const city = findCity(cityName);
    if (city?.emergencyContacts) {
      result.hospitals = city.emergencyContacts
        .filter((e) => e.type === "hospital")
        .map((e) => ({ name: e.nameEn, phone: e.phone, address: e.address, notes: e.notes }));

      result.police_stations = city.emergencyContacts
        .filter((e) => e.type === "police")
        .map((e) => ({ name: e.nameEn, phone: e.phone, address: e.address, notes: e.notes }));
    }
  }

  return result;
}

// ============================================
// Helper Functions
// ============================================

function findCity(name: string): City | null {
  if (!name) return null;

  const lowerName = name.toLowerCase();

  // Try slug match first
  const slugMap: Record<string, string> = {
    beijing: "beijing",
    北京: "beijing",
    peking: "beijing",
    shanghai: "shanghai",
    上海: "shanghai",
    guangzhou: "guangzhou",
    广州: "guangzhou",
    canton: "guangzhou",
    "xi'an": "xian",
    xian: "xian",
    西安: "xian",
    chengdu: "chengdu",
    成都: "chengdu",
    guilin: "guilin",
    桂林: "guilin",
  };

  const slug = slugMap[lowerName];
  if (slug) {
    return cities.find((c) => c.slug === slug) || null;
  }

  // Fuzzy search on names
  for (const city of cities) {
    const cityLower = (city.nameEn || city.name || "").toLowerCase();
    const nameLower = city.name.toLowerCase();
    if (
      cityLower.includes(lowerName) ||
      nameLower.includes(lowerName) ||
      lowerName.includes(cityLower)
    ) {
      return city;
    }
  }

  return null;
}

function calculateArrival(departure: string, durationHours: number): string {
  const [hours, minutes] = departure.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60);
  const arrivalHours = Math.floor(totalMinutes / 60) % 24;
  const arrivalMinutes = totalMinutes % 60;
  return `${String(arrivalHours).padStart(2, "0")}:${String(arrivalMinutes).padStart(2, "0")}`;
}

// ============================================
// Tool Registry
// ============================================

// Tool implementations for the 13 ChinaConnect tools
// Each tool is a function that returns structured data

/**
 * CitySearch - Search for city information in the database
 */
function citySearch(params: { query: string; language?: string }):
  | { cities: unknown[]; total: number }
  | { error: string } {
  const { query, language = "en" } = params;
  if (!query) {
    return { error: "query parameter is required" };
  }

  const lowerQuery = query.toLowerCase();
  const results: unknown[] = [];

  for (const city of cities) {
    const nameMatch =
      city.name.toLowerCase().includes(lowerQuery) ||
      city.nameEn?.toLowerCase().includes(lowerQuery) ||
      city.slug.toLowerCase().includes(lowerQuery);

    if (nameMatch) {
      results.push({
        slug: city.slug,
        name_en: city.nameEn,
        name_zh: city.name,
        region: city.region,
        population: city.population,
        highlights: city.highlights?.slice(0, 3) || [],
      });
    }
  }

  return { cities: results, total: results.length };
}

/**
 * AttractionSearch - Search for attractions in a city
 */
function attractionSearch(params: { city: string; category?: string; language?: string }):
  | { attractions: unknown[]; total: number }
  | { error: string } {
  const city = findCity(params.city);
  if (!city) {
    return { error: `City "${params.city}" not found` };
  }

  let attractions = city.attractions || [];

  if (params.category) {
    attractions = attractions.filter((a) =>
      a.category?.toLowerCase().includes(params.category!.toLowerCase()),
    );
  }

  const result = attractions.slice(0, 20).map((a) => ({
    id: a.id,
    name_en: a.nameEn || a.name,
    name_zh: a.name,
    category: a.category,
    description: a.description?.slice(0, 200),
    ticket_price: a.ticketPrice,
    opening_hours: a.openingHours,
    duration: a.recommendedVisitTime,
    highlights: a.highlights,
    tips: a.tips,
    coordinates: a.coordinates,
  }));

  return { attractions: result, total: result.length };
}

/**
 * FoodSearch - Search for restaurants and food in a city
 */
function foodSearch(params: { city: string; cuisine?: string; budget?: string; language?: string }):
  | { restaurants: unknown[]; total: number }
  | { error: string } {
  const city = findCity(params.city);
  if (!city) {
    return { error: `City "${params.city}" not found` };
  }

  let restaurants = city.restaurants || [];

  if (params.cuisine) {
    restaurants = restaurants.filter((r) =>
      r.cuisine?.toLowerCase().includes(params.cuisine!.toLowerCase()),
    );
  }

  if (params.budget) {
    restaurants = restaurants.filter((r) => r.type === params.budget);
  }

  const result = restaurants.slice(0, 15).map((r) => ({
    id: r.id,
    name_en: r.nameEn || r.name,
    name_zh: r.name,
    cuisine: r.cuisine,
    type: r.type,
    star: r.star,
    diamond: r.diamond,
    avg_price: r.avgPrice,
    rating: r.rating,
    dish_highlights: r.dishHighlights?.slice(0, 5),
    hours: r.hours,
    address: r.address,
  }));

  return { restaurants: result, total: result.length };
}

/**
 * PaymentGuide - Get payment method information
 */
function paymentGuide(params: { city?: string; language?: string }):
  | { payment_methods: unknown[]; tips: string[] }
  | { error: string } {
  const { language = "en" } = params;
  const isZh = language === "zh";

  const paymentMethods = [
    {
      method: isZh ? "微信支付" : "WeChat Pay",
      icon: "📱",
      description: isZh
        ? "中国最流行的移动支付方式，绑定银行卡后即可使用"
        : "China's most popular mobile payment, link bank card to use",
      setup: isZh ? "在微信中绑定银行卡" : "Link bank card in WeChat",
      usage: isZh ? "扫码支付、转账、发红包" : "Scan QR codes, transfers, red packets",
    },
    {
      method: isZh ? "支付宝" : "Alipay",
      icon: "💳",
      description: isZh
        ? "另一大移动支付平台，功能与微信支付类似"
        : "Another major mobile payment platform, similar to WeChat Pay",
      setup: isZh ? "在支付宝中绑定银行卡" : "Link bank card in Alipay",
      usage: isZh ? "扫码支付、转账、花呗" : "Scan QR codes, transfers, Huabei credit",
    },
    {
      method: isZh ? "现金" : "Cash",
      icon: "💵",
      description: isZh ? "准备适量现金以备不时之需" : "Keep some cash as backup",
      setup: isZh ? "在银行或兑换点兑换人民币" : "Exchange at banks or currency exchanges",
      usage: isZh ? "小商贩、农贸市场、景区门票" : "Street vendors, markets, tickets",
    },
    {
      method: isZh ? "信用卡" : "Credit Cards",
      icon: "💳",
      description: isZh
        ? "大型商场、酒店、餐厅可用"
        : "Accepted at large malls, hotels, restaurants",
      setup: isZh ? "确认卡片支持 foreign transactions" : "Ensure card allows foreign transactions",
      usage: isZh ? "酒店、商场、高端餐厅" : "Hotels, malls, upscale restaurants",
    },
  ];

  const tips = isZh
    ? [
        "大型商场和酒店普遍接受信用卡",
        "路边小摊和农贸市场通常只收现金",
        "提前确认卡片是否需要开通境外支付功能",
        "支付宝和微信支付是最便捷的支付方式",
      ]
    : [
        "Credit cards widely accepted at malls and hotels",
        "Street vendors and markets usually only accept cash",
        "Check if your card needs foreign transaction enabled",
        "Alipay and WeChat Pay are most convenient",
      ];

  return { payment_methods: paymentMethods, tips };
}

/**
 * VisaCheck - Check visa requirements
 */
function visaCheck(params: { nationality: string; purpose: string; language?: string }):
  | { visa_requirements: unknown[]; notes: string[] }
  | { error: string } {
  const { nationality, purpose = "tourism", language = "en" } = params;
  const isZh = language === "zh";

  // Simplified visa database
  const visaData: Record<
    string,
    { visa_type: string; duration: string; required_docs: string[]; notes: string[] }
  > = {
    "United States": {
      visa_type: "L (Tourism/Business)",
      duration: "30-90 days",
      required_docs: isZh
        ? ["护照", "签证申请表", "照片", "行程单", "酒店预订"]
        : ["Passport", "Visa application form", "Photo", "Itinerary", "Hotel booking"],
      notes: isZh
        ? ["需要面签", "建议提前1个月申请", "可申请10年多次入境"]
        : ["Interview required", "Apply 1 month in advance", "10-year multiple entry available"],
    },
    "United Kingdom": {
      visa_type: "L (Tourism)",
      duration: "30-60 days",
      required_docs: isZh
        ? ["护照", "签证申请表", "照片", "行程单"]
        : ["Passport", "Visa application form", "Photo", "Itinerary"],
      notes: isZh
        ? ["需要面签", "建议提前6周申请"]
        : ["Interview required", "Apply 6 weeks in advance"],
    },
    default: {
      visa_type: "L (Tourism)",
      duration: "30-60 days",
      required_docs: isZh
        ? ["护照", "签证申请表", "照片", "行程单"]
        : ["Passport", "Visa application form", "Photo", "Itinerary"],
      notes: isZh
        ? ["签证要求因国籍而异", "请查询当地中国领事馆"]
        : ["Visa requirements vary by nationality", "Check with local Chinese embassy"],
    },
  };

  const data = visaData[nationality] || visaData.default;

  return {
    visa_requirements: [
      {
        nationality,
        visa_type: data.visa_type,
        duration: data.duration,
        purpose,
        required_documents: data.required_docs,
      },
    ],
    notes: data.notes,
  };
}

/**
 * SIMCard - Get SIM card and data plan information
 */
function simCardInfo(params: { city?: string; language?: string }):
  | { providers: unknown[]; tips: string[] }
  | { error: string } {
  const { language = "en" } = params;
  const isZh = language === "zh";

  const providers = [
    {
      name: isZh ? "中国移动" : "China Mobile",
      logo: "📶",
      plans: isZh
        ? [
            { name: "5G畅享套餐", data: "30GB", price: "¥128/月" },
            { name: "4G自选套餐", data: "10GB", price: "¥58/月" },
          ]
        : [
            { name: "5G Unlimited", data: "30GB", price: "¥128/month" },
            { name: "4G Choice", data: "10GB", price: "¥58/month" },
          ],
      note: isZh ? "信号最好，覆盖最广" : "Best coverage, most popular",
    },
    {
      name: isZh ? "中国联通" : "China Unicom",
      logo: "📱",
      plans: isZh
        ? [
            { name: "5G畅爽套餐", data: "30GB", price: "¥129/月" },
            { name: "腾讯王卡", data: "40GB", price: "¥59/月" },
          ]
        : [
            { name: "5G Fast", data: "30GB", price: "¥129/month" },
            { name: "Tencent King", data: "40GB", price: "¥59/month" },
          ],
      note: isZh ? "性价比较高" : "Good value for money",
    },
    {
      name: isZh ? "中国电信" : "China Telecom",
      logo: "📞",
      plans: isZh
        ? [
            { name: "5G套餐", data: "30GB", price: "¥129/月" },
            { name: "4G套餐", data: "10GB", price: "¥59/月" },
          ]
        : [
            { name: "5G Plan", data: "30GB", price: "¥129/month" },
            { name: "4G Plan", data: "10GB", price: "¥59/month" },
          ],
      note: isZh ? "宽带服务优惠" : "Good broadband deals",
    },
  ];

  const tips = isZh
    ? [
        "可在机场到达大厅购买，需要护照",
        "便利店如7-11、全家也有销售",
        "建议选择30GB以上的套餐",
        "国际漫游费用较高，不推荐长期使用",
      ]
    : [
        "Available at airport arrival halls, bring passport",
        "Also sold at convenience stores like 7-Eleven",
        "Recommend plans with 30GB or more",
        "International roaming is expensive, not recommended",
      ];

  return { providers, tips };
}

/**
 * EmergencySOS - Get emergency SOS information
 */
function emergencySOS(params: { city?: string; language?: string }):
  | { emergency_numbers: unknown[]; procedures: string[]; shelters: unknown[] }
  | { error: string } {
  const { city, language = "en" } = params;
  const isZh = language === "zh";

  const emergencyNumbers = [
    { service: isZh ? "急救" : "Ambulance", number: "120", icon: "🚑" },
    { service: isZh ? "报警" : "Police", number: "110", icon: "🚔" },
    { service: isZh ? "火警" : "Fire", number: "119", icon: "🚒" },
    { service: isZh ? "交通事故" : "Traffic Accident", number: "122", icon: "🚗" },
  ];

  const procedures = isZh
    ? [
        "保持冷静，简要说清情况",
        "提供详细地址或地标",
        "说明受伤人数和情况",
        "保持电话畅通",
        "如有能力，可先进行自救",
      ]
    : [
        "Stay calm, describe the situation clearly",
        "Provide detailed address or landmarks",
        "State number of injured and their conditions",
        "Keep your phone on",
        "If able, provide self-first aid",
      ];

  // City-specific shelters would go here
  const shelters: unknown[] = [];

  return { emergency_numbers: emergencyNumbers, procedures, shelters };
}

/**
 * WebSearch - Placeholder for real-time web search
 */
function webSearch(params: { query: string; language?: string }):
  | { results: unknown[]; total: number; note: string }
  | { error: string } {
  const { query, language = "en" } = params;
  if (!query) {
    return { error: "query parameter is required" };
  }

  // Placeholder - actual web search would require external API
  return {
    results: [],
    total: 0,
    note:
      language === "zh"
        ? "实时搜索需要配置 AnySearch MCP 或其他搜索API"
        : "Real-time search requires AnySearch MCP or other search API configuration",
  };
}

/**
 * LocalExpert - Get local expert recommendations
 */
function localExpert(params: { city: string; specialty?: string; language?: string }):
  | { experts: unknown[]; tours: unknown[]; note: string }
  | { error: string } {
  const { city, specialty = "general", language = "en" } = params;
  const isZh = language === "zh";

  // Placeholder for local expert/guides
  const experts: unknown[] = [
    {
      name: isZh ? "当地向导" : "Local Guide",
      specialty: specialty,
      rating: 4.8,
      languages: ["English", "Mandarin"],
      note: isZh
        ? "请联系当地旅行社获取认证向导"
        : "Contact local travel agency for certified guides",
    },
  ];

  const tours: unknown[] = [
    {
      name: isZh ? "城市一日游" : "City Day Tour",
      duration: "8 hours",
      includes: isZh
        ? ["交通", "门票", "午餐", "向导"]
        : ["Transport", "Tickets", "Lunch", "Guide"],
      price: isZh ? "¥500-800/人" : "¥500-800/person",
    },
  ];

  return {
    experts,
    tours,
    note:
      language === "zh"
        ? "更多向导服务请通过当地旅行社预约"
        : "For more guides, book through local travel agencies",
  };
}

// ============================================
// Tool Registry (13 Tools)
// ============================================

export const TOOL_REGISTRY = {
  // Core search tools
  CitySearch: citySearch,
  AttractionSearch: attractionSearch,
  FoodSearch: foodSearch,
  HotelSearch: searchHotels,
  TransportSearch: searchTransport,
  WeatherSearch: (params: { city: string; days?: number }) =>
    getWeatherData(params.city, params.days),

  // Information tools
  EmergencyContact: getEmergencyInfo,
  PaymentGuide: paymentGuide,
  VisaCheck: visaCheck,
  SIMCard: simCardInfo,
  TranslationService: translateText,
  EmergencySOS: emergencySOS,

  // Advanced tools
  WebSearch: webSearch,
  LocalExpert: localExpert,

  // Legacy aliases (for backward compatibility)
  city_database: getCityDatabase,
  map_service: getMapData,
};

export type ToolName = keyof typeof TOOL_REGISTRY;
