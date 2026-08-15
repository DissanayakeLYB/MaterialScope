import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // API payloads and account pages aren't useful to index.
      disallow: ["/api/", "/auth", "/profile"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
