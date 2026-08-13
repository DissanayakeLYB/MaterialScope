export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

/**
 * A course groups an ordered set of lessons. Each course lives in
 * `/content/courses/<slug>.mdx` and is parsed into this type by `lib/content.ts`.
 */
export interface Course {
  /** URL slug, matching the filename in `/content/courses` */
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  /** Lesson slugs in teaching order */
  lessons: string[];
  /** Raw MDX body, rendered with `compileMDX` from next-mdx-remote */
  body: string;
}

/**
 * A single lesson. Each lesson lives in `/content/lessons/<slug>.mdx` and is
 * parsed into this type by `lib/content.ts`.
 */
export interface Lesson {
  /** URL slug, matching the filename in `/content/lessons` */
  slug: string;
  title: string;
  /** Slug of the course this lesson belongs to */
  course: string;
  /** 1-based position within the course's ordered lesson list */
  order: number;
  /** Raw MDX body, rendered with `compileMDX` from next-mdx-remote */
  body: string;
}
