import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

// During SSR in Node.js < 22, the Supabase realtime client throws because there's no native WebSocket.
// We patch the WebSocketFactory to not throw during SSR.
if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { WebSocketFactory } = require("@supabase/realtime-js");
    if (WebSocketFactory && WebSocketFactory.getWebSocketConstructor) {
      // Store original method
      const originalGetWebSocketConstructor = WebSocketFactory.getWebSocketConstructor.bind(WebSocketFactory);
      // Replace with version that returns undefined instead of throwing
      WebSocketFactory.getWebSocketConstructor = () => {
        try {
          return originalGetWebSocketConstructor();
        } catch {
          // Return undefined during SSR - realtime will be disabled
          return undefined;
        }
      };
    }
  } catch {
    // Patching failed, continue anyway
  }
}

// Create the Supabase client - now should not throw during SSR
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

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
