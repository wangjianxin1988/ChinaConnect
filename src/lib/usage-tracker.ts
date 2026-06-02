/**
 * AI Usage Tracker
 * Tracks monthly AI request usage with automatic monthly reset
 * Supports Supabase-backed tier checking for authenticated users
 */

import { getCurrentTier, setCurrentTier, TIER_LIMITS, type SubscriptionTier } from './subscription';

const STORAGE_KEY = 'ai_usage_data';

interface UsageData {
  count: number;
  month: number; // 0-11
  year: number;
}

// Cached tier from Supabase to avoid repeated fetches
let cachedTier: SubscriptionTier | null = null;
let tierFetchPromise: Promise<SubscriptionTier> | null = null;

/**
 * Fetch the user's actual tier from Supabase
 * Returns the tier slug mapped to our local subscription tier
 */
async function fetchTierFromSupabase(): Promise<SubscriptionTier> {
  if (typeof window === 'undefined') return 'free';

  try {
    // Dynamically import to avoid circular deps and SSR issues
    const { supabase } = await import('@/supabase/config');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'free';

    // Use the get_user_membership RPC function
    const { data, error } = await supabase.rpc('get_user_membership', {
      p_user_id: user.id,
    });

    if (error || !data || data.length === 0) {
      // Fallback: check profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('membership_tier')
        .eq('user_id', user.id)
        .single();

      if (profile?.membership_tier) {
        return mapDbTierToLocal(profile.membership_tier);
      }
      return 'free';
    }

    const tierSlug = data[0]?.tier_slug || 'free';
    const mapped = mapDbTierToLocal(tierSlug);

    // Update localStorage cache
    setCurrentTier(mapped);

    return mapped;
  } catch (err) {
    console.warn('Failed to fetch tier from Supabase:', err);
    return getCurrentTier();
  }
}

/**
 * Map database tier slugs to local subscription tier names
 * DB uses: free, pro, enterprise
 * Local uses: free, explorer, traveler, business
 */
function mapDbTierToLocal(dbSlug: string): SubscriptionTier {
  const mapping: Record<string, SubscriptionTier> = {
    free: 'free',
    explorer: 'explorer',
    traveler: 'traveler',
    business: 'business',
    pro: 'traveler',      // Map DB 'pro' to local 'traveler'
    enterprise: 'business', // Map DB 'enterprise' to local 'business'
  };
  return mapping[dbSlug] || 'free';
}

/**
 * Get the current tier, checking Supabase first for authenticated users
 * Falls back to localStorage for non-logged-in users
 */
export async function getAuthAwareTier(): Promise<SubscriptionTier> {
  if (typeof window === 'undefined') return 'free';

  // Return cached value if available
  if (cachedTier) return cachedTier;

  // Deduplicate concurrent requests
  if (!tierFetchPromise) {
    tierFetchPromise = fetchTierFromSupabase().finally(() => {
      tierFetchPromise = null;
    });
  }

  cachedTier = await tierFetchPromise;
  return cachedTier;
}

/**
 * Clear the cached tier (call after login/logout/upgrade)
 */
export function clearTierCache(): void {
  cachedTier = null;
  tierFetchPromise = null;
}

/**
 * Get the current usage data from localStorage
 * Automatically resets if we're in a new month
 */
function getUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { count: 0, month: new Date().getMonth(), year: new Date().getFullYear() };
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: UsageData = JSON.parse(stored);
      // Check if we need to reset (new month)
      if (data.month !== currentMonth || data.year !== currentYear) {
        const resetData: UsageData = { count: 0, month: currentMonth, year: currentYear };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        return resetData;
      }
      return data;
    }
  } catch {
    // If parsing fails, reset
  }

  // Initialize fresh
  const freshData: UsageData = { count: 0, month: currentMonth, year: currentYear };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
  return freshData;
}

/**
 * Save usage data to localStorage
 */
function saveUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Get the number of AI requests used this month
 */
export function getUsageCount(): number {
  return getUsageData().count;
}

/**
 * Get the maximum allowed requests for the current tier
 * Returns -1 for unlimited
 */
export function getMaxRequests(tier?: SubscriptionTier): number {
  const t = tier || getCurrentTier();
  return TIER_LIMITS[t].aiRequestsPerMonth;
}

/**
 * Get the number of remaining requests
 * Returns -1 for unlimited
 */
export function getRemainingRequests(): number {
  const max = getMaxRequests();
  if (max === -1) return -1; // unlimited
  const used = getUsageCount();
  return Math.max(0, max - used);
}

/**
 * Check if the user has exceeded their usage limit
 * Returns true if within limit, false if exceeded
 */
export function checkUsageLimit(): { allowed: boolean; remaining: number; max: number } {
  const max = getMaxRequests();
  // -1 means unlimited
  if (max === -1) {
    return { allowed: true, remaining: -1, max: -1 };
  }

  const used = getUsageCount();
  const remaining = Math.max(0, max - used);

  return {
    allowed: used < max,
    remaining,
    max,
  };
}

/**
 * Increment the usage count by 1
 * Returns the new count
 */
export function incrementUsage(): number {
  const data = getUsageData();
  data.count += 1;
  saveUsageData(data);

  // Dispatch custom event so UI components can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai-usage-updated', { detail: { count: data.count } }));
  }

  return data.count;
}

/**
 * Reset usage count (for testing or admin purposes)
 */
export function resetUsage(): void {
  const now = new Date();
  saveUsageData({ count: 0, month: now.getMonth(), year: now.getFullYear() });
}

/**
 * Get usage percentage (0-100)
 * Returns -1 for unlimited
 */
export function getUsagePercentage(): number {
  const max = getMaxRequests();
  if (max === -1) return -1;
  const used = getUsageCount();
  return Math.min(100, Math.round((used / max) * 100));
}
