import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import {
  DIFFICULTIES,
  type Course,
  type Difficulty,
  type Lesson,
} from "@/lib/types";

const contentRoot = path.join(process.cwd(), "content");
const coursesDir = path.join(contentRoot, "courses");
const lessonsDir = path.join(contentRoot, "lessons");

interface MdxFile {
  /** Absolute path to the file (used in error messages) */
  file: string;
  /** Slug derived from the filename */
  slug: string;
  /** Raw file contents */
  content: string;
}

function readMdxFiles(dir: string): MdxFile[] {
  if (!fs.existsSync(dir)) {
    throw new Error(`Content directory not found: ${dir}`);
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const file = path.join(dir, name);
      return {
        file,
        slug: name.replace(/\.mdx$/, ""),
        content: fs.readFileSync(file, "utf8"),
      };
    });
}

function requireString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Invalid frontmatter in ${file}: "${field}" must be a non-empty string.`
    );
  }
  return value.trim();
}

function parseDifficulty(value: unknown, file: string): Difficulty {
  if (
    typeof value !== "string" ||
    !DIFFICULTIES.includes(value as Difficulty)
  ) {
    throw new Error(
      `Invalid frontmatter in ${file}: "difficulty" must be one of ${DIFFICULTIES.join(", ")}.`
    );
  }
  return value as Difficulty;
}

function parseCourse({ file, slug, content }: MdxFile): Course {
  const { data, content: body } = matter(content);

  const lessons = data.lessons;
  if (
    !Array.isArray(lessons) ||
    lessons.some((l) => typeof l !== "string" || l.length === 0)
  ) {
    throw new Error(
      `Invalid frontmatter in ${file}: "lessons" must be an array of lesson slugs.`
    );
  }

  return {
    slug: requireString(data.slug ?? slug, "slug", file),
    title: requireString(data.title, "title", file),
    description: requireString(data.description, "description", file),
    difficulty: parseDifficulty(data.difficulty, file),
    lessons: lessons as string[],
    body: body.trim(),
  };
}

function parseLesson({ file, slug, content }: MdxFile): Lesson {
  const { data, content: body } = matter(content);

  const order = data.order;
  if (typeof order !== "number" || !Number.isInteger(order) || order < 1) {
    throw new Error(
      `Invalid frontmatter in ${file}: "order" must be a positive integer.`
    );
  }

  return {
    slug: requireString(data.slug ?? slug, "slug", file),
    title: requireString(data.title, "title", file),
    course: requireString(data.course, "course", file),
    order,
    body: body.trim(),
  };
}

/** All courses, sorted by title. */
export function getAllCourses(): Course[] {
  return readMdxFiles(coursesDir)
    .map((file) => parseCourse(file))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** A single course by slug, or `undefined` if it doesn't exist. */
export function getCourse(slug: string): Course | undefined {
  return getAllCourses().find((course) => course.slug === slug);
}

/** All lessons, sorted by course then order. */
export function getAllLessons(): Lesson[] {
  return readMdxFiles(lessonsDir)
    .map((file) => parseLesson(file))
    .sort((a, b) => a.course.localeCompare(b.course) || a.order - b.order);
}

/** A single lesson by slug, or `undefined` if it doesn't exist. */
export function getLesson(slug: string): Lesson | undefined {
  return getAllLessons().find((lesson) => lesson.slug === slug);
}

/**
 * Resolve a course's ordered list of lesson slugs into full `Lesson` objects,
 * sorted by their `order` field. Slugs with no matching lesson file are skipped.
 */
export function getLessonsForCourse(courseSlug: string): Lesson[] {
  const course = getCourse(courseSlug);
  if (!course) return [];

  const lessonsBySlug = new Map(
    getAllLessons().map((lesson) => [lesson.slug, lesson])
  );
  return course.lessons
    .map((slug) => lessonsBySlug.get(slug))
    .filter((lesson): lesson is Lesson => lesson !== undefined)
    .sort((a, b) => a.order - b.order);
}
