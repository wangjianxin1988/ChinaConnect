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
  const translations = TRANSLATIONS[targetLang] || TRANSLATIONS["en"];

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
    map_url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(cityName + " China")}`,
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
    xian: "xian",
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

export const TOOL_REGISTRY = {
  city_database: getCityDatabase,
  weather_api: (params: { city: string; days?: number }) =>
    getWeatherData(params.city, params.days),
  hotel_search: searchHotels,
  transport_search: searchTransport,
  translation_api: translateText,
  map_service: getMapData,
  emergency_info: getEmergencyInfo,
};

export type ToolName = keyof typeof TOOL_REGISTRY;
