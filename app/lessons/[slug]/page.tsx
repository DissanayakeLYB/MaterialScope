import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";

import { mdxComponents } from "@/components/lesson/mdx-components";
import {
  getAllLessons,
  getCourse,
  getLesson,
  getLessonsForCourse,
} from "@/lib/content";

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
    options: { blockJS: false },
    components: mdxComponents,
  });

  const courseLessons = getLessonsForCourse(lesson.course);
  const index = courseLessons.findIndex((item) => item.slug === lesson.slug);
  const previous = index > 0 ? courseLessons[index - 1] : undefined;
  const next =
    index >= 0 && index < courseLessons.length - 1
      ? courseLessons[index + 1]
      : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted-foreground">
        <Link
          href={`/courses/${course?.slug ?? lesson.course}`}
          className="underline-offset-4 hover:underline"
        >
          {course?.title ?? lesson.course}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{lesson.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lesson {lesson.order}
      </p>

      <article className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        {content}
      </article>

      <nav className="mt-12 flex justify-between gap-4 border-t pt-6 text-sm">
        {previous ? (
          <Link
            href={`/lessons/${previous.slug}`}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            className="text-right text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
