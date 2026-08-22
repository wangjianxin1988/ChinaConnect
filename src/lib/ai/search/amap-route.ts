/**
 * AmapRouteSearch Tool for ChinaConnect AI
 * Returns FREE Amap (高德地图) navigation deep links between two locations.
 * uri.amap.com deep links need NO Amap Web API key.
 *
 * For real-time schedules / prices / live routes, the AI must call
 * TransportSearch / WebSearch (trains, flights, taxis, etc.).
 */

// ============================================
// Types
// ============================================

export interface AmapRouteParams {
  origin: string;
  destination: string;
  mode?: "driving" | "transit" | "walking" | "riding";
  city?: string;
  strategy?: number;
}

export interface AmapRouteStep {
  instruction: string;
  road?: string;
  distance?: string;
  duration?: string;
  action?: string;
  assistantAction?: string;
}

export interface AmapRouteSegment {
  mode: string;
  lineName?: string;
  departureStop?: string;
  arrivalStop?: string;
  departureTime?: string;
  arrivalTime?: string;
  stationNum?: number;
  price?: string;
}

export interface AmapRoute {
  distance: string;
  duration: string;
  steps: AmapRouteStep[];
  segments?: AmapRouteSegment[];
  taxiCost?: string;
  tolls?: string;
}

export interface AmapRouteResult {
  success: boolean;
  mode: string;
  origin: string;
  destination: string;
  routes: AmapRoute[];
  error?: string;
  /** Free Amap navigation deep link (no API key required) */
  freeNavigationLink?: string;
  note?: string;
}

// ============================================
// Route Search (100% free, no API key)
// ============================================

const MODE_MAP: Record<string, string> = {
  driving: "car",
  transit: "bus",
  walking: "walk",
  riding: "ride",
};

/**
 * Build a FREE Amap navigation deep link (uri.amap.com — no API key required).
 * The user opens it in the Amap app / web and sees the live route.
 */
export async function executeAmapRouteSearch(params: AmapRouteParams): Promise<AmapRouteResult> {
  const { origin, destination, mode = "driving", city } = params;

  if (!origin || !destination) {
    return {
      success: false,
      mode,
      origin: origin || "",
      destination: destination || "",
      routes: [],
      error: "Both 'origin' and 'destination' parameters are required.",
    };
  }

  const amapMode = MODE_MAP[mode] || "car";
  const navLink =
    "https://uri.amap.com/route/plan?from=" +
    encodeURIComponent(origin) +
    "&to=" +
    encodeURIComponent(destination) +
    "&mode=" +
    amapMode +
    (city ? "&city=" + encodeURIComponent(city) : "") +
    "&callnative=1";

  return {
    success: true,
    mode,
    origin,
    destination,
    routes: [],
    freeNavigationLink: navLink,
    note: "Free Amap navigation link (no API key required). For real-time schedules/prices use TransportSearch/WebSearch.",
  };
}

// ============================================
// Tool Definition for MiniMax API (OpenAI-compatible)
// ============================================

export const AmapRouteSearchToolDefinition = {
  type: "function" as const,
  function: {
    name: "AmapRouteSearch",
    description:
      "Get a FREE Amap (高德地图) navigation deep link between two locations in China (driving, transit, walking, or cycling). No API key required — the link opens Amap for live navigation. For real-time schedules and prices, use TransportSearch / WebSearch.",
    parameters: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description:
            "Starting location. Can be a place name (e.g. 'Tiananmen', '天安门').",
        },
        destination: {
          type: "string",
          description: "Ending location. Same format as origin: place name.",
        },
        mode: {
          type: "string",
          enum: ["driving", "transit", "walking", "riding"],
          description:
            "Route mode: 'driving' (car), 'transit' (public transit/subway/bus), 'walking', or 'riding' (bicycle). Default: 'driving'.",
        },
        city: {
          type: "string",
          description: "City name for transit routes, e.g. 'Beijing', '北京'. Default: none.",
        },
        strategy: {
          type: "number",
          description:
            "Unused in free mode (Amap app chooses the route). Kept for API compatibility.",
        },
      },
      required: ["origin", "destination"],
    },
  },
};
