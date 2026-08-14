import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wide text-accent-foreground">
        About
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        About MaterialScope
      </h1>

      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
        <p>
          MaterialScope is an interactive curriculum for learning materials
          science: how atoms arrange into solids, and why the resulting
          materials behave the way they do.
        </p>
        <p>
          Built for students and self-learners. The lessons assume only
          high-school chemistry and basic algebra — no textbook required.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/courses">
            Start learning
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/playground">Explore the playground</Link>
        </Button>
      </div>
    </main>
  );
}
