import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { mdxComponents } from "@/components/lesson/mdx-components";
import { Progress } from "@/components/ui/progress";
import { getAllCourses, getCourse, getLessonsForCourse } from "@/lib/content";

interface CoursePageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const course = getCourse(params.slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = getCourse(params.slug);
  if (!course) notFound();

  const lessons = getLessonsForCourse(course.slug);
  const { content: intro } = await compileMDX({
    source: course.body,
    // Content is author-written, so we enable JSX attribute expressions.
    // Dangerous calls stay blocked.
    options: {
      blockJS: false,
      mdxOptions: { rehypePlugins: [rehypeSlug] },
    },
    components: mdxComponents,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Badge variant={course.difficulty} className="capitalize">
        {course.difficulty}
      </Badge>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{course.title}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{course.description}</p>

      {/* Visual-only progress; no tracking backend yet. */}
      <div className="mt-6 max-w-md rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Course progress</p>
          <span className="text-2xs text-muted-foreground">Coming soon</span>
        </div>
        <Progress value={0} size="sm" className="mt-2" />
      </div>

      {course.body && (
        <div className="prose prose-neutral dark:prose-invert mt-6 max-w-none">
          {intro}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          Lessons ({lessons.length})
        </h2>
        <ol className="mt-4 space-y-3">
          {lessons.map((lesson, index) => (
            <li key={lesson.slug}>
              <Link
                href={`/lessons/${lesson.slug}`}
                className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium transition-colors group-hover:text-primary">
                    {lesson.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lesson {lesson.order}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
