/**
 * AnySearch API Proxy
 * 
 * Proxies search requests to AnySearch API to keep the API key server-side.
 * 
 * Usage: POST /api/search
 * Body: { "query": "...", "max_results": 10, "location": "..." }
 */



interface Env {
  ANYSEARCH_API_KEY: string;
}

export const onRequestPost = async (context) => {
  const { request, env } = context;
  
  const apiKey = env.ANYSEARCH_API_KEY;
  if (!apiKey) {
    // Fallback: return empty results so client can use DuckDuckGo/Wikipedia fallback
    return new Response(
      JSON.stringify({ code: 0, data: { results: [] } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json() as { query?: string; max_results?: number; location?: string };
    
    if (!body.query) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anysearch.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: body.query,
        max_results: body.max_results || 10,
        ...(body.location ? { location: body.location } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache 1 minute
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch from AnySearch API" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
