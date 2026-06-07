/**
 * Amap (高德地图) API Proxy
 * 
 * Proxies requests to Amap Web API to keep the API key server-side.
 * 
 * Usage: GET /api/amap?keywords=...&city=...&type=restaurant
 */



interface Env {
  AMAP_WEB_API_KEY: string;
}

export const onRequestGet = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const amapKey = env.AMAP_WEB_API_KEY;
  if (!amapKey) {
    return new Response(
      JSON.stringify({ error: "Amap API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Forward query params to Amap
  const amapUrl = new URL("https://restapi.amap.com/v3/place/text");
  
  // Copy allowed params from client request
  const allowedParams = ["keywords", "city", "citylimit", "type", "offset", "page", "extensions"];
  for (const param of allowedParams) {
    const value = url.searchParams.get(param);
    if (value) {
      amapUrl.searchParams.set(param, value);
    }
  }
  
  // Set defaults
  if (!amapUrl.searchParams.has("offset")) {
    amapUrl.searchParams.set("offset", "25");
  }
  if (!amapUrl.searchParams.has("extensions")) {
    amapUrl.searchParams.set("extensions", "all");
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
    return new Response(
      JSON.stringify({ error: "Failed to fetch from Amap API" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
