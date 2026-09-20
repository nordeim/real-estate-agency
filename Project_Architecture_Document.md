# MAISON ESTATE — Master Project Architecture Document (PAD) v1.5

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION-LOCKED BLUEPRINT
**Companion Document:** README.md (product overview), AGENTS.md (agent instructions), CLAUDE.md (engineering conventions)
**Last Updated:** 2026-09-20
**Audience:** Senior Engineers, Tech Leads, DevOps, and Onboarding Engineers
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

## Revision History

| Version | Date | Change | Tag |
| --- | --- | --- | --- |
| 1.5 | 2026-09-20 | Cascade & primitive parity: brand classes moved into `@layer components` so Tailwind utilities win (hero H1 `leading-[0.9]` → 184px desktop like the original); shadcn primitives rewritten to the original's v1-style base classes (48px filter selects — no `data-[size]:h-9`, `ring-1` focus, no `data-slot` attrs, no scroll buttons, v1 item indicator); global empty toast container replica on every page except /login (`GlobalToastLayer` — mobile top-32px blocking included); inquiry form native validation (no `noValidate`); aria-label strip to match the original; sell H1 plain text; `DATABASE_URL="file:../db/custom.db"` documented correctly (repo-root `db/`); primitives/toast-layer e2e suites (17 tests, total 75) | [CA] |
| 1.4 | 2026-09-20 | Layout & copy parity: flex-column page chrome (`min-h-screen flex flex-col` + `main.flex-1`) on every content page with per-page top padding (universal `pt-24` removed; measured H1 viewport-tops now match the original on all pages); legal pages rewritten to the original's verbatim Wix-template copy (`legal-page.tsx`); about-page structure (2 hairlines + parallax band `h-[500px] md:h-[650px]`); sell `#contact` anchor div (scroll-margin-top 80px); `.hairline` visibility fix (`var(--border)` — was transparent); layout/legal e2e suites (15 tests) | [CA] |
| 1.3 | 2026-09-20 | Interactive-state parity: five-view auth card (reset/check-email/create-account/verify-email) with `src/actions/auth.ts` + User verification columns; zero-match empty state + Clear Filters on /properties; login error alert + newsletter success copy alignment; sonner Toaster scoped to /login only (inquiry toast becomes an intentional no-op, mirroring the original); auth test suites (12 vitest + 9 e2e) | [CA] |
| 1.2 | 2026-09-20 | SEO/metadata parity: `src/lib/seo.ts` + `pageMetadata()` on all pages, OG/Twitter layer, SVG favicon wiring, `sitemap.ts`/`robots.ts`, filter-width parity; scaffold purge (`/api` route, `tailwind.config.ts`, 44 unused ui components, hooks); SEO test suites (11 vitest + 8 e2e) | [CA] |
| 1.1 | 2026-09-20 | Parity iteration: font-cascade fix (F1), hero popover dropdowns, section reworks, original page titles, Playwright e2e suite, queries tests | [CA] |
| 1.0 | 2026-09-20 | Initial as-built document from the completed build | [SYN] |

Tags: `[RES]` Resolution · `[SR]` Scope Revision · `[CA]` Corrective Action · `[SYN]` Sync/Refresh · `[SAN]` Sanity Check · `[AUTH]` Authoritative Clarification

## Table of Contents

