import type { MetadataRoute } from "next";

import { getAllCourses, getAllLessons } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/**
 * Sitemap built from content: the static site routes plus every course and
 * lesson, so search engines discover the full curriculum. Generated at build
 * time (this module has no dynamic dependencies).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/playground`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const courses: MetadataRoute.Sitemap = getAllCourses().map((course) => ({
    url: `${siteUrl}/courses/${course.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const lessons: MetadataRoute.Sitemap = getAllLessons().map((lesson) => ({
    url: `${siteUrl}/lessons/${lesson.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...courses, ...lessons];
}
