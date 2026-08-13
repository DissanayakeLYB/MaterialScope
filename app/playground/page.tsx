import type { Metadata } from "next";

import { CrystalViewer } from "@/components/visualizations/crystal-viewer";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
      <p className="mt-2 text-muted-foreground">
        Standalone interactive tools for exploring materials science concepts.
      </p>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-lg font-semibold tracking-tight">Crystal Viewer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive 3D unit cells — drag to rotate, scroll to zoom. Future
          tools (a phase-diagram explorer, defect simulators, and more) will
          be added as separate cards here.
        </p>
        <div className="mt-6">
          <CrystalViewer structure="fcc" />
        </div>
      </section>
    </main>
  );
}
