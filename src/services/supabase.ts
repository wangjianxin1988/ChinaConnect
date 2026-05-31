import type { Database } from "@/types/database";
import { supabase } from "@/supabase/config";

// Re-export the single Supabase client instance
export { supabase };
export type { Database };
