import "server-only";

import { getAllCourses, getAllLessons } from "@/lib/content";
import { excerpt, mdxToPlainText } from "@/lib/text";

/** Serializable search-index entries — served to the client via /api/search. */
export interface SearchCourse {
  slug: string;
  title: string;
  description: string;
}

export interface SearchLesson {
  slug: string;
  title: string;
  /** Course slug. */
  course: string;
  /** Course title for display/disambiguation. */
  courseTitle: string;
  /** Full lesson body as plain text (search target). */
  content: string;
  /** Short snippet for showing in results. */
  excerpt: string;
}

export interface SearchIndex {
  courses: SearchCourse[];
  lessons: SearchLesson[];
}

/**
 * Build the site-wide search index over all courses and lessons. This runs
 * server-side (the content layer is server-only) and is served statically by
 * `/api/search`; the client fetches it once and filters in the browser.
 */
export function buildSearchIndex(): SearchIndex {
  const courses = getAllCourses();
  const courseTitles = new Map(
    courses.map((course) => [course.slug, course.title])
  );

  return {
    courses: courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
    })),
    lessons: getAllLessons().map((lesson) => {
      const content = mdxToPlainText(lesson.body);
      return {
        slug: lesson.slug,
        title: lesson.title,
        course: lesson.course,
        courseTitle: courseTitles.get(lesson.course) ?? lesson.course,
        content,
        excerpt: excerpt(content, 140),
      };
    }),
  };
}
