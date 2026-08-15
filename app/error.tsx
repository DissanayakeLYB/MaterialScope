"use client";

import { useEffect } from "react";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Surface the error to the console in dev; in production the digest (if
    // present) can be correlated with server logs.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try
        again, or head back to the home page.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs tabular-nums text-muted-foreground">
          Error reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}
