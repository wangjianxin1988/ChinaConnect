/**
 * Amap (楂樺痉鍦板浘) API Proxy
 *
 * Proxies requests to Amap Web API to keep the API key server-side.
 *
 * Usage:
 *   POI:     GET /api/amap?keywords=...&city=...&type=restaurant
 *   Route:   GET /api/amap?endpoint=direction/transit/integrated&origin=...&destination=...&mode=...
 */

interface Env {
  AMAP_WEB_API_KEY: string;
}

const AMAP_BASES: Record<string, string> = {
  "place/text": "https://restapi.amap.com/v3/place/text",
  "direction/driving": "https://restapi.amap.com/v3/direction/driving",
  "direction/transit/integrated": "https://restapi.amap.com/v3/direction/transit/integrated",
  "direction/walking": "https://restapi.amap.com/v3/direction/walking",
  "direction/bicycling": "https://restapi.amap.com/v3/direction/bicycling",
};

const DEFAULT_ALLOWED = ["keywords", "city", "citylimit", "type", "offset", "page", "extensions"];
const DIRECTION_ALLOWED = ["origin", "destination", "strategy", "city", "cityd", "output", "extensions", "size", "time"];

export const onRequestGet = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const amapKey = env.AMAP_WEB_API_KEY;
  if (!amapKey) {
    return new Response(JSON.stringify({ error: "Amap API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Route to the right Amap endpoint based on the optional `endpoint` param.
  const endpoint = url.searchParams.get("endpoint") || "place/text";
  const amapBase = AMAP_BASES[endpoint] || AMAP_BASES["place/text"];
  const allowedParams = endpoint === "place/text" ? DEFAULT_ALLOWED : DIRECTION_ALLOWED;

  const amapUrl = new URL(amapBase);

  // Copy allowed params from client request
  for (const param of allowedParams) {
    const value = url.searchParams.get(param);
    if (value) {
      amapUrl.searchParams.set(param, value);
    }
  }

  // Set defaults for POI search
  if (endpoint === "place/text") {
    if (!amapUrl.searchParams.has("offset")) {
      amapUrl.searchParams.set("offset", "25");
    }
    if (!amapUrl.searchParams.has("extensions")) {
      amapUrl.searchParams.set("extensions", "all");
    }
  }

  // Add server-side API key
  amapUrl.searchParams.set("key", amapKey);

  try {
    const response = await fetch(amapUrl.toString());
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // Cache 5 minutes
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from Amap API" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
