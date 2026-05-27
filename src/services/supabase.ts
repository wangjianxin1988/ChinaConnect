import type { Database } from "@/types/database";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. " +
      "Copy .env.example to .env and fill in your Supabase credentials.",
  );
}

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
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

export type { Database };
