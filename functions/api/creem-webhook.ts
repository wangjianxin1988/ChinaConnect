/**
 * Creem Webhook Handler
 * Processes Creem webhook events for subscription lifecycle
 *
 * POST /api/creem-webhook
 * Header: creem-signature (HMAC-SHA256 of raw body)
 *
 * Events handled:
 *   - subscription.active   → activate membership
 *   - subscription.paid     → create order record (renewal)
 *   - subscription.canceled → mark cancel_at_period_end
 *   - subscription.expired  → deactivate membership, tier back to free
 *   - subscription.past_due → flag payment issue
 */

import type { PagesFunction } from "@cloudflare/workers-types";
import { createClient } from "@supabase/supabase-js";

interface Env {
  CREEM_WEBHOOK_SECRET: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  PUBLIC_SUPABASE_URL: string;
}

interface CreemEvent {
  id: string;
  type: string;
  object: {
    id: string;
    status: string;
    product_id?: string;
    customer?: {
      id: string;
      email?: string;
    };
    metadata?: Record<string, string>;
    current_period_end?: string;
    canceled_at?: string;
    amount?: number;
    currency?: string;
  };
}

// Map Creem product IDs to tier slugs (must match checkout.ts)
const PRODUCT_TO_TIER: Record<string, string> = {
  prod_explorer_monthly: "explorer",
  prod_explorer_annual: "explorer",
  prod_traveler_monthly: "traveler",
  prod_traveler_annual: "traveler",
  prod_business_monthly: "business",
  prod_business_annual: "business",
};

/**
 * Verify HMAC-SHA256 signature using Web Crypto API (CF Workers compatible)
 */
async function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSig = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    if (expectedSig.length !== signature.length) return false;
    let result = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      result |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.CREEM_WEBHOOK_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("Server configuration error", { status: 500 });
  }

  // Read raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get("creem-signature");

  // Verify webhook signature
  const isValid = await verifySignature(body, signature, env.CREEM_WEBHOOK_SECRET);
  if (!isValid) {
    console.error("Webhook signature verification failed");
    return new Response("Invalid signature", { status: 401 });
  }

  // Parse event
  let event: CreemEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Initialize Supabase with service role key for admin operations
  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case "subscription.active": {
        await handleSubscriptionActive(supabase, event);
        break;
      }

      case "subscription.paid": {
        await handleSubscriptionPaid(supabase, event);
        break;
      }

      case "subscription.canceled": {
        await handleSubscriptionCanceled(supabase, event);
        break;
      }

      case "subscription.expired": {
        await handleSubscriptionExpired(supabase, event);
        break;
      }

      case "subscription.past_due": {
        await handleSubscriptionPastDue(supabase, event);
        break;
      }

      default:
        console.log(`Unhandled Creem event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Webhook handler error for ${event.type}:`, message);
    return new Response(`Webhook handler error: ${message}`, { status: 500 });
  }
};

/**
 * Find user by email from Creem customer data
 */
async function findUserByEmail(supabase: ReturnType<typeof createClient>, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error);
    return null;
  }
  return data.users.find((u) => u.email === email) || null;
}

/**
 * Get tier ID from product slug, with fallback mapping
 */
async function getTierId(supabase: ReturnType<typeof createClient>, tierSlug: string) {
  const { data } = await supabase
    .from("membership_tiers")
    .select("id")
    .eq("slug", tierSlug)
    .single();

  if (data) return data.id;

  // Fallback mappings
  const fallbackMap: Record<string, string> = {
    explorer: "pro",
    business: "enterprise",
  };
  const fallback = fallbackMap[tierSlug] || tierSlug;
  const { data: fb } = await supabase
    .from("membership_tiers")
    .select("id")
    .eq("slug", fallback)
    .single();

  return fb?.id || null;
}

/**
 * Handle subscription.active — user subscribed or reactivated
 */
async function handleSubscriptionActive(supabase: ReturnType<typeof createClient>, event: CreemEvent) {
  const obj = event.object;
  const productId = obj.product_id || obj.metadata?.product_id || "";
  const tierSlug = PRODUCT_TO_TIER[productId] || obj.metadata?.tier || "explorer";
  const billing = obj.metadata?.billing || (productId.includes("annual") ? "annual" : "monthly");
  const customerEmail = obj.customer?.email;

  if (!customerEmail) {
    console.error("No customer email in subscription.active event");
    return;
  }

  const user = await findUserByEmail(supabase, customerEmail);
  if (!user) {
    console.error("User not found for email:", customerEmail);
    return;
  }

  const tierId = await getTierId(supabase, tierSlug);
  if (!tierId) {
    console.error("Tier not found:", tierSlug);
    return;
  }

  const billingCycle = billing === "monthly" ? "monthly" : "yearly";
  const now = new Date();
  const expiresAt = new Date(now);
  if (billingCycle === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  // Cancel any existing active membership
  await supabase
    .from("user_memberships")
    .update({ status: "cancelled", cancelled_at: now.toISOString() })
    .eq("user_id", user.id)
    .eq("status", "active");

  // Create new membership
  const { error: membershipError } = await supabase
    .from("user_memberships")
    .insert({
      user_id: user.id,
      tier_id: tierId,
      status: "active",
      billing_cycle: billingCycle,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      auto_renew: true,
      metadata: {
        creem_subscription_id: obj.id,
        creem_customer_id: obj.customer?.id,
      },
    });

  if (membershipError) {
    console.error("Error creating membership:", membershipError);
    return;
  }

  // Ensure wallet exists
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    await supabase.from("wallets").insert({
      user_id: user.id,
      balance: 0,
      currency: (obj.currency || "USD").toUpperCase(),
      status: "active",
    });
  }

  console.log(`Membership activated for user ${user.id}: ${tierSlug} (${billingCycle})`);
}

