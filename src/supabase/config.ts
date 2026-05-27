import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

// Conditionally configure realtime based on environment
// During SSR/build (typeof window === 'undefined'), we disable realtime to prevent
// WebSocket connection issues. The ws package is Node.js only and won't work in V8 isolates.
const isServerSide = typeof window === "undefined";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    // Only enable realtime on the client side where WebSocket is available
    enabled: !isServerSide,
  },
});

export async function signOut() {
  await supabase.auth.signOut();
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
    },
  });
}

export async function signInWithOAuth(provider: "google" | "github") {
  return supabase.auth.signInWithOAuth({ provider });
}

export async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyPhoneOTP(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}
