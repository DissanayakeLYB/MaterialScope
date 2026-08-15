"use client";

import Link from "next/link";
import { useTransition, useState } from "react";

import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/lib/progress/actions";

interface MarkCompleteProps {
  lessonSlug: string;
  /** Whether the lesson is already completed for the current user. */
  initialCompleted: boolean;
  /** Latest quiz score (percent) for this lesson, if any. */
  initialQuizScore: number | null;
}

/**
 * "Mark complete" button for the lesson page. Writes a lesson_progress row for
 * the signed-in user (upserted on (user_id, lesson_slug)); signed-out users
 * get a hint pointing at /auth.
 */
export function MarkComplete({
  lessonSlug,
  initialCompleted,
  initialQuizScore,
}: MarkCompleteProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function mark() {
    setError(null);
    startTransition(async () => {
      const res = await markLessonComplete(lessonSlug);
      if (res?.saved) {
        setCompleted(true);
      } else if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
      {completed ? (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Completed
        </span>
      ) : (
        <Button onClick={mark} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Mark complete
        </Button>
      )}
      {initialQuizScore !== null && (
        <span className="text-sm text-muted-foreground">
          Quiz score:{" "}
          <span className="font-medium tabular-nums text-foreground">
            {Math.round(initialQuizScore)}%
          </span>
        </span>
      )}
      {error && (
        <span className="text-sm text-muted-foreground">
          {error.includes("signed in") ? (
            <>
              <Link
                href="/auth"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>{" "}
              to track your progress.
            </>
          ) : (
            error
          )}
        </span>
      )}
    </div>
  );
}
