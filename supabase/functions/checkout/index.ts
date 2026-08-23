// Supabase Edge Function: Create Creem Checkout Session
// Requires CREEM_API_KEY in the environment.
//
// Creem notes (verified against docs.creem.io):
//  - Auth header is x-api-key (NOT Authorization: Bearer).
//  - A Creem product is a single price period (every-month / every-year),
//    so each tier needs two product IDs. 3 tiers x 2 periods = 6 env vars.
//  - Checkout API has no billing parameter; billing is implied by product.
//  - success_url receives Creem redirect params automatically
//    (checkout_id/order_id/customer_id/subscription_id/product_id/signature).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutRequest {
  tier: string;
  billing?: string; // "monthly" | "yearly" | "annual" (legacy alias)
  lang?: string;
}

type BillingCycle = "monthly" | "yearly";

// Site languages that have localized pricing/checkout pages under /{lang}/.
const SUPPORTED_LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];

function langPrefix(lang: string | undefined): string {
  if (lang && SUPPORTED_LANGS.includes(lang)) return "/" + lang;
  return "";
}

function normalizeBilling(b: string | undefined): BillingCycle {
  if (b === "yearly" || b === "annual") return "yearly";
  return "monthly";
}

const TIER_TO_PRODUCT_ENV: Record<string, Record<BillingCycle, string>> = {
  explorer: {
    monthly: "CREEM_PRODUCT_EXPLORER_MONTHLY",
    yearly: "CREEM_PRODUCT_EXPLORER_YEARLY",
  },
  traveler: {
    monthly: "CREEM_PRODUCT_TRAVELER_MONTHLY",
    yearly: "CREEM_PRODUCT_TRAVELER_YEARLY",
  },
  business: {
    monthly: "CREEM_PRODUCT_BUSINESS_MONTHLY",
    yearly: "CREEM_PRODUCT_BUSINESS_YEARLY",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const accessToken = authHeader.replace("Bearer ", "");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const creemApiKey = Deno.env.get("CREEM_API_KEY") || "";
  const siteUrl = Deno.env.get("SITE_URL") || "https://chinaengage.org";
  const testMode = Deno.env.get("CREEM_TEST_MODE") === "true";
  const creemBaseUrl =
    Deno.env.get("CREEM_BASE_URL") ||
    (testMode ? "https://test-api.creem.io/v1" : "https://api.creem.io/v1");

  if (!creemApiKey) {
    return new Response(
      JSON.stringify({
        error: "payment_not_configured",
        message:
          "Creem payment is not yet configured. Please set CREEM_API_KEY in the Supabase dashboard.",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const tierEnvMap = TIER_TO_PRODUCT_ENV[body.tier];
  if (!body.tier || !tierEnvMap) {
    return new Response(JSON.stringify({ error: "Invalid tier" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const billing = normalizeBilling(body.billing);
  const productEnv = tierEnvMap[billing];
  const productId = Deno.env.get(productEnv) || "";
  if (!productId) {
    return new Response(
      JSON.stringify({
        error: "tier_not_configured",
        message: `Creem product for "${body.tier}" (${billing}) is not configured. Add ${productEnv} to the Supabase secrets.`,
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const lp = langPrefix(body.lang);
  const successUrl = `${siteUrl}${lp}/checkout/success`;
  // Stable per-user reference id so webhooks/success page can correlate.
  const requestId = `cc_${user.id.replace(/-/g, "").slice(0, 12)}_${Date.now()}`;

  try {
    const creemRes = await fetch(`${creemBaseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": creemApiKey,
      },
      body: JSON.stringify({
        product_id: productId,
        request_id: requestId,
        units: 1,
        success_url: successUrl,
        customer: {
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
        },
        metadata: {
          user_id: user.id,
          tier: body.tier,
          billing,
          source: "pricing",
        },
      }),
    });

    if (!creemRes.ok) {
      const errText = await creemRes.text();
      console.error("Creem error:", creemRes.status, errText);
      return new Response(
        JSON.stringify({
          error: "payment_provider_error",
          status: creemRes.status,
          detail: errText.slice(0, 500),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await creemRes.json();
    // Official field is checkout_url; keep url as a defensive fallback.
    const checkoutUrl = data.checkout_url || data.url;

    if (!checkoutUrl) {
      return new Response(JSON.stringify({ error: "No checkout URL returned" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ url: checkoutUrl, checkoutId: data.id || null, requestId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Checkout error:", e);
    return new Response(JSON.stringify({ error: "Internal error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});