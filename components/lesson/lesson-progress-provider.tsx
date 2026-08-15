"use client";

import { createContext, useContext } from "react";

/**
 * The slug of the lesson currently being rendered. Provided by the lesson
 * page so embedded client components (like the Quiz) can record progress
 * against the right lesson without each MDX author passing it in.
 */
const LessonSlugContext = createContext<string | null>(null);

export function LessonProgressProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <LessonSlugContext.Provider value={slug}>
      {children}
    </LessonSlugContext.Provider>
  );
}

export function useLessonSlug(): string | null {
  return useContext(LessonSlugContext);
}
