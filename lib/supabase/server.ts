import { cookies } from "next/headers";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * Server Supabase client bound to the request's cookies. Use in Server
 * Components, Server Actions, and Route Handlers.
 *
 * Server Components cannot write cookies, so the `setAll` call is wrapped in
 * a try/catch — in those contexts the middleware (`lib/supabase/middleware.ts`)
 * is responsible for refreshing the session on the next request.
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll: ((cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — ignore, middleware refreshes.
        }
      }) satisfies SetAllCookies,
    },
  });
}
