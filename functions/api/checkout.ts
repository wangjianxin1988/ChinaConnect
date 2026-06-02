/**
 * Stripe Checkout Session API
 * Creates a Stripe Checkout Session for subscription purchase
 *
 * POST /api/checkout
 * Body: { tier: "explorer" | "traveler" | "business", billing: "monthly" | "annual" }
 * Returns: { url: string } - Stripe Checkout URL
 */

import type { PagesFunction } from "@cloudflare/workers-types";
import Stripe from "stripe";

interface Env {
  STRIPE_SECRET_KEY: string;
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
}

// Stripe Price ID mapping (replace with actual IDs from Stripe Dashboard)
// These are placeholder IDs - create matching products/prices in Stripe
const PRICE_IDS: Record<string, Record<string, string>> = {
  explorer: {
    monthly: "price_explorer_monthly",   // Replace with real Stripe price ID
    annual: "price_explorer_annual",     // Replace with real Stripe price ID
  },
  traveler: {
    monthly: "price_traveler_monthly",   // Replace with real Stripe price ID
    annual: "price_traveler_annual",     // Replace with real Stripe price ID
  },
  business: {
    monthly: "price_business_monthly",   // Replace with real Stripe price ID
    annual: "price_business_annual",     // Replace with real Stripe price ID
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

  // Validate Stripe key
  if (!env.STRIPE_SECRET_KEY) {
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

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });

    const priceId = PRICE_IDS[tier][billing];

    // Get origin for redirect URLs
    const url = new URL(request.url);
    const origin = url.origin;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?cancelled=true`,
      metadata: {
        tier,
        billing,
      },
      subscription_data: {
        metadata: {
          tier,
          billing,
        },
      },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
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
