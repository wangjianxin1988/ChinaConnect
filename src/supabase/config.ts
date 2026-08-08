/**
 * Supabase config: shared client + auth helpers.
 * The redirect URL for email confirmations is set to /auth/callback so the
 * verification link the user receives in their email points to our callback
 * page, which exchanges the code for a session.
 */

import { type SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  if (typeof (globalThis as unknown as { WebSocket?: unknown }).WebSocket === "undefined") {
    class DummyWebSocket {
      close(): void {}
      send(_data: string | ArrayBuffer | Blob): void {}
      addEventListener(): void {}
      removeEventListener(): void {}
      onopen: null | (() => void) = null;
      onclose: null | (() => void) = null;
      onerror: null | ((event: unknown) => void) = null;
      onmessage: null | ((event: unknown) => void) = null;
      readyState = 0;
      CONNECTING = 0;
      OPEN = 1;
      CLOSING = 2;
      CLOSED = 3;
    }
    (globalThis as unknown as { WebSocket: typeof DummyWebSocket }).WebSocket = DummyWebSocket;
  }
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

function callbackUrl(): string {
  if (typeof window !== "undefined") return `${window.location.origin}/auth/callback`;
  return "/auth/callback";
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
      emailRedirectTo: callbackUrl(),
    },
  });
}

export async function signInWithOAuth(provider: "google" | "github") {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl() },
  });
}

export async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyPhoneOTP(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}

/**
 * Exchange the PKCE `?code=` query param from the email confirmation link
 * for a Supabase session. Called by /auth/callback.astro.
 */
export async function exchangeCodeForSession(code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}

/**
 * Verify OTP token from `?token_hash=&type=` (used by some email templates).
 */
export async function verifyOtpToken(tokenHash: string, type: string) {
  return supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "signup" | "recovery" | "magiclink" | "email_change" | "sms",
  });
}