1. [System Overview & Decisions](#1-system-overview--decisions)
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Application Architecture](#3-application-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Design System Reference](#5-design-system-reference)
6. [Security Architecture](#6-security-architecture)
7. [Testing Strategy](#7-testing-strategy)
8. [Build & Deployment](#8-build--deployment)
9. [Developer Handbook](#9-developer-handbook)
10. [Known Issues & Outstanding Tasks](#10-known-issues--outstanding-tasks)
11. [Key Files Reference](#11-key-files-reference)
12. [Glossary](#12-glossary)

---

## 1. System Overview & Decisions

### 1.1 Document Metadata & Purpose

MAISON ESTATE is a luxury real-estate agency web application — a faithful,
production-grade clone of the original Base44 application at
`https://real-estate-agency.base44.app/`. This document records the as-built
architecture: stack decisions with rationale, the layer model, data design,
the design-token system, security posture, testing, and operations. It exists
so future maintainers can change the system without reverse-engineering it.

### 1.2 Technology Stack Summary

| Layer | Technology | Version | Key Rationale |
| --- | --- | --- | --- |
| Web framework | Next.js (App Router) | 16.x | Server Components give zero-client-JS data reads; Server Actions replace a REST layer; aligned with the reference architecture (scandihaven) the clone was commissioned from |
| UI runtime | React | 19.x | Required by Next 16; function-component + hooks model |
| Language | TypeScript, `strict` | 5.x | Compile-time contracts across DTOs, actions, and props |
| Styling | Tailwind CSS (CSS-first `@theme`) | 4.x | Reproduces the original app's exact token system; no config file drift |
| Component primitives | shadcn/ui + Radix | current | Accessible Select/Input/Textarea foundations; original app is itself shadcn-based |
| Animation | framer-motion | 12.x | The original's hero, reveals, rotating stamps, and parallax are motion-defining |
| ORM | Prisma | 6.x | Typed schema + client; SQLite dev / PostgreSQL prod with one provider switch |
| Auth | NextAuth v4 | 4.24 | Credentials provider matches the original login flow; JWT sessions; Google optional |
| Validation | Zod | 4.x | Single dialect for action input contracts and tests |
| Unit/integration tests | Vitest | 5.x | Fast node-environment runner; runs actions against the real DB |
| Toasts | sonner | 2.x | Inquiry/newsletter feedback |
| Package manager / runtime | Bun | ≥ 1.1 | Single toolchain for install, scripts, and tsx-style seed execution |

### 1.3 Architecture Decision Records

**ADR-001: Single Next.js application (not a monorepo)**
- **Context:** The commissioning reference (scandihaven) is a pnpm + Turborepo
  monorepo with separate storefront/admin apps and shared packages.
- **Decision:** Build a single Next.js app with an internal layer structure
  (`app/`, `components/site/`, `lib/`, `actions/`).
- **Rationale:** The original Base44 app is one public site with a login —
  there is no back-office surface to split out. A single app removes workspace
  tooling overhead, keeps every file one hop from the route that uses it, and
  still enforces the same seams (queries vs actions vs UI).
- **Consequences:** No cross-package dependency rules needed; the layer
  discipline moves to conventions documented here and in AGENTS.md.
- **Alternatives Rejected:** pnpm/Turborepo monorepo (justifiable only with a
  second app or shared packages); separate API service (Server Actions
  suffice for this mutation surface).

**ADR-002: Server Actions as the only mutation seam**
- **Context:** The app persists inquiries and newsletter subscriptions from
  public forms; the original called a hosted SDK from the client.
- **Decision:** All writes flow through `"use server"` functions in
  `src/actions/inquiry.ts` returning a typed `ActionResult<T>` union; no REST
  endpoints exist for UI mutations.
- **Rationale:** One place to validate (Zod), rate-limit, log, and translate
  persistence failures into user-safe messages. Typed results prevent throws
  across the RSC boundary and keep failure paths testable.
- **Consequences:** Client components call actions directly; the only route
  handler is NextAuth's `/api/auth/[...nextauth]`.
- **Alternatives Rejected:** Route handlers per mutation (validation and error
  mapping would be duplicated); client-side SDK calls (secrets and validation
  logic would ship to the browser).

**ADR-003: SQLite for development, PostgreSQL for production**
- **Context:** The reference stack uses PostgreSQL 17; the build environment
  must run with zero external services.
- **Decision:** Ship SQLite (`db/custom.db`) as the default `DATABASE_URL`
  with string-union "enums" and JSON-text array columns; document the
  one-switch PostgreSQL path in `.env.example` and the README.
- **Rationale:** Anyone can `bun install && db:push && db:seed && dev` with
  no server. String columns + `constants.ts` canonical lists keep the schema
  portable across both engines instead of engine-specific enum types.
- **Consequences:** Array fields need `parseJsonArray()` at the DTO boundary;
  referential checks for `Inquiry.propertyId` are application-level.
- **Alternatives Rejected:** Postgres-only (blocks zero-config local runs);
  an ORM-agnostic repository layer (no second engine is actually in use).

**ADR-004: URL as the source of truth for listing filters**
- **Context:** The /properties page filters by search text, location, type,
  price band, and beds; the original mirrored filter state in React state.
- **Decision:** Derive filter values from `searchParams` on every render;
  every change pushes a new URL; only the free-text input keeps a local
  draft.
- **Rationale:** Shareable, back/forward-correct views with no state-sync
  effects — which also satisfies the `react-hooks/set-state-in-effect` rule.
- **Consequences:** The page must `await searchParams` (Next 16 async props).
- **Alternatives Rejected:** Local state + effect syncing from the URL
  (lint-flagged, double render); global store (unnecessary for one page).

**ADR-005: Credentials auth seeded with the original demo user**
- **Context:** The original app's login accepts
  `sepnetflix2023@outlook.com` / `$Abcd1234`; a clone should authenticate the
  same way out of the box.
- **Decision:** NextAuth v4 Credentials provider against the `User` table
  (bcrypt hashes); the seed creates that demo user; Google OAuth is wired but
  disabled until env keys are provided.
- **Rationale:** Functional parity with the original sign-in flow; no secret
  in the repo (the demo password is intentionally public demo data, hashed at
  seed time).
- **Consequences:** JWT sessions; no OAuth-only features; signup is not
  implemented (mirrors the original's template behavior).
- **Alternatives Rejected:** Better-Auth (heavier than this surface needs);
  disabling auth entirely (would regress the /login page parity).

**ADR-006: Reproduce the original design tokens exactly**
- **Context:** The brief is a pixel-faithful clone; the original's CSS was
  fully extractable.
- **Decision:** Port the original `:root` HSL variables, custom classes
  (`.ghost-btn`, `.hairline`, `.text-display-*`, `.tracking-*`), fonts
  (Instrument Serif + Inter), `--radius: 9999px` pill geometry, and media
  assets into `globals.css` / `public/media`.
- **Rationale:** Token fidelity is cheaper and more robust than approximating
  visuals per-component; any future rebrand changes one file.
- **Consequences:** Components may use brand classes alongside Tailwind
  utilities; shadcn primitives inherit the pill radius (matching the
  original, which is also shadcn-based).
- **Alternatives Rejected:** Rebuilding with default shadcn theme (loses the
  editorial identity); CSS-in-JS (fights Tailwind v4).

---

## 2. High-Level System Topology

```mermaid
flowchart TB
    subgraph Client["Browser (desktop / mobile)"]
        UI["React 19 client islands<br/>header · forms · carousels · stamps"]
    end

    subgraph Next["Next.js 16 (App Router) — single deployment"]
        direction TB
        RSC["RSC pages (server)<br/>/ · /properties · /property/:id<br/>/sell · /about · legal · /login"]
        QRY["src/lib/queries.ts<br/>typed DTO read functions"]
        ACT["src/actions/inquiry.ts<br/>Server Actions (mutations)"]
        AUTH["src/lib/auth.ts + /api/auth/*<br/>NextAuth v4"]
        CSS["globals.css design system<br/>Tailwind v4 @theme"]
    end

    subgraph Data["Data layer"]
        PRISMA["Prisma Client singleton<br/>src/lib/db.ts"]
        SQLITE[("SQLite db/custom.db<br/>(dev default)")]
        PG[("PostgreSQL<br/>(production path)")]
    end

    UI -->|"GET (document/RSC payloads)"| RSC
    UI -->|"action calls"| ACT
    UI -->|"sign-in"| AUTH
    RSC --> QRY
    QRY --> PRISMA
    ACT --> PRISMA
    AUTH --> PRISMA
    PRISMA --> SQLITE
    PRISMA -.->|"provider switch"| PG
    RSC --> CSS
```

Runtime notes: pages are `force-dynamic` (listing data must be fresh and the
filter set is user-driven); static assets (video, imagery, fonts) are served
from `public/media` and `next/font` with immutable caching. There are no
external service calls at request time — the Google Maps embed is an iframe,
not an API dependency.

---

## 3. Application Architecture

### 3.1 Layer Model

| # | Layer | Location | Responsibility | Golden Rule |
| --- | --- | --- | --- | --- |
| L0 | Presentation shell | `app/layout.tsx`, `components/site/{site-header,site-footer}` | Fonts, metadata, header/footer chrome | Branding/positioning bugs are fixed here, never per-page |
| L1 | Pages (RSC) | `app/**/page.tsx` | Compose sections, read data via queries, await async props | Data-read bugs are fixed in `lib/queries.ts`, not in components |
| L2 | Client islands | `components/site/*` (`"use client"`) | Interactivity: forms, filters, carousel, gallery, menu | Server is the source of truth; islands hold only UI/draft state |
| L3 | Mutations | `actions/inquiry.ts` | Validate → rate-limit → persist; typed results | Never throw across the boundary; always return `ActionResult<T>` |
| L4 | Data access | `lib/{db,queries}.ts`, `prisma/*` | Prisma client, DTO mapping, schema, seed | One client singleton; DTOs are the only shapes pages see |

### 3.2 Annotated Directory Structure

```text
real-estate-agency/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← fonts, metadata, sonner toaster
│   │   ├── globals.css             ← THE design system (tokens + brand classes)
│   │   ├── page.tsx                ← home: hero, featured, neighborhoods, services, advisors, testimonials, parallax
│   │   ├── not-found.tsx           ← editorial 404
│   │   ├── properties/page.tsx     ← listings; awaits searchParams; renders filter bar + grid
│   │   ├── property/[id]/page.tsx  ← detail; gallery, stats, features, map, sticky inquiry
│   │   ├── sell/page.tsx           ← seller hero, coverage checklist, contact form
│   │   ├── about/page.tsx          ← legacy, advisors (DB), credentials, community, contact
│   │   ├── login/page.tsx          ← credentials sign-in (Google gated by env)
│   │   ├── privacy|terms|accessibility/page.tsx ← LegalPage wrapper
│   │   └── api/auth/[...nextauth]/route.ts      ← the ONLY route handler
│   ├── actions/
│   │   ├── inquiry.ts              ← submitInquiry + subscribeNewsletter (Server Actions)
│   │   └── inquiry.test.ts         ← action integration tests (real DB)
│   ├── components/
│   │   ├── site/                   ← header, footer, hero-search, property-card, stamps,
│   │   │                              property-gallery, inquiry-form(+toast), properties-filters,
│   │   │                              testimonial-carousel, parallax-image, newsletter-form,
│   │   │                              legal-page, reveal (client boundary for motion)
│   │   └── ui/                     ← shadcn primitives (select, input, textarea, sonner…)
│   ├── lib/
│   │   ├── db.ts                   ← Prisma singleton
│   │   ├── queries.ts              ← DTO types + read functions + filter engine
│   │   ├── constants.ts            ← canonical filter lists, neighborhoods, site facts
│   │   ├── format.ts               ← formatPrice / formatSqft / parseJsonArray
│   │   ├── auth.ts                 ← NextAuth options (credentials + optional Google)
│   │   └── format.test.ts          ← unit tests for helpers + constants
│   └── types/next-auth.d.ts        ← session user.id augmentation
├── prisma/
│   ├── schema.prisma               ← Property, Agent, Testimonial, Inquiry, User
│   └── seed.ts                     ← idempotent upserts + demo login user
├── public/media/                   ← hero video, neighborhoods, page imagery, 30 listing photos, agent portraits
├── docs/screenshots/               ← dev-server captures for documentation
├── .env.example                    ← every variable with documented defaults
├── AGENTS.md / CLAUDE.md / README.md / Project_Architecture_Document.md
└── eslint.config.mjs · tsconfig.json · vitest.config.ts · package.json
```

### 3.3 Critical Code Patterns

**Pattern 1 — Server Action result union (the mutation contract)**

```ts
// src/actions/inquiry.ts — every mutation returns this shape; nothing throws.
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> } };

// Why this pattern: client components branch on `ok` and render either the
// success toast or field-level errors; test code asserts codes directly;
// internal failures are logged server-side with context but never leak
// details to the browser.
```

**Pattern 2 — DTO mapping at the data boundary**

```ts
// src/lib/queries.ts — DB rows never reach components; DTOs decode JSON columns.
function toPropertyDto(p: Property): PropertyDto {
  return { ...p, images: parseJsonArray(p.images), features: parseJsonArray(p.features), createdAt: p.createdAt.toISOString() };
}
// Why: JSON-text columns (SQLite portability, ADR-003) are decoded exactly
// once, dates are serialized once, and every consumer gets stable types.
```

**Pattern 3 — URL-derived filters (no state-sync effects)**

```tsx
// src/components/site/properties-filters.tsx
const filters = {
  search: searchParams.get("search") ?? "",
  type: searchParams.get("type") ?? "All Types",
  /* … */
};
const pushFilters = (overrides) => router.push(`/properties?${buildParams({ ...filters, ...overrides })}`);
// Why: the URL is the single source of truth — shareable views, working
// back/forward, and no `useEffect` state mirroring (lint-clean).
```

**Pattern 4 — Client boundary for motion in server pages**

```tsx
// src/components/site/reveal.tsx
"use client";
export function Reveal({ children, delay, duration, className }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} …>{children}</motion.div>;
}
// Why: framer-motion cannot run in Server Components; pages compose <Reveal>
// for scroll animations while staying server-rendered.
```

**Pattern 5 — Signature rotating stamp (brand-defining detail)**

```tsx
// src/components/site/stamps.tsx
<motion.svg viewBox="0 0 100 100" animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
  <circle cx="50" cy="50" r="50" fill={fill} />
  <text …><textPath href={`#${pathId}`}>{label}</textPath></text>
</motion.svg>
// Why: the original app's "NEW" / "OPEN HOUSE" circular stamps are part of
// its identity; reproducing them as SVG + motion keeps them crisp at any
// size and animates exactly like the source (20s linear rotation).
```

---

## 4. Data Architecture

### 4.1 Database Schema

```mermaid
erDiagram
    Property ||..o{ Inquiry : "propertyId (app-level ref)"
    User {
        string id PK
        string email UK
        string name
        string passwordHash
        string role
        boolean verified
        string verificationCodeHash
        datetime verificationCodeExpiresAt
        int verificationAttemptsLeft
        datetime createdAt
    }
    Property {
        string id PK
        string title UK
        string shortDescription
        string description
        int price
        int bedrooms
        int bathrooms
        int sqft
        int garage
        int yearBuilt
        string address
        string city
        string state
        string zipCode
        string neighborhood
        string location
        string propertyType
        string images
        string featuredImage
        string features
        string videoUrl
        boolean isFeatured
        boolean isHighPriority
        string status
    }
    Agent {
        string id PK
        string name
        string title
        string bio
        string photo
        int yearsExperience
        string totalSalesVolume
        string email UK
        string phone
        boolean isFeatured
    }
    Testimonial {
        string id PK
        string quote
        string clientName
        string propertyType
        string location
    }
    Inquiry {
        string id PK
        string fullName
        string email
        string phone
        string message
        string inquiryType
        string preferredDate
        string propertyId
        string propertyTitle
        string status
    }
```

### 4.2 Data Models

- **Property** — the listing aggregate. `images`/`features` are JSON-text
  arrays (decoded via `parseJsonArray`); `price` is integer USD; `location`
  drives the filter list; `isFeatured` selects the home page rail;
  `isHighPriority` toggles the rotating NEW stamp.
- **Agent** — advisor profiles; `isFeatured` picks the three on the home
  page; all agents render on /about.
- **Testimonial** — quote, client name, property type, location; newest five
  drive the auto-rotating carousel.
- **Inquiry** — the lead-capture record for property inquiries, the /sell
  contact form, the /about contact form, and newsletter subscriptions
  (sentinel fields: `fullName = "Newsletter Subscriber"`, `message =
  "Newsletter subscription"` — parity with the original app). `propertyId`
  is verified to exist inside the action before insert.
- **User** — credentials-auth user; the seed inserts the demo account with a
  bcrypt hash (cost 12).

### 4.3 Persistence Strategy

Reads: RSC pages call `queries.ts` functions; listing pages are
`force-dynamic`. Writes: Server Actions only, validated by Zod, rate-limited
(5 submissions / 60s / email in-process), wrapped in try/catch that logs
context and returns `INTERNAL` on unexpected failure. Seeding is idempotent —
properties upsert by `title`, agents by `email`, the demo user by `email`;
testimonials are cleared and re-created. `db:push` (not migrations) is the
documented local path; production may adopt `prisma migrate` once the
PostgreSQL provider switch is made.

---

## 5. Design System Reference

### 5.1 Typographic System

| Role | Family | Weights | Notes |
| --- | --- | --- | --- |
| Display / headings | Instrument Serif | 400 (+italic) | `--font-display-src`; sizes via `.text-display-xl` clamp(3rem→7rem) · `-lg` clamp(2.5→4.5rem) · `-md` clamp(2→3rem) · `-sm` clamp(1.5→2rem) |
| Body / UI | Inter | 300–600 | `--font-body`; labels use `.tracking-label` (0.15em) uppercase |

**v1.1 critical detail:** the next/font variable classes attach to `<html>`
(not `<body>`) — the `:root` tokens substitute at the html level, and
attaching them lower silently collapses the whole site to the system
sans-serif fallback. Guarded by `e2e/fonts.spec.ts`.

### 5.2 Color Tokens (`:root`, HSL)

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `30 20% 97%` | Warm editorial cream |
| `--foreground` | `0 0% 10%` | Near-black text / footer surface |
| `--primary` | `0 0% 10%` | Buttons |
| `--secondary` / `--muted` | `30 10% 90%` | Subtle surfaces |
| `--muted-foreground` | `30 5% 35%` | Secondary text |
| `--accent` | `35 65% 36%` | Bronze-gold accent (prices, active nav, icons) |
| `--border` | `30 12% 88%` | Hairlines and card borders |
| `--radius` | `9999px` | The pill geometry everything inherits |
| Stamp fills | `#FFFFA3` (NEW) · `#F2CC65` (OPEN HOUSE) · `#facca3` (light gold on dark) | Signature yellows |

Body text on `--background` and white on `--foreground` both exceed WCAG AA
contrast; accent is reserved for large/bold or non-essential decoration.

### 5.3 Component Primitives

Brand classes (in `globals.css`): `.ghost-btn` (pill, 1px foreground border,
transparent, uppercase, 0.1em tracking), `.ghost-btn-light` (white variant
for hero), `.hairline` (0.5px rule painting the visible beige `--border`
color, as on the original), `.tracking-editorial` (−0.02em),
`.tracking-label` (0.15em). Layout rhythm: `max-w-[1400px]`/`[1600px]`
containers with `px-[2%]`/`[4%]`, section padding `py-24 md:py-40`, header
`h-14 md:h-16` fixed. Page chrome: every content page wraps in
`div.min-h-screen.flex.flex-col` (fixed header · `main.flex-1` · footer) so
the footer pins to the viewport bottom on short pages; there is no global
`pt-24` — properties/legal own their `pt-32`/`pt-40` containers and the hero
is `h-screen` with `md:pt-[35vh]`. Note: `.ghost-btn`'s `hsl(var(--x))`
declarations are invalid at computed-value time, but their fallbacks
(transparent bg / currentColor border) reproduce the original's rendering
exactly — do not rewrite them; `.hairline` had the same pattern but its
transparent fallback diverged, so it references `var(--border)` directly.
The brand classes (including `.text-display-*`) are declared inside
`@layer components`, so Tailwind utilities override them — the hero H1's
`leading-[0.9]` beats `.text-display-xl`'s 1.05 line-height, which is why
the original's hero H1 measures 184px on desktop (sessions 1–5 missed this
because only H1 tops, not heights, were verified).
shadcn primitives (Select, Input, Textarea) carry the ORIGINAL's old
v1-style base classes (audited live): `focus-visible:ring-1` focus rings,
`shadow-sm`, no `data-slot` attributes, `SelectTrigger` without
`data-[size]:h-9` (usage `h-12` renders 48px), `SelectContent` `max-h-96`
with no scroll buttons and the v1 `py-1.5 pl-2 pr-8` item +
`span[aria-hidden]` indicator wrapper — pinned byte-level by
`e2e/primitives.spec.ts`; do not "upgrade" them to current shadcn defaults.
A `GlobalToastLayer` in the root layout replicates the original's empty
global toast container on every page except `/login` — on mobile it covers
the top 32px full-width (the menu opens only from the lower part of the
toggle, like the original); pinned by `e2e/toast-layer.spec.ts`.

### 5.4 Motion

framer-motion: hero fade-up (1s, 0.3s delay); scroll reveals (`<Reveal>`,
0.6s, 0.1s stagger); card image zoom (1.2s ease-out); rotating stamps (20s
linear); testimonial crossfade (0.5s, 4s auto-advance); parallax band
(scroll-linked −15%); header hide-on-scroll-down with 700ms transitions. All
motion is disabled under `prefers-reduced-motion` via the globals rule.

---

## 6. Security Architecture

### 6.1 Security Rules

| Rule | Enforcement |
| --- | --- |
| All action input validated (Zod) before persistence | `inquirySchema.safeParse` in `submitInquiry`; failures return `VALIDATION` with field errors |
| Public form abuse bounded | In-process rate limiter — 5 submissions / 60s / normalized email → `RATE_LIMITED` |
| No secrets in client bundles | Only `NEXT_PUBLIC_*` vars referenced client-side; auth secrets stay server-side |
| Passwords never stored or logged in clear | bcrypt (cost 12) hashes; logs record inquiry type/property id only, never payloads |
| Referential integrity for lead records | `propertyId` existence verified inside the action → `NOT_FOUND` for stale ids |
| CSRF posture | Server Actions are POST-only with Next's built-in action-id binding; NextAuth handlers carry their own CSRF tokens |
| Session security | JWT strategy, `NEXTAUTH_SECRET` signing, httpOnly cookies via NextAuth defaults |
| Dependency hygiene | `bun audit` before releases; lockfile committed |

### 6.2 Security Utilities

`bcryptjs` (hashing in seed + authorize), Zod (input contracts), the rate
limiter map in `src/actions/inquiry.ts`.

### 6.3 AuthN / AuthZ

Authentication: NextAuth v4 Credentials provider (email + bcrypt check
against `User`, **requiring `verified = true`**); optional Google provider
enabled only when both env keys exist and `NEXT_PUBLIC_GOOGLE_ENABLED="true"`.
Sessions: JWT strategy with `sub` carrying the user id; pages use no
session-gated views — matching the original app, where the public site is
identical signed-in or not.

The login card reproduces the original's five views — sign-in ·
reset-password (→ check-email) · create-account (→ verify-email). Backing
actions in `src/actions/auth.ts`: sign-up creates an unverified `User` and
issues a bcrypt-hashed 6-digit code (15-minute expiry, 5-attempt budget);
`verifyEmailWithCode` compares, decrements, and on success verifies + clears
the challenge, after which the client signs in with the captured
credentials; `resendVerificationCode` re-issues and restores the budget;
`requestPasswordReset` validates format and always succeeds (no
user-existence oracle — the original shows "Check your email" for any
well-formed address). Error copy is literal from the original. Outside
production the sign-up/resend actions return `devCode` (the plaintext code)
so dev and the test suites can complete verification without a mail
provider; production never returns it. Mail transport is deliberately out
of scope — no completion route past "Check your email" is observable on
the original.

Authorization: single `role` column reserved for future back-office gating;
no privileged surface exists yet, so no permission matrix is warranted
(YAGNI — revisit if an admin area is added).

### 6.4 Threat Model (surface-level)

| Threat | Mitigation |
| --- | --- |
| Form spam / flooding | Rate limiter + required fields + honeypot-ready structure |
| Injection via form fields | Prisma parameterized queries; no string interpolation into SQL; React escapes output |
| Credential stuffing on /login | bcrypt verify cost; failed sign-ins return a single generic error |
| Verification-code brute force | 6-digit code stored bcrypt-hashed; 5-attempt budget then fresh-code required; 15-minute expiry |
| Account enumeration via reset/reset-request | Reset always succeeds for well-formed emails (no oracle); sign-up duplicate error is the original's observable behavior |
| Stale-property inquiries | Existence check inside the action |
| Secret leakage | `.env` git-ignored; `.env.example` carries sentinels only; demo password is intentionally public demo data |

---

## 7. Testing Strategy

### 7.1 Test Distribution

| Level | Location | Count | Covers |
| --- | --- | --- | --- |
| Unit | `src/lib/format.test.ts` | 9 | Price/sqft formatting, JSON-array parsing, canonical constants and price-band contiguity |
| Unit (SEO) | `src/lib/seo.test.ts` | 11 | Site constants verbatim from the original; `pageMetadata()` full OG/Twitter emission, per-page description pattern, og:image/url/site-name, twitter card |
| Integration (actions, real DB) | `src/actions/inquiry.test.ts` | 7 | Validation paths, unknown inquiry type, not-found property, rate limiting, happy-path persistence, newsletter sentinel behavior |
| Integration (auth, real DB) | `src/actions/auth.test.ts` | 12 | Sign-up validation with literal original copy, duplicate detection, unverified user + hashed expiring code + 5-attempt budget, verify/clear challenge, resend budget reset, reset-request oracle-free behavior |
| Integration (queries, real DB) | `src/lib/queries.test.ts` | 15 | Filter-engine semantics (type/location/price-band boundaries/beds/search, conjunctive combos), neighborhood counts, hero option derivation |
| E2E (Playwright, real Chromium) | `e2e/*.spec.ts` | 75 | Font-cascade regression guard, original page titles, hero popover dropdowns + navigation params, property not-found inline state, filter URL round-trips + per-filter widths + zero-match empty state + Clear Filters, served meta layer (description/og:*/twitter:*/favicon), `sitemap.xml` + `robots.txt`, stray-API-route absence, inquiry/newsletter persistence to the DB (silent reset, no toast outside /login), the five-view auth card (transitions, literal error copy, OTP auto-advance, attempt countdown, login-only toaster scope), demo login, mobile menu, page-chrome/geometry guards (flex-column wrapper on 7 content pages, measured H1 viewport-tops, about structure incl. hairlines + parallax band, sell `#contact` anchor, visible hairline color), the legal pages' verbatim template copy (label, headings, lists, container geometry, exact typos), the hero H1 line-height cascade + mb-8 sentence offset + 48px filter selects + mobile filter pitch + v1-style primitive base classes (input/textarea/trigger/content/item, no data-slot attrs) + plain sell H1 + native validation + aria-label absence + newsletter structure (`e2e/primitives.spec.ts`), and the global empty toast layer (page coverage, /login exclusion, mobile top-32px blocking + lower-part menu opening, desktop bottom-right repositioning) (`e2e/toast-layer.spec.ts`) |

### 7.2 Test Patterns

Tests import production modules directly (no mocking of the DB or actions) —
asserting observable behavior: returned `ActionResult` codes and persisted
rows. Unique emails per case prevent cross-test rate-limit coupling; the
rate-limit test intentionally floods one address. The e2e suite runs against
the **production standalone build** by default (isolated distDir via
`PROD_DIST_DIR`, static assets staged at `standalone/<distDir>/static`, db
symlinked so the server and the test's PrismaClient share one SQLite file);
`E2E_BASE_URL` reuses an already-running server (e.g. dev).

### 7.3 Coverage Thresholds

Formal thresholds are not yet configured; the tested surface is the entire
mutation seam, the full query/filter engine, and the browser-level user
flows. Adding thresholds (e.g. 85% lines on `lib/` + `actions/`) is a
tracked task (see §10).

### 7.4 Pre-PR / Pre-Deploy Checklist

1. `bun run lint` — zero errors/warnings.
2. `bun run typecheck` — clean.
3. `bun run test` — all passing.
4. `bun run test:e2e` — all passing against the production build.
5. Browser-verify affected flows (hero search → filters incl. zero-match →
   detail → inquiry; the login card's five views with demo credentials;
   newsletter; mobile menu).
6. `tail dev.log` — no runtime errors from the session.
7. `bun audit` before deploys.

---

## 8. Build & Deployment

### 8.1 Production Build

```bash
bun install
bun run build   # next build (standalone output)
bun run start   # serves the standalone build
```

### 8.2 Environment Variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `file:../db/custom.db` | SQLite path (dev; Prisma-resolved against `prisma/schema.prisma` → `<repo-root>/db/custom.db`) or PostgreSQL URL (prod; switch provider first) |
| `NEXTAUTH_SECRET` | Yes | — | Session signing secret; generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Canonical origin for auth callbacks/redirects |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | No | `false` | `"true"` surfaces the Google button on /login |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Metadata `metadataBase`, OG/Twitter resolution, absolute `robots.txt` sitemap URL |

### 8.3 Docker Configuration

None shipped. The app is a standard Next.js standalone build; the reference
stack's `postgres:17-alpine` compose pattern applies directly when the
PostgreSQL switch is made (see §10).

### 8.4 CI/CD Pipeline

No hosted CI yet (no `.github/workflows`); the local gate — lint →
typecheck → test → browser spot-check — is the release gate, per the repo's
operator contract. Adding GitHub Actions running the same three commands is
a tracked task.

---

## 9. Developer Handbook

### 9.1 Local Setup

```bash
bun install
cp .env.example .env
bun run db:push && bun run db:seed
bun run dev          # http://localhost:3000
```

Demo login: `sepnetflix2023@outlook.com` / `$Abcd1234`.

### 9.2 Common Commands

| Command | Location | Purpose |
| --- | --- | --- |
| `bun run dev` | repo root | Dev server on :3000, logs to `dev.log` |
| `bun run lint` / `typecheck` / `test` | repo root | Quality gates |
| `bun run db:push` | repo root | Sync schema to DB |
| `bun run db:seed` | repo root | Idempotent demo data |
| `bunx vitest run <file>` | repo root | Single test file |

### 9.3 Code Style Rules

- TypeScript strict; no `any`; `import type` for types.
- Server Components by default; `"use client"` only for interactive leaves.
- Brand tokens/classes over ad-hoc values; no `tailwind.config.js`.
- Mutations only via Server Actions returning `ActionResult<T>`.
- Comments explain why; conventional commits, atomic scope.

### 9.4 Git Workflow

`main` only; Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`);
never commit `.env`, `db/*.db`, logs, or scratch material.

---

## 10. Known Issues & Outstanding Tasks

| Priority | Issue | Impact | Status |
| --- | --- | --- | --- |
| Low | No CI workflow (`.github/workflows`) | Gate relies on local runs | Open |
| Low | No coverage thresholds wired into Vitest | Coverage unenforced | Open |
| Low | `Inquiry.propertyId` is app-level (not a DB FK) | Orphaned rows possible if a property is deleted | Open (accepted under SQLite portability, ADR-003) |
| Low | Rate limiter is in-process | Resets on restart; not shared across instances | Open (acceptable at demo scale; move to DB-backed window if deployed multi-node) |
| Info | Original's og:description truncates to "…experien." (builder bug) | Clone ships the complete word — intentional fidelity deviation | By design (v1.2) |
| Info | Next 16 renders sitemap priority `1.0` as `1` and normalizes `User-agent` casing | Byte-level diff vs original's sitemap/robots; semantically identical to crawlers | By design (v1.2) |
| Info | Signup ("Need an account?") opens the original's create-account → verify-email flow | Registration is real (unverified User + 6-digit code); mail transport is out of scope, so outside production the code is returned as `devCode` | By design (v1.3) |
| Info | Inquiry form success shows NO toast | The original mounts its sonner Toaster ONLY on /login (verified route-by-route); the form's toast() call is a no-op and the form silently resets — reproduced bug-for-bug | By design (v1.3) |
| Info | Password reset terminates at the "Check your email" view | No mail transport bundled; no completion route is observable on the original — deployment concern | By design (v1.3) |
| Info | framer-motion logs a scroll-container position warning in dev | Cosmetic console noise only | Accepted |
| Info | Google button always visible; without env keys it shows a setup notice instead of failing | Matches the original's always-visible button | By design (ADR-005, v1.1) |
| Info | Properties filters are URL-driven (original is state-driven after URL hydration) | Shareable/back-forward-correct views; entry points (hero, neighborhood cards) interplay identically | Intentional improvement (ADR-004) |
| Info | Legal pages ship the original's Wix-template placeholder copy verbatim | Includes boilerplate ("A legal disclaimer"), bracketed placeholders and the template's exact typos — fidelity over polish, pinned byte-level by `e2e/legal.spec.ts` | By design (v1.4) |
| Info | `.ghost-btn`'s `hsl(var(--x))` CSS is invalid at computed-value time | Its fallbacks (transparent bg, currentColor border) are exactly what the original renders — the "bug" is load-bearing; only `.hairline` was fixed to `var(--border)` | By design (v1.4) |
| Info | Global empty toast container blocks the top 32px on mobile (incl. the top of the hamburger toggle) | The original mounts this empty sonner-style wrapper on EVERY page — the menu opens only from the lower part of the button; reproduced bug-for-bug and pinned by `e2e/toast-layer.spec.ts` | By design (v1.5) |
| Info | shadcn primitives intentionally use old v1-style bases (no `data-slot` attrs, `ring-1` focus, no scroll buttons) | Byte-matches the original's rendered classes; current-shadcn defaults diverge visibly (36px selects, 3px rings) — do not upgrade | By design (v1.5) |
| Info | The original exposes no aria-labels on chrome/filters/form fields | Accessibility parity follows the original's actual DOM; e2e locators use placeholders/text/CSS instead | By design (v1.5) |
| Info | Inquiry form uses NATIVE browser validation (no `noValidate`, no custom pre-submit error DOM) | Mirrors the original's client behavior; server-side Zod + rate-limit alerts still guard the action seam | By design (v1.5) |
| Info | Clone DB is seeded (12 properties, 5 advisors); the original's live DB is empty | Data-driven surfaces (listing grids, advisor cards, counts) differ only by content — structure is byte-identical | By design (demo seed) |

---

## 11. Key Files Reference

| File | Purpose |
| --- | --- |
| `src/app/globals.css` | The design system — tokens, brand classes, reduced-motion rule |
| `src/app/page.tsx` | Home page composition (hero → parallax) |
| `src/app/properties/page.tsx` | Listings page — awaits searchParams, renders filters + grid |
| `src/app/property/[id]/page.tsx` | Detail page — gallery, stats, features, map, sticky inquiry; inline not-found state |
| `src/app/login/page.tsx` | The original's five-view auth card (sign-in / reset / check-email / sign-up / verify-email) |
| `src/app/not-found.tsx` | The original's centered slate 404 inside the site chrome |
| `src/lib/seo.ts` | SEO helper — site constants + `pageMetadata()` (full OG/Twitter emission) |
| `src/app/sitemap.ts` | `/sitemap.xml` — the original's 7 public URLs with priorities |
| `src/app/robots.ts` | `/robots.txt` — allow-all + absolute sitemap reference |
| `src/actions/inquiry.ts` | The mutation seam — validation, rate limit, persistence |
| `src/actions/auth.ts` | Auth-flow actions — sign-up / verify / resend / reset-request (verification challenge) |
| `src/lib/queries.ts` | DTO types + all read functions + filter engine |
| `src/lib/constants.ts` | Canonical filter lists, hero sentinels, neighborhoods, site facts |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | NextAuth options |
| `src/components/site/site-header.tsx` | Scroll-hiding header (transparent at top on all routes), mobile menu |
| `src/components/site/legal-page.tsx` | Shared legal layout — the original's verbatim Wix-template copy structure (label, hairline-opened sections, dash lists, bracket suffixes) |
| `src/components/site/reveal.tsx` | Client-boundary scroll reveal (`yOffset` tunes the slide distance) |
| `src/components/site/parallax-image.tsx` | Full-bleed parallax band (home `section` 280/600px; about `div` 500/650px via `heightClassName`/`wrapperAs`) |
| `src/components/site/hero-search.tsx` | Video hero + sentence-style search |
| `src/components/site/hero-dropdown.tsx` | The hero's serif-italic popover dropdown |
| `src/components/site/property-card.tsx` | Listing card with hover reveal + stamps |
| `src/components/site/stamps.tsx` | Rotating NEW / OPEN HOUSE SVG badges |
| `src/components/site/properties-filters.tsx` | URL-driven filter bar |
| `src/components/site/global-toast-layer.tsx` | Fidelity artifact — the original's EMPTY global toast container on every page except /login (mobile top-32px blocking included) |
| `src/components/site/inquiry-form.tsx` | Lead-capture form (action-wired) |
| `prisma/schema.prisma` | Data model |
| `prisma/seed.ts` | Idempotent seed + demo user |
| `playwright.config.ts` | E2E config — production standalone webServer, PROD_DIST_DIR staging, db symlink |
| `e2e/` | Playwright suite — fonts, titles, hero, property detail, flows |
| `.env.example` | Environment contract |

---

## 12. Glossary

- **DTO** — Data Transfer Object; the serialized shape produced by
  `lib/queries.ts` and consumed by components.
- **ActionResult** — discriminated union returned by every Server Action
  (`ok: true` data or `ok: false` coded error).
- **Price band** — one of the five canonical label/min/max ranges powering
  price filtering.
- **Stamp** — the rotating circular "NEW"/"OPEN HOUSE" badge on listings.
- **Sentinel inquiry** — the Inquiry row shape representing a newsletter
  subscription (parity with the original app).
- **Reveal** — the client-boundary scroll-animation wrapper used by server
  pages.
