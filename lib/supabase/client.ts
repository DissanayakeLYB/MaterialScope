"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client. Safe to call from client components; auth cookies
 * are managed automatically by @supabase/ssr.
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
