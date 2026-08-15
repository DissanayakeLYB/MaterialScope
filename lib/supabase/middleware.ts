import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * Middleware session refresher. Runs on every request (except static assets),
 * exchanges the session cookie for a fresh one when it's close to expiring,
 * and copies the updated cookies onto the response.
 *
 * Pages handle their own auth state, so this only refreshes — it does not
 * redirect or protect routes.
 */
export async function updateSession(request: NextRequest) {
  // No env config → nothing to refresh; pass through unchanged.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = requireSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll: ((cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }) satisfies SetAllCookies,
    },
  });

  // IMPORTANT: do not run code between createServerClient and getUser — the
  // middleware must refresh the session before anything reads it.
  await supabase.auth.getUser();

  return supabaseResponse;
}
