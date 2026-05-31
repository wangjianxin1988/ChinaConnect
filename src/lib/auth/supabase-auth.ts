/**
 * Supabase Auth Module for ChinaConnect
 * Centralized auth functions for login, register, OAuth, and session management.
 *
 * IMPORTANT: Uses PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY (Astro convention).
 * Reuses the shared Supabase client from @/supabase/config.
 */

import { supabase } from "@/supabase/config";
import type { User } from "@supabase/supabase-js";

// ============================================
// Auth Functions
// ============================================

/**
 * Sign up with email, password, and optional username.
 * The username is stored as `display_name` in user metadata,
 * which the handle_new_user() trigger uses to populate the profile.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username || email.split("@")[0],
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in with Google OAuth.
 * Redirects to Google, then back to /auth/callback.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the currently authenticated user (from session).
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Get the current session (includes access_token, user, etc.).
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.).
 * Returns the subscription object — call `.subscription.unsubscribe()` to clean up.
 */
export function onAuthStateChange(
  callback: (event: string, user: User | null) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null);
  });
}

/**
 * Fetch the user's profile from the `profiles` table.
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { profile: data, error };
}

/**
 * Fetch the user's active membership info from the user_dashboard view.
 */
export async function getUserDashboard(userId: string) {
  const { data, error } = await supabase
    .from("user_dashboard")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { dashboard: data, error };
}

/**
 * Fetch the user's wallet balance.
 */
export async function getUserWallet(userId: string) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { wallet: data, error };
}

/**
 * Fetch the user's recent orders.
 */
export async function getUserOrders(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { orders: data, error };
}

/**
 * Fetch the user's saved AI routes.
 */
export async function getUserRoutes(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("ai_routes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { routes: data, error };
}

/**
 * Fetch the user's bookmarks/favorites.
 */
export async function getUserFavorites(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { favorites: data, error };
}

// Re-export supabase client for convenience
export { supabase };
