/**
 * Cloudflare Pages Function — MiniMax API Proxy
 *
 * This server-side proxy forwards chat requests to the MiniMax API.
 * The API key is stored as a Cloudflare Pages secret (MINIMAX_API_KEY),
 * never exposed to the client.
 *
 * Supports both streaming (SSE) and non-streaming requests.
 */

import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  MINIMAX_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Get API key from environment
  const apiKey = env.MINIMAX_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error: MINIMAX_API_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Parse the request body
    const body = await request.json();

    // Forward to MiniMax API
    const minimaxResponse = await fetch("https://api.minimax.chat/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // If streaming, pipe the response through
    if (body.stream) {
      return new Response(minimaxResponse.body, {
        status: minimaxResponse.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...corsHeaders,
        },
      });
    }

    // Non-streaming: return JSON response
    const data = await minimaxResponse.text();
    return new Response(data, {
      status: minimaxResponse.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Proxy error: ${error}` }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
