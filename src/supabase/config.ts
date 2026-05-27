import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "";
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

// During SSR in Node.js < 22, the Supabase realtime client throws because there's no native WebSocket.
// We provide a dummy WebSocket class to prevent the error.
// This is only used during SSR - in the browser, the real WebSocket is available.
if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  // Check if WebSocket is not already available
  if (typeof (globalThis as unknown as { WebSocket?: unknown }).WebSocket === "undefined") {
    // Create a dummy WebSocket class that won't throw
    class DummyWebSocket {
      constructor(_url: string, _protocols?: string | string[]) {
        // Do nothing - this is just to satisfy the WebSocketFactory check
      }
      close(): void {
        // Do nothing
      }
      send(_data: string | ArrayBuffer | Blob): void {
        // Do nothing
      }
      addEventListener(): void {
        // Do nothing
      }
      removeEventListener(): void {
        // Do nothing
      }
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
    // Make the dummy WebSocket available globally so WebSocketFactory.detectEnvironment() finds it
    (globalThis as unknown as { WebSocket: typeof DummyWebSocket }).WebSocket = DummyWebSocket;
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
