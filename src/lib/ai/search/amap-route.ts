/**
 * AmapRouteSearch Tool for ChinaConnect AI
 * Gets driving and transit route directions between two locations
 * using the Amap (高德地图) Web API.
 *
 * API Docs: https://lbs.amap.com/api/webservice/guide/api/direction
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
}

// ============================================
// Amap API Configuration
// ============================================

const AMAP_DIRECTION_API_BASE: Record<string, string> = {
  driving: "direction/driving",
  transit: "direction/transit/integrated",
  walking: "direction/walking",
  riding: "direction/bicycling",
};

/**
 * Amap API key is now handled server-side via /api/amap proxy.
 * No key is needed on the client.
 */
function getAmapKey(): string | undefined {
  // Key is injected server-side by the proxy — return a marker so callers
  // know the feature is available.
  return "proxied";
}

/**
 * Parse a location string into coordinates if possible.
 * Accepts: "lng,lat" format, or a place name to geocode.
 * Returns the string as-is for Amap API (it handles geocoding internally).
 */
function normalizeLocation(loc: string): string {
  // If already in lng,lat format, return as-is
  if (/^\d+\.\d+,\d+\.\d+$/.test(loc.trim())) {
    return loc.trim();
  }
  // Amap direction API accepts place names and geocodes them
  return loc.trim();
}

// ============================================
// Route Search Implementation
// ============================================

/**
 * Execute a route search using Amap Direction API.
 * Supports driving, transit, walking, and riding modes.
 */
export async function executeAmapRouteSearch(params: AmapRouteParams): Promise<AmapRouteResult> {
  const { origin, destination, mode = "driving", city = "全国", strategy } = params;

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

  const amapKey = getAmapKey();
  if (!amapKey) {
    return {
      success: false,
      mode,
      origin,
      destination,
      routes: [],
      error:
        "Amap API proxy not available. Ensure the /api/amap endpoint is deployed.",
    };
  }

  const apiUrl = AMAP_DIRECTION_API_BASE[mode];
  if (!apiUrl) {
    return {
      success: false,
      mode,
      origin,
      destination,
      routes: [],
      error: `Unsupported route mode: ${mode}. Use 'driving', 'transit', 'walking', or 'riding'.`,
    };
  }

  try {
    const params_obj = new URLSearchParams({
      endpoint: apiUrl,
      origin: normalizeLocation(origin),
      destination: normalizeLocation(destination),
      output: "json",
    });

    // Transit mode requires city parameter
    if (mode === "transit") {
      params_obj.set("city", city);
      params_obj.set("cityd", city);
    }

    // Strategy for driving/transit
    if (strategy !== undefined) {
      params_obj.set("strategy", String(strategy));
    }

    const url = `/api/amap?${params_obj}`;
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
        mode,
        origin,
        destination,
        routes: [],
        error: `Amap API error: ${data.info || "Unknown error"} (infocode: ${data.infocode})`,
      };
    }

    const routes: AmapRoute[] = parseRoutes(data, mode);

    return {
      success: routes.length > 0,
      mode,
      origin,
      destination,
      routes,
    };
  } catch (error) {
    return {
      success: false,
      mode,
      origin,
      destination,
      routes: [],
      error: `Amap route search failed: ${String(error)}`,
    };
  }
}

// ============================================
// Response Parsing
// ============================================

function parseRoutes(data: Record<string, unknown>, mode: string): AmapRoute[] {
  switch (mode) {
    case "driving":
      return parseDrivingRoutes(data);
    case "transit":
      return parseTransitRoutes(data);
    case "walking":
      return parseWalkingRoutes(data);
    case "riding":
      return parseRidingRoutes(data);
    default:
      return [];
  }
}

function parseDrivingRoutes(data: Record<string, unknown>): AmapRoute[] {
  const route = data.route as Record<string, unknown> | undefined;
  if (!route) return [];

  const paths = Array.isArray(route.paths) ? route.paths : [];
  return paths.slice(0, 3).map((path: Record<string, unknown>) => {
    const steps = Array.isArray(path.steps)
      ? (path.steps as Array<Record<string, unknown>>).map((s) => ({
          instruction: String(s.instruction || ""),
          road: s.road ? String(s.road) : undefined,
          distance: s.distance ? `${s.distance}m` : undefined,
          duration: s.duration ? `${Math.round(Number(s.duration) / 60)}min` : undefined,
          action: s.action ? String(s.action) : undefined,
          assistantAction: s.assistant_action ? String(s.assistant_action) : undefined,
        }))
      : [];

    return {
      distance: formatDistance(Number(path.distance) || 0),
      duration: formatDuration(Number(path.duration) || 0),
      steps,
      taxiCost: path.tolls ? `¥${path.tolls}` : undefined,
      tolls: path.tolls ? `¥${path.tolls}` : undefined,
    };
  });
}

