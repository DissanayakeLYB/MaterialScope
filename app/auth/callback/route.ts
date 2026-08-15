import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback. Supabase redirects here with an authorization `code` after
 * Google sign-in; we exchange it for a session and land on the profile page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/auth?error=not-configured`);
  }

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("OAuth code exchange failed:", error.message);
  }

  return NextResponse.redirect(`${origin}/auth?error=auth-code`);
}
