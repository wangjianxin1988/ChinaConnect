// Supabase Edge Function: Creem Webhook
// Receives payment / subscription lifecycle events from Creem and keeps
// orders + user_memberships in sync (which drives AI tier gating).
//
// Verified against docs.creem.io/code/webhooks:
//  - Signature: header `creem-signature` = HMAC-SHA256(webhookSecret, rawBody)
//    hex digest (no `sha256=` prefix).
//  - Event name lives at payload.eventType (NOT event_type).
//  - Event data lives at payload.object.
//  - Amount is in cents: object.order.amount (1000 == EUR 10.00).
//  - Renewal payments also arrive as subscription.paid.
//  - Cancellation event is spelled subscription.canceled (single "l").

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, creem-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EventPayload {
  id?: string;
  eventType?: string;
  created_at?: number;
  object?: Record<string, unknown>;
}

interface MembershipMeta {
  user_id?: string;
  tier?: string;
  billing?: string;
  source?: string;
  subscription_id?: string;
  checkout_id?: string;
  request_id?: string;
}

const VALID_TIERS = ["explorer", "traveler", "business"];

function safeMeta(meta: unknown): MembershipMeta {
  const raw = (meta && typeof meta === "object" ? meta : {}) as Record<string, unknown>;
  const out: MembershipMeta = {};
  if (typeof raw.user_id === "string") out.user_id = raw.user_id;
  if (typeof raw.tier === "string") out.tier = raw.tier;
  if (typeof raw.billing === "string") out.billing = raw.billing;
  if (typeof raw.source === "string") out.source = raw.source;
  if (typeof raw.subscription_id === "string") out.subscription_id = raw.subscription_id;
  if (typeof raw.checkout_id === "string") out.checkout_id = raw.checkout_id;
  if (typeof raw.request_id === "string") out.request_id = raw.request_id;
  return out;
}

function normalizeBilling(b: string | undefined): "monthly" | "yearly" {
  if (b === "yearly" || b === "annual") return "yearly";
  return "monthly";
}

function tierSlug(t: string | undefined): string {
  if (t && VALID_TIERS.includes(t)) return t;
  return "free";
}

function centsToNumber(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n) / 100;
}

