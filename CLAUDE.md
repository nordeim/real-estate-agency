IMPORTANT: File is read fresh for every conversation. Be brief and practical.

# MAISON ESTATE — Real Estate Agency

## Core Identity & Purpose

MAISON ESTATE is a luxury real estate agency website — a Next.js 16 clone of
`https://real-estate-agency.base44.app/` rebuilt to production standards. It
presents curated property listings (estates, penthouses, waterfront and
modernist residences), neighborhood expertise, advisor profiles, testimonials,
lead capture (inquiries + newsletter), and credentials auth. It is maintained
as a single-application TypeScript codebase with Prisma as the data layer.

Key technical decisions: App Router with RSC data reads and Server Actions as
the only mutation seam; Tailwind v4 CSS-first theming with the original app's
exact design tokens; a flex-column page chrome (`min-h-screen flex flex-col`
+ `main.flex-1`) on every content page with per-page top padding (no global
`pt-24`); legal pages that reproduce the original's Wix-template placeholder
copy verbatim; SQLite for zero-config local development with a
documented PostgreSQL production path; NextAuth v4 credentials auth seeded
with the original app's demo user; the original's five-view auth card
(reset / check-email / sign-up / verify-email) backed by validated server
actions with a bcrypt-hashed, attempt-limited email-verification challenge.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the relevant pages, queries, actions, and schema before
   changing anything. Never assume from file names alone.
2. **PLAN** — State the smallest correct path before implementing.
3. **VALIDATE** — Confirm scope for anything touching money, auth, or the
   inquiry pipeline.
4. **IMPLEMENT** — Modular, typed, tested changes; follow existing patterns
   (DTOs from `queries.ts`, `ActionResult` from actions).
5. **VERIFY** — `bun run lint && bun run typecheck && bun run test && bun run
   test:e2e`, then browser-verify the changed flow; check `dev.log` for
   runtime errors.
6. **DELIVER** — Report what was verified, what was reasoned, what remains.

### Project-Specific Principles

- The server is the source of truth: pages read via RSC query functions;
   mutations happen only in Server Actions.
- Money is integer USD; formatting happens at the presentation edge.
- The URL is the state for the /properties filters — no mirror state.
- Fidelity to the original app's design tokens is a feature: change
   `globals.css` tokens, not ad-hoc values in components.
- Parity can be accidental and still correct: `.ghost-btn`'s
   `hsl(var(--foreground))` declarations are invalid at computed-value time,
   but their fallbacks (transparent bg, currentColor border) are exactly
   what the original renders — leave them alone. `.hairline`'s identical
   pattern, however, fell back to transparent and diverged (the original
   paints a visible beige line), so it uses `var(--border)` directly.
   When in doubt, measure the original's computed styles before "fixing".

## Implementation Standards

### General Coding Practices

- Early returns over nested conditionals; composition over inheritance.
- Self-documenting names; comments explain *why*, not *what*.
- Strict TypeScript; `unknown` over `any`; explicit error handling.
- Validate external input at the boundary (Zod in Server Actions).

### Language & Framework Guidelines

