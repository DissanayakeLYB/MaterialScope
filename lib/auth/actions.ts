"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  /** Fatal/validation error, shown in the form. */
  error?: string;
  /** Informational message (e.g. email confirmation required). */
  message?: string;
}

const unconfigured: AuthActionResult = {
  error:
    "Supabase is not configured yet. Copy .env.example to .env.local, add your " +
    "Supabase URL and anon key, then restart the dev server.",
};

/** Sign in with email + password. On success, redirects to /profile. */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) return unconfigured;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { error: error.message };

  redirect("/profile");
}

/**
 * Sign up with email + password. If email confirmation is enabled in the
 * Supabase project (the default), no session is created yet — we return a
 * "check your email" message instead.
 */
export async function signUpWithPassword(
  email: string,
  password: string
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) return unconfigured;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) return { error: error.message };

  if (!data.session) {
    return {
      message:
        "Check your inbox for a confirmation link, then sign in. " +
        "(Tip: turn off email confirmation in Supabase → Authentication → " +
        "Providers → Email to skip this step.)",
    };
  }

  redirect("/profile");
}

/** Sign out and return to the home page. */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
