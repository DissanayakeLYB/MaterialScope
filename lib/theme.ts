/**
 * Theme system
 * ------------
 * MaterialScope ships **dark by default** — visitors who have never chosen a
 * theme see dark mode. Users can override it per browser (no auth backend yet)
 * with one of three settings:
 *
 * - `light`   — force light mode
 * - `dark`    — force dark mode
 * - `default` — restore the site default (dark)
 *
 * The choice lives in `localStorage` under THEME_STORAGE_KEY. Because the
 * root layout is server-rendered, `themeInitScript` re-applies the class
 * before hydration (see app/layout.tsx) so there's no flash of the wrong
 * theme. `applyTheme` keeps the DOM in sync afterwards.
 */

export const THEME_STORAGE_KEY = "materialscope-theme";

export type Theme = "light" | "dark" | "default";
export type ResolvedTheme = "light" | "dark";

const THEMES: readonly Theme[] = ["light", "dark", "default"];

export function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value);
}

/** The site default is dark — only an explicit "light" choice resolves light. */
export function resolveTheme(theme: Theme | null): ResolvedTheme {
  return theme === "light" ? "light" : "dark";
}

export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Toggle the `.dark` class on <html> to match the effective theme. */
export function applyTheme(theme: Theme | null): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(
    "dark",
    resolveTheme(theme) === "dark"
  );
}

/**
 * Inline script injected into the server-rendered HTML before the app
 * hydrates, so the correct theme is applied on the very first paint.
 * Anything other than an explicit "light" choice resolves to dark.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var dark=t!=="light";document.documentElement.classList.toggle("dark",dark);}catch(e){document.documentElement.classList.add("dark");}})();`;
