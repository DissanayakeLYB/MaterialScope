import type { Metadata } from "next";
import Link from "next/link";

import { BookOpen, CheckCircle2, GraduationCap, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAllCourses,
  getAllLessons,
  getLessonsForCourse,
} from "@/lib/content";
import { getUserProfile, getUserProgress } from "@/lib/progress/queries";

export const metadata: Metadata = {
  title: "Profile",
};

// Reads the auth session + progress, so it must render per request.
export const dynamic = "force-dynamic";

function initialsOf(name: string): string {
  return (
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  // Signed-out state — a clean panel instead of a redirect.
  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-primary">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Track your progress
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Sign in to see courses you&apos;ve started, lessons you&apos;ve
          completed, and your average quiz score.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/auth">Sign in</Link>
        </Button>
      </main>
    );
  }

  const [profile, { progress }] = await Promise.all([
    getUserProfile(user),
    getUserProgress(),
  ]);

  const lessons = getAllLessons();
  const courses = getAllCourses();

  const completed = lessons.filter((lesson) => progress[lesson.slug]);
  const quizScores = completed
    .map((lesson) => progress[lesson.slug].quizScore)
    .filter((score): score is number => score !== null);
  const averageQuizScore =
    quizScores.length > 0
      ? Math.round(
          quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
        )
      : null;

  const startedCourseSlugs = new Set(completed.map((lesson) => lesson.course));

  const displayName =
    profile?.displayName ?? user.user_metadata?.full_name ?? user.email ?? "";
  const memberSince = profile?.createdAt ?? user.created_at;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Identity header */}
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {initialsOf(displayName)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {displayName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          {memberSince && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Member since {formatDate(memberSince)}
            </p>
          )}
        </div>
      </div>

      {/* Overall stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-primary">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <CardTitle className="text-sm font-medium">
              Courses started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {startedCourseSlugs.size}
              <span className="text-lg font-semibold text-muted-foreground">
                {" "}
                / {courses.length}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {startedCourseSlugs.size === 0
                ? "Complete a lesson to get started."
                : "Courses with at least one completed lesson."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-primary">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <CardTitle className="text-sm font-medium">
              Lessons completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {completed.length}
              <span className="text-lg font-semibold text-muted-foreground">
                {" "}
                / {lessons.length}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {completed.length === 0
                ? "Your completed lessons will appear here."
                : `Across ${startedCourseSlugs.size} ${
                    startedCourseSlugs.size === 1 ? "course" : "courses"
                  }.`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-primary">
              <Trophy className="h-4 w-4" aria-hidden="true" />
            </span>
            <CardTitle className="text-sm font-medium">
              Average quiz score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {averageQuizScore === null ? (
                <span className="text-xl font-semibold text-muted-foreground">
                  —
                </span>
              ) : (
                `${averageQuizScore}%`
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {quizScores.length === 0
                ? "Complete a quiz to see your average."
                : `Across ${quizScores.length} completed ${
                    quizScores.length === 1 ? "quiz" : "quizzes"
                  }.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-course progress */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Course progress
        </h2>
        <div className="mt-4 space-y-3">
          {courses.map((course) => {
            const courseLessons = getLessonsForCourse(course.slug);
            const done = courseLessons.filter(
              (lesson) => progress[lesson.slug]
            ).length;
            const percent =
              courseLessons.length > 0
                ? Math.round((done / courseLessons.length) * 100)
                : 0;
            return (
              <Card key={course.slug}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-medium transition-colors hover:text-primary"
                    >
                      {course.title}
                    </Link>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {done}/{courseLessons.length} · {percent}%
                    </span>
                  </div>
                  <Progress value={percent} size="sm" className="mt-2" />
                  {percent === 0 && (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Start this course →
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recently completed lessons */}
      {completed.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Recently completed
          </h2>
          <ol className="mt-4 divide-y rounded-xl border bg-card">
            {completed
              .slice()
              .sort(
                (a, b) =>
                  new Date(progress[b.slug].completedAt).getTime() -
                  new Date(progress[a.slug].completedAt).getTime()
              )
              .map((lesson) => {
                const row = progress[lesson.slug];
                const courseTitle = courses.find(
                  (c) => c.slug === lesson.course
                )?.title;
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={`/lessons/${lesson.slug}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lesson.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {courseTitle ?? lesson.course} · Lesson {lesson.order}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {row.quizScore !== null && (
                          <p className="text-sm font-semibold tabular-nums text-success">
                            {Math.round(row.quizScore)}% quiz
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(row.completedAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ol>
        </section>
      )}
    </main>
  );
}
