import "server-only";

import type { User } from "@supabase/supabase-js";

import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** A completed lesson, as stored in lesson_progress. */
export interface LessonProgress {
  lessonSlug: string;
  completedAt: string;
  /** Percent (0-100) from the latest completed quiz, or null. */
  quizScore: number | null;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

interface ProgressRow {
  lesson_slug: string;
  completed_at: string;
  quiz_score: number | null;
}

interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

function toLessonProgress(row: ProgressRow): LessonProgress {
  return {
    lessonSlug: row.lesson_slug,
    completedAt: row.completed_at,
    quizScore: row.quiz_score !== null ? Number(row.quiz_score) : null,
  };
}

export interface UserProgress {
  /** Whether a user is actually signed in (vs. Supabase not configured). */
  signedIn: boolean;
  /** The user's progress rows, keyed by lesson slug. */
  progress: Record<string, LessonProgress>;
}

const empty: UserProgress = { signedIn: false, progress: {} };

/**
 * The current user's progress rows, keyed by lesson slug. `signedIn` is false
 * when there's no session or Supabase isn't configured, so pages can render
 * their signed-out state without branching on the session themselves.
 */
export async function getUserProgress(): Promise<UserProgress> {
  if (!isSupabaseConfigured()) return empty;

  const user = await getCurrentUser();
  if (!user) return empty;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_slug, completed_at, quiz_score");

  if (error) {
    console.error("Failed to load lesson progress:", error.message);
    return { signedIn: true, progress: {} };
  }

  return {
    signedIn: true,
    progress: (data as ProgressRow[]).reduce<Record<string, LessonProgress>>(
      (map, row) => {
        map[row.lesson_slug] = toLessonProgress(row);
        return map;
      },
      {}
    ),
  };
}

/** The current user's profile row, or null. */
export async function getUserProfile(
  user?: User | null
): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const current = user ?? (await getCurrentUser());
  if (!current) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, created_at")
    .eq("id", current.id)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ProfileRow;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

/** Convenience: does the user have progress on this lesson? */
export async function isLessonComplete(lessonSlug: string): Promise<boolean> {
  const { progress } = await getUserProgress();
  return Boolean(progress[lessonSlug]);
}
