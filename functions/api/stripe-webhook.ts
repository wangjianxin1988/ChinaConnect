/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events for subscription lifecycle
 *
 * POST /api/stripe-webhook
 * Handles: checkout.session.completed, customer.subscription.updated,
 *          customer.subscription.deleted, invoice.payment_failed
 */

import type { PagesFunction } from "@cloudflare/workers-types";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  PUBLIC_SUPABASE_URL: string;
}

// Map Stripe price IDs to tier slugs (must match checkout.ts)
const PRICE_TO_TIER: Record<string, string> = {
  price_explorer_monthly: "explorer",
  price_explorer_annual: "explorer",
  price_traveler_monthly: "traveler",
  price_traveler_annual: "traveler",
  price_business_monthly: "business",
  price_business_annual: "business",
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  // Get the raw body and signature
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Initialize Supabase with service role key for admin operations
  const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, stripe, session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
 * Handle checkout.session.completed
 * Creates order and user_membership records
 */
async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const tier = session.metadata?.tier;
  const billing = session.metadata?.billing;

  if (!tier || !billing) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  // Get the subscription to find user info
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error("No subscription in checkout session");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get the customer email to find user
  const customerId = session.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    console.error("Customer was deleted");
    return;
  }
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error("No email found for customer:", customerId);
    return;
  }

  // Find user by email in Supabase
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("Error listing users:", userError);
    return;
  }

  const user = userData.users.find((u) => u.email === customerEmail);
  if (!user) {
    console.error("User not found for email:", customerEmail);
    return;
  }

  // Get the tier from membership_tiers table
  const { data: tierData, error: tierError } = await supabase
    .from("membership_tiers")
    .select("id")
    .eq("slug", tier)
    .single();

  if (tierError || !tierData) {
    console.error("Tier not found:", tier, tierError);
    // Try 'pro' as fallback mapping for explorer
    const fallbackSlug = tier === "explorer" ? "pro" : tier === "business" ? "enterprise" : tier;
    const { data: fallbackTier } = await supabase
      .from("membership_tiers")
      .select("id")
      .eq("slug", fallbackSlug)
      .single();

    if (!fallbackTier) {
      console.error("Fallback tier not found either:", fallbackSlug);
      return;
    }

    await createMembershipAndOrder(supabase, user.id, fallbackTier.id, billing, subscription, session);
    return;
  }

  await createMembershipAndOrder(supabase, user.id, tierData.id, billing, subscription, session);
}

/**
 * Create membership and order records
 */
async function createMembershipAndOrder(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tierId: string,
  billing: string,
  subscription: Stripe.Subscription,
  session: Stripe.Checkout.Session
) {
  const billingCycle = billing === "monthly" ? "monthly" : "yearly";
  const amount = (session.amount_total || 0) / 100;
  const currency = (session.currency || "usd").toUpperCase();

  // Generate order number
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `CC${datePart}${randPart}`;

  // Calculate expiry
  const expiresAt = new Date();
  if (billingCycle === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  // Create order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_type: "membership_new",
      order_number: orderNumber,
      amount: amount,
      currency: currency,
      final_amount: amount,
      tier_id: tierId,
      billing_cycle: billingCycle,
      status: "paid",
      payment_method: "stripe",
      payment_provider: "stripe",
      external_order_id: session.id,
      paid_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      metadata: {
        stripe_session_id: session.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: session.customer,
      },
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    return;
  }

  // Cancel any existing active membership
  await supabase
    .from("user_memberships")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");

  // Create new membership
  const { error: membershipError } = await supabase
    .from("user_memberships")
    .insert({
      user_id: userId,
      tier_id: tierId,
      status: "active",
      billing_cycle: billingCycle,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      auto_renew: true,
      order_id: orderData?.id,
      metadata: {
        stripe_subscription_id: subscription.id,
        stripe_customer_id: session.customer,
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
    .eq("user_id", userId)
    .single();

  if (!wallet) {
    await supabase.from("wallets").insert({
      user_id: userId,
      balance: 0,
      currency: currency,
      status: "active",
    });
  }

  console.log(`Membership created for user ${userId}: ${tierId} (${billingCycle})`);
}

/**
 * Handle subscription updated (plan change, renewal)
 */
async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const tier = subscription.metadata?.tier;

  // Update membership status based on subscription status
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "suspended",
    canceled: "cancelled",
    unpaid: "suspended",
  };

  const newStatus = statusMap[subscription.status] || "active";

  // Find membership by subscription ID in metadata
  const { data: memberships } = await supabase
    .from("user_memberships")
    .select("id, metadata")
    .eq("status", "active");

  if (memberships) {
    for (const membership of memberships) {
      const meta = membership.metadata as Record<string, unknown>;
      if (meta?.stripe_subscription_id === subscription.id) {
        await supabase
          .from("user_memberships")
          .update({
            status: newStatus,
            expires_at: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancelled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", membership.id);
        break;
      }
    }
  }
}

/**
 * Handle subscription deleted (cancelled)
 */
async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  // Find and cancel the membership
  const { data: memberships } = await supabase
    .from("user_memberships")
    .select("id, metadata")
    .eq("status", "active");

  if (memberships) {
    for (const membership of memberships) {
      const meta = membership.metadata as Record<string, unknown>;
      if (meta?.stripe_subscription_id === subscription.id) {
        await supabase
          .from("user_memberships")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", membership.id);
        break;
      }
    }
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Find the membership and mark as suspended
  const { data: memberships } = await supabase
    .from("user_memberships")
    .select("id, metadata")
    .eq("status", "active");

  if (memberships) {
    for (const membership of memberships) {
      const meta = membership.metadata as Record<string, unknown>;
      if (meta?.stripe_subscription_id === subscriptionId) {
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
}

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
    },
  });
};
