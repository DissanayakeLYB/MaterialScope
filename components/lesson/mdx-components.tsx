import { Quiz } from "@/components/lesson/quiz";
import { Callout } from "@/components/ui/callout";
import { CrystalViewer } from "@/components/visualizations/crystal-viewer";
import { PhaseDiagram } from "@/components/visualizations/phase-diagram";

/**
 * Components available to course and lesson MDX bodies. Add new lesson
 * building blocks (or visualizations) here to make them usable from MDX.
 */
export const mdxComponents = {
  Callout,
  Quiz,
  CrystalViewer,
  PhaseDiagram,
};
