import { getAllLessons } from "@/lib/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getAllLessons());
}
