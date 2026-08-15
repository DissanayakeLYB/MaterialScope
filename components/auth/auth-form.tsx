"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  signInWithPassword,
  signUpWithPassword,
  type AuthActionResult,
} from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function AuthForm() {
  const searchParams = useSearchParams();
  const initialError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<AuthActionResult | null>(
    initialError
      ? {
          error:
            initialError === "not-configured"
              ? "Supabase is not configured yet — add your env vars first."
              : "Sign-in failed. Please try again.",
        }
      : null
  );
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    const action = mode === "signin" ? signInWithPassword : signUpWithPassword;
    startTransition(async () => {
      const res = await action(email, password);
      // On success the action redirects; only errors/messages come back.
      if (res) setResult(res);
    });
  }

  function signInWithGoogle() {
    setResult(null);
    const supabase = createClient();
    void supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      .then(({ error }) => {
        if (error) setResult({ error: error.message });
        // Otherwise the browser navigates to the provider.
      });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Track your progress across courses and lessons."
            : "Free forever — track progress, quizzes, and completions."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm">
          {(["signin", "signup"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                mode === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                setMode(value);
                setResult(null);
              }}
            >
              {value === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              minLength={mode === "signup" ? 6 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="••••••••"
            />
          </div>

          {result?.error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {result.error}
            </p>
          )}
          {result?.message && (
            <p
              role="status"
              className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {result.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGoogle}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M12 5.04c1.62 0 3.06.56 4.2 1.66l3.12-3.12C17.45 1.8 14.97.75 12 .75 7.73.75 4.03 3.18 2.19 6.7l3.65 2.83C6.67 7.1 9.08 5.04 12 5.04z" />
            <path d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z" />
            <path d="M5.84 14.47A6.94 6.94 0 0 1 5.5 12c0-.86.13-1.7.34-2.47L2.19 6.7A11.24 11.24 0 0 0 .75 12c0 1.81.43 3.53 1.19 5.06l3.9-2.59z" />
            <path d="M12 23.25c2.97 0 5.46-.98 7.28-2.66l-3.88-2.98c-1.08.72-2.45 1.15-3.4 1.15-2.92 0-5.33-1.96-6.16-4.29l-3.65 2.83c1.84 3.52 5.54 5.95 9.81 5.95z" />
          </svg>
          Continue with Google
        </Button>

        {mode === "signup" && (
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account you agree to use this app for learning only.
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here? " : "Already have an account? "}
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setResult(null);
          }}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
