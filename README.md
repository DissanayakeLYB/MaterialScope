# MaterialScope

An interactive materials science teaching platform built with **Next.js 14**
(App Router, TypeScript). Lessons are written as MDX files in `/content` and
rendered into typed `Course` / `Lesson` objects, paired with interactive
visualization tools in the playground.

## Stack

- **Next.js 14** — App Router, React Server Components, TypeScript
- **Tailwind CSS 3** — design system tokens in `app/globals.css` and
  `tailwind.config.ts` (cobalt/copper palette, semantic type scale, prose theme)
- **shadcn/ui** — accessible UI primitives in `/components/ui`
- **ESLint + Prettier** — `eslint-config-next` with `eslint-config-prettier`
- **next-mdx-remote** — MDX rendering with custom components
- **Supabase** — auth (email/password + Google OAuth) and progress tracking via
  `@supabase/ssr` + `@supabase/supabase-js`

### Why next-mdx-remote instead of Contentlayer?

We evaluated both:

- **Contentlayer (official)** is unmaintained — the maintainer stepped back in
  early 2023 — and its `next-contentlayer` plugin has unresolved dependency
  conflicts with Next.js 14.
- **contentlayer2** (community fork) works with Next 14, but has open critical
  issues with Next 14.2.x (e.g. [issue #20](https://github.com/timlrx/contentlayer2/issues/20),
  a production build failure from a micromatch incompatibility) and was last
  published over a year ago.
- **next-mdx-remote** is actively maintained, RSC-first, and plays nicely with
  the App Router.

To keep Contentlayer's best feature — *typed content objects* — we define the
`Course` and `Lesson` TypeScript types explicitly (`lib/types.ts`) and parse +
validate frontmatter with `gray-matter` in `lib/content.ts`. If a course or
lesson file has missing/invalid frontmatter, the build fails with a clear error.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup (auth + progress)

The app needs a Supabase project for sign-in and lesson progress tracking.
Everything degrades gracefully without it (signed-out UI, no crash), but to
use the full flow:

1. **Create a project** — go to [supabase.com](https://supabase.com) →
   **New project** (free tier is fine).
2. **Run the schema** — open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) (tables, RLS policies,
   triggers), and click **Run**. Safe to re-run.
3. **Copy env vars** — in the Supabase dashboard go to **Project Settings →
   API**. Copy `.env.example` to `.env.local` and fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```

   Use the **anon public** key, never the `service_role` key — the app relies
   on Row Level Security, which the service key would bypass.
4. **(Optional) Enable Google sign-in** — **Authentication → Providers →
   Google**, turn it on, and add `http://localhost:3000/auth/callback` to the
   **Redirect URLs** (plus your production URL). You'll need a Google OAuth
   client ID/secret from [Google Cloud Console](https://console.cloud.google.com).
5. **(Optional) Disable email confirmation** — by default new sign-ups must
   click an emailed confirmation link. For instant local testing, go to
   **Authentication → Providers → Email** and turn off **Confirm email**.

Restart the dev server after adding env vars. Sign up / sign in at
`/auth`, see your stats at `/profile`, and complete lessons (or their quizzes)
to write `lesson_progress` rows.

## Scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | Production build                      |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | Run ESLint                            |
| `npm run typecheck` | Run `tsc --noEmit`                    |
| `npm run format`    | Format the codebase with Prettier     |
| `npm run format:check` | Verify formatting without writing |

## Folder structure

```
.
├── app/
│   ├── (marketing)/          # Landing page + about (route group, no URL segment)
│   │   ├── page.tsx          # Home page — lists available courses
│   │   └── about/page.tsx
│   ├── courses/
│   │   ├── page.tsx          # Course listing (progress % when signed in)
│   │   └── [slug]/page.tsx   # Individual course page (checkmarks, %)
│   ├── lessons/
│   │   └── [slug]/page.tsx   # Individual lesson page (MDX + Mark complete)
│   ├── auth/
│   │   ├── page.tsx          # Sign in / sign up (email/password + Google)
│   │   └── callback/route.ts # OAuth callback → exchanges code for session
│   ├── profile/page.tsx      # Overall stats: courses started, lessons done, avg quiz
│   ├── playground/           # Standalone interactive tools (crystal viewer, …)
│   ├── api/
│   │   ├── courses/route.ts  # GET /api/courses → JSON
│   │   └── lessons/route.ts  # GET /api/lessons → JSON
│   ├── layout.tsx            # Root layout (fonts, site header, metadata)
│   └── globals.css           # Tailwind + design tokens (CSS variables)
├── components/
│   ├── ui/                   # shadcn/ui primitives + design system
│   │   └── (navbar, footer, card, badge, progress, callout, …)
│   ├── auth/                 # Auth form (sign in / sign up / Google)
│   ├── visualizations/       # 3D + chart components (crystal-viewer, …)
│   └── lesson/               # Lesson building blocks (quiz, progress, toc)
│       └── mdx-components.tsx# Component map made available inside MDX
├── content/
│   ├── courses/              # One .mdx file per course
│   └── lessons/              # One .mdx file per lesson
├── lib/
│   ├── types.ts              # Course / Lesson / Difficulty types
│   ├── content.ts            # Typed content loader (parses /content)
│   ├── auth/                 # getCurrentUser + auth server actions
│   ├── progress/             # progress queries + record actions
│   ├── supabase/             # SSR client setup (server, client, middleware)
│   └── utils.ts              # cn() helper (shadcn)
├── supabase/schema.sql       # SQL to run in the Supabase SQL editor
├── middleware.ts             # Session refresh (Supabase SSR)
├── tailwind.config.ts        # Theme: shadcn tokens + custom `brand` colors
└── next.config.mjs
```

## Content model

### Course — `content/courses/<slug>.mdx`

| Field         | Type            | Required | Notes                          |
| ------------- | --------------- | -------- | ------------------------------ |
| `slug`        | string          | no*      | Defaults to the filename       |
| `title`       | string          | yes      |                                |
| `description` | string          | yes      |                                |
| `difficulty`  | `beginner` \| `intermediate` \| `advanced` | yes |          |
| `lessons`     | string[]        | yes      | Lesson slugs, in teaching order |
| *(body)*      | MDX             | no       | Rendered as a course intro     |

```mdx
---
slug: crystal-structures
title: Introduction to Crystal Structures
description: Learn how atoms pack together in crystals.
difficulty: beginner
lessons:
  - unit-cells
  - bravais-lattices
  - miller-indices
---

Optional course intro, rendered on the course page.
```

### Lesson — `content/lessons/<slug>.mdx`

| Field    | Type   | Required | Notes                    |
| -------- | ------ | -------- | ------------------------ |
| `slug`   | string | no*      | Defaults to the filename |
| `title`  | string | yes      |                          |
| `course` | string | yes      | Slug of the parent course |
| `order`  | number | yes      | 1-based position in the course |
| *(body)* | MDX    | yes      | Lesson content, rendered on the lesson page |

```mdx
---
slug: unit-cells
title: Unit Cells and Lattices
course: crystal-structures
order: 1
---

Lesson content goes here.
```

\* `slug` is optional because it defaults to the filename — using filenames as
slugs keeps URLs stable and predictable.

## Adding a new course

1. Create `content/courses/<slug>.mdx` with the frontmatter above.
2. Create one `content/lessons/<slug>.mdx` per lesson, each referencing the
   course slug with the right `order`.
3. List the lesson slugs in the course's `lessons` array.
4. That's it — the course appears on the home page, `/courses`, and the lesson
   pages are linked from the course page. (Optionally restart the dev server
   if content changes don't hot-reload.)

## Components available inside MDX

`components/lesson/mdx-components.tsx` registers custom components for MDX
bodies:

| Component       | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `<Callout type="note\|warning\|example" title="…">` | Highlighted note box (`info`→`note`, `tip`→`example` aliases kept) |
| `<Quiz questions={[{ type, prompt, options?, correctAnswer, tolerance?, explanation }]} />` | Interactive quiz — multiple-choice and numerical (with ±% tolerance) questions, per-question feedback, and a summary with retry-incorrect. When a signed-in user completes a quiz inside a lesson, it auto-writes a `lesson_progress` row (completion + quiz score) |
| `<CrystalViewer structure="fcc" />` | Interactive 3D unit-cell viewer (react-three-fiber; supports `sc`, `bcc`, `fcc`, `hcp`) |

Standard markdown (headings, tables, code, links) also works out of the box.

## API routes

- `GET /api/courses` — all courses as JSON
- `GET /api/lessons` — all lessons as JSON (including raw MDX `body`)

Both are `force-dynamic` so they always reflect the current `/content`.
