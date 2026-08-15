import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAllCourses, getLessonsForCourse } from "@/lib/content";
import { getUserProgress } from "@/lib/progress/queries";

export const metadata: Metadata = {
  title: "Courses",
};

// Reads the auth session + progress, so it must render per request.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = getAllCourses();
  const { signedIn, progress } = await getUserProgress();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
      <p className="mt-2 text-muted-foreground">
        Browse the full course catalog.
      </p>

      {courses.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No courses yet. Add your first course under{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            /content/courses
          </code>
          .
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {courses.map((course) => {
            const lessons = getLessonsForCourse(course.slug);
            const completedCount = lessons.filter(
              (lesson) => progress[lesson.slug]
            ).length;
            const percent =
              lessons.length > 0
                ? Math.round((completedCount / lessons.length) * 100)
                : 0;
            return (
              <Link key={course.slug} href={`/courses/${course.slug}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{course.title}</CardTitle>
                      <Badge variant="secondary" className="capitalize">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {course.description}
                    {signedIn && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-foreground">
                            Progress
                          </span>
                          <span className="tabular-nums">
                            {completedCount}/{lessons.length} · {percent}%
                          </span>
                        </div>
                        <Progress
                          value={percent}
                          size="sm"
                          className="mt-1.5"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
