import { LineChart } from "lucide-react";

/**
 * Placeholder for the interactive phase-diagram visualization (Prompt 5).
 * Lesson MDX already references it with data props; this stub renders a
 * frame that summarizes what the real component will draw. Swap the frame
 * for the actual chart component later — the props interface should stay
 * compatible.
 */
interface PhaseDiagramProps {
  /**
   * Describes the diagram the real component will render. Accepts any
   * object; recognized fields (`system`, `xLabel`, `yLabel`, `phases`)
   * are surfaced in the placeholder frame.
   */
  data?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function PhaseDiagram({ data }: PhaseDiagramProps) {
  const record = asRecord(data);
  const system =
    typeof record.system === "string" ? record.system : undefined;
  const xLabel = typeof record.xLabel === "string" ? record.xLabel : undefined;
  const yLabel = typeof record.yLabel === "string" ? record.yLabel : undefined;

  const rawPhases = Array.isArray(record.phases) ? record.phases : [];
  const phases = rawPhases
    .map((phase) => {
      const p = asRecord(phase);
      return typeof p.label === "string" ? (p.label as string) : undefined;
    })
    .filter((label): label is string => label !== undefined);

  return (
    <figure className="my-6 rounded-lg border border-dashed bg-muted/50 p-5">
      <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
        <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
        Interactive phase diagram · placeholder
      </div>
      <div className="mt-3 space-y-1 text-sm">
        {system && (
          <p>
            <span className="font-medium text-foreground">System:</span>{" "}
            {system}
          </p>
        )}
        {(xLabel || yLabel) && (
          <p className="text-muted-foreground">
            Axes: {xLabel ?? "—"} × {yLabel ?? "—"}
          </p>
        )}
        {phases.length > 0 && (
          <p className="flex flex-wrap gap-1.5 pt-1">
            {phases.map((phase) => (
              <span
                key={phase}
                className="rounded-md border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
              >
                {phase}
              </span>
            ))}
          </p>
        )}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Visualization from the Prompt 5 component set — not built yet. This
        frame marks where the interactive diagram will render.
      </figcaption>
    </figure>
  );
}
