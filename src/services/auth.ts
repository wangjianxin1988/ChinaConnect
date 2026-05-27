/**
 * ChinaConnect Auth Service
 * Supabase Auth integration with magic link and OAuth support
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
import type { Database } from "@/types/database";

// ============================================
// Auth Client
// ============================================

const authUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const authKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!authUrl || !authKey) {
  throw new Error("Supabase auth environment variables are not set");
}

export const authClient = createClient<Database>(authUrl, authKey);

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
  const { error } = await authClient.auth.signOut();
  return { error };
}

/**
 * Reset password request
 */
export async function resetPassword(
  email: string,
): Promise<{ error: SupabaseAuthError | null }> {
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
  const { error } = await authClient.auth.updateUser({ password: newPassword });
  return { error };
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<Pick<UserProfile, "display_name" | "avatar_url" | "bio" | "nationality" | "native_language">>,
): Promise<ProfileResponse> {
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
  try {
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return { profile: null, error: new Error("User not authenticated") };

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
