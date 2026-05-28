/**
 * ChinaConnect Auth Service
 * Supabase Auth integration with magic link, OAuth, and Demo Mode support
 */

import { createClient, type AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import type {
  AuthProvider,
  AuthState,
  SignInOptions,
  SignUpData,
  User,
  UserProfile,
} from "@/types/user";
import { supabase } from "./supabase";
import type { Database, UserLevel } from "@/types/database";

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
  "demo@chinaconnect.com": {
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
    email: "demo@chinaconnect.com",
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
// Auth Client
// ============================================

const authUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const authKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const authClient = createClient<Database>(authUrl || "https://placeholder.supabase.co", authKey || "placeholder", {
  auth: {
    autoRefreshToken: !DEMO_MODE,
    persistSession: !DEMO_MODE,
    detectSessionInUrl: !DEMO_MODE,
  },
});

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
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
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
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) return { user: null, session: null, error };

  // OAuth redirects, so user/session will be handled in callback
  return { user: null, session: null, error: null };
}

/**
 * Sign in with magic link (passwordless email)
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
      emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  });

  return { error };
}

/**
 * Verify magic link token from URL
 */
export async function verifyMagicLink(): Promise<AuthResponse> {
  // Demo mode - return demo user
  if (DEMO_MODE && isDemoSessionActive()) {
    return { user: demoUser, session: null, error: null };
  }

  const { data, error } = await authClient.auth.getSession();

  if (error) return { user: null, session: null, error };

  if (!data.session) {
    return {
      user: null,
      session: null,
      error: {
        name: "AuthError",
        message: "No session found after magic link verification",
        status: 400,
      } as SupabaseAuthError,
    };
  }

  return {
    user: {
      id: data.session.user.id,
      email: data.session.user.email || "",
      created_at: data.session.user.created_at,
      updated_at: data.session.user.updated_at || data.session.user.created_at,
    },
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
export async function resetPassword(
  email: string,
): Promise<{ error: SupabaseAuthError | null }> {
  // Demo mode - silently succeed
  if (DEMO_MODE) {
    return { error: null };
  }

  const { error } = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
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
  updates: Partial<Pick<UserProfile, "display_name" | "avatar_url" | "bio" | "nationality" | "native_language">>,
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
      .single();

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
  return authClient.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email || "",
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        }
      : null;

    let profile: UserProfile | null = null;
    if (user) {
      const { profile: fetchedProfile } = await getProfile(user.id);
      profile = fetchedProfile;
    }

    callback({
      user,
      profile,
      isLoading: false,
      isAuthenticated: !!user,
      error: null,
    });
  });
}

// ============================================
// Type exports
// ============================================

export type { SupabaseAuthError };
