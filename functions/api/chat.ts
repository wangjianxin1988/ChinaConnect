/**
 * Cloudflare Pages Function — /api/chat
 * Server-side proxy for MiniMax API with tool calling support.
 *
 * - Keeps MINIMAX_API_KEY server-side (never exposed to client)
 * - Handles tool_calls: executes tools, sends results back, loops
 * - Streams SSE response to client
 */

import type { PagesFunction } from "@cloudflare/workers-types";

// ---------------------------------------------------------------------------
// Tool executor — inline to avoid import issues in Cloudflare Functions
// ---------------------------------------------------------------------------

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

// We import tool execution logic inline because Cloudflare Functions
// have limited module resolution. The actual tools live in src/lib/ai/
// but for the function we use a lightweight dispatcher.

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  // For server-side execution, we call the tools via internal HTTP
  // or implement them directly. For now, return a structured response
  // that tells the AI the tool was called.

  // The tools are defined in src/lib/ai/tools.ts and search/*.ts
  // In Cloudflare Functions, we can't import them directly,
  // so we proxy through the site itself or implement lightweight versions.

  try {
    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

    // Route to appropriate tool handler
    switch (name) {
      case "WebSearch":
        return await handleWebSearch(parsedArgs);
      case "AmapPOISearch":
        return await handleAmapPOISearch(parsedArgs);
      case "AmapRouteSearch":
        return await handleAmapRouteSearch(parsedArgs);
      case "CitySearch":
      case "HotelSearch":
      case "FoodSearch":
      case "TransportSearch":
      case "WeatherInfo":
      case "EmergencyInfo":
      case "VisaInfo":
      case "SubwayRoute":
      case "BudgetCalculator":
      case "TranslationHelper":
        // Local data tools — these need the city database
        // For now, return a note that the tool was called
        // In production, these would call the actual implementations
        return JSON.stringify({
          tool: name,
          args: parsedArgs,
          note: "Local data tool — implement with city database integration",
        });
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({ error: `Tool execution failed: ${String(e)}` });
  }
}

// ---------------------------------------------------------------------------
// Tool implementations (server-side)
// ---------------------------------------------------------------------------

async function handleWebSearch(args: Record<string, string>): Promise<string> {
  const query = args.query || "";
  if (!query) return JSON.stringify({ error: "Missing query parameter" });

  // Use DuckDuckGo Instant Answer API (free, no key required)
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const resp = await fetch(ddgUrl, { signal: AbortSignal.timeout(8000) });

    if (!resp.ok) {
      return JSON.stringify({ success: false, query, results: [], error: "Search failed" });
    }

    const data = await resp.json();
    const results: Array<{ title: string; url: string; snippet: string }> = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || "Answer",
        url: data.AbstractURL || "",
        snippet: data.AbstractText,
      });
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.slice(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }

    return JSON.stringify({ success: true, query, results, totalResults: results.length });
  } catch (e) {
    return JSON.stringify({ success: false, query, results: [], error: String(e) });
  }
}

async function handleAmapPOISearch(args: Record<string, string>): Promise<string> {
  const { keywords, city, type } = args;
  if (!keywords || !city) {
    return JSON.stringify({ error: "Missing keywords or city parameter" });
  }

  // Amap Web Service API
  const amapKey = (globalThis as Record<string, unknown>).__AMAP_WEB_KEY__ as string || "";
  if (!amapKey) {
    return JSON.stringify({
      error: "Amap API key not configured",
      hint: "Set AMAP_WEB_KEY in Cloudflare Pages environment variables",
    });
  }

  try {
    const typeMap: Record<string, string> = {
      restaurant: "050000",
      hotel: "100000",
      attraction: "110000",
      shopping: "060000",
      hospital: "090000",
    };

    const params = new URLSearchParams({
      key: amapKey,
      keywords,
      city,
      citylimit: "true",
      output: "json",
      offset: "10",
    });

    if (type && typeMap[type]) {
      params.set("types", typeMap[type]);
    }

    const resp = await fetch(`https://restapi.amap.com/v3/place/text?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) {
      return JSON.stringify({ success: false, error: "Amap API request failed" });
    }

    const data = await resp.json() as {
      status: string;
      pois?: Array<{
        name: string;
        address: string;
        location: string;
        tel: string;
        type: string;
        biz_ext?: { rating?: string; cost?: string };
        photos?: Array<{ url: string }>;
      }>;
    };

    if (data.status !== "1") {
      return JSON.stringify({ success: false, error: "Amap API returned error" });
    }

    const results = (data.pois || []).map((poi) => ({
      name: poi.name,
      address: poi.address,
      location: poi.location,
      phone: poi.tel,
      type: poi.type,
      rating: poi.biz_ext?.rating || "N/A",
      cost: poi.biz_ext?.cost || "N/A",
    }));

    return JSON.stringify({ success: true, city, keywords, results, total: results.length });
  } catch (e) {
    return JSON.stringify({ success: false, error: String(e) });
  }
}

async function handleAmapRouteSearch(args: Record<string, string>): Promise<string> {
  const { origin, destination, mode = "driving", city } = args;
  if (!origin || !destination) {
    return JSON.stringify({ error: "Missing origin or destination" });
  }

  const amapKey = (globalThis as Record<string, unknown>).__AMAP_WEB_KEY__ as string || "";
  if (!amapKey) {
    return JSON.stringify({ error: "Amap API key not configured" });
  }

  try {
    const modeMap: Record<string, string> = {
      driving: "https://restapi.amap.com/v3/direction/driving",
      walking: "https://restapi.amap.com/v3/direction/walking",
      riding: "https://restapi.amap.com/v4/direction/bicycling",
      transit: "https://restapi.amap.com/v3/direction/transit/integrated",
    };

    const baseUrl = modeMap[mode] || modeMap.driving;
    const params = new URLSearchParams({
      key: amapKey,
      origin,
      destination,
      output: "json",
    });

    if (mode === "transit" && city) {
      params.set("city", city);
    }

    const resp = await fetch(`${baseUrl}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) {
      return JSON.stringify({ success: false, error: "Route request failed" });
    }

    const data = await resp.json() as {
      status: string;
      route?: { distance?: string; duration?: string };
    };

    if (data.status !== "1") {
      return JSON.stringify({ success: false, error: "Route API error" });
    }

    return JSON.stringify({
      success: true,
      mode,
      origin,
      destination,
      distance: data.route?.distance ? `${(Number(data.route.distance) / 1000).toFixed(1)}km` : "N/A",
      duration: data.route?.duration ? `${Math.round(Number(data.route.duration) / 60)}min` : "N/A",
    });
  } catch (e) {
    return JSON.stringify({ success: false, error: String(e) });
  }
}

