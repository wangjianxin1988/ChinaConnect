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

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    // Disable realtime to prevent WebSocket connection issues during SSR/build
    realtime: {
      enabled: false,
    },
  },
);

export type { Database };