- **Next.js 16 App Router**: Server Components by default; `"use client"` only
  for interactive leaves (forms, carousels, header, the login card's views).
  `params`/`searchParams`
  are async — `await` them. Use `next/font/google`, `next/link`, Metadata API
  via `pageMetadata()` from `src/lib/seo.ts` (emits the full OG/twitter
  objects — Next replaces them wholesale, partial overrides drop fields).
- **React 19**: function components, hooks; derive state instead of
  syncing with effects; no `forwardRef` needed.
- **Tailwind v4**: CSS-first — tokens in `globals.css` `@theme inline`; brand
  utility classes (`.ghost-btn`, `.text-display-*`) defined there inside
  `@layer components` (Tailwind utilities override them — the hero H1's
  `leading-[0.9]` beats `.text-display-xl`, matching the original's
  cascade); no config file.
- **Prisma**: schema in `prisma/schema.prisma`; client via `@/lib/db`;
  JSON-array columns parsed through `parseJsonArray`.
- **Auth flows**: the login card's views drive `src/actions/auth.ts`
  (sign-up → verify-email → sign-in; reset → check-email). Error copy is
  literal — it mirrors strings observed on the original. The sonner Toaster
  renders only on `/login` (original scope); toasts elsewhere are
  intentional no-ops. Every other page mounts the original's EMPTY global
  toast container (`GlobalToastLayer` in the root layout — on mobile it
  covers the top 32px, blocking the top of the hamburger toggle exactly
  like the original).
- **framer-motion**: only inside client components; use `<Reveal>` from
  `src/components/site/reveal.tsx` in server pages.

## Development Workflow

### Environment Setup

```bash
bun install
cp .env.example .env            # adjust if needed
bun run db:push && bun run db:seed
bun run dev                     # http://localhost:3000
```

The SQLite file lands at `<repo>/db/custom.db` regardless of the working
directory: `src/lib/db-path.ts` anchors the relative
`DATABASE_URL="file:../db/custom.db"` against `prisma/schema.prisma`
(Prisma-schema semantics) for the app client, and `scripts/with-db.ts`
wraps every `db:*` CLI command with the same resolution. Production
deployments should use an absolute path or PostgreSQL — see
`docs/DEPLOYMENT.md`.

### Build Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Dev server on port 3000 (logs to `dev.log`) |
| `bun run lint` | ESLint (Next.js core-web-vitals + TS rules) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest unit/integration suite |
| `bun run test:coverage` | Same suite + coverage thresholds (85/80/75/85) |
| `bun run test:e2e` | Playwright e2e (builds a standalone server on :3003; `E2E_BASE_URL` reuses a running one) |
| `bun run db:push` | Apply schema to the database (via `scripts/with-db.ts`) |
| `bun run db:seed` | Idempotent seed (12 properties, 5 advisors, 5 testimonials, demo user) |

## Testing Strategy

### Test Pyramid

- **Unit**: pure helpers (`src/lib/format.test.ts`, `src/lib/utils.test.ts`)
  — formatting, JSON-array parsing, canonical constants and price-band
  contiguity, `cn` class-merge semantics (conflict resolution guards the
  rendered geometry).
- **Integration (infra)**: `src/lib/db-path.test.ts` — the repo-root
  SQLite resolution contract (relative `file:` URLs anchor at
  `prisma/schema.prisma`; absolute/Postgres passthrough; missing env
  passthrough) and the `describeDatabaseTarget()` verdict the CLI
  wrapper surfaces when an env-injected absolute URL points outside
  the repo (stale-exported `DATABASE_URL` misdirection).
- **Integration**: Server Actions (`src/actions/inquiry.test.ts`,
  `src/actions/auth.test.ts`) and the query/filter engine
  (`src/lib/queries.test.ts`) run against the real SQLite DB — validation
  paths, rate limiting, not-found guards, happy-path persistence, filter
  semantics, and the full sign-up → verify challenge (attempts, expiry,
  clearing).
- **E2E (Playwright, `e2e/`)**: `bun run test:e2e` builds the production
  standalone server (isolated distDir via `PROD_DIST_DIR`) and drives a real
  Chromium — font rendering regression guards, page titles, hero dropdown
  behavior, filter navigation, the zero-match empty state + Clear Filters,
  inquiry/newsletter persistence to the DB, the five-view auth card
  (transitions, literal error copy, OTP auto-advance, attempt countdown,
  toaster scope), login with the demo credentials, the page-chrome/geometry
  guards (flex-column wrapper, measured H1 viewport-tops, about structure,
  `#contact` anchor, visible hairlines), the legal pages' verbatim
  template copy, the hero H1 line-height cascade + 48px filter selects +
  v1-style primitive base classes (`e2e/primitives.spec.ts`), and the
  global toast layer's page coverage + mobile blocking geometry
  (`e2e/toast-layer.spec.ts`). The runner resolves `DATABASE_URL` to the
  absolute repo-root path in `playwright.config.ts` so the DB-asserting
  specs and the webServer share one SQLite file.
- **SEO routes**: `e2e/metadata.spec.ts` guards the served meta layer
  (description, og:*, twitter:*, favicon link) and `e2e/seo-routes.spec.ts`
  guards `/sitemap.xml`, `/robots.txt`, and the absence of stray API routes.

### Test Commands

```bash
bun run test                            # all unit/integration (77 tests)
bun run test:coverage                  # + coverage floors: 85% stmts /
                                        # 80% branches / 75% funcs / 85%
                                        # lines over src/lib + src/actions
                                        # (src/lib/auth.ts excluded — its
                                        # authorize path is pinned by e2e)
bun run test:e2e                       # full e2e (production build, 75 tests)
E2E_BASE_URL=http://localhost:3000 \
  bun run test:e2e                     # e2e against a running dev server
bunx vitest run src/lib/format.test.ts # one file
```

CI (`.github/workflows/ci.yml`) runs the full gate sequence — lint →
typecheck → test:coverage → test:e2e — on every push and pull request to
`main` from a cold checkout (`.env` from the example, seeded db, Chromium
with system deps).

## Code Quality Standards

### Linting & Formatting

```bash
bun run lint
bun run typecheck
```

Both must be clean before commit. Do not disable rules to make a gate pass —
fix the issue or flag the debt explicitly.

## Git & Version Control

### Branching Strategy

Single `main` branch; push with `git push origin main`.

### Commit Standards

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Atomic commits — one logical change each, message explains *why*.
- Never commit `.env`, `db/*.db`, logs, or `reference-ui/`.

## Error Handling & Debugging

- Server Actions return `ActionResult<T>`; never throw across the boundary.
  Failures carry a code (`VALIDATION`, `RATE_LIMITED`, `NOT_FOUND`,
  `INTERNAL`) and a user-safe message.
- Check `dev.log` after browser sessions for runtime errors.
- Forms render field-level errors from action `fieldErrors`; the auth card
  renders action messages as its red/green alert blocks; the inquiry form
  resets silently on success (the original mounts no Toaster outside
  `/login`).

## Communication & Documentation

- Explain *why* in comments and commit messages.
- Document assumptions and constraints where they're made.
- Architecture rationale lives in `Project_Architecture_Document.md`;
  agent-facing commands live in `AGENTS.md`; don't duplicate between them.

## Project-Specific Standards

### Architecture

Single Next.js app: `src/app/**` pages, `src/components/site/**` UI,
`src/lib/**` data + helpers + SEO, `src/actions/**` mutations, `prisma/**`
schema and seed. Public assets under `public/media/`.

### API Design

No REST for UI mutations. NextAuth route handler under
`/api/auth/[...nextauth]` is the only API surface. `/sitemap.xml` and
`/robots.txt` are generated by `src/app/sitemap.ts` / `src/app/robots.ts`.

### Database / Data Layer

Models: `Property`, `Agent`, `Testimonial`, `Inquiry`, `User`. Reads via
`src/lib/queries.ts` (typed DTOs); writes via Server Actions. Enums are
string columns validated by constants/Zod (SQLite-friendly, PG-portable).
The `User` model carries the email-verification challenge columns
(`verified`, `verificationCodeHash`, `verificationCodeExpiresAt`,
`verificationAttemptsLeft`) — cleared on successful verification.

### Environment Variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLite file or Postgres URL | `file:../db/custom.db` (Prisma-relative; resolves to `<repo-root>/db/custom.db`) |
| `NEXTAUTH_SECRET` | Session signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App canonical origin | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth | (empty = hidden) |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | Show Google button on /login | `false` |
| `NEXT_PUBLIC_SITE_URL` | Metadata/OG/sitemap origin | `http://localhost:3000` |

## Anti-Patterns to Avoid

- REST endpoints for UI mutations; client-side global data fetching.
- Float money; hard-coded filter lists; `JSON.parse` on DB columns inline.
- `new PrismaClient()` outside `@/lib/db`.
- framer-motion imported in Server Components.
- A `tailwind.config.ts` (Tailwind v4 is CSS-first here) or re-adding unused
  shadcn components to `src/components/ui/` (only input/select/sonner/textarea
  are used).
- Weakening lint/type gates or skipping tests to ship.