async function verifySignature(secret: string, body: string, header: string | null): Promise<boolean> {
  if (!header) return false;
  const expectedHex = await hmacSha256Hex(secret, body);
  const provided = header.trim().toLowerCase();
  if (provided.length !== expectedHex.length) return false;
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expectedHex);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
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

  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Webhook not configured. Set CREEM_WEBHOOK_SECRET in Supabase secrets." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const body = await req.text();
  let payload: EventPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("creem-signature");
  const valid = await verifySignature(webhookSecret, body, signature);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eventType = payload.eventType || "";
  const eventData = (payload.object && typeof payload.object === "object" ? payload.object : {}) as Record<string, unknown>;
  const metadata = safeMeta(eventData.metadata);
  const userId = metadata.user_id;
  const tier = tierSlug(metadata.tier);
  const billing = normalizeBilling(metadata.billing);

  if (!userId) {
    // Events without user_id (e.g. manually created test checkouts) are
    // logged and skipped instead of hard-failing.
    console.warn("Webhook ignored: missing user_id in metadata", eventType, payload.id);
    return new Response(JSON.stringify({ ok: true, action: "ignored_no_user" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    switch (eventType) {
      case "checkout.completed":
      case "subscription.paid": {
        // -- Resolve amount / currency / ids ---------------------------------
        const order = (eventData.order && typeof eventData.order === "object" ? eventData.order : {}) as Record<string, unknown>;
        const product = (eventData.product && typeof eventData.product === "object" ? eventData.product : {}) as Record<string, unknown>;
        // checkout.completed puts amount on object.order; subscription.paid and
        // subscription.active put it on object.product.price (all in cents).
        const amountCents = order.amount ?? product.price ?? eventData.amount;
        const amount = centsToNumber(amountCents);
        const currency = String(order.currency || product.currency || eventData.currency || "USD").toUpperCase();
        const subId =
          metadata.subscription_id ||
          (typeof eventData.subscription === "object" && eventData.subscription ? (eventData.subscription as Record<string, unknown>).id : undefined) ||
          (typeof eventData.id === "string" && String(eventData.id).startsWith("sub_") ? String(eventData.id) : undefined);
        const checkoutId = metadata.checkout_id || (String(eventData.id).startsWith("ch_") ? String(eventData.id) : undefined);
        const orderId =
          (typeof order.id === "string" ? String(order.id) : undefined) ||
          (eventType === "subscription.paid" && typeof eventData.last_transaction_id === "string" ? String(eventData.last_transaction_id) : undefined);

        // subscription.paid / subscription.active put product id at
        // eventData.product.id; checkout.completed may too.
        const productId =
          (typeof product.id === "string" ? String(product.id) : undefined) ||
          (typeof eventData.product_id === "string" ? String(eventData.product_id) : undefined) ||
          "";

        const currentPeriodEnd =
          typeof eventData.current_period_end_date === "string"
            ? eventData.current_period_end_date
            : undefined;
        const lastTransactionDate =
          typeof eventData.last_transaction_date === "string"
            ? eventData.last_transaction_date
            : undefined;
        const paidAt = lastTransactionDate || (typeof eventData.paid_at === "string" ? eventData.paid_at : undefined) || new Date().toISOString();

        if (tier === "free" || !amount) {
          // We always pass metadata with the tier, so this should not happen;
          // still guard against activating "free" via webhook.
          console.warn("Webhook ignored: no valid tier/amount", eventType, userId);
          return new Response(JSON.stringify({ ok: true, action: "ignored_no_amount" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // -- Look up tier row -------------------------------------------------
        const { data: tierRow } = await supabase
          .from("membership_tiers")
          .select("id, slug, currency")
          .eq("slug", tier)
          .single();
        if (!tierRow) {
          return new Response(JSON.stringify({ error: "Tier not found" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // -- Idempotency: skip if this order/transaction was already handled --
        const orderIdKey = orderId || (eventType === "checkout.completed" && checkoutId ? checkoutId : "") || payload.id || "";
        if (orderIdKey) {
          const { data: existingOrder } = await supabase
            .from("orders")
            .select("id")
            .eq("external_order_id", orderIdKey)
            .maybeSingle();
          if (existingOrder) {
            console.log("Webhook idempotent skip (order exists):", orderIdKey);
            return new Response(JSON.stringify({ ok: true, action: "duplicate", orderIdKey }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // -- Create order -----------------------------------------------------
        const orderType = eventType === "subscription.paid" ? "membership_renew" : "membership_new";
        const orderNumber = `CC${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
        const { data: orderRow, error: orderErr } = await supabase
          .from("orders")
          .insert({
            user_id: userId,
            order_type: orderType,
            order_number: orderNumber,
            amount: amount,
            currency: currency,
            discount_amount: 0,
            final_amount: amount,
            tier_id: tierRow.id,
            billing_cycle: billing,
            status: "paid",
            payment_method: "creem",
            payment_provider: "creem",
            external_order_id: orderIdKey,
            paid_at: paidAt,
            completed_at: new Date().toISOString(),
            description: `Membership ${orderType === "membership_new" ? "upgrade to" : "renewal of"} ${tier}`,
            metadata: {
              ...metadata,
              raw_event: eventType,
              event_id: payload.id || null,
              checkout_id: checkoutId || null,
              subscription_id: subId || null,
              product_id: productId || null,
              order_id: orderId || null,
              amount_cents: amountCents != null ? Number(amountCents) : null,
            },
          })
          .select("id")
          .single();
        if (orderErr) {
          console.error("Order insert failed:", orderErr);
          const orderErrDetail = JSON.stringify({ message: orderErr?.message, code: orderErr?.code, details: orderErr?.details, hint: orderErr?.hint });
          console.error("Order insert failed:", orderErrDetail);
          return new Response(JSON.stringify({ error: "Order insert failed", detail: orderErrDetail }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // -- Upsert membership ------------------------------------------------
        const startedAt = typeof eventData.current_period_start_date === "string" ? eventData.current_period_start_date : paidAt;
        const expiresAt =
          currentPeriodEnd ||
          new Date(Date.now() + (billing === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

        if (subId) {
          // Renewal / existing subscription: extend the same membership row.
          const { data: existingMembership } = await supabase
            .from("user_memberships")
            .select("id, status")
            .eq("user_id", userId)
            .eq("metadata->>subscription_id", subId)
            .maybeSingle();

          if (existingMembership) {
            const { error: updErr } = await supabase
              .from("user_memberships")
              .update({
                status: "active",
                tier_id: tierRow.id,
                billing_cycle: billing,
                expires_at: expiresAt,
                cancelled_at: null,
                auto_renew: true,
                order_id: orderRow.id,
                started_at: existingMembership.status === "cancelled" ? startedAt : undefined,
                metadata: {
                  ...metadata,
                  subscription_id: subId,
                  checkout_id: checkoutId || null,
                  last_renewal: paidAt,
                  raw_event: eventType,
                },
              })
              .eq("id", existingMembership.id);
            if (updErr) console.error("Membership renew update failed:", updErr);
          } else {
            await supabase.from("user_memberships").insert({
              user_id: userId,
              tier_id: tierRow.id,
              status: "active",
              billing_cycle: billing,
              started_at: startedAt,
              expires_at: expiresAt,
              auto_renew: true,
              order_id: orderRow.id,
              metadata: {
                ...metadata,
                subscription_id: subId,
                checkout_id: checkoutId || null,
                last_renewal: paidAt,
                raw_event: eventType,
              },
            });
          }
        } else {
          // One-time purchase or no subscription id: cancel any other active
          // membership for this user, then insert a fresh one.
          await supabase
            .from("user_memberships")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString(), auto_renew: false })
            .eq("user_id", userId)
            .eq("status", "active");
          await supabase.from("user_memberships").insert({
            user_id: userId,
            tier_id: tierRow.id,
            status: "active",
            billing_cycle: billing,
            started_at: startedAt,
            expires_at: expiresAt,
            auto_renew: true,
            order_id: orderRow.id,
            metadata: { ...metadata, raw_event: eventType, checkout_id: checkoutId || null },
          });
        }

        // -- Sync AI usage tier -------------------------------------------------
        await supabase.rpc("update_ai_usage_tier", { p_user_id: userId, p_tier_slug: tier });

        return new Response(
          JSON.stringify({ ok: true, action: eventType, tier, orderId: orderRow.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "subscription.active": {
        // Per Creem docs this event is for synchronization only — activation
        // should be driven by checkout.completed / subscription.paid. Do not
        // create a second order here (would duplicate the first purchase).
        const subId = typeof eventData.id === "string" ? String(eventData.id) : undefined;
        const endDate = typeof eventData.current_period_end_date === "string"
          ? eventData.current_period_end_date
          : undefined;
        if (subId && endDate) {
          await supabase
            .from("user_memberships")
            .update({ status: "active", expires_at: endDate, cancelled_at: null, auto_renew: true })
            .eq("metadata->>subscription_id", subId)
            .eq("user_id", userId);
        }
        return new Response(JSON.stringify({ ok: true, action: "subscription.active_sync" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "subscription.scheduled_cancel": {
        // Access continues until period end; keep membership active but stop
        // auto-renew so the UI reflects the pending cancellation.
        const subId = typeof eventData.id === "string" ? String(eventData.id) : undefined;
        const q = supabase.from("user_memberships");
        let query = q.update({ auto_renew: false });
        if (subId) {
          query = query.eq("metadata->>subscription_id", subId);
        } else {
          query = query.eq("user_id", userId).eq("status", "active");
        }
        await query;
        return new Response(JSON.stringify({ ok: true, action: "scheduled_cancel" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "subscription.canceled": {
        const subId = typeof eventData.id === "string" ? String(eventData.id) : undefined;
        const q = supabase.from("user_memberships");
        let query = q.update({ status: "cancelled", cancelled_at: new Date().toISOString(), auto_renew: false });
        if (subId) {
          query = query.eq("metadata->>subscription_id", subId);
        } else {
          query = query.eq("user_id", userId).eq("status", "active");
        }
        await query;
        await supabase.rpc("update_ai_usage_tier", { p_user_id: userId, p_tier_slug: "free" });
        return new Response(JSON.stringify({ ok: true, action: "canceled" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "subscription.past_due": {
        // Payment failed but Creem is retrying. Keep access; record the state.
        const subId = typeof eventData.id === "string" ? String(eventData.id) : undefined;
        const q = supabase.from("user_memberships");
        let query = q.update({ auto_renew: false, metadata: { ...metadata, past_due: true, raw_event: eventType } });
        if (subId) {
          query = query.eq("metadata->>subscription_id", subId);
        } else {
          query = query.eq("user_id", userId).eq("status", "active");
        }
        await query;
        return new Response(JSON.stringify({ ok: true, action: "past_due" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ ok: true, action: "ignored", eventType }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response(JSON.stringify({ error: "Internal error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});