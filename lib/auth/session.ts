import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in user, or `null`. Never throws: when Supabase is not configured
 * (no .env.local yet) this returns `null` so pages render their signed-out
 * state instead of crashing.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    // Malformed/invalid session cookie — treat as signed out.
    console.error("Failed to resolve current user:", error);
    return null;
  }
}
