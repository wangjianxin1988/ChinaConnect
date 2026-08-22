// Supabase Edge Function: AI Chat
// Server-side proxy for MiniMax API with server-side usage tracking, conversation memory,
// and tool calling loop. Replaces the missing /api/chat endpoint.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { FOOD_DATA } from "./data/food-data.ts";
import { HOTEL_DATA } from "./data/hotel-data.ts";
import { EMERGENCY_DATA } from "./data/emergency-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: MiniMaxToolCall[];
  name?: string;
}

interface MiniMaxToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
  language?: string;
  model?: string;
  tools?: unknown[];
  stream?: boolean;
}

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  explorer: 20,
  traveler: 40,
  pro: 40,
  business: -1,
  enterprise: -1,
};

const MAX_TOOL_ITERATIONS = 6;

async function getAccessToken(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("missing_bearer");
  }
  return authHeader.replace("Bearer ", "");
}

async function callMinimax(
  baseUrl: string,
  apiKey: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });
}

// ---------------------------------------------------------------------------
// Mini server-side tool implementations
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Bundled static dataset helpers
// ---------------------------------------------------------------------------

interface FoodEntry {
  id?: string; name?: string; nameEn?: string; type?: string; cuisine?: string;
  avgPrice?: number; rating?: number; address?: string; district?: string;
  city?: string; cityZh?: string; phone?: string; hours?: string;
  tags?: string[]; lat?: number; lng?: number;
}

interface HotelEntry {
  id?: string; name?: string; nameEn?: string; category?: string;
  priceMin?: number; priceMax?: number; city?: string; cityZh?: string;
  district?: string; address?: string; rating?: number; phone?: string;
}

interface EmergencyEntry {
  id?: string; name?: string; nameCn?: string; province?: string;
  police?: string; ambulance?: string; fire?: string; traffic?: string; info?: string;
}

function normCity(s: string): string {
  return (s || "").trim().toLowerCase();
}

function matchCityFields(
  entryCity: string | undefined,
  entryCityZh: string | undefined,
  entryName: string | undefined,
  entryNameEn: string | undefined,
  kw: string | undefined,
): boolean {
  const k = normCity(kw || "");
  if (!k) return true;
  const raw = kw || "";
  const city = normCity(entryCity || "");
  const name = normCity(entryName || "");
  const nameEn = normCity(entryNameEn || "");
  const cityZh = entryCityZh || "";
  return (
    city.includes(k) ||
    cityZh.includes(raw) ||
    cityZh.includes(k) ||
    name.includes(k) ||
    nameEn.includes(k)
  );
}

function amapSearchLink(name: string): string {
  return "https://uri.amap.com/search?keyword=" + encodeURIComponent(name || "");
}

function amapMarkerLink(lat: number | undefined, lng: number | undefined, name: string | undefined): string {
  if (lat && lng) {
    return "https://uri.amap.com/marker?position=" + lng + "," + lat + "&name=" + encodeURIComponent(name || "");
  }
  return amapSearchLink(name || "");
}

// ---------------------------------------------------------------------------
// Mini server-side tool implementations
// ---------------------------------------------------------------------------

