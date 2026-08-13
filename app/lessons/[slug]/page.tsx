import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

import { CourseSidebar } from "@/components/lesson/course-sidebar";
import { mdxComponents } from "@/components/lesson/mdx-components";
import { TableOfContents } from "@/components/lesson/toc";
import {
  getAllLessons,
  getCourse,
  getLesson,
  getLessonsForCourse,
} from "@/lib/content";
import { extractHeadings } from "@/lib/toc";

interface LessonPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const lesson = getLesson(params.slug);
  if (!lesson) return {};
  return {
    title: lesson.title,
    description: `Lesson ${lesson.order} in the course "${lesson.course}".`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = getLesson(params.slug);
  if (!lesson) notFound();

  const course = getCourse(lesson.course);
  const { content } = await compileMDX({
    source: lesson.body,
    // Content is author-written, so we enable JSX attribute expressions
    // (e.g. <Quiz questions={[...]} />). Dangerous calls stay blocked.
    options: {
      blockJS: false,
      mdxOptions: {
        // Add stable heading ids so the "On this page" TOC anchors work.
        rehypePlugins: [rehypeSlug],
      },
    },
    components: mdxComponents,
  });

  const courseLessons = getLessonsForCourse(lesson.course);
  const index = courseLessons.findIndex((item) => item.slug === lesson.slug);
  const previous = index > 0 ? courseLessons[index - 1] : undefined;
  const next =
    index >= 0 && index < courseLessons.length - 1
      ? courseLessons[index + 1]
      : undefined;

  const toc = extractHeadings(lesson.body);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Course contents on small screens (collapsible). */}
      <details className="group mb-6 rounded-lg border bg-card lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          Course contents
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t p-4">
          {course && (
            <CourseSidebar
              course={course}
              lessons={courseLessons}
              currentSlug={lesson.slug}
            />
          )}
        </div>
      </details>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]">
        {/* Left: course lesson list. */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pr-2">
            {course && (
              <CourseSidebar
                course={course}
                lessons={courseLessons}
                currentSlug={lesson.slug}
              />
            )}
          </div>
        </aside>

        {/* Center: article. */}
        <div className="mx-auto w-full min-w-0 max-w-2xl">
          <article>
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Link
                href="/"
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/courses"
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Courses
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href={`/courses/${course?.slug ?? lesson.course}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {course?.title ?? lesson.course}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-medium text-foreground">
                Lesson {lesson.order}
              </span>
            </nav>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {lesson.title}
            </h1>

            <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
              {content}
            </div>
          </article>

          {/* Prev / next lesson navigation. */}
          <nav
            className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2"
            aria-label="Lesson navigation"
          >
            {previous ? (
              <Link
                href={`/lessons/${previous.slug}`}
                className="group rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Previous
                </span>
                <span className="mt-1.5 block text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/lessons/${next.slug}`}
                className="group rounded-lg border p-4 text-right transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="flex items-center justify-end gap-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="mt-1.5 block text-sm font-medium leading-snug transition-colors group-hover:text-primary">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>

        {/* Right: on-this-page table of contents. */}
        <aside className="hidden xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </div>
    </main>
  );
}
