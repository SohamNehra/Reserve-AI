import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Anon client for browser use — subject to RLS policies.
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