async function toolWebSearch(args: Record<string, string>): Promise<string> {
  const query = args.query || args.q || "";
  const apiKey = Deno.env.get("VITE_ANYSEARCH_API_KEY");
  if (!apiKey) return JSON.stringify({ error: "search_disabled", results: [] });

  try {
    const res = await fetch("https://api.anysearch.com/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({ query, max_results: Number(args.max_results) || 5 }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return JSON.stringify({ error: "search_failed", status: res.status, results: [] });
    const data = await res.json();
    return JSON.stringify(data).slice(0, 4000);
  } catch (e) {
    return JSON.stringify({ error: String(e), results: [] });
  }
}

async function toolCitySearch(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, string>,
): Promise<string> {
  const city = args.city || args.query || "";
  const { data, error } = await supabase
    .from("cities")
    .select(
      "id, name_en, name_zh, slug, province, country, lat, lng, population, timezone, description, description_zh, climate, best_season, cost_level, airport_code, high_speed_rail_available",
    )
    .or(
      "name_en.ilike.%" + city + "%,name_zh.ilike.%" + city + "%,slug.ilike.%" + city + "%",
    )
    .limit(5);
  if (error) return JSON.stringify({ error: error.message, cities: [] });
  return JSON.stringify({ cities: data ?? [] });
}

async function toolFoodSearch(args: Record<string, string>): Promise<string> {
  const city = args.city || "";
  const cuisine = (args.cuisine || "").trim().toLowerCase();
  const budget = (args.budget || "").trim().toLowerCase();

  let list = (FOOD_DATA as FoodEntry[]).filter((e) =>
    matchCityFields(e.city, e.cityZh, e.name, e.nameEn, city),
  );
  if (cuisine) {
    list = list.filter((e) => {
      const hay = ((e.cuisine || "") + " " + (e.type || "") + " " + (e.tags || []).join(" ")).toLowerCase();
      return hay.includes(cuisine);
    });
  }
  if (budget === "low" || budget === "budget") {
    list = list.filter((e) => (e.avgPrice ?? 300) < 100);
  } else if (budget === "medium" || budget === "mid") {
    list = list.filter((e) => {
      const p = e.avgPrice ?? 300;
      return p >= 100 && p <= 300;
    });
  } else if (budget === "high" || budget === "luxury") {
    list = list.filter((e) => (e.avgPrice ?? 0) > 300);
  }

  const top = [...list]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 15)
    .map((e) => ({
      name: e.name,
      nameEn: e.nameEn,
      type: e.type,
      cuisine: e.cuisine,
      avgPrice: e.avgPrice,
      rating: e.rating,
      address: e.address,
      district: e.district,
      city: e.cityZh || e.city,
      phone: e.phone,
      hours: e.hours,
      tags: e.tags,
      amap: amapMarkerLink(e.lat, e.lng, e.nameEn || e.name),
      dianping: "https://www.dianping.com/search/keyword/0/0_" + encodeURIComponent(e.nameEn || e.name || ""),
    }));

  return JSON.stringify({ city, matched: list.length, restaurants: top });
}

async function toolHotelSearch(args: Record<string, string>): Promise<string> {
  const city = args.city || "";
  const budget = (args.budget || args.category || "").trim().toLowerCase();

  const list = (HOTEL_DATA as HotelEntry[]).filter((e) =>
    matchCityFields(e.city, e.cityZh, e.name, e.nameEn, city),
  );

  const tierMap: Record<string, string[]> = {
    budget: ["budget", "hostel"],
    mid: ["mid_range", "mid"],
    luxury: ["luxury"],
  };

  let tiers: string[];
  if (budget === "budget" || budget === "low") tiers = ["budget"];
  else if (budget === "mid" || budget === "medium") tiers = ["mid"];
  else if (budget === "luxury" || budget === "high") tiers = ["luxury"];
  else tiers = ["budget", "mid", "luxury"];

  const result: { tier: string; hotels: unknown[] }[] = [];
  for (const tier of tiers) {
    const cats = tierMap[tier] || [tier];
    const picks = list
      .filter((e) => cats.includes((e.category || "").toLowerCase()))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 5)
      .map((e) => ({
        name: e.nameEn || e.name,
        nameZh: e.name,
        category: e.category,
        pricePerNight:
          e.priceMin && e.priceMax ? "¥" + e.priceMin + "-" + e.priceMax : undefined,
        rating: e.rating,
        district: e.district,
        address: e.address,
        phone: e.phone,
        amap: amapSearchLink(e.nameEn || e.name || ""),
        bookTrip:
          "https://hotels.ctrip.com/hotels/list?city=" +
          encodeURIComponent(e.cityZh || e.city || ""),
        bookBooking:
          "https://www.booking.com/searchresults.html?ss=" +
          encodeURIComponent(e.nameEn || e.name || ""),
      }));
    if (picks.length) result.push({ tier, hotels: picks });
  }

  return JSON.stringify({ city, matched: list.length, tiers: result });
}

