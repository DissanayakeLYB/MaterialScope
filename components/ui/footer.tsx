import Link from "next/link";

import { Logo } from "@/components/ui/logo";

const columns = [
  {
    heading: "Learn",
    links: [
      { href: "/courses", label: "Courses" },
      { href: "/playground", label: "Playground" },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/api/courses", label: "Courses API" },
      { href: "/api/lessons", label: "Lessons API" },
      { href: "https://github.com", label: "GitHub" },
    ],
  },
];

/** Site footer — brand blurb, link columns, and a legal bar. */
export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]">
          <div className="max-w-sm">
            <Link href="/" aria-label="MaterialScope home">
              <Logo />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Interactive materials science education — from crystal structures
              to phase diagrams, with hands-on visualizations. Built for
              students and serious self-learners.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                {column.heading}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} MaterialScope. Free forever for
            learners.
          </p>
          <p>Materials science, explained atom by atom.</p>
        </div>
      </div>
    </footer>
  );
}
