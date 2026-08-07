// Supabase Edge Function: Creem Webhook
// Receives payment success / cancellation events from Creem and updates
// user_memberships in Supabase. Also bumps ai_usage.tier_slug so the chat
// function gates requests correctly.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const webhookSecret = Deno.env.get("CREEM_WEBHOOK_SECRET") || "";

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const body = await req.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify webhook signature if configured
  if (webhookSecret) {
    const signature = req.headers.get("creem-signature") || req.headers.get("x-creem-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Creem uses HMAC-SHA256; the signature is in the form "sha256=<hex>"
    const expected = await hmacHex(webhookSecret, body);
    if (signature !== `sha256=${expected}` && signature !== expected) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const eventType = payload.event_type || payload.type || payload.event;
  const eventData = (payload.data || payload.object || payload) as Record<string, unknown>;
  const metadata = (eventData.metadata || {}) as Record<string, string>;
  const userId = metadata.user_id;
  const tier = metadata.tier;
  const billing = metadata.billing || "monthly";

  if (!userId || !tier) {
    return new Response(JSON.stringify({ error: "Missing user_id or tier in metadata" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Map tier to local tier slug
  const tierSlug =
    tier === "explorer" || tier === "traveler" || tier === "business" ? tier : "free";

  try {
    if (
      eventType === "checkout.completed" ||
      eventType === "payment.succeeded" ||
      eventType === "subscription.created"
    ) {
      // Activate membership
      const { data: tierRow } = await supabase
        .from("membership_tiers")
        .select("id")
        .eq("slug", tierSlug)
        .single();

      if (!tierRow) {
        return new Response(JSON.stringify({ error: "Tier not found" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Cancel any existing active membership
      await supabase
        .from("user_memberships")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("status", "active");

      // Calculate expiry
      const periodMs = billing === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + periodMs).toISOString();

      // Insert new membership
      await supabase.from("user_memberships").insert({
        user_id: userId,
        tier_id: tierRow.id,
        status: "active",
        billing_cycle: billing,
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
        auto_renew: true,
        payment_channel: "creem",
        payment_provider: "creem",
        metadata: { ...metadata, raw_event: eventType },
      });

      // Update ai_usage tier for current period
      await supabase.rpc("update_ai_usage_tier", {
        p_user_id: userId,
        p_tier_slug: tierSlug,
      });

      return new Response(JSON.stringify({ ok: true, action: "activated", tier: tierSlug }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (eventType === "subscription.cancelled" || eventType === "payment.failed") {
      await supabase
        .from("user_memberships")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("status", "active");

      await supabase.rpc("update_ai_usage_tier", {
        p_user_id: userId,
        p_tier_slug: "free",
      });

      return new Response(JSON.stringify({ ok: true, action: "cancelled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, action: "ignored", eventType }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response(JSON.stringify({ error: "Internal error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
