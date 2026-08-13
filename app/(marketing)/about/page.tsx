import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About LatticeLab</h1>
      <p className="mt-4 text-muted-foreground">
        LatticeLab is an interactive teaching platform for materials science. It
        pairs short, structured lessons with hands-on tools — crystal viewers,
        phase-diagram explorers, and more — so students can see the structures
        they are learning about.
      </p>
      <p className="mt-4 text-muted-foreground">
        This page is a placeholder. Add team, mission, and contact information
        here.
      </p>
    </main>
  );
}
