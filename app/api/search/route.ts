import { NextResponse } from "next/server";

import { buildSearchIndex } from "@/lib/search";

/**
 * Static GET route: serves the course/lesson search index as JSON. The index
 * is derived from content files at build time (Next 14 caches GET route
 * handlers by default), so the client can fetch it once and filter locally.
 */
export function GET() {
  return NextResponse.json(buildSearchIndex());
}
