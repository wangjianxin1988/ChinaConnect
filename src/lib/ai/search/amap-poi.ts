/**
 * AmapPOISearch Tool for ChinaConnect AI
 * Searches for Points of Interest (restaurants, hotels, attractions, etc.)
 * using the Amap (高德地图) Web API.
 *
 * API Docs: https://lbs.amap.com/api/webservice/guide/api/search
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
}

// ============================================
// Amap API Configuration
// ============================================

const AMAP_WEB_API_BASE = "https://restapi.amap.com/v3/place/text";

/**
 * Get Amap API key from environment.
 * Uses VITE_AMAP_WEB_API_KEY (client-side) or AMAP_WEB_API_KEY (server-side).
 */
function getAmapKey(): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_AMAP_WEB_API_KEY;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.AMAP_WEB_API_KEY;
  }
  return undefined;
}

/**
 * Map user-friendly POI type keywords to Amap type codes.
 * See: https://lbs.amap.com/api/webservice/guide/api/search#s4
 */
const AMAP_TYPE_MAP: Record<string, string> = {
  restaurant: "050000",
  food: "050000",
  dining: "050000",
  hotel: "100000",
  accommodation: "100000",
  lodging: "100000",
  attraction: "110000",
  scenic: "110000",
  sightseeing: "110000",
  shopping: "060000",
  mall: "060000",
  hospital: "090100",
  pharmacy: "090600",
  bank: "160100",
  atm: "160102",
  subway: "150500",
  metro: "150500",
  airport: "150100",
  train: "150200",
  station: "150200",
  gas: "011100",
  parking: "150900",
  cafe: "050300",
  bar: "050400",
  tea: "050500",
};

// ============================================
// Amap POI Search Implementation
// ============================================

/**
 * Search for POIs using Amap Web API.
 * Returns structured JSON data suitable for AI consumption.
 */
export async function executeAmapPOISearch(params: AmapPOIParams): Promise<AmapPOIResult> {
  const { keywords, city, type, page = 1, pageSize = 10 } = params;

  if (!keywords || keywords.trim().length === 0) {
    return {
      success: false,
      count: 0,
      pois: [],
      error: "Keywords parameter is required and cannot be empty.",
    };
  }

  const amapKey = getAmapKey();
  if (!amapKey) {
    return {
      success: false,
      count: 0,
      pois: [],
      error:
        "Amap API key not configured. Set VITE_AMAP_WEB_API_KEY in your .env file. Get a key at https://console.amap.com/dev/key/app",
    };
  }

  try {
    const params_obj = new URLSearchParams({
      key: amapKey,
      keywords: keywords.trim(),
      offset: String(Math.min(pageSize, 25)),
      page: String(page),
      extensions: "all", // include detailed info (photos, rating, etc.)
      output: "json",
    });

    // Add city filter
    if (city) {
      params_obj.set("city", city);
    }

    // Add type filter
    if (type) {
      const amapType = AMAP_TYPE_MAP[type.toLowerCase()] || type;
      params_obj.set("types", amapType);
    }

    const url = `${AMAP_WEB_API_BASE}?${params_obj}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Amap API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "1") {
      return {
        success: false,
        count: 0,
        pois: [],
        error: `Amap API error: ${data.info || "Unknown error"} (infocode: ${data.infocode})`,
      };
    }

    const pois: AmapPOIItem[] = (data.pois || []).map(
      (poi: Record<string, unknown>) => {
        const location = String(poi.location || "").split(",");
        const photos = Array.isArray(poi.photos)
          ? (poi.photos as Array<{ title?: string; url?: string }>).slice(0, 3).map((p) => ({
              title: p.title || "",
              url: p.url || "",
            }))
          : [];

        return {
          name: String(poi.name || ""),
          type: String(poi.type || ""),
          address: String(poi.address || ""),
          location: {
            lng: parseFloat(location[0]) || 0,
            lat: parseFloat(location[1]) || 0,
          },
          tel: poi.tel ? String(poi.tel) : undefined,
          distance: poi.distance ? String(poi.distance) : undefined,
          rating: poi.biz_ext
            ? String((poi.biz_ext as Record<string, unknown>).rating || "")
            : undefined,
          cost: poi.biz_ext
            ? String((poi.biz_ext as Record<string, unknown>).cost || "")
            : undefined,
          businessArea: poi.business_area ? String(poi.business_area) : undefined,
          photos: photos.length > 0 ? photos : undefined,
        };
      }
    );

    return {
      success: true,
      count: parseInt(String(data.count || "0"), 10),
      pois,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      pois: [],
      error: `Amap POI search failed: ${String(error)}`,
    };
  }
}

// ============================================
// Tool Definition for MiniMax API (OpenAI-compatible)
// ============================================

export const AmapPOISearchToolDefinition = {
  type: "function" as const,
  function: {
    name: "AmapPOISearch",
    description:
      "Search for Points of Interest in China using Amap (高德地图). Find restaurants, hotels, attractions, hospitals, shopping malls, subway stations, and more. Returns name, address, phone, location coordinates, rating, and price info.",
    parameters: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description:
            "Search keywords, e.g. '烤鸭' (Peking duck), '故宫' (Forbidden City), '星巴克' (Starbucks). Chinese or English both work.",
        },
        city: {
          type: "string",
          description:
            "City name to limit search scope, e.g. '北京', '上海', '成都'. Supports Chinese city names.",
        },
        type: {
          type: "string",
          description:
            "POI type filter: 'restaurant', 'hotel', 'attraction', 'shopping', 'hospital', 'subway', 'cafe', 'bar'. Maps to Amap type codes automatically.",
        },
        page: {
          type: "number",
          description: "Page number (default 1).",
        },
        pageSize: {
          type: "number",
          description: "Results per page (1-25, default 10).",
        },
      },
      required: ["keywords"],
    },
  },
};
