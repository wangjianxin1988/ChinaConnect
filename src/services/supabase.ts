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

// Conditionally configure realtime based on environment
// During SSR/build (typeof window === 'undefined'), we disable realtime to prevent
// WebSocket connection issues. The ws package is Node.js only and won't work in V8 isolates.
const isServerSide = typeof window === "undefined";

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    realtime: {
      // Only enable realtime on the client side where WebSocket is available
      enabled: !isServerSide,
    },
  },
);

export type { Database };
