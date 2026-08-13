import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // MaterialScope brand palette — cobalt blue (alias of `primary`).
        // Swap the --brand* CSS variables in app/globals.css to rebrand.
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          muted: "hsl(var(--brand-muted))",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      /*
       * MaterialScope type scale.
       *
       * `base` uses a 1.75 line-height so body copy reads well in long
       * technical lessons; headings tighten up and gain slight negative
       * tracking. Headings render in the sans stack; formula/data content
       * uses `font-mono`.
       */
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.375rem" }],
        base: ["1rem", { lineHeight: "1.75rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.01em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "6xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.035em" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")({
      /*
       * Lesson prose — palette-matched so long-form content reads as part
       * of the design system. Code and tables render in the mono stack.
       */
      css: ({ theme }: { theme: (path: string) => string }) => ({
        "--tw-prose-body": "hsl(215 16% 38%)", // slate-600
        "--tw-prose-headings": "hsl(222 47% 11%)",
        "--tw-prose-lead": "hsl(215 16% 47%)",
        "--tw-prose-links": "hsl(224 64% 33%)",
        "--tw-prose-bold": "hsl(222 47% 11%)",
        "--tw-prose-counters": "hsl(215 16% 47%)",
        "--tw-prose-bullets": "hsl(214 32% 80%)",
        "--tw-prose-hr": "hsl(214 32% 91%)",
        "--tw-prose-quotes": "hsl(222 47% 11%)",
        "--tw-prose-quote-borders": "hsl(224 64% 33%)",
        "--tw-prose-captions": "hsl(215 16% 47%)",
        "--tw-prose-code": "hsl(222 47% 11%)",
        "--tw-prose-pre-code": "hsl(210 40% 98%)",
        "--tw-prose-pre-bg": "hsl(222 47% 8%)",
        "--tw-prose-th-borders": "hsl(214 32% 84%)",
        "--tw-prose-td-borders": "hsl(214 32% 91%)",
        "--tw-prose-invert-body": "hsl(215 20% 65%)",
        "--tw-prose-invert-headings": "hsl(210 40% 98%)",
        "--tw-prose-invert-lead": "hsl(215 20% 65%)",
        "--tw-prose-invert-links": "hsl(217 91% 65%)",
        "--tw-prose-invert-bold": "hsl(210 40% 98%)",
        "--tw-prose-invert-counters": "hsl(215 20% 65%)",
        "--tw-prose-invert-bullets": "hsl(217 33% 30%)",
        "--tw-prose-invert-hr": "hsl(217 33% 15%)",
        "--tw-prose-invert-quotes": "hsl(210 40% 98%)",
        "--tw-prose-invert-quote-borders": "hsl(217 91% 65%)",
        "--tw-prose-invert-captions": "hsl(215 20% 65%)",
        "--tw-prose-invert-code": "hsl(210 40% 98%)",
        "--tw-prose-invert-pre-code": "hsl(210 40% 98%)",
        "--tw-prose-invert-pre-bg": "hsl(222 47% 5%)",
        "--tw-prose-invert-th-borders": "hsl(217 33% 25%)",
        "--tw-prose-invert-td-borders": "hsl(217 33% 15%)",
        code: {
          fontFamily: theme("fontFamily.mono"),
          fontWeight: "500",
        },
        "code::before": { content: "none" },
        "code::after": { content: "none" },
        "a code": { color: "inherit" },
        pre: {
          fontFamily: theme("fontFamily.mono"),
        },
        "pre code": {
          fontWeight: "400",
        },
        "h1, h2, h3, h4": {
          scrollMarginTop: "6rem",
        },
        table: {
          fontSize: "0.875rem",
        },
        "thead th": {
          letterSpacing: "0.03em",
        },
        blockquote: {
          fontWeight: "400",
        },
        // Worked-example solutions hidden behind a disclosure.
        details: {
          marginTop: "1.5em",
          marginBottom: "1.5em",
          borderRadius: "0.5rem",
          border: "1px solid hsl(var(--border))",
          backgroundColor: "hsl(var(--muted))",
          padding: "0.75rem 1rem",
        },
        "details summary": {
          cursor: "pointer",
          fontWeight: "500",
          color: "hsl(222 47% 11%)",
        },
        "details[open] summary": {
          marginBottom: "0.75rem",
        },
        "details p": {
          marginTop: "0.5em",
          marginBottom: "0.5em",
        },
      }),
    }),
  ],
};

export default config;
