"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";

import { SearchDialog } from "@/components/search/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

// True on macOS/iOS — used to render the ⌘K hint in the search trigger.
const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

const navItems = [
  { href: "/courses", label: "Courses" },
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(name: string): string {
  return (
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export interface NavbarUser {
  email: string;
  displayName: string | null;
}

/**
 * Sticky site navbar: logo, course/main navigation with an accent-colored
 * active state, the theme toggle, and either a sign-in button (signed out) or
 * a user menu with a link to the profile page and sign-out (signed in).
 */
export function NavbarClient({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the user menu on outside click, and both popovers on Escape.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Close the mobile menu when the route changes (e.g. tapping a nav link).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
      router.refresh();
    });
  }

  const displayName = user?.displayName ?? user?.email.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="MaterialScope home"
        >
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-1 text-sm md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-40 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:flex lg:w-52"
            aria-label="Search courses and lessons"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">Search…</span>
            <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 font-mono text-2xs font-medium text-muted-foreground lg:inline-block">
              {IS_MAC ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <ThemeToggle />
          {user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Account menu for ${displayName}`}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initialsOf(displayName)}
                </span>
                <span className="max-w-32 truncate">{displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Account"
                  className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                >
                  <div className="border-b px-2.5 py-2">
                    <p className="truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleSignOut}
                    disabled={pending}
                  >
                    <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Search courses and lessons"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {open && (
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  Profile ({displayName})
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={pending}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/auth" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