// ---------------------------------------------------------------------------
// SSE stream helpers
// ---------------------------------------------------------------------------

function createSSEStream() {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  return {
    readable,
    async write(data: Record<string, unknown>) {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    },
    async close() {
      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    },
  };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

interface Env {
  MINIMAX_API_KEY: string;
  AMAP_WEB_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = env.MINIMAX_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "MINIMAX_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Store Amap key for tool execution
  (globalThis as Record<string, unknown>).__AMAP_WEB_KEY__ = env.AMAP_WEB_KEY || "";

  try {
    const body = await request.json() as {
      messages: Array<{ role: string; content: string; tool_call_id?: string; tool_calls?: ToolCall[] }>;
      tools?: unknown[];
      stream?: boolean;
    };

    const { messages, tools, stream = true } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty messages array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set up SSE stream
    const sse = createSSEStream();

    // Run the tool-calling loop in background
    (async () => {
      try {
        let currentMessages = [...messages];
        const maxToolRounds = 5;

        for (let round = 0; round < maxToolRounds; round++) {
          // Call MiniMax API
          const minimaxBody: Record<string, unknown> = {
            model: "MiniMax-M2.7-highspeed",
            messages: currentMessages,
            stream: false, // We handle streaming on our side
            reasoning_split: true,
          };

          if (tools && tools.length > 0) {
            minimaxBody.tools = tools;
          }

          const minimaxResp = await fetch("https://api.minimax.chat/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(minimaxBody),
          });

          if (!minimaxResp.ok) {
            const errText = await minimaxResp.text();
            await sse.write({ error: `MiniMax API error: ${minimaxResp.status} - ${errText}` });
            break;
          }

          const minimaxData = await minimaxResp.json() as {
            choices?: Array<{
              message?: {
                role: string;
                content?: string;
                tool_calls?: ToolCall[];
                reasoning_content?: string;
              };
              finish_reason?: string;
            }>;
          };

          const choice = minimaxData.choices?.[0];
          const message = choice?.message;

          if (!message) {
            await sse.write({ error: "No message in MiniMax response" });
            break;
          }

          // Check if there are tool calls
          if (message.tool_calls && message.tool_calls.length > 0) {
            // Send tool call notification to client
            await sse.write({
              type: "tool_calls",
              tool_calls: message.tool_calls.map((tc) => ({
                id: tc.id,
                name: tc.function.name,
                arguments: tc.function.arguments,
              })),
            });

            // Add assistant message with tool_calls to history
            currentMessages.push({
              role: "assistant",
              content: message.content || "",
              tool_calls: message.tool_calls,
            });

            // Execute each tool and add results
            for (const toolCall of message.tool_calls) {
              const args = typeof toolCall.function.arguments === "string"
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function.arguments;

              // Send tool execution start
              await sse.write({
                type: "tool_executing",
                tool_name: toolCall.function.name,
                tool_id: toolCall.id,
              });

              const result = await executeTool(toolCall.function.name, args);

              // Send tool result to client
              await sse.write({
                type: "tool_result",
                tool_name: toolCall.function.name,
                tool_id: toolCall.id,
                result: result.slice(0, 2000), // Truncate for client
              });

              // Add tool result to message history
              currentMessages.push({
                role: "tool",
                content: result,
                tool_call_id: toolCall.id,
              });
            }

            // Continue loop — MiniMax will process tool results
            continue;
          }

          // No tool calls — this is the final response
          // Stream it to the client in chunks
          const content = message.content || "";

          if (stream) {
            // Simulate streaming by sending chunks
            const chunkSize = 50;
            for (let i = 0; i < content.length; i += chunkSize) {
              const chunk = content.slice(i, i + chunkSize);
              await sse.write({
                type: "content",
                content: chunk,
              });
            }
          }

          // Send final message
          await sse.write({
            type: "done",
            content: content,
            finish_reason: choice?.finish_reason || "stop",
          });

          break; // Exit tool-calling loop
        }
      } catch (e) {
        await sse.write({ error: `Server error: ${String(e)}` });
      } finally {
        await sse.close();
      }
    })();

    return new Response(sse.readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `Request parsing failed: ${String(e)}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
