import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service role client — bypasses RLS, for use in server-only code only.
// Never import this in client components or expose to the browser.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
