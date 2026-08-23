/**
 * ChinaConnect Auth Service
 * Supabase Auth integration with magic link, OAuth, and Demo Mode support
 */

import type { Database, UserLevel } from "@/types/database";
import type { AuthProvider, AuthState, SignUpData, User, UserProfile } from "@/types/user";
import { type AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import { supabase } from "@/supabase/config";

// ============================================
// Demo Mode Configuration
// ============================================

export const DEMO_MODE =
  !import.meta.env.PUBLIC_SUPABASE_URL ||
  import.meta.env.PUBLIC_SUPABASE_URL === "your-project-url" ||
  import.meta.env.PUBLIC_SUPABASE_URL === "";

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// Demo users for development/preview
const DEMO_USERS: Record<string, { password: string; profile: Partial<UserProfile> }> = {
  "demo@chinaengage.org": {
    password: "demo123",
    profile: {
      id: "demo-user-1",
      user_id: "demo-user-1",
      display_name: "Demo Explorer",
      avatar_url: null,
      nationality: "US",
      bio: "Exploring China one city at a time!",
      level: "探索者" as UserLevel,
      points: 250,
      posts_count: 5,
      check_ins_count: 12,
      likes_received: 28,
      best_answers: 2,
      native_language: "en",
      travel_level: 3,
      badges: ["first_checkin", "explorer_10", "streak_3", "first_post"],
      preferences: {
        language: "en",
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          likes: true,
          comments: true,
          checkInReminders: true,
          weeklyDigest: false,
        },
        privacy: {
          showProfile: true,
          showTravelHistory: true,
          showBadges: true,
        },
      },
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-05-20T00:00:00Z",
    },
  },
};

// Demo session storage (in-memory)
let demoUser: User | null = null;
let demoProfile: UserProfile | null = null;
let demoSessionExpiry: number | null = null;

