"use client";

import { useEffect } from "react";

import { themeInitScript } from "@/lib/theme";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort error boundary. When the root layout itself fails, Next renders
 * this instead — it must provide its own <html>/<body>. The theme init script
 * is included so dark mode still applies on the very first paint.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <p className="text-2xs font-semibold uppercase tracking-wider text-accent-foreground">
          Error
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
          An unexpected error occurred. Try again, or reload the page.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs tabular-nums text-muted-foreground">
            Error reference: {error.digest}
          </p>
        )}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
