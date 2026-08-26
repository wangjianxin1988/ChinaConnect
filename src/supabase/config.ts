/**
 * Supabase config: shared client + auth helpers.
 * The redirect URL for email confirmations is set to /auth/callback so the
 * verification link the user receives in their email points to our callback
 * page, which completes the session (implicit #access_token or token_hash).
 * flowType is implicit: PKCE breaks numeric OTP verify (supabase/auth-js #662)
 * because verifyOtp() never sends the code_verifier, so passwordless login,
 * signup confirmations and password recovery fail with 403 otp_expired.
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
    flowType: "implicit",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: createAuthStorage(),
  },
});

// Cookie mirror so Cloudflare Pages Functions (/api/auth/state) can verify the
// session server-side. supabase-js persists to localStorage by default, but the
// header auth state is read from a cookie; keep both in sync.
const AUTH_COOKIE_NAME = "sb-auth-token";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 3600;

function writeAuthCookie(value: string | null): void {
  if (typeof document === "undefined") return;
  try {
    if (value === null) {
      document.cookie = AUTH_COOKIE_NAME + "=; Path=/; SameSite=Lax; Max-Age=0";
      return;
    }
    document.cookie =
      AUTH_COOKIE_NAME +
      "=" +
      encodeURIComponent(value) +
      "; Path=/; SameSite=Lax; Max-Age=" +
      AUTH_COOKIE_MAX_AGE;
  } catch {
    // Cookies may be unavailable (e.g. third-party iframe); localStorage still works.
  }
}

function createAuthStorage() {
  return {
    getItem: async function (key: string): Promise<string | null> {
      if (typeof localStorage === "undefined") return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async function (key: string, value: string): Promise<void> {
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(key, value);
        } catch {
          // storage may be full/blocked; still try the cookie
        }
      }
      try {
        const parsed = JSON.parse(value) as {
          access_token?: string;
          refresh_token?: string;
          expires_at?: number;
        };
        if (parsed.access_token) {
          writeAuthCookie(
            JSON.stringify({
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token ?? "",
              expires_at: parsed.expires_at ?? 0,
            }),
          );
        }
      } catch {
        // not a session payload; ignore
      }
    },
    removeItem: async function (key: string): Promise<void> {
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      }
      writeAuthCookie(null);
    },
  };
}

function callbackUrl(): string {
  if (typeof window !== "undefined") {
    // Keep OAuth callbacks on the user's current language (e.g. /ja/auth/callback)
    // so the post-login redirect never drops to the English account page.
    const w = window as unknown as { __I18N__?: { serverLang?: string } };
    const serverLang = w.__I18N__?.serverLang || "";
    let lang = serverLang && serverLang !== "en" ? serverLang : "";
    if (!lang) {
      try {
        const stored = localStorage.getItem("chinaconnect_language");
        if (stored && stored !== "en") lang = stored;
      } catch {
        // ignore
      }
    }
    return lang
      ? `${window.location.origin}/${lang}/auth/callback`
      : `${window.location.origin}/auth/callback`;
  }
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
