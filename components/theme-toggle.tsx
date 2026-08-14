"use client";

import { useEffect, useRef, useState } from "react";

import { Check, Moon, RotateCcw, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/theme";

const options: {
  value: Theme;
  label: string;
  hint?: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  {
    value: "default",
    label: "Default",
    hint: "Site default (dark)",
    icon: RotateCcw,
  },
];

/**
 * Theme switcher — an icon button that opens a Light / Dark / Default menu.
 * "Default" restores the site default, which is dark mode.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = resolvedTheme === "light" ? Sun : Moon;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(next: Theme) {
    setTheme(next);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${resolvedTheme}. Change theme.`}
        onClick={() => setOpen((value) => !value)}
      >
        <CurrentIcon className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {options.map((option) => {
            const active =
              option.value === theme ||
              (option.value === "default" && theme === null);
            const OptionIcon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:bg-accent"
                onClick={() => select(option.value)}
              >
                <OptionIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">
                  <span className="block font-medium">{option.label}</span>
                  {option.hint && (
                    <span className="block text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  )}
                </span>
                {active && (
                  <Check
                    className={cn("h-4 w-4 shrink-0", "text-accent-foreground")}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
