import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllCourses } from "@/lib/content";

export default function HomePage() {
  const courses = getAllCourses();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <section className="space-y-4 pb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          LatticeLab
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          An interactive platform for learning materials science — from crystal
          structures to phase diagrams, with hands-on visualizations.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Courses</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">Browse all</Link>
          </Button>
        </div>

        {courses.length === 0 ? (
          <p className="text-muted-foreground">
            No courses yet — add your first course under{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              /content/courses
            </code>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.slug} className="flex flex-col">
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
                <CardFooter className="mt-auto">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/courses/${course.slug}`}>View course</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
