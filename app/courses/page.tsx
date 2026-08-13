import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCourses } from "@/lib/content";

export const metadata: Metadata = {
  title: "Courses",
};

export default function CoursesPage() {
  const courses = getAllCourses();

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
          {courses.map((course) => (
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
