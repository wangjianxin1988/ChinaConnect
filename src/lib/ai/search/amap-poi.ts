/**
 * AmapPOISearch Tool for ChinaConnect AI
 * Searches for Points of Interest (restaurants, hotels, attractions, etc.)
 * using ChinaConnect's built-in city dataset, then returns FREE Amap (高德地图)
 * deep links — uri.amap.com links need NO Amap Web API key.
 *
 * For real-time verification (opening hours, prices, phone numbers) the AI must
 * also call WebSearch.
 */

// ============================================
// Types
// ============================================

export interface AmapPOIParams {
  keywords: string;
  city?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface AmapPOIItem {
  name: string;
  type: string;
  address: string;
  location: { lng: number; lat: number };
  tel?: string;
  distance?: string;
  rating?: string;
  cost?: string;
  businessArea?: string;
  photos?: Array<{ title: string; url: string }>;
}

export interface AmapPOIResult {
  success: boolean;
  count: number;
  pois: AmapPOIItem[];
  error?: string;
  /** Free Amap deep link (no API key required) */
  freeSearchLink?: string;
  /** Result source: "builtin" (in-site dataset) or "none" */
  source?: "builtin" | "none";
}

// ============================================
// Built-in dataset search (100% free, no API key)
// ============================================

import { cities } from "@/data/cities";
import type { City } from "@/data/cities/types";

function findCity(input?: string): City | null {
  if (!input) return null;
  const lower = input.toLowerCase().trim();
  if (!lower) return null;
  for (const city of cities) {
    const nameEn = (city.nameEn || "").toLowerCase();
    const nameZh = (city.name || "").toLowerCase();
    const slug = city.slug.toLowerCase();
    if (
      nameEn.includes(lower) ||
      nameZh.includes(lower) ||
      slug.includes(lower) ||
      lower.includes(nameEn) ||
      lower.includes(nameZh)
    ) {
      return city;
    }
  }
  return null;
}

function matchKw(haystack: string | undefined, kw: string): boolean {
  if (!kw) return true;
  return (haystack || "").toLowerCase().includes(kw);
}

/**
 * Search POIs using ChinaConnect's built-in city dataset.
 * Returns structured JSON plus a free Amap deep link for navigation.
 * No Amap Web API key is required.
 */
export async function executeAmapPOISearch(params: AmapPOIParams): Promise<AmapPOIResult> {
  const { keywords, city: cityName, type, page = 1, pageSize = 10 } = params;

  if (!keywords || keywords.trim().length === 0) {
    return {
      success: false,
      count: 0,
      pois: [],
      error: "Keywords parameter is required and cannot be empty.",
    };
  }

  const kw = keywords.trim().toLowerCase();
  const city = findCity(cityName);
  const typeKey = (type || "").toLowerCase();

  const freeSearchLink =
    "https://uri.amap.com/search?keyword=" +
    encodeURIComponent(keywords.trim()) +
    "&city=" +
    encodeURIComponent(city?.nameEn || cityName || "") +
    "&callnative=1";

  if (!city) {
    return {
      success: true,
      count: 0,
      pois: [],
      source: "none",
      freeSearchLink,
      error:
        "City not found in built-in dataset. Use WebSearch for real-time POI details.",
    };
  }

  const pois: AmapPOIItem[] = [];

  const isRestaurant =
    typeKey === "" ||
    typeKey === "restaurant" ||
    typeKey === "food" ||
    typeKey === "dining" ||
    typeKey === "cafe" ||
    typeKey === "bar" ||
    typeKey === "tea";
  const isHotel = typeKey === "hotel" || typeKey === "accommodation" || typeKey === "lodging";
  const isAttraction = typeKey === "attraction" || typeKey === "scenic" || typeKey === "sightseeing";

  if (isRestaurant) {
    for (const r of city.restaurants || []) {
      if (
        !matchKw(r.name, kw) &&
        !matchKw(r.nameEn, kw) &&
        !matchKw(r.cuisine, kw) &&
        !matchKw(r.address, kw) &&
        !matchKw(r.dishHighlights?.join(" "), kw)
      ) {
        continue;
      }
      pois.push({
        name: r.nameEn || r.name,
        type:
          r.type === "michelin"
            ? "Michelin"
            : r.type === "blackpearl"
              ? "Black Pearl"
              : "Local",
        address: r.address || "",
        location: r.coordinates
          ? { lng: r.coordinates.lng, lat: r.coordinates.lat }
          : { lng: 0, lat: 0 },
        tel: r.phone,
        rating: r.rating ? String(r.rating) : undefined,
        cost: r.avgPrice ? `¥${r.avgPrice}` : undefined,
      });
    }
  }

  if (isHotel) {
    for (const h of city.hotels || []) {
      if (
        !matchKw(h.name, kw) &&
        !matchKw(h.nameEn, kw) &&
        !matchKw(h.address, kw)
      ) {
        continue;
      }
      pois.push({
        name: h.nameEn || h.name,
        type: h.budget === "luxury" ? "Luxury" : h.budget === "mid" ? "Mid-range" : "Budget",
        address: h.address || "",
        location: { lng: 0, lat: 0 },
        rating: h.rating ? String(h.rating) : undefined,
        cost: h.priceRange,
      });
    }
  }

  if (isAttraction) {
    for (const a of city.attractions || []) {
      if (
        !matchKw(a.name, kw) &&
        !matchKw(a.nameEn, kw) &&
        !matchKw(a.category, kw) &&
        !matchKw(a.address, kw)
      ) {
        continue;
      }
      pois.push({
        name: a.nameEn || a.name,
        type: a.category || "Attraction",
        address: a.address || "",
        location: a.coordinates
          ? { lng: a.coordinates.lng, lat: a.coordinates.lat }
          : { lng: 0, lat: 0 },
        cost: a.ticketPrice,
      });
    }
  }

  pois.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

  const start = (page - 1) * pageSize;
  const pagePois = pois.slice(start, start + pageSize);

  return {
    success: true,
    count: pois.length,
    pois: pagePois,
    source: "builtin",
    freeSearchLink,
  };
}

// ============================================
// Tool Definition for MiniMax API (OpenAI-compatible)
// ============================================

export const AmapPOISearchToolDefinition = {
  type: "function" as const,
  function: {
    name: "AmapPOISearch",
    description:
      "Search for Points of Interest (restaurants, hotels, attractions) using ChinaConnect's built-in city dataset, plus a FREE Amap (高德地图) navigation deep link. No API key required. If built-in data has no match, use WebSearch for real-time details.",
    parameters: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description:
            "Search keywords, e.g. 'Peking duck', 'Forbidden City', 'Starbucks'. Chinese or English both work.",
        },
        city: {
          type: "string",
          description:
            "City name to limit search scope, e.g. 'Beijing', '北京', 'Shanghai'. Supports Chinese and English city names.",
        },
        type: {
          type: "string",
          description:
            "POI type filter: 'restaurant', 'hotel', 'attraction'. Defaults to restaurant.",
        },
        page: {
          type: "number",
          description: "Page number (default 1).",
        },
        pageSize: {
          type: "number",
          description: "Results per page (default 10).",
        },
      },
      required: ["keywords"],
    },
  },
};
