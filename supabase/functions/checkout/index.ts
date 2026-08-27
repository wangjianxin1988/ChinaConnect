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
//
// 2026-08: added subscription lifecycle rules so customers can never be
// double-charged, upgrades take effect immediately and downgrades/duplicate
// purchases are rejected with a clear, localized message.

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

const TIER_RANK: Record<string, number> = { free: 0, explorer: 1, traveler: 2, business: 3, pro: 2, enterprise: 3 };

const TIER_LABEL: Record<string, Record<string, string>> = {
  explorer: { en: "Explorer", zh: "探索版" },
  traveler: { en: "Traveler", zh: "旅行版" },
  business: { en: "Business", zh: "商务版" },
};

function langPrefix(lang: string | undefined): string {
  if (lang && SUPPORTED_LANGS.includes(lang)) return "/" + lang;
  return "";
}

function normalizeBilling(b: string | undefined): BillingCycle {
  if (b === "yearly" || b === "annual") return "yearly";
  return "monthly";
}

function billingLabel(b: BillingCycle, lang: string | undefined): string {
  if (lang === "zh-CN" || lang === "zh-TW") return b === "yearly" ? "年付" : "月付";
  return b === "yearly" ? "yearly" : "monthly";
}

function tierLabel(tier: string, lang: string | undefined): string {
  const entry = TIER_LABEL[tier];
  if (!entry) return tier;
  return lang === "zh-CN" || lang === "zh-TW" ? entry.zh : entry.en;
}

function localize(lang: string | undefined, key: "already_subscribed" | "downgrade_blocked" | "unlimited_active", tier: string, billing: BillingCycle): string {
  const zh = lang === "zh-CN" || lang === "zh-TW";
  const t = tierLabel(tier, lang);
  const b = billingLabel(billing, lang);
  if (key === "already_subscribed") {
    return zh
      ? `您已开通 ${t}（${b}）套餐且仍有效。为避免重复扣费，不能重复购买当前套餐。您可以选择升级到更高套餐，或在当前周期结束后再调整。`
      : `You already have an active ${t} (${b}) plan. To avoid duplicate charges you cannot purchase the same plan again. You can upgrade to a higher plan, or manage your plan from your Account page.`;
  }
  if (key === "downgrade_blocked") {
    return zh
      ? `您当前是更高档位的 ${t} 套餐。降级会在当前计费周期结束后生效，请从“我的账户”页面管理套餐。`
      : `You are currently on the higher ${t} plan. Downgrades take effect after your current billing period ends — please manage your plan from the Account page.`;
  }
  return zh
    ? `您的账户已开通不限次数（${t}）权益，无需再购买其他套餐。`
    : `Your account already has unlimited access (${t} plan). No additional purchase is needed.`;
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
  const requestedRank = TIER_RANK[body.tier] ?? 0;

  // -------------------------------------------------------------------------
  // Subscription lifecycle rules — prevent duplicate charges, blocked
  // downgrades and purchases on admin-granted unlimited accounts, while
  // always allowing upgrades (higher tier) and billing-cycle switches.
  // -------------------------------------------------------------------------
  const { data: activeRows } = await supabase
    .from("user_memberships")
    .select("id, status, tier_id, billing_cycle, auto_renew, expires_at, created_at, metadata, membership_tiers(slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const nowMs = Date.now();
  const current = (activeRows || []).find((row: any) => {
    if (!row.expires_at) return true; // lifetime / granted
    return new Date(row.expires_at).getTime() > nowMs;
  });

  if (current) {
    const currentSlug = current.membership_tiers?.slug || "free";
    const currentRank = TIER_RANK[currentSlug] ?? 0;
    const meta = (current.metadata && typeof current.metadata === "object" ? current.metadata : {}) as Record<string, unknown>;
    const isGranted =
      current.billing_cycle === "lifetime" ||
      meta.granted === true ||
      (typeof meta.note === "string" && meta.note.includes("test account")) ||
      (typeof meta.note === "string" && meta.note.includes("admin grant"));

    // 1) Admin-granted / lifetime unlimited access: block further purchases.
    if (isGranted && currentRank >= 3) {
      return new Response(
        JSON.stringify({
          error: "unlimited_active",
          message: localize(body.lang, "unlimited_active", currentSlug, billing),
          current_tier: currentSlug,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Same tier + same billing + still auto-renewing: duplicate purchase.
    if (currentSlug === body.tier && current.billing_cycle === billing && current.auto_renew !== false) {
      return new Response(
        JSON.stringify({
          error: "already_subscribed",
          message: localize(body.lang, "already_subscribed", currentSlug, billing),
          current_tier: currentSlug,
          current_billing: current.billing_cycle,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3) Downgrade while a higher auto-renewing plan is active: blocked.
    if (requestedRank < currentRank && current.auto_renew !== false) {
      return new Response(
        JSON.stringify({
          error: "downgrade_blocked",
          message: localize(body.lang, "downgrade_blocked", currentSlug, billing),
          current_tier: currentSlug,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4) Upgrade (higher rank) or same-tier billing switch: allowed.
  }

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