/**
 * Handle subscription.paid — renewal payment
 */
async function handleSubscriptionPaid(supabase: ReturnType<typeof createClient>, event: CreemEvent) {
  const obj = event.object;
  const customerEmail = obj.customer?.email;

  if (!customerEmail) {
    console.error("No customer email in subscription.paid event");
    return;
  }

  const user = await findUserByEmail(supabase, customerEmail);
  if (!user) {
    console.error("User not found for email:", customerEmail);
    return;
  }

  // Generate order number
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `CC${datePart}${randPart}`;

  const amount = (obj.amount || 0) / 100; // Creem amount is in cents
  const currency = (obj.currency || "USD").toUpperCase();

  // Find existing membership to get tier
  const { data: membership } = await supabase
    .from("user_memberships")
    .select("tier_id, billing_cycle")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  await supabase.from("orders").insert({
    user_id: user.id,
    order_type: "membership_renewal",
    order_number: orderNumber,
    amount: amount,
    currency: currency,
    final_amount: amount,
    tier_id: membership?.tier_id || null,
    billing_cycle: membership?.billing_cycle || "monthly",
    status: "paid",
    payment_method: "creem",
    payment_provider: "creem",
    external_order_id: obj.id,
    paid_at: now.toISOString(),
    completed_at: now.toISOString(),
    metadata: {
      creem_subscription_id: obj.id,
      creem_customer_id: obj.customer?.id,
    },
  });

  // Update membership expiry
  if (membership) {
    const expiresAt = new Date(now);
    if (membership.billing_cycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await supabase
      .from("user_memberships")
      .update({ expires_at: expiresAt.toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active");
  }

  console.log(`Renewal order created for user ${user.id}: ${orderNumber}`);
}

/**
 * Handle subscription.canceled — mark as cancel_at_period_end
 */
async function handleSubscriptionCanceled(supabase: ReturnType<typeof createClient>, event: CreemEvent) {
  const obj = event.object;

  const { data: memberships } = await supabase
    .from("user_memberships")
    .select("id, metadata")
    .eq("status", "active");

  if (memberships) {
    for (const membership of memberships) {
      const meta = membership.metadata as Record<string, unknown>;
      if (meta?.creem_subscription_id === obj.id) {
        await supabase
          .from("user_memberships")
          .update({
            auto_renew: false,
            cancelled_at: obj.canceled_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", membership.id);
        break;
      }
    }
  }

  console.log(`Subscription ${obj.id} marked as cancel_at_period_end`);
}

/**
 * Handle subscription.expired — deactivate membership, tier back to free
 */
async function handleSubscriptionExpired(supabase: ReturnType<typeof createClient>, event: CreemEvent) {
  const obj = event.object;

  const { data: memberships } = await supabase
    .from("user_memberships")
    .select("id, user_id, metadata")
    .in("status", ["active", "suspended"]);

  if (memberships) {
    for (const membership of memberships) {
      const meta = membership.metadata as Record<string, unknown>;
      if (meta?.creem_subscription_id === obj.id) {
        await supabase
          .from("user_memberships")
          .update({
            status: "expired",
            cancelled_at: new Date().toISOString(),
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", membership.id);

        console.log(`Membership ${membership.id} expired for user ${membership.user_id}`);
        break;
      }
    }
  }
}

/**
 * Handle subscription.past_due — flag payment issue
 */
async function handleSubscriptionPastDue(supabase: ReturnType<typeof createClient>, event: CreemEvent) {
  const obj = event.object;

  const { data: memberships } = await supabase
    .from("user_memberships")
    .select("id, metadata")
    .eq("status", "active");

  if (memberships) {
    for (const membership of memberships) {
      const meta = membership.metadata as Record<string, unknown>;
      if (meta?.creem_subscription_id === obj.id) {
        await supabase
          .from("user_memberships")
          .update({
            status: "suspended",
            updated_at: new Date().toISOString(),
          })
          .eq("id", membership.id);
        break;
      }
    }
  }

  console.log(`Subscription ${obj.id} past due — membership suspended`);
}

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, creem-signature",
    },
  });
};
