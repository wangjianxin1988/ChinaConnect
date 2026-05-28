import type { Database } from "@/types/database";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. " +
      "Copy .env.example to .env and fill in your Supabase credentials.",
  );
}

// During SSR in Node.js < 22, the Supabase realtime client throws because there's no native WebSocket.
// We provide a dummy WebSocket class to prevent the error.
// This is only used during SSR - in the browser, the real WebSocket is available.
if (typeof window === "undefined" && typeof globalThis !== "undefined") {
  // Check if WebSocket is not already available
  if (typeof (globalThis as unknown as { WebSocket?: unknown }).WebSocket === "undefined") {
    // Create a dummy WebSocket class that won't throw
    class DummyWebSocket {
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
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

export type { Database };
