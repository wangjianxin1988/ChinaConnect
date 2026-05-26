/**
 * Supabase Auth Configuration for ChinaConnect
 *
 * This file contains the configuration for Supabase Auth including:
 * - Email/Password authentication
 * - OAuth providers (Google, GitHub)
 * - SMS phone verification
 * - Row Level Security (RLS) policies
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Enable Auth providers in Supabase Dashboard > Authentication > Providers
 * 3. Add your Supabase URL and Anon Key to .env
 * 4. Run the SQL schema in supabase/schema.sql to create tables and RLS policies
 */

import type { Database } from "@/types/database";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

// Environment variables - use lazy access to avoid build-time errors
function getSupabaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SUPABASE_URL) {
    return import.meta.env.PUBLIC_SUPABASE_URL;
  }
  return "https://placeholder.supabase.co";
}

function getSupabaseAnonKey(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SUPABASE_ANON_KEY) {
    return import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  }
  return "placeholder-anon-key";
}

// Create Supabase client lazily
let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        // Auto-refresh the token before it expires
        autoRefreshToken: true,
        // Persist the session in localStorage
        persistSession: true,
        // Detect session from URL (for OAuth callback)
        detectSessionInUrl: true,
        // Time before the OAuth modal is closed
        oauthAnchor: "tail",
      },
    });
  }
  return supabaseInstance;
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (_, prop) => {
    return (getSupabaseClient() as any)[prop];
  },
});

// Auth configuration for OAuth providers
export const OAUTH_PROVIDERS = {
  google: {
    name: "Google",
    icon: "/icons/google.svg",
    scopes: ["email", "profile"],
  },
  github: {
    name: "GitHub",
    icon: "/icons/github.svg",
    scopes: ["user:email"],
  },
} as const;

// Auth redirect URLs
export const AUTH_REDIRECT_URLS = {
  // Production URLs
  production: {
    success: "/auth/callback?success=true",
    error: "/auth/callback?error=auth_failed",
  },
  // Development URLs
  development: {
    success: "http://localhost:4321/auth/callback?success=true",
    error: "http://localhost:4321/auth/callback?error=auth_failed",
  },
} as const;

// Get the appropriate redirect URL based on environment
export function getRedirectURLs() {
  const isProduction = import.meta.env.PROD;
  return isProduction ? AUTH_REDIRECT_URLS.production : AUTH_REDIRECT_URLS.development;
}

// Sign up with email/password
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<{ user: Database["public"]["Tables"]["profiles"]["Row"] | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user as Database["public"]["Tables"]["profiles"]["Row"] | null, error: null };
}

// Sign in with email/password
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: unknown; error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

// Sign in with OAuth (Google or GitHub)
export async function signInWithOAuth(
  provider: "google" | "github",
): Promise<{ error: Error | null }> {
  const urls = getRedirectURLs();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: urls.success,
      scopes: provider === "google" ? "email profile" : "user:email",
    },
  });

  return { error };
}

// Sign in with phone number (SMS)
export async function signInWithPhone(phone: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: "sms",
    },
  });

  return { error };
}

// Verify phone OTP
export async function verifyPhoneOTP(
  phone: string,
  token: string,
): Promise<{ user: unknown; error: Error | null }> {
  const { data, error } = await supabase.auth.verifyOTP({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

// Sign out
export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

// Update user profile
export async function updateProfile(
  updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>,
): Promise<{ user: Database["public"]["Tables"]["profiles"]["Row"] | null; error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: new Error("User not authenticated") };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { user: null, error };
  }

  return { user: data as Database["public"]["Tables"]["profiles"]["Row"], error: null };
}

// Reset password request (email)
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error };
}

// Update password
export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

// Export the supabase client as default
export default supabase;
