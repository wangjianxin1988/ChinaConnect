/**
 * AI Usage Tracker
 * Tracks monthly AI request usage with server-side persistence (Supabase).
 * The server is the source of truth — local cache is only a UI hint.
 *
 * Why this changed:
 *   The previous version wrote everything to localStorage. Refreshing / clearing browser data
 *   reset the counter, letting users get unlimited free requests. Now the Edge Function
 *   increments `public.ai_usage` per user per period (YYYYMM UTC), and the client just
 *   refreshes from the server.
 */

import { getCurrentTier, setCurrentTier, TIER_LIMITS, type SubscriptionTier } from "./subscription";

const STORAGE_KEY = "ai_usage_cache";

interface UsageCache {
  count: number;
  max: number;
  tier: SubscriptionTier;
  month: string; // YYYY-MM
  fetchedAt: number;
}

interface ServerUsage {
  request_count: number;
  max_requests: number;
  tier_slug: string;
}

let cachedTier: SubscriptionTier | null = null;
let tierFetchPromise: Promise<SubscriptionTier> | null = null;

async function fetchTierFromServer(): Promise<SubscriptionTier> {
  if (typeof window === "undefined") return "free";
  try {
    const { supabase } = await import("@/supabase/config");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return "free";

    const { data, error } = await supabase.rpc("get_user_membership", {
      p_user_id: userData.user.id,
    });
    if (error || !data || data.length === 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_tier")
        .eq("user_id", userData.user.id)
        .single();
      if (profile?.membership_tier) return mapDbTierToLocal(profile.membership_tier);
      return "free";
    }
    const mapped = mapDbTierToLocal(data[0]?.tier_slug || "free");
    setCurrentTier(mapped);
    return mapped;
  } catch {
    return getCurrentTier();
  }
}

function mapDbTierToLocal(dbSlug: string): SubscriptionTier {
  const mapping: Record<string, SubscriptionTier> = {
    free: "free",
    explorer: "explorer",
    traveler: "traveler",
    business: "business",
    pro: "traveler",
    enterprise: "business",
  };
  return mapping[dbSlug] || "free";
}

export async function getAuthAwareTier(): Promise<SubscriptionTier> {
  if (typeof window === "undefined") return "free";
  if (cachedTier) return cachedTier;
  if (!tierFetchPromise) {
    tierFetchPromise = fetchTierFromServer().finally(() => {
      tierFetchPromise = null;
    });
  }
  cachedTier = await tierFetchPromise;
  return cachedTier;
}

export function clearTierCache(): void {
  cachedTier = null;
  tierFetchPromise = null;
}

// ---------------------------------------------------------------------------
// Local cache helpers (UI hint only — server is authoritative)
// ---------------------------------------------------------------------------

function getCache(): UsageCache {
  if (typeof window === "undefined") {
    return {
      count: 0,
      max: TIER_LIMITS.free.aiRequestsPerMonth,
      tier: "free",
      month: "",
      fetchedAt: 0,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UsageCache;
  } catch {
    // ignore
  }
  return {
    count: 0,
    max: TIER_LIMITS.free.aiRequestsPerMonth,
    tier: "free",
    month: "",
    fetchedAt: 0,
  };
}

function saveCache(cache: UsageCache): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch authoritative usage from the server. Returns null if unauthenticated.
 */
export async function fetchUsageFromServer(): Promise<UsageCache | null> {
  if (typeof window === "undefined") return null;
  try {
    const { supabase } = await import("@/supabase/config");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;

    const { data, error } = await supabase.rpc("get_user_ai_usage", {
      p_user_id: userData.user.id,
    });
    if (error) {
      console.warn("get_user_ai_usage failed", error);
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    const cache: UsageCache = {
      count: row.request_count,
      max: row.max_requests,
      tier: mapDbTierToLocal(row.tier_slug),
      month: row.period_yyyymm,
      fetchedAt: Date.now(),
    };
    saveCache(cache);
    // Keep the tier badge in sync with the server (the server is authoritative).
    setCurrentTier(cache.tier);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ai-usage-updated", {
          detail: { count: cache.count, max: cache.max, tier: cache.tier },
        }),
      );
    }
    return cache;
  } catch (e) {
    console.warn("fetchUsageFromServer failed", e);
    return null;
  }
}

/**
 * Optimistically bump the local counter after a successful request.
 * The server is authoritative — this just keeps the UI snappy.
 */
export function bumpLocalCount(): number {
  const c = getCache();
  c.count += 1;
  c.fetchedAt = Date.now();
  saveCache(c);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ai-usage-updated", { detail: { count: c.count, max: c.max } }),
    );
  }
  return c.count;
}

/**
 * Read the cached usage synchronously. Use as a UI hint only.
 */
export function getUsageCount(): number {
  return getCache().count;
}

export function getMaxRequests(tier?: SubscriptionTier): number {
  const t = tier || getCurrentTier();
  return TIER_LIMITS[t].aiRequestsPerMonth;
}

export function getRemainingRequests(): number {
  const cache = getCache();
  const max = cache.max === -1 ? -1 : cache.max;
  if (max === -1) return -1;
  return Math.max(0, max - cache.count);
}

/**
 * Sync check based on the local cache. The Edge Function is the actual gatekeeper.
 */
export function checkUsageLimit(): { allowed: boolean; remaining: number; max: number } {
  const cache = getCache();
  const max = cache.max;
  if (max === -1) return { allowed: true, remaining: -1, max: -1 };
  const remaining = Math.max(0, max - cache.count);
  return { allowed: cache.count < max, remaining, max };
}

/**
 * Synchronous UI hint. Real gate is server-side.
 */
export function canMakeRequest(): boolean {
  if (typeof window === "undefined") return true;
  return checkUsageLimit().allowed;
}

export function getUsagePercentage(): number {
  const cache = getCache();
  if (cache.max === -1) return -1;
  return Math.min(100, Math.round((cache.count / cache.max) * 100));
}

/**
 * Local reset for testing / admin.
 */
export function resetUsage(): void {
  const cache: UsageCache = {
    count: 0,
    max: TIER_LIMITS.free.aiRequestsPerMonth,
    tier: "free",
    month: currentPeriod(),
    fetchedAt: Date.now(),
  };
  saveCache(cache);
}
