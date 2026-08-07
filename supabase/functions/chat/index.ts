// Supabase Edge Function: AI Chat
// Server-side proxy for MiniMax API with server-side usage tracking, conversation memory,
// and tool calling loop. Replaces the missing /api/chat endpoint.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

const MAX_TOOL_ITERATIONS = 5;

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

async function toolWebSearch(args: Record<string, string>): Promise<string> {
  const query = args.query || args.q || "";
  const apiKey = Deno.env.get("VITE_ANYSEARCH_API_KEY");
  if (!apiKey) return JSON.stringify({ error: "search_disabled", results: [] });

  try {
    const res = await fetch("https://api.anysearch.hk/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, max_results: 5 }),
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
      "id, name, name_zh, name_pinyin, province, tier, summary, climate, best_time, days_recommended",
    )
    .or(`name.ilike.%${city}%,name_zh.ilike.%${city}%,name_pinyin.ilike.%${city}%`)
    .limit(5);
  if (error) return JSON.stringify({ error: error.message, cities: [] });
  return JSON.stringify({ cities: data ?? [] });
}

async function toolHotelSearch(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, string>,
): Promise<string> {
  const city = args.city || "";
  const budget = args.budget || args.category;
  const { data, error } = await supabase
    .from("hotels")
    .select("id, name, name_zh, city, category, price_per_night, rating, address, amenities")
    .ilike("city", `%${city}%`)
    .limit(10);
  if (error) return JSON.stringify({ error: error.message, hotels: [] });
  return JSON.stringify({ hotels: data ?? [] });
}

async function toolFoodSearch(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, string>,
): Promise<string> {
  const city = args.city || "";
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, name_zh, city, cuisine, price_range, rating, address, specialties")
    .ilike("city", `%${city}%`)
    .limit(10);
  if (error) return JSON.stringify({ error: error.message, restaurants: [] });
  return JSON.stringify({ restaurants: data ?? [] });
}

async function toolTransportSearch(
  supabase: ReturnType<typeof createClient>,
  args: Record<string, string>,
): Promise<string> {
  const from = args.from || args.origin || "";
  const to = args.to || args.destination || "";
  const { data, error } = await supabase
    .from("transport_routes")
    .select("id, from_city, to_city, mode, duration_minutes, distance_km, price_range, frequency")
    .or(`from_city.ilike.%${from}%,to_city.ilike.%${to}%`)
    .limit(10);
  if (error) return JSON.stringify({ error: error.message, routes: [] });
  return JSON.stringify({ routes: data ?? [] });
}

async function toolWeatherInfo(args: Record<string, string>): Promise<string> {
  const city = args.city || "Beijing";
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`,
      { signal: AbortSignal.timeout(5000) },
    );
    const geo = await geoRes.json();
    if (!geo.results?.[0]) return JSON.stringify({ error: "city_not_found", city });
    const { latitude, longitude, name } = geo.results[0];
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
      { signal: AbortSignal.timeout(5000) },
    );
    const wx = await wxRes.json();
    return JSON.stringify({ city: name, current: wx.current });
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
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
        return await toolHotelSearch(supabase, args);
      case "FoodSearch":
        return await toolFoodSearch(supabase, args);
      case "TransportSearch":
        return await toolTransportSearch(supabase, args);
      case "WeatherInfo":
        return await toolWeatherInfo(args);
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({ error: `Tool ${name} failed: ${String(e)}` });
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
          max_tokens: 2048,
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
