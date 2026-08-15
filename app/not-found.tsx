import Link from "next/link";

import { ArrowRight, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-primary">
        <SearchX className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="mt-6 text-2xs font-semibold uppercase tracking-wider text-accent-foreground">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Try
        searching, or head back to the course catalog.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/courses">
            Browse courses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