async function toolTransportSearch(args: Record<string, string>): Promise<string> {
  const from = args.from || args.origin || "";
  const to = args.to || args.destination || "";
  if (!from || !to) {
    return JSON.stringify({ error: "Both 'from' and 'to' cities are required." });
  }
  const [trainRaw, flightRaw] = await Promise.all([
    toolWebSearch({ query: from + " to " + to + " China high-speed train schedule ticket price", max_results: "6" }),
    toolWebSearch({ query: from + " to " + to + " flight ticket price schedule today", max_results: "6" }),
  ]);
  let trains: unknown = { error: "empty" };
  let flights: unknown = { error: "empty" };
  try { trains = JSON.parse(trainRaw); } catch { trains = { error: "parse_error" }; }
  try { flights = JSON.parse(flightRaw); } catch { flights = { error: "parse_error" }; }
  return JSON.stringify({
    from,
    to,
    trains,
    flights,
    bookingLinks: {
      train12306: "https://www.12306.cn/index/",
      trainTrip: "https://trains.ctrip.com/TrainBooking/index",
      flightTrip:
        "https://flights.ctrip.com/online/list/oneway-" +
        encodeURIComponent(from) +
        "-" +
        encodeURIComponent(to),
      qunarFlight: "https://flight.qunar.com/",
      amap: "https://uri.amap.com/",
    },
    note: "Schedules and prices change daily. Use the booking links to verify and book.",
  });
}

async function toolWeatherInfo(args: Record<string, string>): Promise<string> {
  const city = args.city || "Beijing";
  try {
    const geoRes = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(city) +
        "&count=1&language=en",
      { signal: AbortSignal.timeout(5000) },
    );
    const geo = await geoRes.json();
    if (!geo.results?.[0]) return JSON.stringify({ error: "city_not_found", city });
    const { latitude, longitude, name } = geo.results[0];
    const wxRes = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        latitude +
        "&longitude=" +
        longitude +
        "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto",
      { signal: AbortSignal.timeout(5000) },
    );
    const wx = await wxRes.json();
    return JSON.stringify({ city: name, current: wx.current, forecastLink: "https://open-meteo.com/" });
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
}

async function toolEmergencyInfo(args: Record<string, string>): Promise<string> {
  const city = (args.city || "").trim();
  let matches = (EMERGENCY_DATA as EmergencyEntry[]).filter(
    (e) =>
      normCity(e.id || "").includes(normCity(city)) ||
      normCity(e.name || "").includes(normCity(city)) ||
      (e.nameCn || "").includes(city),
  );
  if (matches.length === 0) matches = EMERGENCY_DATA as EmergencyEntry[];
  return JSON.stringify({
    city: city || "China (national)",
    national: { police: "110", ambulance: "120", fire: "119" },
    cities: matches.slice(0, 3),
  });
}

