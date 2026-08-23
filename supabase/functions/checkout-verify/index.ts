// Supabase Edge Function: Verify Creem redirect signature
// Called by the /[lang]/checkout/success page after Creem redirects the
// customer back. Prevents malicious users from spoofing a successful payment.
//
// Signature spec (docs.creem.io/features/checkout/checkout-api):
//  canonical = key1=value1|key2=value2|...|keyN=valueN|salt={CREEM_API_KEY}
//  - Keys appear in the same order as in the redirect URL.
//  - Null / empty values are excluded.
//  - digest = SHA-256 hex of canonical.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyRequest {
  // Ordered [key, value] pairs exactly as they appeared in the redirect URL.
  params?: [string, string][];
  signature?: string;
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const creemApiKey = Deno.env.get("CREEM_API_KEY") || "";
  if (!creemApiKey) {
    return new Response(
      JSON.stringify({ error: "payment_not_configured", message: "CREEM_API_KEY is not set." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: VerifyRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const params = Array.isArray(body.params) ? body.params : [];
  const providedSignature = typeof body.signature === "string" ? body.signature : "";

  if (!providedSignature || params.length === 0) {
    return new Response(
      JSON.stringify({ valid: false, error: "Missing signature or params" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Build canonical string in URL order, skipping null/empty values.
  const parts: string[] = [];
  for (const [key, value] of params) {
    if (!key || value === null || value === undefined || value === "") continue;
    if (key === "signature") continue;
    parts.push(`${key}=${value}`);
  }
  parts.push(`salt=${creemApiKey}`);
  const canonical = parts.join("|");

  const expected = await sha256Hex(canonical);
  const valid = timingSafeEqualHex(providedSignature.toLowerCase(), expected);

  if (!valid) {
    return new Response(
      JSON.stringify({ valid: false, error: "Signature mismatch" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Signature is valid — look up the order so the success page can show the
  // real tier even before the webhook lands (or if the webhook was delayed).
  const get = (k: string): string => {
    const found = params.find(([key]) => key === k);
    return found && found[1] ? found[1] : "";
  };
  const checkoutId = get("checkout_id");
  const orderId = get("order_id");
  const subscriptionId = get("subscription_id");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

  let orderInfo: { orderId: string; tier: string; billing: string; status: string } | null = null;
  try {
    let query = supabase.from("orders").select("id, billing_cycle, status, metadata, membership_tiers(slug)");
    if (orderId) {
      query = query.eq("external_order_id", orderId);
    } else if (checkoutId) {
      query = query.eq("metadata->>checkout_id", checkoutId);
    } else {
      query = query.is("id", null);
    }
    const { data: row } = await query.maybeSingle();
    if (row) {
      const meta = (row.metadata && typeof row.metadata === "object" ? row.metadata : {}) as Record<string, unknown>;
      const joinedTier = Array.isArray(row.membership_tiers)
        ? (row.membership_tiers as Array<Record<string, unknown>>)[0]
        : (row.membership_tiers as unknown as Record<string, unknown> | null);
      const tier = (joinedTier && typeof joinedTier === "object" ? joinedTier.slug : meta.tier) || "";
      orderInfo = {
        orderId: String(row.id),
        tier: String(tier || ""),
        billing: String(row.billing_cycle || meta.billing || "monthly"),
        status: String(row.status || "pending"),
      };
    }
  } catch (e) {
    console.error("checkout-verify order lookup failed:", e);
  }

  return new Response(
    JSON.stringify({
      valid: true,
      checkout_id: checkoutId,
      order_id: orderId,
      subscription_id: subscriptionId,
      order: orderInfo,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});