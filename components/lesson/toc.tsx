"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

/**
 * "On this page" navigation generated from lesson headings. Uses an
 * IntersectionObserver to highlight the section currently in view, with the
 * active entry styled in the copper accent.
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      // Track only the band just below the sticky header.
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="mt-3 space-y-0.5 border-l border-border text-sm">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1 pl-3 transition-colors",
                  item.level === 3 && "pl-6",
                  active
                    ? "border-accent-foreground font-medium text-accent-foreground"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