async function toolAmapPOISearch(args: Record<string, string>): Promise<string> {
  const keywords = args.keywords || "";
  if (!keywords) return JSON.stringify({ error: "keywords required", pois: [] });
  const params = new URLSearchParams({
    keywords,
    offset: String(Math.min(Number(args.pageSize) || 10, 25)),
    page: String(args.page || 1),
  });
  if (args.city) params.set("city", args.city);
  if (args.type) params.set("type", args.type);
  try {
    const res = await fetch("https://chinaengage.org/api/amap?" + params.toString(), {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return JSON.stringify({ error: "amap_proxy_error", status: res.status, pois: [] });
    return (await res.text()).slice(0, 4000);
  } catch (e) {
    return JSON.stringify({ error: String(e), pois: [] });
  }
}

async function toolAmapRouteSearch(args: Record<string, string>): Promise<string> {
  const origin = args.origin || "";
  const destination = args.destination || "";
  const mode = args.mode || "driving";
  if (!origin || !destination) {
    return JSON.stringify({ error: "origin and destination are required" });
  }
  const base =
    mode === "driving"
      ? "direction/driving"
      : mode === "transit"
        ? "direction/transit/integrated"
        : mode === "walking"
          ? "direction/walking"
          : "direction/bicycling";
  const params = new URLSearchParams({ endpoint: base, origin, destination, output: "json" });
  if (mode === "transit" && args.city) {
    params.set("city", args.city);
    params.set("cityd", args.city);
  }
  try {
    const res = await fetch("https://chinaengage.org/api/amap?" + params.toString(), {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return JSON.stringify({ error: "amap_proxy_error", status: res.status });
    return (await res.text()).slice(0, 4000);
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
}

async function toolVisaInfo(args: Record<string, string>): Promise<string> {
  const nationality = args.nationality || "United States";
  return toolWebSearch({
    query: "China visa policy " + nationality + " tourist entry requirements 2026",
    max_results: "6",
  });
}

function toolFallback(name: string): string {
  return JSON.stringify({
    error: "Tool '" + name + "' is not available server-side. Use WebSearch instead for real-time information.",
  });
}
async function executeToolCall(
  supabase: ReturnType<typeof createClient>,
  name: string,
  args: Record<string, string>,
): Promise<string> {
  try {
    switch (name) {
      case "WebSearch":
        return await toolWebSearch(args);
      case "CitySearch":
        return await toolCitySearch(supabase, args);
      case "HotelSearch":
        return await toolHotelSearch(args);
      case "FoodSearch":
        return await toolFoodSearch(args);
      case "TransportSearch":
        return await toolTransportSearch(args);
      case "WeatherInfo":
        return await toolWeatherInfo(args);
      case "EmergencyInfo":
        return await toolEmergencyInfo(args);
      case "AmapPOISearch":
        return await toolAmapPOISearch(args);
      case "AmapRouteSearch":
        return await toolAmapRouteSearch(args);
      case "VisaInfo":
        return await toolVisaInfo(args);
      default:
        return toolFallback(name);
    }
  } catch (e) {
    return JSON.stringify({ error: "Tool " + name + " failed: " + String(e) });
  }
}
// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(req);
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized: missing Bearer token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const minimaxApiKey = Deno.env.get("MINIMAX_API_KEY");
  const minimaxBaseUrl = Deno.env.get("MINIMAX_BASE_URL") || "https://api.minimaxi.com/v1";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured: missing Supabase env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!minimaxApiKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: MINIMAX_API_KEY not set" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized: invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Atomic usage increment
  const { data: usageData, error: usageError } = await supabase.rpc("increment_ai_usage", {
    p_user_id: userId,
  });
  if (usageError) {
    return new Response(
      JSON.stringify({ error: "Usage tracking failed", detail: usageError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const usage = Array.isArray(usageData) ? usageData[0] : usageData;
  if (!usage?.allowed) {
    return new Response(
      JSON.stringify({
        error: "usage_exceeded",
        message: "You have reached your monthly AI request limit. Upgrade your plan for more.",
        request_count: usage?.request_count ?? 0,
        max_requests: usage?.max_requests ?? TIER_LIMITS.free,
        tier_slug: usage?.tier_slug ?? "free",
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Resolve or create conversation
  let conversationId = body.conversationId;
  if (!conversationId) {
    const { data: conv, error: convErr } = await supabase
      .from("ai_conversations")
      .insert({ user_id: userId, message_count: 0, language: body.language ?? null })
      .select("id")
      .single();
    if (convErr || !conv) {
      return new Response(JSON.stringify({ error: "Failed to create conversation" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    conversationId = conv.id;
  }

  // Persist the last user message
  const lastUserMsg = [...body.messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg) {
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: lastUserMsg.content,
    });
  }
  // Run the agent loop: keep calling MiniMax until no more tool calls
  const model = body.model || "MiniMax-Text-01";
  const currentMessages: ChatMessage[] = [...body.messages];


  // Strengthen language adherence: append an explicit language directive to the
  // final user message (after persistence, so stored history stays clean).
  const LANGUAGE_DIRECTIVES: Record<string, string> = {
    en: "IMPORTANT: Reply entirely in English.",
    "zh-CN": "IMPORTANT: Reply entirely in Simplified Chinese (简体中文).",
    "zh-TW": "IMPORTANT: Reply entirely in Traditional Chinese (繁體中文).",
    ja: "IMPORTANT: Reply entirely in Japanese (日本語).",
    ko: "IMPORTANT: Reply entirely in Korean (한국어).",
    fr: "IMPORTANT: Reply entirely in French (Français).",
    de: "IMPORTANT: Reply entirely in German (Deutsch).",
    ru: "IMPORTANT: Reply entirely in Russian (Русский).",
    ar: "IMPORTANT: Reply entirely in Arabic (العربية).",
    th: "IMPORTANT: Reply entirely in Thai (ภาษาไทย).",
    vi: "IMPORTANT: Reply entirely in Vietnamese (Tiếng Việt).",
    fa: "IMPORTANT: Reply entirely in Persian/Farsi (فارسی).",
  };
  const langDir = body.language ? LANGUAGE_DIRECTIVES[body.language] : undefined;
  if (langDir) {
    const lastUserIdx = currentMessages.length - 1;
    const lastMsg = currentMessages[lastUserIdx];
    if (lastMsg && lastMsg.role === "user") {
      currentMessages[lastUserIdx] = {
        ...lastMsg,
        content: lastMsg.content + "\n\n" + langDir,
      };
    }
  }

  const tools = body.tools && body.tools.length > 0 ? body.tools : undefined;
  let totalTokens = 0;
  let lastFinishReason = "stop";
  let lastAssistantContent = "";

  const abortController = new AbortController();
  // Bail out if the client disconnects (best-effort)
  req.signal.addEventListener("abort", () => abortController.abort());

  for (let iteration = 0; iteration <= MAX_TOOL_ITERATIONS; iteration++) {
    if (abortController.signal.aborted) break;

    let apiRes: Response;
    try {
      apiRes = await callMinimax(
        minimaxBaseUrl,
        minimaxApiKey,
        {
          model,
          messages: currentMessages,
          stream: false,
          temperature: 0.7,
          max_tokens: 4096,
          ...(tools ? { tools } : {}),
        },
        abortController.signal,
      );
    } catch (e) {
      return new Response(JSON.stringify({ error: "AI provider unreachable", detail: String(e) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("MiniMax API error:", apiRes.status, errText);
      return new Response(
        JSON.stringify({
          error: "AI provider error",
          status: apiRes.status,
          detail: errText.slice(0, 500),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await apiRes.json();
    const choice = data.choices?.[0];
    const assistantMessage = choice?.message;
    lastFinishReason = choice?.finish_reason || "stop";
    lastAssistantContent = assistantMessage?.content || "";
    totalTokens += data.usage?.total_tokens ?? 0;

    if (!assistantMessage) {
      return new Response(JSON.stringify({ error: "Empty response from AI provider" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add assistant message to history
    currentMessages.push({
      role: "assistant",
      content: assistantMessage.content || "",
      tool_calls: assistantMessage.tool_calls,
    });

    // If no tool calls, we're done
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      break;
    }

    // Execute each tool call in parallel
    const toolResults = await Promise.all(
      assistantMessage.tool_calls.map(async (tc: MiniMaxToolCall) => {
        let toolArgs: Record<string, string> = {};
        try {
          toolArgs = JSON.parse(tc.function.arguments);
        } catch {
          toolArgs = {};
        }
        const result = await executeToolCall(supabase, tc.function.name, toolArgs);
        return {
          tool_call_id: tc.id,
          role: "tool" as const,
          name: tc.function.name,
          content: result,
        };
      }),
    );

    currentMessages.push(...toolResults);
  }

  // Persist the final assistant message
  if (lastAssistantContent) {
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: lastAssistantContent,
      model,
      tokens_used: totalTokens,
    });
  }

  // Update conversation metadata
  const { count: msgCount } = await supabase
    .from("ai_messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  // Build / refresh a short per-conversation summary used by the left sidebar.
  // Derived deterministically from the first user message and the final
  // assistant reply so each user gets their own per-conversation summary
  // persisted next to their conversation row.
  const summarySource = [lastUserMsg?.content ?? "", lastAssistantContent ?? ""].join("\n");
  const summaryTrimmed = summarySource.trim();
  const summary =
    summaryTrimmed.length > 120 ? summaryTrimmed.slice(0, 117).trimEnd() + "..." : summaryTrimmed;
  const languageTag = (body.language ?? "").toString().trim();
  await supabase
    .from("ai_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      message_count: msgCount ?? 1,
      updated_at: new Date().toISOString(),
      summary,
      ...(languageTag ? { language: languageTag } : {}),
    })
    .eq("id", conversationId);

  return new Response(
    JSON.stringify({
      content: lastAssistantContent,
      conversationId,
      usage: {
        request_count: usage.request_count,
        max_requests: usage.max_requests,
        tier_slug: usage.tier_slug,
      },
      model,
      finish_reason: lastFinishReason,
      tokens_used: totalTokens,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
