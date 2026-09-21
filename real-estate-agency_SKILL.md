---
name: real-estate-agency
description: >
  Comprehensive, codebase-verified engineering reference for MAISON ESTATE —
  the luxury real-estate agency clone (Next.js 16 + React 19 + Tailwind v4 +
  Prisma/SQLite + NextAuth). Contains every design decision, anti-pattern,
  debugging procedure, parity constraint, and lesson a future agent needs to
  extend, debug, onboard to, or replicate this codebase without re-learning
  them the hard way.
version: 1.0.0
tags:
  - documentation
  - knowledge-distillation
  - nextjs
  - tailwind-v4
  - prisma
  - parity-clone
---

# MAISON ESTATE (Real Estate Agency) — Engineering SKILL

> **How to use this document:** This is the single-source-of-truth distilled
> reference for working on this codebase. Before touching anything, read §1
> (what this project IS), §13/§16 (what NEVER to do), and §11 (the gate you
> must pass before shipping). Every claim below was verified against the
> codebase and test suite at distillation time (2026-09-21, post session-12
> remediation). File paths are exact; versions are installed versions, not
> ranges. When this document and the code disagree, the code wins — then fix
> this document.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Client Islands & State Patterns](#6-client-islands--state-patterns)
7. [Content & Data Management](#7-content--data-management)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [TypeScript Interface Reference](#20-typescript-interface-reference)
- [Appendix A: Architecture Decision Records](#appendix-a-architecture-decision-records)
- [Appendix B: Session & Audit History](#appendix-b-session--audit-history)
- [Appendix C: Live-Site Parity Validation Methodology](#appendix-c-live-site-parity-validation-methodology)
- [Quick Reference Card](#quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**One sentence:** MAISON ESTATE is a production-grade, pixel-faithful clone of
the original Base44 application at
`https://real-estate-agency.base44.app/` — a luxury San-Francisco real-estate
agency site (curated listings, neighborhood expertise, advisors, lead
capture, credentials auth) rebuilt as a single Next.js 16 App Router
application with engineering-grade foundations.

**Design thesis:** *warm editorial minimalism* — Instrument Serif display
type over Inter body, warm cream background (`hsl(30 20% 97%)`), near-black
ink, a single bronze-gold accent, full-pill radius geometry (9999px
everywhere), hairline dividers, and cinematic motion (video hero, rotating
stamps, parallax bands). It reads like a print magazine, not a SaaS
dashboard.

**Non-negotiable design rules:**

1. **Fidelity over polish.** The clone reproduces the original's behavior
   bug-for-bug where observable: the empty global toast container that
   blocks the top 32px on mobile, the login-only Toaster scope, the Wix
   placeholder copy on legal pages (including its template typos), the
   attribute-free hero dropdown buttons. Do not "improve" any of these —
   each is pinned by an e2e test and a documented decision.
2. **The cascade is the design.** Brand classes live in
   `@layer components` so Tailwind utilities beat them; the hero H1's
   184px desktop height exists precisely because `leading-[0.9]` overrides
   `.text-display-xl`'s 1.05. Moving classes out of the layer breaks this.
3. **Money is integer USD**, formatted only at the presentation edge.
4. **The server is the source of truth.** Reads via RSC query functions;
   the only mutation seam is Server Actions returning `ActionResult<T>`.
5. **The URL is the state** for /properties filters — shareable,
   back/forward-correct, no mirror state, no sync effects.

**Anti-generic mandate:** no drop shadows beyond `shadow-sm` on primitives,
no rounded-lg card grids (pills or hairlines instead), no blue/purple
schemes, no emoji or icon soup, no marketing gradients, no glassmorphism
except the single hero search pill. The original's voice is restrained
editorial uppercase micro-labels (`tracking-label`, 0.15em) over large
serif statements.

---

## 2. Tech Stack & Environment

Installed, locked versions (verified with `bun pm ls` at distillation time):

| Layer | Technology | Version | Critical Note |
| --- | --- | --- | --- |
| Framework | next (App Router) | 16.1.3 | `params`/`searchParams` are **Promises** — always `await`. `proxy/middleware` unused. `output: "standalone"` |
| UI runtime | react / react-dom | 19.2.3 | Function components; no `forwardRef` needed |
| Language | typescript | 5.9.3 | `strict: true`; `noImplicitAny: false` (repo convention) |
| Styling | tailwindcss | 4.1.18 | **CSS-first** — no `tailwind.config.*`; tokens in `src/app/globals.css` `@theme inline` |
| CSS extras | tw-animate-css | (pinned in package.json) | Imported after tailwindcss in globals.css |
| Primitives | shadcn/ui style + Radix | per-package | Only 4 primitives exist: `input`, `select`, `textarea`, `sonner` (`src/components/ui/`) — old **v1-style bases**, do not regenerate/upgrade |
| Animation | framer-motion | 12.26.2 | Client-only; use `<Reveal>` wrapper in server pages |
| ORM | prisma / @prisma/client | 6.19.2 | **Relative `file:` URLs anchor at package root (CLI) / CWD (runtime) — NOT schema dir.** Always resolve through `src/lib/db-path.ts` |
| Database | SQLite (dev) / PostgreSQL (prod) | — | File at `<repo>/db/custom.db`; PG switch documented in `.env.example` + `docs/DEPLOYMENT.md` |
| Auth | next-auth | 4.24.13 | Credentials provider + optional Google (env-gated); JWT sessions |
| Validation | zod | 4.3.5 | Server Action input contracts; test assertions |
| Hashing | bcryptjs | 3.0.3 | Cost 12; demo user + verification codes |
| Toasts | sonner | 2.0.7 | Mounted ONLY on `/login` (parity) |
| Unit tests | vitest + @vitest/coverage-v8 | 5.0.1 | Node env; real SQLite DB; coverage thresholds 85/80/75/85 |
| E2E tests | @playwright/test | 1.63.0 | Chromium; production standalone build on :3003 |
| Icons | lucide-react | 0.525.0 | Sparse usage |
| Carousel | embla-carousel-react | 8.6.0 | Used by the property gallery |
| Runner/PM | bun + tsx | bun ≥1.1 · tsx 4.23.13 | All commands run through bun; seeds via tsx wrapped by `scripts/with-db.ts` |

**Environment variables** (7 total — `.env.example` is the contract):

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | `file:../db/custom.db` (schema-anchored by `src/lib/db-path.ts`) or a PostgreSQL URL |
| `NEXTAUTH_SECRET` | ✅ | Session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | Canonical origin for auth redirects |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth (optional pair) |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth (optional pair) |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | ⬜ | `"true"` activates Google sign-in |
| `NEXT_PUBLIC_SITE_URL` | ⬜ | metadataBase / OG / sitemap origin |

---

## 3. Bootstrapping & Configuration

**From zero to running (verified fresh-clone flow):**

```bash
git clone git@github.com:nordeim/real-estate-agency.git
cd real-estate-agency
bun install
cp .env.example .env
# set NEXTAUTH_SECRET to `openssl rand -base64 32` output
bun run db:push && bun run db:seed   # creates <repo>/db/custom.db, seeded
bun run dev                           # http://localhost:3000 (logs to dev.log)
```

**All scripts (package.json):**

| Script | What it does |
| --- | --- |
| `dev` | next dev on :3000, tee to `dev.log` |
| `build` | next build + stage static+public into standalone |
| `start` | serve the standalone build (production) |
| `lint` | eslint (clean: 0 errors, 0 warnings) |
| `typecheck` | `tsc --noEmit` |
| `test` | vitest run — 71 tests (6→7 files) |
| `test:coverage` | vitest run --coverage — thresholds 85% stmts / 80% branches / 75% funcs / 85% lines over `src/lib/**` + `src/actions/**` (excl. `src/lib/auth.ts`, browser-surface) |
| `test:e2e` | playwright test — 75 tests against the production standalone build (:3003) |
| `test:all` | vitest + playwright |
| `db:push` / `db:seed` / `db:migrate` / `db:reset` | ALL run through `scripts/with-db.ts` (loads `.env`, resolves the repo-root SQLite path, then spawns the CLI with the absolute URL) |
| `db:generate` | prisma generate (the only unwrapped db script) |

**Configuration files that matter:**

- `next.config.ts` — `output: "standalone"`; optional `distDir` via
  `PROD_DIST_DIR` env (Playwright uses `.next-e2e` so builds never clobber
  a running dev server); `ignoreBuildErrors: true` (tsc gate is the real
  type check); `reactStrictMode: false`.
- `tsconfig.json` — `strict`, path alias `@/* → ./src/*`; excludes
  `skills`, `reference-ui`, `examples`.
- `eslint.config.mjs` — next core-web-vitals + TS presets with most
  stylistic rules relaxed (see file); ignores include `skills`,
  `scripts/**`, `e2e/**`, `coverage/**`, build dirs.
- `vitest.config.ts` — node env, `src/**/*.test.ts`, coverage block (see
  above), alias `@`.
- `playwright.config.ts` — resolves `DATABASE_URL` through
  `src/lib/db-path.ts` BEFORE spawning anything; builds the standalone
  server itself with `PROD_DIST_DIR=.next-e2e`, stages static assets at
  `standalone/.next-e2e/static` (custom distDir mirrors its name!), boots
  on :3003; `E2E_BASE_URL` reuses a running server.
- `.github/workflows/ci.yml` — the four gates on push/PR to `main`
  (bun install → .env from example → db push+seed → playwright chromium →
  lint → typecheck → test:coverage → test:e2e).

**Critical bootstrapping facts:**

- The `db/` folder is at the REPO ROOT. `DATABASE_URL="file:../db/custom.db"`
  is relative **to `prisma/schema.prisma`** (classic Prisma semantics),
  implemented by `src/lib/db-path.ts`. Never call `prisma db push` bare —
  Prisma 6.19 anchors env-provided relative URLs at the package root and
  will write the db OUTSIDE the repo.
- Demo login (seeded): `sepnetflix2023@outlook.com` / `$Abcd1234`
  (intentionally public demo data, bcrypt-hashed at seed time).
- Seed is idempotent — upserts by natural keys. Re-running is safe.

---

## 4. The Design System (Code-First)

Everything lives in `src/app/globals.css` (245 lines). There is no Tailwind
config file and there must never be one.

### 4.1 The `@theme inline` block (Tailwind v4 token bridge)

Maps CSS custom properties into Tailwind utilities: `--color-background`,
`--color-foreground`, `--color-card(+foreground)`, `--color-popover(+foreground)`,
`--color-primary(+foreground)`, `--color-secondary(+foreground)`,
`--color-muted(+foreground)`, `--color-accent(+foreground)`,
`--color-destructive(+foreground)`, `--color-border`, `--color-input`,
`--color-ring`, `--color-chart-1..5`, fonts
(`--font-sans: var(--font-body)`, `--font-display: var(--font-display-src)`),
`--breakpoint-3xl: 120rem`, and radius scale
`--radius-{sm,md,lg,xl}` derived from `--radius`.

### 4.2 `:root` palette (the MAISON tokens — HSL, verbatim)

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `hsl(30 20% 97%)` | Warm editorial cream page bg |
| `--foreground` | `hsl(0 0% 10%)` | Near-black ink; also footer surface |
| `--primary` | `hsl(0 0% 10%)` | Buttons |
| `--primary-foreground` | `hsl(30 20% 97%)` | Text on primary |
| `--secondary` / `--muted` | `hsl(30 10% 90%)` | Subtle surfaces |
| `--muted-foreground` | `hsl(30 5% 35%)` | Secondary text |
| `--accent` | `hsl(35 65% 36%)` | Bronze-gold — prices, active nav, icons |
| `--accent-foreground` | `hsl(30 20% 97%)` | On accent |
| `--destructive` | `hsl(0 84.2% 60.2%)` | Error alert blocks |
| `--border` / `--input` | `hsl(30 12% 88%)` | Hairlines, card borders, inputs |
| `--ring` | `hsl(35 65% 36%)` | Focus rings (bronze) |
| `--chart-1..5` | `hsl(35 65% 36%)` / `hsl(173 58% 39%)` / `hsl(197 37% 24%)` / `hsl(43 74% 66%)` / `hsl(27 87% 67%)` | Declared, unused by pages (shadcn scaffold parity) |
| `--font-display-src` | `var(--font-instrument-serif), serif` | Display faces |
| `--font-body` | `var(--font-inter), sans-serif` | Body |
| `--radius` | `9999px` | **The pill geometry everything inherits** |

A `.dark` block exists (shadcn scaffold parity) but the app never mounts the
`dark` class — light-only by design.

### 4.3 Typography hierarchy

| Role | Class | Definition |
| --- | --- | --- |
| Display XL (hero H1) | `.text-display-xl` | `clamp(3rem, 8vw, 7rem)` · lh 1.05 · ls −0.02em |
| Display LG | `.text-display-lg` | `clamp(2.5rem, 5vw, 4.5rem)` · lh 1.1 · ls −0.02em |
| Display MD | `.text-display-md` | `clamp(2rem, 4vw, 3rem)` · lh 1.15 · ls −0.01em |
| Display SM | `.text-display-sm` | `clamp(1.5rem, 3vw, 2rem)` · lh 1.2 |
| Uppercase micro-label | `.tracking-label` | `letter-spacing: 0.15em` |
| Editorial tracking | `.tracking-editorial` | `letter-spacing: −0.02em` |
| Serif italic accent | `.font-display` + `italic` | Instrument Serif via `@theme` |

Fonts load via `next/font/google` (Instrument Serif + Inter) in
`src/app/layout.tsx`, exposed as `--font-instrument-serif` / `--font-inter`
on `<html>` (NOT `<body>` — see §9 A-1). The `:root` mapping happens at the
html level; attaching the variables to `<body>` silently collapses the site
to system sans-serif.

### 4.4 Brand classes (the load-bearing CSS)

- `.ghost-btn` — pill, 1px border, transparent bg, uppercase, 0.1em
  tracking, 0.3s color/border transitions. **Its `hsl(var(--foreground))`
  declarations are invalid at computed-value time — intentionally left
  alone**: the fallbacks (transparent bg / currentColor border) are exactly
  what the original renders.
- `.ghost-btn-light` — white variant for the hero (uses literal
  `rgb(255 255 255 / 1)` / `#fff`).
- `.hairline` — `height: 0.5px; background: var(--border)`. Uses the token
  DIRECTLY (not `hsl(var(--border))`) because its transparent fallback
  rendered dividers invisible — the one case where the original's CSS was
  NOT reproducible via the same invalid pattern (see §9 A-2).
- `.scrollbar-thin` — 4px gallery rail scrollbar using `--border`.

### 4.5 The cascade contract (why `@layer components` matters)

`.tracking-label`, `.tracking-editorial`, `.text-display-*` are declared
inside `@layer components`, so **Tailwind utilities win over them**. This
is the mechanism behind the hero H1's measured 184px desktop height: the
page pairs `.text-display-xl` with `leading-[0.9]`, and the utility's 0.9
beats the class's 1.05. Before the layer move, the unlayered class beat the
utilities layer, inflating the H1 to 215px and pushing the whole hero +31px
— a 5-session-long parity bug (§12 L-3).

### 4.6 Motion

framer-motion (client-only): hero fade-up (1s, 0.3s delay), `<Reveal>` scroll
entrances (0.6s, `yOffset` default 24 — legal pages pass 16), card image
zoom (1.2s ease-out), rotating stamps (20s linear), testimonial crossfade
(0.5s, 4s auto-advance), parallax bands (scroll-linked −15%), header
hide-on-scroll-down (700ms). All motion is neutralized under
`prefers-reduced-motion: reduce` by the globals rule (§8).

---

## 5. Component Architecture & Patterns

### 5.1 Layer model

| # | Layer | Location | Responsibility |
| --- | --- | --- | --- |
| L0 | Presentation shell | `src/app/layout.tsx`, `components/site/{site-header,site-footer}` | Fonts on `<html>`, metadata, header/footer chrome |
| L1 | Pages (RSC) | `src/app/**/page.tsx` | Compose sections, read data via queries, `await` async props |
| L2 | Client islands | `components/site/*` (`"use client"`) | Interactivity only; server stays the source of truth |
| L3 | Mutations | `src/actions/{inquiry,auth}.ts` | Validate → rate-limit → persist; typed results, never throw |
| L4 | Data access | `src/lib/{db,queries,db-path}.ts`, `prisma/*` | Prisma singleton, DTO mapping, schema, seed |

Routes: `/` · `/properties` · `/property/[id]` · `/sell` · `/about` ·
`/login` · `/privacy` · `/terms` · `/accessibility` · `/sitemap.xml` ·
`/robots.txt` · `/api/auth/[...nextauth]` (the ONLY route handler) ·
404 via `not-found.tsx`.

### 5.2 Component inventory (17 site + 4 ui primitives)

**Client islands (18 files carry `"use client"`):** `site-header`,
`hero-search`, `hero-dropdown`, `properties-filters`, `property-card`,
`property-gallery`, `stamps`, `testimonial-carousel`, `parallax-image`,
`reveal`, `inquiry-form`, `inquiry-form-with-toast`, `newsletter-form`,
`not-found-route`, `global-toast-layer` (empty parity artifact), plus
`ui/select`, `ui/sonner`, and the whole `login/page.tsx` (five-view state
machine).

**Server components:** `site-footer`, `legal-page`, `ui/input`,
`ui/textarea`, all other `src/app/**` pages.

**Client vs Server decision tree:** start server; add `"use client"` only
when the file needs state, effects, event handlers, framer-motion, or
browser APIs. Server pages needing scroll animation use `<Reveal>`
(the client boundary) instead of importing motion directly.

### 5.3 Page chrome (the flex-column contract)

Every content page wraps in
`div.min-h-screen.flex.flex-col > (fixed header · main.flex-1 · footer)` so
the footer pins to the viewport bottom on short pages. There is NO
universal `main.pt-24` — each page owns its top padding (properties/legal
wrap in `pt-32`/`pt-40` containers; the hero is `h-screen` with
`md:pt-[35vh]`). Measured H1 viewport-tops at 1280×576 are pinned by
`e2e/layout.spec.ts`: properties 140 · sell 172 · about 162 · legal 192
(hero is viewport-relative — 35vh scales).

### 5.4 The queries boundary (the DTO contract)

Components NEVER import `@/lib/db` or touch Prisma types. Pages call
`src/lib/queries.ts` functions that return DTOs with JSON columns already
decoded (`parseJsonArray`) and dates already serialized (ISO strings).
Data-read bugs are fixed in `queries.ts`, not in components.

---

## 6. Client Islands & State Patterns

**There are no custom hooks in this codebase** (verified: zero
`export function useX` / `export const useX` under `src/`). The state model
is deliberately thin — each island owns UI/draft state only and derives
everything else from props or the URL:

| Island | State it owns | Why |
| --- | --- | --- |
| `properties-filters` | free-text search draft only | filters derive from `useSearchParams()`; commits push new URLs (`router.push`) — shareable, back/forward-safe, no mirror effects (satisfies `react-hooks/set-state-in-effect`) |
| `hero-search` / `hero-dropdown` | the three selected values | passed to `/properties` query params on SEARCH |
| `login/page.tsx` | the five-view state machine (sign-in · reset · check-email · create-account · verify-email) + OTP input focus | mirrors the original's card flow; actions return `devCode` outside production |
| `site-header` | `menuOpen`, scroll direction | hides on scroll-down (700ms), transparent at top on all routes |
| `testimonial-carousel` | active index | 4s auto-advance crossfade |
| `property-gallery` | active image | thumbnail rail + main image |
| `inquiry-form` / `newsletter-form` | draft fields + `fieldErrors` | native browser validation fronts the client (NO `noValidate` — parity); server Zod remains the guard |

**Rules for adding state:** derive, don't sync. If a value can live in the
URL, put it in the URL (the /properties pattern). If it must be server
truth, it belongs behind a query function or a Server Action.

---

## 7. Content & Data Management

### 7.1 Data model (prisma/schema.prisma — 5 models)

- **Property** — the listing aggregate: integer USD `price`, `bedrooms`,
  `bathrooms`, `sqft`, `garage`, `yearBuilt`, address fields,
  `neighborhood`, `location`, `propertyType`, `images`/`features`
  (**JSON-text array columns** — decode with `parseJsonArray` from
  `src/lib/format.ts`, never inline `JSON.parse`), `featuredImage`,
  `videoUrl`, `isFeatured` (home rail), `isHighPriority` (rotating NEW
  stamp), `status`, unique `title`.
- **Agent** — advisors; `isFeatured` picks the three on home; all render
  on /about.
- **Testimonial** — quote, clientName, propertyType, location; newest
  five drive the carousel.
- **Inquiry** — lead-capture record shared by property inquiry, /sell and
  /about contact forms, AND newsletter subscriptions (sentinel fields:
  `fullName = "Newsletter Subscriber"`, `inquiryType = "General"` —
  parity with the original). `propertyId` existence is verified inside
  the action (app-level referential integrity, accepted per ADR-003).
- **User** — credentials-auth user + the verification challenge columns
  (`verified`, `verificationCodeHash`, `verificationCodeExpiresAt`,
  `verificationAttemptsLeft`).

### 7.2 Seed content (prisma/seed.ts — idempotent upserts)

12 properties across 6 categories × 6 images each (paths under
`public/media/properties/` — **treat seed image paths as load-bearing**),
5 advisors (`public/media/agents/`), 5 testimonials, 1 demo user
(VERIFIED, bcrypt cost 12). Full reset: delete `db/custom.db` →
`bun run db:push && bun run db:seed`.

### 7.3 Canonical constants (src/lib/constants.ts — the single source)

- `PROPERTY_TYPES` (6 + "All Types"), `LOCATIONS` (6 + "All Locations"),
  `BEDS_OPTIONS` (5 + "Any Beds"), `PRICE_BANDS` (4 bands + "Any Price",
  integer min/max with ±Infinity sentinels), `INQUIRY_TYPES` (4) +
  `INQUIRY_TYPE_LABELS`, `NEIGHBORHOODS` (3 with image paths), `SITE`
  facts (name, tagline, address, phone, email).
- Hero sentinels: `HERO_DEFAULTS` ("Any X"), `HERO_TYPE_OPTIONS`,
  `HERO_LOCATION_OPTIONS`, `HERO_PRICE_OPTIONS` — the homepage uses
  "Any X" wording, /properties uses "All X"; same values, different
  labels (original's behavior).

**Never hard-code filter lists in components** — constants.ts is canonical
and pinned by tests (`format.test.ts` asserts contiguity).

### 7.4 Media (public/media/)

`hero/hero-video.mp4` (the cinematic loop), `neighborhoods/*.png` (3),
`pages/*` (about-parallax, about-office, sell-hero, parallax-home),
`brand/{og-image.svg, favicon.svg}`, `properties/*.jpg` (36 listing
photos), `agents/*.jpg` (6 portraits).

---

## 8. Accessibility Implementation

The parity mandate shapes this codebase's a11y posture — **the original
app exposes NO aria-labels** on chrome, filters, form fields, or the hero
dropdowns (verified live, attribute-by-attribute). The clone matches:

- Write e2e locators against placeholders/text/CSS, never aria-labels.
- The hero dropdown buttons carry ONLY their `class` — not even
  `type="button"` (byte-parity, pinned in `e2e/primitives.spec.ts`).
- The inquiry form fronts the client with NATIVE browser validation
  (`required`, no `noValidate`, no custom pre-submit error DOM);
  server-side Zod + rate-limit alerts still guard the action seam.

What the clone DOES ship beyond the original (harmless additions):

- `prefers-reduced-motion: reduce` globals rule — all animations collapse
  to 0.01ms, transitions to 0.01ms, scroll-behavior auto.
- Bronze focus rings (`outline-ring/50` base rule) on all focusable
  elements.
- `::selection` styled accent/foreground.
- Semantically real landmarks: `<header>`, `<main>`, `<footer>`, H1-per-
  page, `<nav>` links with visible text.
- Contrast: near-black `hsl(0 0% 10%)` on cream `hsl(30 20% 97%)` ≈ 17:1
  (AAA); muted-foreground `hsl(30 5% 35%)` on cream ≈ 7:1 (AA+); accent
  bronze is reserved for large/bold or decorative usage.

Mobile touch target: the hamburger toggle is 40×40 at top 8 → bottom 48 —
the EMPTY global toast layer covers its top half on mobile (parity
artifact, §18); the menu opens from the lower part of the button.

---

## 9. Anti-Patterns & Common Bugs

Every entry below was a real bug in this codebase's history, each with a
regression guard now in place.

### A-1: next/font variables on `<body>` (Critical)

- **Symptom:** whole site renders in system sans-serif; serif hero gone.
- **Root cause:** the `--font-display-src`/`--font-body` custom-property
  substitution happens at the `html` level; attaching the next/font
  variables to `<body>` breaks the cascade.
- **Fix:** variables on `<html>` in `src/app/layout.tsx`.
- **Guard:** `e2e/fonts.spec.ts`.

### A-2: `.hairline` transparent fallback (High)

- **Symptom:** section dividers invisible; layout "missing" its rules.
- **Root cause:** `hsl(var(--border))` is invalid at computed-value time
  (`--border` already holds a full `hsl()`), silently falling back to
  transparent.
- **Fix:** `.hairline` uses `var(--border)` directly. **Do NOT apply the
  same fix to `.ghost-btn`/`.ghost-btn-light`** — their fallbacks
  (transparent bg / currentColor border) are exactly what the original
  renders; making them explicit would diverge.
- **Guard:** `e2e/layout.spec.ts` (visible hairline color assertion).

### A-3: Brand classes outside `@layer components` (Critical)

- **Symptom:** hero H1 inflates to 215px (whole hero +31px shift).
- **Root cause:** unlayered CSS beats Tailwind's utilities layer, so
  `.text-display-xl`'s 1.05 line-height beat the intended `leading-[0.9]`.
- **Fix:** typography customs declared inside `@layer components`.
- **Guard:** `e2e/primitives.spec.ts` (hero H1 cascade + 184px height).

### A-4: Prisma relative `file:` URL anchoring (Critical)

- **Symptom:** `bun run db:push` creates the db OUTSIDE the repo
  (`<repo-parent>/db/custom.db`); vitest fails 20/66 with "Error code 14:
  Unable to open the database file".
- **Root cause:** Prisma 6.19 anchors env-provided relative `file:` URLs
  at the package root (CLI) or `process.cwd()` (client runtime) — NOT at
  `prisma/schema.prisma`.
- **Fix:** `src/lib/db-path.ts` (`findRepoRoot` walks up for
  `prisma/schema.prisma`; `resolveDatabaseUrl` anchors relative `file:`
  URLs at `<repo>/prisma`, passes absolute/Postgres through). Consumed by
  `src/lib/db.ts` (`datasourceUrl`), `scripts/with-db.ts` (all `db:*`
  commands), `playwright.config.ts`.
- **Guard:** `src/lib/db-path.test.ts` (12 tests).

### A-5: e2e hydration race on the /properties filter bar (High)

- **Symptom:** `primitives.spec.ts` failures ~1-in-5 — `main input`
  returns null right after `page.goto` with `readyState: complete`.
- **Root cause:** `PropertiesFilters` uses `useSearchParams` inside a
  `<Suspense>` boundary, so it streams/hydrates AFTER the initial shell;
  a bare `page.evaluate` races that window.
- **Fix:** `waitForSelector` the asserted elements before measuring.
- **Guard:** the guards live in `e2e/primitives.spec.ts` (4 call sites).

### A-6: aria/role/type attributes the original lacks (Medium)

- **Symptom:** accessible names diverge from the target ("Property type:
  Any Type" vs "Any Type").
- **Root cause:** well-intentioned a11y additions on the hero dropdowns.
- **Fix:** strip to byte-parity (buttons carry ONLY `class`).
- **Guard:** byte-exact attribute assertions in `e2e/primitives.spec.ts`.

### A-7: Toaster scope creep (Medium)

- **Symptom:** inquiry form shows a success toast the original never
  shows.
- **Root cause:** mounting sonner's `<Toaster>` in the root layout.
- **Fix:** Toaster mounted ONLY on `/login` (parity); `inquiry-form-with-
  toast.tsx`'s `toast()` call is a deliberate silent no-op elsewhere —
  the form resets, exactly like the original. Every other page mounts the
  EMPTY `GlobalToastLayer` (the original's empty global container).
- **Guard:** `e2e/toast-layer.spec.ts` (5 tests incl. mobile blocking
  geometry).

### A-8: shadcn primitive drift (Medium)

- **Symptom:** filter selects render 36px tall with 3px focus rings.
- **Root cause:** regenerating/upgrading `src/components/ui/*` to current
  shadcn defaults.
- **Fix:** the four primitives are pinned to the original's v1-style
  bases: `focus-visible:ring-1`, `shadow-sm`, NO `data-slot` attrs,
  `SelectTrigger` without `data-[size]:h-9` (usage `h-12` renders 48px),
  `SelectContent` `max-h-96` without scroll buttons, v1 item
  (`py-1.5 pl-2 pr-8` + `span[aria-hidden]` indicator wrapper).
- **Guard:** `e2e/primitives.spec.ts` (12 tests).

---

## 10. Debugging Guide

### 10.1 Build/runtime failures

| Error | Cause | Fix |
| --- | --- | --- |
| `Error code 14: Unable to open the database file` | relative `DATABASE_URL` anchored at CWD/package root (A-4), or a stale injected env pointing outside the repo | ensure `.env` `DATABASE_URL="file:../db/custom.db"`; if a shell exports an absolute/incorrect `DATABASE_URL`, normalize per command: `DATABASE_URL="file:../db/custom.db" bun run test` |
| db created at `<repo-parent>/db/` | someone ran a bare `prisma db push` (bypassing `scripts/with-db.ts`) | delete the stray file; use `bun run db:push` |
| fonts collapse to sans-serif | next/font vars on `<body>` (A-1) | vars on `<html>` |
| e2e webServer 404s on static assets | custom distDir staging — assets staged at `standalone/.next-e2e/static`, NOT `standalone/.next/static` | keep the playwright webServer command as-is |
| Next 16 sitemap `priority 1.0` renders `1` | serializer behavior | by-design byte diff, semantically identical |
| framer-motion scroll-container warning in dev | known cosmetic console noise | accepted |

### 10.2 Test failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| vitest DB tests fail in a sandbox | the shell/session env injected an absolute `DATABASE_URL` shadowing `.env` (dotenv no-override) | export the relative URL per command block |
| `primitives.spec.ts` intermittently fails after goto | hydration race (A-5) | the guards exist; if adding new /properties DOM assertions, `waitForSelector` first |
| coverage gate fails | thresholds 85/80/75/85 on `src/lib`+`src/actions` | run `bun run test:coverage`, read the per-file table, add/repair tests in the failing file |
| e2e can't find `main input` on /properties | filter bar streams inside Suspense | wait for the selector |

### 10.3 Visual/styling issues

| Symptom | Cause | Fix |
| --- | --- | --- |
| dividers invisible | `.hairline` fallback (A-2) | `var(--border)` directly |
| hero H1 too tall | class/utilty cascade broken (A-3) | keep customs in `@layer components` |
| selects 36px instead of 48px | primitive drift (A-8) | restore v1 bases |
| pill buttons become rounded-lg | radius token changed | `--radius: 9999px` |

### 10.4 Live-site verification (what CI cannot catch)

Use `agent-browser` (or Playwright MCP) against both the dev server and the
live original — methodology in Appendix C. Mobile menu geometry is the
canary: toggle top 8 / bottom 48 / 40×40; center blocked by the empty toast
layer; opens from the lower part only.

---

## 11. Pre-Ship Checklist

Run in order; all must pass:

```bash
bun run lint            # eslint — 0 errors, 0 warnings
bun run typecheck       # tsc --noEmit — clean
bun run test:coverage   # 71 vitest tests + coverage floors
                        # (85% stmts / 80% branches / 75% funcs / 85% lines)
bun run test:e2e        # 75 Playwright tests against the production
                        # standalone build on :3003
```

CI (`.github/workflows/ci.yml`) runs exactly these on every push/PR to
`main`. Additional local ritual:

1. Browser-verify the affected flow: hero search → /properties filters
   (incl. a zero-match search → empty state + Clear Filters) → property
   detail → inquiry (row lands in `Inquiry`, form resets silently);
   /login five views with demo credentials; newsletter; mobile menu.
2. `tail dev.log` — no runtime errors from the session.
3. Revert the `tsconfig.json` include-list mutation if `next build` added
   `.next-e2e/*` entries (known transient side-effect; keep the working
   tree clean).
4. `git status` — never commit `.env`, `db/*.db`, logs, `coverage/`,
   `playwright-report/`, `reference-ui/`, `tool-results/`.
5. Atomic conventional commits on `main` only.

---

## 12. Lessons Learnt & How to Avoid Them

1. **Measure the original before "fixing" the clone.** Both `.ghost-btn`
   (invalid CSS, load-bearing) and the hero dropdown aria strip (S7-6,
   missed on one component) taught the same lesson: extract the target's
   computed styles/DOM attributes FIRST, then decide. When in doubt, measure.
2. **CSS validity ≠ rendering truth.** `hsl(var(--x))` with a full-color
   token is invalid, but its fallback may be exactly the original's
   rendering. Fix only what measurably diverges (`.hairline`), leave the
   rest (`.ghost-btn`).
3. **Only H1 tops were verified for 5 sessions — the heights hid a 31px
   drift.** Geometry assertions must cover both position AND size; the
   hero H1's 184px comes from a cascade interplay (`leading-[0.9]` beating
   `.text-display-xl`), invisible to top-only measurement.
4. **Documented semantics can be fiction.** `.env.example` documented
   schema-anchored relative-URL resolution that Prisma 6.19 never shipped;
   the promised `db-path.ts` didn't exist. Validate infra contracts
   empirically on a fresh clone before trusting docs (A-4).
5. **A bare `page.evaluate` after `page.goto` races hydration** on any
   Suspense-streamed subtree — reproducible 1-in-5 even with
   `readyState: complete` (A-5). Always wait for the asserted element.
6. **Parity includes the DOM's attribute set, not just its visual
   output.** Accessible names, `type` attributes, `data-*` markers —
   byte-diff them when fidelity matters (A-6).
7. **Scope-limit coverage gates to what unit tests can own.** The NextAuth
   options module is browser-surface (pinned by e2e); forcing it into unit
   coverage distorts the thresholds — exclude with a documented reason,
   test pure helpers (`utils.test.ts`) for real.
8. **Environment injection beats dotenv.** A session-exported
   `DATABASE_URL` silently overrides `.env` (no-override semantics).
   In sandboxes, normalize per command block; in CI, set it explicitly.
9. **Custom distDir mirrors its name inside the standalone output** (Next
   16) — static asset staging must follow (`.next-e2e/static`), or every
   e2e page 404s its assets.
10. **Empty DOM artifacts can be load-bearing fidelity.** The original's
    empty global toast container blocks the mobile toggle's top half —
    reproducing "nothing" was required for menu-opening parity (A-7).

---

## 13. Pitfalls to Avoid

**Architecture**

- Don't add REST route handlers for UI mutations — Server Actions are the
  only seam (`/api/auth/*` is the sole sanctioned route).
- Don't instantiate `new PrismaClient()` outside `@/lib/db` (e2e DB
  assertions are the one sanctioned exception).
- Don't put DB access in components; queries.ts is the boundary.

**TypeScript**

- Don't use `any` (repo uses `unknown` at boundaries); don't loosen
  `strict`.
- Don't read `params`/`searchParams` synchronously in Next 16 — always
  `await`.

**CSS/Tailwind**

- Don't create `tailwind.config.ts` (v4 is CSS-first here).
- Don't move brand classes out of `@layer components` (breaks the hero
  cascade, A-3).
- Don't "fix" `.ghost-btn`'s invalid `hsl(var(...))` declarations.
- Don't re-add unused shadcn components to `src/components/ui/` (only
  input/select/sonner/textarea are used; 44 were deleted as scaffold
  weight).
- Don't upgrade the four primitives to current shadcn defaults (A-8).

**Data**

- Don't `JSON.parse` array columns inline — `parseJsonArray` only.
- Don't bypass `scripts/with-db.ts` with a bare `prisma` CLI call.
- Don't float money; format at the edge.

**Parity**

- Don't add aria-labels to chrome/filters/forms/hero dropdowns (A-6).
- Don't mount the Toaster outside /login (A-7).
- Don't add `noValidate` or custom pre-submit error DOM to the inquiry
  form.
- Don't "improve" the legal pages' Wix-template copy (typos included) —
  pinned byte-level by `e2e/legal.spec.ts`.

**Testing**

- Don't weaken lint/type gates or skip tests to ship.
- Don't write e2e locators against aria-labels that don't exist — use
  placeholders/text/CSS.
- Don't assert /properties filter-bar DOM without waiting for it (A-5).

---

## 14. Best Practices

- **Server Components by default**; `"use client"` only for interactive
  leaves (the inventory in §5.2 is the map).
- **Mutations:** Zod-validate → rate-limit → persist → return
  `ActionResult<T>`; never throw across the boundary; failures carry
  `code` + user-safe message (+ `fieldErrors` where useful).
- **Reads:** typed DTOs from `queries.ts`; decode JSON columns and
  serialize dates exactly once, at the boundary.
- **Filters:** URL-driven (`searchParams`), commits push new URLs; only
  free-text keeps a local draft.
- **Styling:** brand tokens/classes over ad-hoc values; change
  `globals.css`, not component literals; utilities may override brand
  classes (that IS the cascade contract).
- **Motion:** `<Reveal>` for server pages; direct `motion` imports only
  inside client islands; every animation must degrade under
  `prefers-reduced-motion`.
- **Comments explain why** ("parity with the original", "load-bearing
  invalid CSS"), never what.
- **Conventional atomic commits** on `main`; the gate order is
  lint → typecheck → test → e2e, then browser-verify the affected flow.
- **New constants** go in `src/lib/constants.ts` (canonical + tested);
  components consume, never define.
- **New DB reads** go through `queries.ts` as DTO-returning functions;
  new writes go through a Server Action with a Zod schema.

---

## 15. Coding Patterns

### Pattern 1 — Server Action result union (src/actions/inquiry.ts)

```ts
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string;
      fieldErrors?: Record<string, string[]> } };
// Actions: safeParse → on failure return VALIDATION with fieldErrors;
// rate-limit check → RATE_LIMITED; existence check → NOT_FOUND;
// persist; catch-all → INTERNAL (logged server-side, user-safe message).
```

### Pattern 2 — DTO mapping at the data boundary (src/lib/queries.ts)

```ts
function toPropertyDto(p: Property): PropertyDto {
  return { ...p, images: parseJsonArray(p.images),
           features: parseJsonArray(p.features),
           createdAt: p.createdAt.toISOString() };
}
// JSON-text columns decoded once; dates serialized once; components
// never see raw rows.
```

### Pattern 3 — URL-derived filters (src/components/site/properties-filters.tsx)

```tsx
const filters = { search: searchParams.get("search") ?? "",
                 type: searchParams.get("type") ?? "All Types", /* … */ };
const pushFilters = (overrides) =>
  router.push(`/properties?${buildParams({ ...filters, ...overrides })}`);
// No state-sync effects; shareable views; lint-clean.
```

### Pattern 4 — Client boundary for motion (src/components/site/reveal.tsx)

```tsx
"use client";
export function Reveal({ children, delay, duration, yOffset = 24, className }) {
  return <motion.div initial={{ opacity: 0, y: yOffset }}
    whileInView={{ opacity: 1, y: 0 }} …>{children}</motion.div>;
}
// Server pages compose <Reveal>; only client islands import motion.
```

### Pattern 5 — Deterministic repo-root DB resolution (src/lib/db-path.ts)

```ts
export function findRepoRoot(startDir: string): string
// walks up until prisma/schema.prisma is found
export function resolveDatabaseUrl(rawUrl: string | undefined): string | undefined
// undefined → undefined (caller decides); postgres:// → passthrough;
// absolute file: → passthrough; relative file:../db/custom.db →
// <repoRoot>/prisma/../db/custom.db → absolute URL. Pure node builtins;
// env is read at the caller, never inside (test purity).
```

### Pattern 6 — CLI wrapper (scripts/with-db.ts)

```ts
// loads .env when needed → resolveDatabaseUrl() → spawns the wrapped
// command (prisma db push | prisma db seed | tsx prisma/seed.ts …) with
// the absolute DATABASE_URL injected. package.json db:* scripts route
// through it. Never call the prisma CLI bare.
```

### Pattern 7 — The signature rotating stamp (src/components/site/stamps.tsx)

```tsx
<motion.svg viewBox="0 0 100 100" animate={{ rotate: 360 }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
  <circle cx="50" cy="50" r="50" fill={fill} />
  <text …><textPath href={`#${pathId}`}>{label}</textPath></text>
</motion.svg>
// "NEW" (#FFFFA3) / "OPEN HOUSE" (#F2CC65); brand-defining, crisp at any
// size, 20s linear rotation like the source.
```

### Pattern 8 — SEO metadata emission (src/lib/seo.ts)

```ts
export function pageMetadata({ title, path }: PageMetadataInput): Metadata
// Emits the FULL openGraph + twitter objects — Next replaces a segment's
// objects wholesale, so partial overrides would drop root fields.
// og:description pattern: "{Page} on Real Estate Agency. {site}".
```

---

## 16. Coding Anti-Patterns (don't / do)

| Don't | Do |
| --- | --- |
| `<img src="…">` | `next/image` or the media pipeline already in place |
| `JSON.parse(property.images)` | `parseJsonArray(property.images)` |
| `formatPrice(price * 1.0)` on floats | integer USD math only |
| `new PrismaClient()` in a component/action | `import { db } from "@/lib/db"` |
| Reading `searchParams` sync | `const sp = await searchParams;` |
| `useEffect(() => setFilters(urlSp))` | derive from `searchParams` per render |
| `aria-label="Search properties"` on the filter input | nothing — the original has none; locate by placeholder |
| `toast.success("Sent!")` expecting a Toaster | Toaster exists only on /login; elsewhere toasts are no-ops |
| `prisma db push` bare | `bun run db:push` (wrapped) |
| Hard-coding `["Penthouse", …]` in a component | import from `@/lib/constants` |
| `import { motion } from "framer-motion"` in a server page | `<Reveal>` wrapper |
| Editing `globals.css` tokens to "clean up" invalid CSS | verify computed rendering against the original first |
| `mkdir tests/` for new tests | beside source: `src/**/x.test.ts` (tests/ is git-ignored) |

---

## 17. Responsive Breakpoint Reference

Tailwind v4 defaults (no custom config file) plus one custom breakpoint
declared in `@theme`:

| Breakpoint | Width | Used for |
| --- | --- | --- |
| `sm` | 40rem (640px) | minor type/spacing bumps |
| `md` | 48rem (768px) | the mobile→desktop flip: header `h-14 md:h-16`, hero `pt-[35vh]` at md, filter bar gains per-filter widths, footer columns |
| `lg` | 64rem (1024px) | grid columns (3-across listings) |
| `xl` | 80rem (1280px) | max container padding |
| `2xl` | 96rem (1536px) | container caps |
| `3xl` | **120rem (1920px)** | custom — largest-editorial stage |

Layout rhythm: `max-w-[1400px]` / `max-w-[1600px]` containers with
`px-[2%]` / `px-[4%]`; section padding `py-24 md:py-40`; header fixed
`h-14 md:h-16`. Mobile-first: base styles are mobile; `md:` carries the
desktop layout. Mobile QA at 375×667 (the e2e toast-layer geometry tests
pin toggle 8→48px / 40×40 at that viewport).

---

## 18. Z-Index Layer Map

| z | Element | File | Purpose |
| --- | --- | --- | --- |
| `z-10` | hero content, gallery overlays, stamp positioning | various site components | content layering within sections |
| `z-10` | mobile toggle wrapper | `site-header.tsx` | above hero video |
| `z-40` | mobile menu overlay (`fixed inset-0 bg-background`) | `site-header.tsx:132` | full-screen mobile nav |
| `z-50` | the fixed site header | `site-header.tsx:61` | above everything except toasts |
| `z-[100]` | `GlobalToastLayer` — two nested `div.fixed.top-0` divs, EMPTY | `global-toast-layer.tsx` | the original's global sonner container replica; on mobile covers the top 32px full-width (blocks the toggle's top half — parity artifact); on desktop it repositions to a bottom-right 420px slot |
| (portal) | Radix SelectContent / sonner toasts | `ui/select.tsx`, `ui/sonner.tsx` | Radix portals to body, above page layers |

Conflict rules: header (z-50) sits under toasts (z-100) — intentional;
the mobile menu (z-40) sits under the header (z-50) so the toggle stays
clickable while the menu is open. Do not introduce new z values; if a new
overlay is needed, slot it into this table first.

---

## 19. Color Reference (Complete)

Every token in `src/app/globals.css` `:root` (HSL values are verbatim):

| Token | HSL | Hex (approx) | Tailwind class | Usage |
| --- | --- | --- | --- | --- |
| `--background` | `30 20% 97%` | `#f9f7f4` | `bg-background` | page bg |
| `--foreground` | `0 0% 10%` | `#1a1a1a` | `text-foreground` | ink; footer surface |
| `--card` / `--popover` | `30 20% 97%` | `#f9f7f4` | `bg-card` / `bg-popover` | card/popover surfaces |
| `--primary` | `0 0% 10%` | `#1a1a1a` | `bg-primary` | buttons |
| `--primary-foreground` | `30 20% 97%` | `#f9f7f4` | `text-primary-foreground` | on primary |
| `--secondary` / `--muted` | `30 10% 90%` | `#e7e4e0` | `bg-secondary` / `bg-muted` | subtle surfaces |
| `--secondary-foreground` | `0 0% 10%` | `#1a1a1a` | — | on secondary |
| `--muted-foreground` | `30 5% 35%` | `#5e5a55` | `text-muted-foreground` | secondary text |
| `--accent` | `35 65% 36%` | `#96643a` | `text-accent` | bronze-gold: prices, active nav, icons |
| `--accent-foreground` | `30 20% 97%` | `#f9f7f4` | — | on accent |
| `--destructive` | `0 84.2% 60.2%` | `#ef4444`-like | — | error alert blocks |
| `--destructive-foreground` | `0 0% 98%` | `#fafafa` | — | on destructive |
| `--border` / `--input` | `30 12% 88%` | `#e1dcd6` | `border-border` | hairlines, card borders |
| `--ring` | `35 65% 36%` | bronze | `ring-ring` | focus rings |
| `--chart-1` | `35 65% 36%` | bronze | — | declared, unused |
| `--chart-2` | `173 58% 39%` | teal | — | declared, unused |
| `--chart-3` | `197 37% 24%` | deep blue | — | declared, unused |
| `--chart-4` | `43 74% 66%` | gold | — | declared, unused |
| `--chart-5` | `27 87% 67%` | orange | — | declared, unused |

Stamp fills (literals in `stamps.tsx`, not tokens): NEW `#FFFFA3` ·
OPEN HOUSE `#F2CC65` · light-gold-on-dark `#facca3`.

Note: `--accent` `hsl(35 65% 36%)` ≈ `#96643a` (bronze). Always copy HSL
values from `globals.css` — never re-derive hexes by eye. `.dark` tokens
exist but the app never mounts `.dark` (light-only by design).

---

## 20. TypeScript Interface Reference

The load-bearing contracts (paths exact; shapes verified):

```ts
// src/actions/inquiry.ts — the mutation contract
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string;
      fieldErrors?: Record<string, string[]> } };
export type ErrorCode = "VALIDATION" | "RATE_LIMITED" | "NOT_FOUND" | "INTERNAL";
export interface InquiryInput { /* Zod-validated form shape:
  fullName, email, phone?, message, inquiryType, propertyId?,
  propertyTitle?, preferredDate? */ }

// src/actions/auth.ts — the auth-flow contract
export type AuthActionResult<T> = /* same union, auth-specific codes */;
// Actions: signUpWithEmailAndPassword, verifyEmailWithCode,
// resendVerificationCode, requestPasswordReset (oracle-free).

// src/lib/queries.ts — the DTO contracts (JSON columns decoded, dates ISO)
export interface PropertyDto { id, title, shortDescription, description,
  price: number, bedrooms, bathrooms, sqft, garage, yearBuilt: number,
  address, city, state, zipCode, neighborhood, location, propertyType: string,
  images: string[], featuredImage, features: string[], videoUrl,
  isFeatured, isHighPriority: boolean, status, createdAt: string }
export interface AgentDto { id, name, title, bio, photo,
  yearsExperience: number, totalSalesVolume, email, phone, isFeatured }
export interface TestimonialDto { id, quote, clientName, propertyType, location }
export interface PropertyFilters { search?, type?, location?, priceBand?,
  bedsMin?: number /* derived from label */ }
// Read fns: listFeaturedProperties(6), listAllProperties,
// getPropertyById, listFeaturedAgents(3), listAllAgents,
// listTestimonials(5), countPropertiesByLocation, listPropertiesFiltered.

// src/lib/constants.ts
export interface PriceBand { label: string; min: number; max: number }

// src/lib/seo.ts
export interface PageMetadataInput { title?: string; path: string }

// src/types/next-auth.d.ts — session user.id augmentation
```

Verification for all of the above: `bun run typecheck` is clean against
these exact shapes.

---

## Appendix A: Architecture Decision Records

| ADR | Decision | Rationale (short) |
| --- | --- | --- |
| ADR-001 | Single Next.js app, not a monorepo | one public site + login; no back-office surface to split; seams enforced by convention |
| ADR-002 | Server Actions as the only mutation seam | one place to validate/rate-limit/translate; typed results; no REST duplication |
| ADR-003 | SQLite dev / PostgreSQL prod | zero-config local; string-union "enums" + JSON arrays keep the schema portable |
| ADR-004 | URL as the source of truth for /properties filters | shareable, back/forward-correct, no state-sync effects |
| ADR-005 | NextAuth v4 Credentials + seeded demo user | parity with the original sign-in; Google optional behind env |
| ADR-006 | Reproduce the original design tokens exactly | token fidelity is cheaper and more robust than per-component approximation |

Full ADRs with context/consequences/alternatives: PAD §1.3.

## Appendix B: Session & Audit History

| Session | Focus |
| --- | --- |
| 1–2 | Recon, design extraction, core build (all pages, actions, seed) |
| 3–5 | Parity iterations: fonts, hero dropdowns, section structures, titles |
| 6 | S7 sweep: aria strip, legal copy verbatim, layout guards |
| 7 (docs/session_8–9) | Interactive-state parity, five-view auth card, zero-match state |
| 8 (docs/session_10) | Infra hardening: db-path resolver, e2e determinism, hero byte-parity |
| 9 (docs/session_11) | Operator log of session 8 |
| 12 (docs/session_12) | Coverage thresholds + CI workflow + THIS SKILL.md; parity re-audit (zero drift) |

Test progression: 54 vitest (session 9) → 66 (session 10) → **71** (session
12) · e2e 75 since session 10.

## Appendix C: Live-Site Parity Validation Methodology

What CI cannot catch: the original's evolving DOM and computed styles. The
method (agent-browser, both desktop 1280×720 and mobile 375×667):

1. **Login** to the original (demo credentials) — note the post-login
   redirect (homepage; the app has no dashboard).
2. **Extract, don't assume**: `getBoundingClientRect()` for geometry;
   `Object.fromEntries([...el.attributes].map(a=>[a.name,a.value]))` for
   DOM byte-parity; `document.elementFromPoint(x,y)` for hit-testing
   (which element actually receives the tap).
3. **Mobile canary**: toggle geometry (top 8 / bottom 48 / 40×40);
   `elementFromPoint` at the toggle center → must hit the empty toast
   layer, at the lower part → must hit the button; menu contents
   (Properties/Sell/About/View Listings + 4 category links).
4. **Diff the clone** at the same viewport with the same probes; pin any
   divergence as an e2e assertion BEFORE fixing it (TDD for parity).
5. Capture reference screenshots (target) OUTSIDE the repo; clone
   screenshots go to `docs/screenshots/`.

## Quick Reference Card

| Need | Where |
| --- | --- |
| Commands & gates | `AGENTS.md` (authoritative) + §3/§11 here |
| Design tokens | `src/app/globals.css` + §4/§19 |
| DB resolution contract | `src/lib/db-path.ts` (+12 tests) |
| CLI wrapper | `scripts/with-db.ts` |
| Mutation seam | `src/actions/inquiry.ts`, `src/actions/auth.ts` |
| Read engine + DTOs | `src/lib/queries.ts` |
| Canonical lists | `src/lib/constants.ts` |
| SEO emission | `src/lib/seo.ts` (`pageMetadata()`) |
| e2e suite | `e2e/*.spec.ts` (13 specs, 75 tests) |
| Coverage config | `vitest.config.ts` (85/80/75/85) |
| CI | `.github/workflows/ci.yml` |
| Deployment | `docs/DEPLOYMENT.md` |
| Screenshots | `docs/screenshots/` (17 captures) |
| This skill | `real-estate-agency_SKILL.md` (update §6.2-style version bumps on every sprint) |




