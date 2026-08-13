import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ListChecks,
  Orbit,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllCourses,
  getAllLessons,
  getLessonsForCourse,
} from "@/lib/content";

export const metadata: Metadata = {
  description:
    "Interactive materials science lessons and visualization tools — from crystal structures to phase diagrams.",
};

const features = [
  {
    icon: BookOpen,
    title: "Interactive lessons",
    description:
      "Short, structured MDX lessons with quizzes, callouts, and worked examples — built for focused study sessions.",
  },
  {
    icon: Orbit,
    title: "Visual playground",
    description:
      "Rotate crystal structures and explore phase diagrams with hands-on tools that make abstract concepts tangible.",
  },
  {
    icon: ListChecks,
    title: "Structured curriculum",
    description:
      "Courses with clear learning paths, from beginner unit cells to advanced Miller indices.",
  },
];

/** Decorative crystal-lattice illustration for the hero. */
function LatticeArt() {
  const border = "hsl(var(--border))";
  const primary = "hsl(var(--primary))";
  const copper = "hsl(var(--accent-foreground))";
  const muted = "hsl(var(--muted-foreground))";
  const bond = "hsl(var(--primary) / 0.3)";

  const s = 56;
  const hw = s / 2;
  const hh = s / 4;

  const cubes = [
    { x: 95, y: 70 },
    { x: 245, y: 70 },
    { x: 170, y: 140 },
    { x: 95, y: 210 },
    { x: 245, y: 210 },
  ];

  const atoms = [
    { cx: 170, cy: 126, r: 7, fill: copper },
    { cx: 170, cy: 154, r: 5, fill: primary },
    { cx: 95, cy: 56, r: 5, fill: primary },
    { cx: 245, cy: 56, r: 4, fill: muted },
    { cx: 67, cy: 210, r: 4, fill: muted },
    { cx: 67, cy: 238, r: 5, fill: primary },
    { cx: 273, cy: 210, r: 5, fill: primary },
    { cx: 245, cy: 224, r: 6, fill: copper },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:18px_18px] p-8">
      <svg
        viewBox="0 0 340 300"
        className="h-auto w-full"
        role="img"
        aria-label="A schematic crystal lattice built from unit-cell wireframes and atom nodes"
      >
        {/* Bonds between atoms */}
        <g
          stroke={bond}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
        >
          <path d="M 170 126 L 95 56" />
          <path d="M 170 126 L 245 56" />
          <path d="M 170 154 L 67 238" />
        </g>

        {/* Unit-cell wireframes */}
        {cubes.map((cube, index) => (
          <g
            key={index}
            stroke={border}
            strokeWidth={1.75}
            strokeLinejoin="round"
          >
            <path
              d={`M ${cube.x} ${cube.y - hh} L ${cube.x + hw} ${cube.y} L ${
                cube.x
              } ${cube.y + hh} L ${cube.x - hw} ${cube.y} Z`}
            />
            <path d={`M ${cube.x} ${cube.y + hh} L ${cube.x + hw} ${cube.y + 2 * hh}`} />
            <path d={`M ${cube.x} ${cube.y + hh} L ${cube.x - hw} ${cube.y + 2 * hh}`} />
          </g>
        ))}

        {/* Atom nodes */}
        {atoms.map((atom, index) => (
          <circle key={index} {...atom} />
        ))}
      </svg>
    </div>
  );
}

export default function HomePage() {
  const courses = getAllCourses();
  const lessonCount = getAllLessons().length;
  const featured = courses[0];

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-brand-muted/60 via-background to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-accent-foreground">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Open materials science curriculum
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Materials, explained{" "}
              <span className="text-primary">atom by atom</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              MaterialScope turns crystallography, phase diagrams, and defect
              physics into hands-on lessons with interactive visualizations —
              for university students and serious self-learners.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/courses">
                  Start learning
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/playground">Explore the playground</Link>
              </Button>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Courses
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums">
                  {courses.length}
                </dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lessons
                </dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums">
                  {lessonCount}
                </dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Access
                </dt>
                <dd className="mt-0.5 text-xl font-semibold">Free forever</dd>
              </div>
            </dl>
          </div>

          <div className="hidden lg:block">
            <LatticeArt />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-2 text-lg">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-accent-foreground">
              Curriculum
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Featured courses
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">Browse all courses</Link>
          </Button>
        </div>

        {courses.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            No courses yet — add your first course under{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              /content/courses
            </code>
            .
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const lessons = getLessonsForCourse(course.slug);
              return (
                <Card
                  key={course.slug}
                  className="group flex flex-col transition-colors hover:border-primary/40"
                >
                  <CardHeader>
                    <Badge
                      variant={course.difficulty}
                      className="w-fit capitalize"
                    >
                      {course.difficulty}
                    </Badge>
                    <CardTitle className="group-hover:text-primary">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto items-center justify-between">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-primary hover:text-primary"
                      >
                        View course
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA band */}
      {featured && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Start with the fundamentals
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-primary-foreground/85">
              {featured.description}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-background text-foreground hover:bg-background/90"
            >
              <Link href={`/courses/${featured.slug}`}>
                Begin {featured.title}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
