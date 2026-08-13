import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Course, Lesson } from "@/lib/types";

interface CourseSidebarProps {
  course: Course;
  lessons: Lesson[];
  /** Slug of the lesson currently being read; highlighted in the list. */
  currentSlug?: string;
  className?: string;
}

/**
 * Course contents sidebar for the lesson layout: course title, a (visual-only)
 * progress bar, and the ordered lesson list with the current lesson accented.
 */
export function CourseSidebar({
  course,
  lessons,
  currentSlug,
  className,
}: CourseSidebarProps) {
  return (
    <nav className={cn("space-y-5", className)} aria-label="Course lessons">
      <div>
        <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
          Course contents
        </p>
        <Link
          href={`/courses/${course.slug}`}
          className="mt-1.5 block font-semibold leading-snug transition-colors hover:text-primary"
        >
          {course.title}
        </Link>
        <Badge
          variant={course.difficulty}
          className="mt-2 text-2xs capitalize"
        >
          {course.difficulty}
        </Badge>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">Course progress</p>
          <span className="text-2xs text-muted-foreground">Coming soon</span>
        </div>
        <Progress value={0} size="sm" className="mt-2" />
      </div>

      <ol className="space-y-0.5">
        {lessons.map((lesson, index) => {
          const active = lesson.slug === currentSlug;
          return (
            <li key={lesson.slug}>
              <Link
                href={`/lessons/${lesson.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-2xs font-semibold",
                    active
                      ? "bg-accent-foreground text-accent"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <span className="leading-snug">{lesson.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