function parseTransitRoutes(data: Record<string, unknown>): AmapRoute[] {
  const route = data.route as Record<string, unknown> | undefined;
  if (!route) return [];

  const transits = Array.isArray(route.transits) ? route.transits : [];
  return transits.slice(0, 3).map((transit: Record<string, unknown>) => {
    const segments: AmapRouteSegment[] = [];
    const steps = Array.isArray(transit.segments) ? transit.segments : [];

    for (const seg of steps) {
      const bus = seg.bus as Record<string, unknown> | undefined;
      const railway = seg.railway as Record<string, unknown> | undefined;
      const taxi = seg.taxi as Record<string, unknown> | undefined;

      if (bus && Array.isArray(bus.buslines) && bus.buslines.length > 0) {
        const line = bus.buslines[0] as Record<string, unknown>;
        segments.push({
          mode: "bus",
          lineName: line.name ? String(line.name) : undefined,
          departureStop: line.departure_stop ? String((line.departure_stop as Record<string, unknown>).name || "") : undefined,
          arrivalStop: line.arrival_stop ? String((line.arrival_stop as Record<string, unknown>).name || "") : undefined,
          stationNum: line.via_num ? Number(line.via_num) + 1 : undefined,
        });
      }

      if (railway) {
        segments.push({
          mode: "railway",
          lineName: railway.name ? String(railway.name) : undefined,
          departureStop: railway.departure_stop ? String((railway.departure_stop as Record<string, unknown>).name || "") : undefined,
          arrivalStop: railway.arrival_stop ? String((railway.arrival_stop as Record<string, unknown>).name || "") : undefined,
          departureTime: railway.departure_stop ? String((railway.departure_stop as Record<string, unknown>).time || "") : undefined,
          arrivalTime: railway.arrival_stop ? String((railway.arrival_stop as Record<string, unknown>).time || "") : undefined,
          price: railway.price ? `¥${railway.price}` : undefined,
          stationNum: railway.via_num ? Number(railway.via_num) + 1 : undefined,
        });
      }

      if (taxi) {
        segments.push({
          mode: "taxi",
          price: taxi.price ? `¥${taxi.price}` : undefined,
        });
      }

      // Walking segment
      if (seg.walking) {
        const walking = seg.walking as Record<string, unknown>;
        if (walking.distance && Number(walking.distance) > 0) {
          segments.push({
            mode: "walking",
            distance: formatDistance(Number(walking.distance)),
            duration: walking.duration ? formatDuration(Number(walking.duration)) : undefined,
          });
        }
      }
    }

    return {
      distance: formatDistance(Number(transit.distance) || 0),
      duration: formatDuration(Number(transit.duration) || 0),
      steps: [],
      segments,
      taxiCost: transit.cost ? `¥${transit.cost}` : undefined,
    };
  });
}

function parseWalkingRoutes(data: Record<string, unknown>): AmapRoute[] {
  const route = data.route as Record<string, unknown> | undefined;
  if (!route) return [];

  const paths = Array.isArray(route.paths) ? route.paths : [];
  return paths.slice(0, 2).map((path: Record<string, unknown>) => {
    const steps = Array.isArray(path.steps)
      ? (path.steps as Array<Record<string, unknown>>).map((s) => ({
          instruction: String(s.instruction || ""),
          road: s.road ? String(s.road) : undefined,
          distance: s.distance ? `${s.distance}m` : undefined,
          duration: s.duration ? `${Math.round(Number(s.duration) / 60)}min` : undefined,
        }))
      : [];

    return {
      distance: formatDistance(Number(path.distance) || 0),
      duration: formatDuration(Number(path.duration) || 0),
      steps,
    };
  });
}

function parseRidingRoutes(data: Record<string, unknown>): AmapRoute[] {
  const data_inner = data.data as Record<string, unknown> | undefined;
  if (!data_inner) return [];

  const paths = Array.isArray(data_inner.paths) ? data_inner.paths : [];
  return paths.slice(0, 2).map((path: Record<string, unknown>) => {
    const steps = Array.isArray(path.steps)
      ? (path.steps as Array<Record<string, unknown>>).map((s) => ({
          instruction: String(s.instruction || ""),
          road: s.road ? String(s.road) : undefined,
          distance: s.distance ? `${s.distance}m` : undefined,
          duration: s.duration ? `${Math.round(Number(s.duration) / 60)}min` : undefined,
        }))
      : [];

    return {
      distance: formatDistance(Number(path.distance) || 0),
      duration: formatDuration(Number(path.duration) || 0),
      steps,
    };
  });
}

// ============================================
// Helpers
// ============================================

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  }
  return `${Math.round(seconds / 60)}min`;
}

// ============================================
// Tool Definition for MiniMax API (OpenAI-compatible)
// ============================================

export const AmapRouteSearchToolDefinition = {
  type: "function" as const,
  function: {
    name: "AmapRouteSearch",
    description:
      "Get driving, transit, walking, or cycling directions between two locations in China using Amap (高德地图). Returns distance, duration, route steps, transit details (bus/subway lines), and estimated costs.",
    parameters: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description:
            "Starting location. Can be a place name (e.g. '天安门') or coordinates 'lng,lat' (e.g. '116.397428,39.90923').",
        },
        destination: {
          type: "string",
          description:
            "Ending location. Same format as origin: place name or 'lng,lat' coordinates.",
        },
        mode: {
          type: "string",
          enum: ["driving", "transit", "walking", "riding"],
          description:
            "Route mode: 'driving' (car), 'transit' (public transit/subway/bus), 'walking', or 'riding' (bicycle). Default: 'driving'.",
        },
        city: {
          type: "string",
          description:
            "City name for transit routes (required for transit mode), e.g. '北京', '上海'. Default: '全国'.",
        },
        strategy: {
          type: "number",
          description:
            "Route strategy for driving: 0=recommended, 1=avoid tolls, 2=shortest distance, 4=avoid highways. For transit: 0=fastest, 1=fewest transfers, 2=cheapest.",
        },
      },
      required: ["origin", "destination"],
    },
  },
};
