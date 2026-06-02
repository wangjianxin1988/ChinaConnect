/**
 * Creem Checkout Session API
 * Creates a Creem Checkout for subscription purchase
 *
 * POST /api/checkout
 * Body: { tier: "explorer" | "traveler" | "business", billing: "monthly" | "annual" }
 * Returns: { url: string } - Creem Checkout URL
 *
 * NOTE: CF Pages Functions cannot import node_modules. All Creem API calls use fetch().
 */

import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  CREEM_API_KEY: string;
  CREEM_API_BASE?: string; // optional override, defaults to https://api.creem.io/v1
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
}

// Creem Product ID mapping (replace with real product IDs from Creem Dashboard)
const PRODUCT_IDS: Record<string, Record<string, string>> = {
  explorer: {
    monthly: "prod_explorer_monthly",
    annual: "prod_explorer_annual",
  },
  traveler: {
    monthly: "prod_traveler_monthly",
    annual: "prod_traveler_annual",
  },
  business: {
    monthly: "prod_business_monthly",
    annual: "prod_business_annual",
  },
};

const TIER_NAMES: Record<string, string> = {
  explorer: "Explorer",
  traveler: "Traveler",
  business: "Business",
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Validate Creem API key
  if (!env.CREEM_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const body = await request.json() as { tier?: string; billing?: string };
    const { tier, billing } = body;

    // Validate inputs
    if (!tier || !["explorer", "traveler", "business"].includes(tier)) {
      return new Response(
        JSON.stringify({ error: "Invalid tier. Must be explorer, traveler, or business." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!billing || !["monthly", "annual"].includes(billing)) {
      return new Response(
        JSON.stringify({ error: "Invalid billing. Must be monthly or annual." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const productId = PRODUCT_IDS[tier][billing];

    // Get origin for redirect URLs
    const url = new URL(request.url);
    const origin = url.origin;

    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const creemApiBase = env.CREEM_API_BASE || "https://api.creem.io/v1";

    // Call Creem API to create checkout (using fetch — CF Workers compatible)
    const creemResponse = await fetch(`${creemApiBase}/checkouts`, {
      method: "POST",
      headers: {
        "x-api-key": env.CREEM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: successUrl,
        metadata: {
          tier,
          billing,
        },
      }),
    });

    if (!creemResponse.ok) {
      const errorText = await creemResponse.text();
      console.error("Creem API error:", creemResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Creem checkout creation failed: ${errorText}` }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const checkout = await creemResponse.json() as { checkout_url: string; id: string };

    return new Response(
      JSON.stringify({ url: checkout.checkout_url, checkoutId: checkout.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", message);
    return new Response(
      JSON.stringify({ error: `Checkout error: ${message}` }),
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
