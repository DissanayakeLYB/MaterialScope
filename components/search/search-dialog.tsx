"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowRight,
  BookOpen,
  CornerDownLeft,
  GraduationCap,
  Loader2,
  Search,
  SearchX,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { SearchCourse, SearchIndex, SearchLesson } from "@/lib/search";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultItem =
  | { kind: "course"; course: SearchCourse }
  | { kind: "lesson"; lesson: SearchLesson };

const MAX_COURSES = 4;
const MAX_LESSONS = 6;

// Cache the index for the lifetime of the page so reopening the palette is
// instant after the first fetch.
let cachedIndex: SearchIndex | null = null;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wrap case-insensitive query matches in <mark> for highlighting. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, "ig"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark
            key={index}
            className="rounded-sm bg-primary/15 px-0 text-foreground"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

/** Rank a course or lesson against the query; 0 means no match. */
function scoreCourse(course: SearchCourse, q: string): number {
  const title = course.title.toLowerCase();
  const description = course.description.toLowerCase();
  let score = 0;
  if (title.startsWith(q)) score += 4;
  else if (title.includes(q)) score += 3;
  if (description.includes(q)) score += 1;
  return score;
}

function scoreLesson(lesson: SearchLesson, q: string): number {
  const title = lesson.title.toLowerCase();
  const courseTitle = lesson.courseTitle.toLowerCase();
  const content = lesson.content.toLowerCase();
  let score = 0;
  if (title.startsWith(q)) score += 4;
  else if (title.includes(q)) score += 3;
  if (courseTitle.includes(q)) score += 1;
  if (content.includes(q)) score += 1;
  return score;
}

function search(index: SearchIndex, rawQuery: string): ResultItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const courses: ResultItem[] = index.courses
    .map((course) => ({
      kind: "course" as const,
      course,
      score: scoreCourse(course, q),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_COURSES)
    .map(({ course }) => ({ kind: "course" as const, course }));

  const lessons: ResultItem[] = index.lessons
    .map((lesson) => ({
      kind: "lesson" as const,
      lesson,
      score: scoreLesson(lesson, q),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_LESSONS)
    .map(({ lesson }) => ({ kind: "lesson" as const, lesson }));

  return [...courses, ...lessons];
}

/**
 * Command-palette search (⌘K / Ctrl+K, or "/" anywhere on the page). Results
 * are ranked client-side against a static index of course and lesson titles
 * plus full lesson content, fetched once from /api/search. Arrow keys move
 * the selection, Enter opens the highlighted result, Escape closes.
 */
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [index, setIndex] = useState<SearchIndex | null>(cachedIndex);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    cachedIndex ? "ready" : "loading"
  );

  // Global shortcut: ⌘K / Ctrl+K toggles, "/" opens, Escape closes.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (event.key === "/" && !open) {
        const target = event.target as HTMLElement | null;
        const typing =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;
        if (!typing) {
          event.preventDefault();
          onOpenChange(true);
        }
        return;
      }
      if (event.key === "Escape" && open) onOpenChange(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Fetch the index lazily on first open, then cache it.
  useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    fetch("/api/search")
      .then((response) => {
        if (!response.ok)
          throw new Error(`Search index request failed: ${response.status}`);
        return response.json() as Promise<SearchIndex>;
      })
      .then((data) => {
        if (cancelled) return;
        cachedIndex = data;
        setIndex(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  // Focus the input and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const items = useMemo(
    () => (index ? search(index, query) : []),
    [index, query]
  );

  // Reset the cursor whenever the query or result set changes.
  useEffect(() => {
    setSelected(0);
  }, [query, items.length]);

  function openResult(item: ResultItem | undefined) {
    if (!item) return;
    onOpenChange(false);
    router.push(
      item.kind === "course"
        ? `/courses/${item.course.slug}`
        : `/lessons/${item.lesson.slug}`
    );
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (items.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((value) => (value + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((value) => (value - 1 + items.length) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(items[selected]);
    }
  }

  if (!open) return null;

  const courseCount = items.filter((item) => item.kind === "course").length;
  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="absolute inset-x-0 top-[12vh] mx-auto w-[min(92vw,36rem)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses and lessons…"
            aria-label="Search courses and lessons"
            className="h-12 w-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Close search"
          >
            <SearchX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {status === "loading" && (
            <p className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading search index…
            </p>
          )}

          {status === "error" && (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Couldn&apos;t load the search index. Try again in a moment.
            </p>
          )}

          {status === "ready" && hasQuery && items.length === 0 && (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              No results for “{query.trim()}”.
            </p>
          )}

          {status === "ready" && items.length > 0 && (
            <>
              {courseCount > 0 && (
                <div className="pb-1">
                  <p className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Courses
                  </p>
                  {items
                    .filter(
                      (item): item is Extract<ResultItem, { kind: "course" }> =>
                        item.kind === "course"
                    )
                    .map((item) => {
                      const flatIndex = items.indexOf(item);
                      return (
                        <button
                          key={item.course.slug}
                          type="button"
                          onClick={() => openResult(item)}
                          onMouseEnter={() => setSelected(flatIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                            flatIndex === selected &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <GraduationCap
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              <Highlight
                                text={item.course.title}
                                query={query}
                              />
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              <Highlight
                                text={item.course.description}
                                query={query}
                              />
                            </span>
                          </span>
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 shrink-0",
                              flatIndex === selected
                                ? "text-accent-foreground"
                                : "text-muted-foreground"
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                </div>
              )}

              {items.length > courseCount && (
                <div className="pb-1">
                  <p className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lessons
                  </p>
                  {items
                    .filter(
                      (item): item is Extract<ResultItem, { kind: "lesson" }> =>
                        item.kind === "lesson"
                    )
                    .map((item) => {
                      const flatIndex = items.indexOf(item);
                      return (
                        <button
                          key={item.lesson.slug}
                          type="button"
                          onClick={() => openResult(item)}
                          onMouseEnter={() => setSelected(flatIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                            flatIndex === selected &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <BookOpen
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              <Highlight
                                text={item.lesson.title}
                                query={query}
                              />
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              <Highlight
                                text={item.lesson.excerpt}
                                query={query}
                              />
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            {item.lesson.courseTitle}
                            <CornerDownLeft
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t bg-muted/40 px-4 py-2 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1 py-0.5 font-mono">
              ↑
            </kbd>
            <kbd className="rounded border bg-background px-1 py-0.5 font-mono">
              ↓
            </kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-background px-1 py-0.5 font-mono">
              ↵
            </kbd>
            to open
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="rounded border bg-background px-1 py-0.5 font-mono">
              esc
            </kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
