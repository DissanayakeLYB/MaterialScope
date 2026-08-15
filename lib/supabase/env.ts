/** Whether the Supabase environment variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Returns the Supabase URL/anon key, throwing a helpful error if they are
 * missing. Prefer `isSupabaseConfigured()` for graceful signed-out rendering;
 * call this only when you actually need to talk to Supabase.
 */
export function requireSupabaseEnv(): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and set " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see " +
        "README.md → Supabase setup)."
    );
  }
  return { url, anonKey };
}
