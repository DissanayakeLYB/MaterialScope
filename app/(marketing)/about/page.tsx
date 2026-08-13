import type { Metadata } from "next";

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
          MaterialScope is an interactive teaching platform for materials
          science. It pairs short, structured lessons with hands-on tools —
          crystal viewers, phase-diagram explorers, and more — so students can
          see the structures they are learning about.
        </p>
        <p>
          This page is a placeholder. Add team, mission, and contact
          information here.
        </p>
      </div>
    </main>
  );
}
