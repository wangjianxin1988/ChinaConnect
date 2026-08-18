// Supabase Edge Function: Create Creem Checkout Session
// Replaces the missing /api/checkout endpoint.
// Requires CREEM_API_KEY in the environment.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutRequest {
  tier: string;
  billing: "monthly" | "yearly";
  lang?: string;
}

// Site languages that have localized pricing/checkout pages under /{lang}/.
const SUPPORTED_LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
function langPrefix(lang: string | undefined): string {
  if (lang && SUPPORTED_LANGS.includes(lang)) return "/" + lang;
  return "";
}

const TIER_TO_PRODUCT_ENV: Record<string, string> = {
  explorer: "CREEM_PRODUCT_EXPLORER",
  traveler: "CREEM_PRODUCT_TRAVELER",
  business: "CREEM_PRODUCT_BUSINESS",
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
  const creemApiKey = Deno.env.get("CREEM_API_KEY");
  const creemBaseUrl = Deno.env.get("CREEM_BASE_URL") || "https://api.creem.io/v1";
  const siteUrl = Deno.env.get("SITE_URL") || "https://chinaengage.org";

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
  if (!body.tier || !TIER_TO_PRODUCT_ENV[body.tier]) {
    return new Response(JSON.stringify({ error: "Invalid tier" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const billing = body.billing === "yearly" ? "yearly" : "monthly";

  const productId = Deno.env.get(TIER_TO_PRODUCT_ENV[body.tier]) || "";
  if (!productId) {
    return new Response(
      JSON.stringify({
        error: "tier_not_configured",
        message: `Creem product for tier "${body.tier}" is not configured. Add ${TIER_TO_PRODUCT_ENV[body.tier]} to the Supabase secrets.`,
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const lp = langPrefix(body.lang);
  const successUrl = `${siteUrl}${lp}/checkout/success?session={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}${lp}/pricing?cancelled=1`;

  try {
    const creemRes = await fetch(`${creemBaseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creemApiKey}`,
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer: {
          email: user.email,
          user_id: user.id,
        },
        metadata: {
          user_id: user.id,
          tier: body.tier,
          billing,
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
    const checkoutUrl = data.url || data.checkout_url;

    if (!checkoutUrl) {
      return new Response(JSON.stringify({ error: "No checkout URL returned" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: checkoutUrl, sessionId: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return new Response(JSON.stringify({ error: "Internal error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
