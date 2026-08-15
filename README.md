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
│   │   ├── page.tsx          # Course listing
│   │   └── [slug]/page.tsx   # Individual course page
│   ├── lessons/
│   │   └── [slug]/page.tsx   # Individual lesson page (MDX body + quiz etc.)
│   ├── playground/           # Standalone interactive tools (crystal viewer, …)
│   ├── api/
│   │   ├── courses/route.ts  # GET /api/courses → JSON
│   │   └── lessons/route.ts  # GET /api/lessons → JSON
│   ├── layout.tsx            # Root layout (fonts, site header, metadata)
│   └── globals.css           # Tailwind + design tokens (CSS variables)
├── components/
│   ├── ui/                   # shadcn/ui primitives + design system
│   │   └── (navbar, footer, card, badge, progress, callout, …)
│   ├── visualizations/       # 3D + chart components (crystal-viewer, …)
│   └── lesson/               # Lesson building blocks (toc, quiz, mdx-components)
│       └── mdx-components.tsx# Component map made available inside MDX
├── content/
│   ├── courses/              # One .mdx file per course
│   └── lessons/              # One .mdx file per lesson
├── lib/
│   ├── types.ts              # Course / Lesson / Difficulty types
│   ├── content.ts            # Typed content loader (parses /content)
│   └── utils.ts              # cn() helper (shadcn)
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
| `<Quiz questions={[{ type, prompt, options?, correctAnswer, tolerance?, explanation }]} />` | Interactive quiz — multiple-choice and numerical (with ±% tolerance) questions, per-question feedback, and a summary with retry-incorrect |
| `<CrystalViewer structure="fcc" />` | Interactive 3D unit-cell viewer (react-three-fiber; supports `sc`, `bcc`, `fcc`, `hcp`) |

Standard markdown (headings, tables, code, links) also works out of the box.

## API routes

- `GET /api/courses` — all courses as JSON
- `GET /api/lessons` — all lessons as JSON (including raw MDX `body`)

Both are `force-dynamic` so they always reflect the current `/content`.
