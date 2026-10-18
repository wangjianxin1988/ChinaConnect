/**
 * Cloudflare Pages Function — LLM API Proxy (DeepSeek, 2026-08-31 起)
 *
 * This server-side proxy forwards chat requests to the LLM provider.
 * 2026-08-31 信哥要求从 MiniMax 切到 DeepSeek：key 读 DEEPSEEK_API_KEY（Pages secret），
 * 缺失时回落到旧的 MINIMAX_API_KEY / PUBLIC_MINIMAX_API_KEY 以保持向后兼容。
 * The API key is never exposed to the client.
 *
 * Supports both streaming (SSE) and non-streaming requests.
 */

import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  MINIMAX_API_KEY?: string;
  PUBLIC_MINIMAX_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Resolve provider: DeepSeek first, MiniMax as legacy fallback.
  const raw = env as unknown as Record<string, string | undefined>;
  const deepseekKey = raw.DEEPSEEK_API_KEY;
  const apiKey = deepseekKey || raw.MINIMAX_API_KEY || raw.PUBLIC_MINIMAX_API_KEY;
  const upstreamUrl = deepseekKey
    ? `${(raw.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "")}/chat/completions`
    : "https://api.minimax.chat/v1/chat/completions";
  const defaultModel = deepseekKey ? (raw.DEEPSEEK_MODEL || "deepseek-flash") : "MiniMax-Text-01";

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error: DEEPSEEK_API_KEY not set",
        hint: "Set DEEPSEEK_API_KEY as a Pages secret (or keep MINIMAX_API_KEY as legacy fallback).",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    // Parse the request body
    const body = await request.json();

    // Force a provider-compatible model: client may still send a MiniMax model name.
    if (deepseekKey && (!body.model || /minimax/i.test(String(body.model)))) {
      body.model = defaultModel;
    }

    // Forward to the LLM API
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // If streaming, pipe the response through
    if (body.stream) {
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...corsHeaders,
        },
      });
    }

    // Non-streaming: return JSON response
    const data = await upstreamResponse.text();
    return new Response(data, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Proxy error: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
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