function createDemoSession(profile: UserProfile): void {
  demoUser = {
    id: profile.user_id,
    email: "demo@chinaengage.org",
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
  demoProfile = profile;
  demoSessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
}

function clearDemoSession(): void {
  demoUser = null;
  demoProfile = null;
  demoSessionExpiry = null;
}

function isDemoSessionActive(): boolean {
  return !!(demoSessionExpiry && Date.now() < demoSessionExpiry);
}

// ============================================
// Auth Client - Use the single Supabase instance
// ============================================

export const authClient = supabase;

// ============================================
// Auth Response Types
// ============================================

export interface AuthResponse {
  user: User | null;
  session: import("@supabase/supabase-js").Session | null;
  error: SupabaseAuthError | null;
}

export interface ProfileResponse {
  profile: UserProfile | null;
  error: Error | null;
}

// ============================================
// Auth Functions
// ============================================

/**
 * Get current session
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await authClient.auth.getSession();
  return { session, error };
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  // Check demo mode first
  if (DEMO_MODE && isDemoSessionActive()) {
    return demoUser;
  }

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();
  if (error || !user) return null;
  return {
    id: user.id,
    email: user.email || "",
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  };
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  // Demo mode - check demo users
  if (DEMO_MODE) {
    const demoAccount = DEMO_USERS[email.toLowerCase()];
    if (demoAccount && demoAccount.password === password) {
      const profile = {
        ...demoAccount.profile,
        created_at: demoAccount.profile.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as UserProfile;
      createDemoSession(profile);
      return {
        user: demoUser,
        session: null,
        error: null,
      };
    }
    return {
      user: null,
      session: null,
      error: {
        name: "AuthError",
        message: "Invalid email or password",
        status: 400,
      } as SupabaseAuthError,
    };
  }

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, session: null, error };

  return {
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email || "",
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
        }
      : null,
    session: data.session,
    error: null,
  };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
  // Demo mode - sign up not available
  if (DEMO_MODE) {
    return {
      user: null,
      session: null,
      error: {
        name: "AuthError",
        message: "Sign up is not available in demo mode",
        status: 400,
      } as SupabaseAuthError,
    };
  }

  const { data: authData, error } = await authClient.auth.signUp({
    email: data.email,
    password: data.password || "",
    options: {
      data: {
        display_name: data.displayName || data.email.split("@")[0],
        nationality: data.nationality,
        native_language: data.nativeLanguage,
      },
      emailRedirectTo: authCallbackUrl(),
    },
  });

  if (error) return { user: null, session: null, error };

  return {
    user: authData.user
      ? {
          id: authData.user.id,
          email: authData.user.email || "",
          created_at: authData.user.created_at,
          updated_at: authData.user.updated_at || authData.user.created_at,
        }
      : null,
    session: authData.session,
    error: null,
  };
}

/**
 * Language-aware auth callback URL: keeps OAuth/email confirmations on the
 * user's current language (e.g. /ja/auth/callback) so the post-login redirect
 * never drops to the English account page.
 */
function authCallbackUrl(): string {
  if (typeof window === "undefined") return "/auth/callback";
  const w = window as unknown as { __I18N__?: { serverLang?: string } };
  const serverLang = w.__I18N__?.serverLang || "";
  let lang = serverLang && serverLang !== "en" ? serverLang : "";
  if (!lang) {
    try {
      const stored = localStorage.getItem("chinaconnect_language");
      if (stored && stored !== "en") lang = stored;
    } catch {
      /* ignore */
    }
  }
  return lang
    ? `${window.location.origin}/${lang}/auth/callback`
    : `${window.location.origin}/auth/callback`;
}

/**
 * Sign in with OAuth provider (Google, GitHub)
 */
export async function signInWithOAuth(provider: AuthProvider): Promise<AuthResponse> {
  // Demo mode - OAuth not available
  if (DEMO_MODE) {
    return {
      user: null,
      session: null,
      error: {
        name: "AuthError",
        message: "OAuth sign-in is not available in demo mode",
        status: 400,
      } as SupabaseAuthError,
    };
  }

  const { data, error } = await authClient.auth.signInWithOAuth({
    provider: provider === "email" ? "google" : provider,
    options: {
      redirectTo: authCallbackUrl(),
    },
  });

  if (error) return { user: null, session: null, error };

  // OAuth redirects, so user/session will be handled in callback
  return { user: null, session: null, error: null };
}

/**
 * Passwordless sign-in: email a 6-digit verification code.
 * (No emailRedirectTo is passed so the email template renders the numeric
 * code instead of a magic-link URL.)
 */
export async function signInWithMagicLink(
  email: string,
  redirectTo?: string,
): Promise<{ error: SupabaseAuthError | null }> {
  // Demo mode - magic link not available
  if (DEMO_MODE) {
    return {
      error: {
        name: "AuthError",
        message: "Magic link is not available in demo mode",
        status: 400,
      } as SupabaseAuthError,
    };
  }

  const { error } = await authClient.auth.signInWithOtp({
    email,
    options: {
      // Keep backward compatibility for callers that still rely on a link.
      ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
    },
  });

  return { error };
}

/**
 * Verify the 6-digit email verification code sent by signInWithMagicLink.
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<AuthResponse> {
  const { data, error } = await authClient.auth.verifyOtp({
    email,
    token: token.trim(),
    type: "email",
  });

  if (error) return { user: null, session: null, error };

  return {
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email || "",
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
        }
      : null,
    session: data.session,
    error: null,
  };
}

/**
 * Verify a magic link / recovery / signup token from the current URL.
 * Handles every link format Supabase can produce:
 *   1. ?code=...            (PKCE flow — email confirmation & recovery)
 *   2. ?token_hash=&type=   (legacy / alternate email templates)
 *   3. #access_token=...    (implicit flow)
 *   4. already-established session (fallback)
 */
export async function verifyMagicLink(): Promise<AuthResponse> {
  // Demo mode - return demo user
  if (DEMO_MODE && isDemoSessionActive()) {
    return { user: demoUser, session: null, error: null };
  }

  if (typeof window === "undefined") {
    return { user: null, session: null, error: null };
  }

  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  function toUser(session: import("@supabase/supabase-js").Session) {
    return {
      id: session.user.id,
      email: session.user.email || "",
      created_at: session.user.created_at,
      updated_at: session.user.updated_at || session.user.created_at,
    };
  }

  // 1) PKCE code exchange (signup confirmations & password recovery)
  const code = params.get("code") || hashParams.get("code");
  if (code) {
    const { data, error } = await authClient.auth.exchangeCodeForSession(code);
    if (error) return { user: null, session: null, error };
    if (data.session) {
      return { user: toUser(data.session), session: data.session, error: null };
    }
  }

  // 2) token_hash + type (magiclink / recovery / signup / email_change)
  const tokenHash = params.get("token_hash") || hashParams.get("token_hash");
  const otpType = params.get("type") || hashParams.get("type");
  if (tokenHash && otpType) {
    const { data, error } = await authClient.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as "signup" | "recovery" | "magiclink" | "email_change" | "sms",
    });
    if (error) return { user: null, session: null, error };
    if (data.session) {
      return { user: toUser(data.session), session: data.session, error: null };
    }
  }

  // 3) Implicit flow (#access_token=...)
  const accessToken = hashParams.get("access_token");
  if (accessToken) {
    const { data, error } = await authClient.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get("refresh_token") || "",
    });
    if (error) return { user: null, session: null, error };
    if (data.session) {
      return { user: toUser(data.session), session: data.session, error: null };
    }
  }

  // 4) Fallback: session already established
  const { data, error } = await authClient.auth.getSession();
  if (error) return { user: null, session: null, error };

  if (!data.session) {
    return {
      user: null,
      session: null,
      error: {
        name: "AuthError",
        message: "No session found after link verification",
        status: 400,
      } as SupabaseAuthError,
    };
  }

  return {
    user: toUser(data.session),
    session: data.session,
    error: null,
  };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: SupabaseAuthError | null }> {
  // Clear demo session
  if (DEMO_MODE && isDemoSessionActive()) {
    clearDemoSession();
    return { error: null };
  }

  const { error } = await authClient.auth.signOut();
  return { error };
}

