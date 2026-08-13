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

      <div className="mt-6 space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          MaterialScope is an open, interactive curriculum for learning
          materials science — the discipline that asks how atoms arrange
          themselves into solids, and why the resulting materials behave the
          way they do.
        </p>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What&apos;s here
          </h2>
          <p className="mt-2">
            The core course, <em>Crystal Structures and Bonding</em>, starts
            with the bonds that hold atoms together and builds up to crystal
            lattices, Miller indices, and the defects that shape real
            materials. Each lesson is written to be read in a single sitting:
            plain explanations, worked examples with solutions you can reveal,
            short quizzes, and interactive 3D visualizations of the unit cells
            themselves.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Who it&apos;s for
          </h2>
          <p className="mt-2">
            University students taking an introductory materials science
            course, and self-learners who want the real thing without a
            textbook&apos;s bulk. The only prerequisites are high-school
            chemistry and basic algebra — every equation is introduced from
            scratch.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            How it&apos;s made
          </h2>
          <p className="mt-2">
            Lessons are written by hand as plain-text files: short, factual,
            and easy to review. Every figure in the visualizations is derived
            from the geometry it displays, so the numbers you see are the
            numbers that define the structure.
          </p>
        </div>
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
