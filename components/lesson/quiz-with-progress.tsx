"use client";

import { useTransition } from "react";

import { Quiz, type QuizProps } from "@/components/lesson/quiz";
import { useLessonSlug } from "@/components/lesson/lesson-progress-provider";
import { recordQuizCompletion } from "@/lib/progress/actions";

/**
 * `<Quiz>` as exposed to MDX. Works exactly like the plain component but, when
 * rendered inside a lesson (which provides its slug via context), automatically
 * records a lesson_progress row on completion — completed_at plus the overall
 * quiz score — so completing a quiz marks the lesson done.
 */
export function QuizWithProgress(props: QuizProps) {
  const lessonSlug = useLessonSlug();
  const [, startTransition] = useTransition();

  return (
    <Quiz
      {...props}
      onComplete={(result) => {
        props.onComplete?.(result);
        if (!lessonSlug) return;
        const score = Math.round(result.overallScore);
        startTransition(() => {
          void recordQuizCompletion(lessonSlug, score).then((res) => {
            if (res?.error) {
              // Silent for signed-out users; loud for real failures.
              if (!res.error.includes("signed in")) {
                console.error("Failed to record quiz progress:", res.error);
              }
            }
          });
        });
      }}
    />
  );
}
