"use server";

import { getLesson } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface ProgressActionResult {
  error?: string;
  /** True when the write actually happened (vs. signed-out no-op). */
  saved?: boolean;
}

/** Clamp a quiz percentage (0-100) to a safe numeric range. */
function clampQuizScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
}

const unconfigured: ProgressActionResult = {
  error:
    "Progress tracking needs Supabase configured — copy .env.example to " +
    ".env.local and add your URL and anon key.",
};

const signedOut: ProgressActionResult = {
  error: "You need to be signed in to track progress.",
};

/**
 * Write (or refresh) a lesson_progress row for the current user. The
 * (user_id, lesson_slug) unique constraint makes this an upsert; a manual
 * "Mark complete" never overwrites an existing quiz score.
 */
export async function markLessonComplete(
  lessonSlug: string
): Promise<ProgressActionResult> {
  if (!isSupabaseConfigured()) return unconfigured;
  if (!getLesson(lessonSlug)) return { error: `Unknown lesson: ${lessonSlug}` };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return signedOut;

  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("quiz_score")
    .eq("user_id", user.id)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("lesson_progress")
        .update({ completed_at: now })
        .eq("user_id", user.id)
        .eq("lesson_slug", lessonSlug)
    : await supabase.from("lesson_progress").insert({
        user_id: user.id,
        lesson_slug: lessonSlug,
        completed_at: now,
      });

  if (error) return { error: error.message };
  return { saved: true };
}

/**
 * Record a quiz completion for a lesson: sets completed_at and stores the
 * overall score (percent of the full quiz, including retried questions).
 */
export async function recordQuizCompletion(
  lessonSlug: string,
  quizScore: number
): Promise<ProgressActionResult> {
  if (!isSupabaseConfigured()) return unconfigured;
  if (!getLesson(lessonSlug)) return { error: `Unknown lesson: ${lessonSlug}` };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return signedOut;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_slug: lessonSlug,
      completed_at: new Date().toISOString(),
      quiz_score: clampQuizScore(quizScore),
    },
    { onConflict: "user_id,lesson_slug" }
  );

  if (error) return { error: error.message };
  return { saved: true };
}