/**
 * Reset password request
 */
export async function resetPassword(email: string): Promise<{ error: SupabaseAuthError | null }> {
  // Demo mode - silently succeed
  if (DEMO_MODE) {
    return { error: null };
  }

  const { error } = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${authCallbackUrl().replace(/\/auth\/callback$/, "")}/auth/reset-password`,
  });
  return { error };
}

/**
 * Update user password
 */
export async function updatePassword(
  newPassword: string,
): Promise<{ error: SupabaseAuthError | null }> {
  // Demo mode - not available
  if (DEMO_MODE) {
    return { error: null };
  }

  const { error } = await authClient.auth.updateUser({ password: newPassword });
  return { error };
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<
    Pick<UserProfile, "display_name" | "avatar_url" | "bio" | "nationality" | "native_language">
  >,
): Promise<ProfileResponse> {
  // Demo mode - update local profile
  if (DEMO_MODE && isDemoSessionActive()) {
    if (demoProfile) {
      demoProfile = { ...demoProfile, ...updates, updated_at: new Date().toISOString() };
    }
    return { profile: demoProfile, error: null };
  }

  try {
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return { profile: null, error: new Error("User not authenticated") };

    const { data, error } = await authClient
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return { profile: null, error };

    return { profile: data as UserProfile, error: null };
  } catch (err) {
    return { profile: null, error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

/**
 * Get user profile by user ID
 */
export async function getProfile(userId: string): Promise<ProfileResponse> {
  try {
    const { data, error } = await authClient
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return { profile: null, error };

    return { profile: data as UserProfile, error: null };
  } catch (err) {
    return { profile: null, error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<ProfileResponse> {
  // Check demo mode first
  if (DEMO_MODE && isDemoSessionActive()) {
    return { profile: demoProfile, error: null };
  }

  try {
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return { profile: null, error: null };

    return getProfile(user.id);
  } catch (err) {
    return { profile: null, error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

/**
 * Create or update user profile
 */
export async function upsertProfile(
  userId: string,
  data: Partial<UserProfile>,
): Promise<ProfileResponse> {
  try {
    const { data: result, error } = await authClient
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          ...data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) return { profile: null, error };

    return { profile: result as UserProfile, error: null };
  } catch (err) {
    return { profile: null, error: err instanceof Error ? err : new Error("Unknown error") };
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (authState: AuthState) => void) {
  return authClient.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email || "",
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        }
      : null;

    // Fire the callback synchronously. Never await DB work inside the auth
    // notification: gotrue-js holds a Web-Locks lock (lock:<storageKey>) while
    // notifying subscribers, and supabase queries call getSession(), which
    // tries to acquire the SAME lock -> re-entrant deadlock (e.g. the reset
    // password button stuck at "Processing..." forever). The profile fetch is
    // therefore deferred until after the notification releases the lock.
    callback({
      user,
      profile: null,
      isLoading: false,
      isAuthenticated: !!user,
      error: null,
    });

    if (!user) return;

    void (async () => {
      try {
        let profile: UserProfile | null = null;
        const { profile: fetchedProfile } = await getProfile(user.id);
        profile = fetchedProfile;
        if (!profile && session?.user?.user_metadata) {
          // Auto-create the profile row from OAuth metadata (Google/GitHub)
          // in case the DB trigger was missing or the provider used different keys.
          const meta = session.user.user_metadata as Record<string, unknown>;
          const displayName = String(
            meta.display_name || meta.full_name || meta.name || meta.preferred_username || "",
          )
            .trim();
          const avatarUrl = String(meta.avatar_url || meta.picture || "").trim();
          if (displayName || avatarUrl) {
            const { profile: created } = await upsertProfile(user.id, {
              display_name: displayName || undefined,
              avatar_url: avatarUrl || undefined,
            });
            if (created) profile = created;
          }
        }
        callback({
          user,
          profile,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch {
        callback({
          user,
          profile: null,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    })();
  });
}

// ============================================
// Type exports
// ============================================

export type { SupabaseAuthError };
