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

// During SSR/build, the Supabase client throws an error because Node.js < 22 doesn't have
// native WebSocket support. We MUST NOT call createClient during SSR.
// The client variable itself is undefined during SSR - it will be initialized on client side.
let supabaseInstance: SupabaseClient<Database> | undefined;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    // This should never be called during SSR, but if it is, create a temporary client
    // Note: This may still throw, so ideally this function should not be called during SSR
    console.warn("getSupabaseClient called during SSR - this should not happen");
    throw new Error("Supabase client should not be accessed during SSR");
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-key",
    );
  }
  return supabaseInstance;
}

// Export a proxy that ensures client is only accessed on client side
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    if (typeof window === "undefined") {
      // Return a no-op function during SSR to prevent errors
      const noop = () => {
        console.warn(`Supabase.${String(prop)} called during SSR - returning no-op`);
      };
      return prop === "then" ? undefined : noop;
    }
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient<Database>];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export type { Database };
