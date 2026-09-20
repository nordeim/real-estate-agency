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
exact design tokens; SQLite for zero-config local development with a
documented PostgreSQL production path; NextAuth v4 credentials auth seeded
with the original app's demo user.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the relevant pages, queries, actions, and schema before
   changing anything. Never assume from file names alone.
2. **PLAN** — State the smallest correct path before implementing.
3. **VALIDATE** — Confirm scope for anything touching money, auth, or the
   inquiry pipeline.
4. **IMPLEMENT** — Modular, typed, tested changes; follow existing patterns
   (DTOs from `queries.ts`, `ActionResult` from actions).
5. **VERIFY** — `bun run lint && bun run typecheck && bun run test`, then
   browser-verify the changed flow; check `dev.log` for runtime errors.
6. **DELIVER** — Report what was verified, what was reasoned, what remains.

### Project-Specific Principles

- The server is the source of truth: pages read via RSC query functions;
   mutations happen only in Server Actions.
- Money is integer USD; formatting happens at the presentation edge.
- The URL is the state for the /properties filters — no mirror state.
- Fidelity to the original app's design tokens is a feature: change
   `globals.css` tokens, not ad-hoc values in components.

## Implementation Standards

### General Coding Practices

- Early returns over nested conditionals; composition over inheritance.
- Self-documenting names; comments explain *why*, not *what*.
- Strict TypeScript; `unknown` over `any`; explicit error handling.
- Validate external input at the boundary (Zod in Server Actions).

### Language & Framework Guidelines

- **Next.js 16 App Router**: Server Components by default; `"use client"` only
  for interactive leaves (forms, carousels, header). `params`/`searchParams`
  are async — `await` them. Use `next/font/google`, `next/link`, Metadata API.
- **React 19**: function components, hooks; derive state instead of
  syncing with effects; no `forwardRef` needed.
- **Tailwind v4**: CSS-first — tokens in `globals.css` `@theme inline`; brand
  utility classes (`.ghost-btn`, `.text-display-*`) defined there; no config
  file.
- **Prisma**: schema in `prisma/schema.prisma`; client via `@/lib/db`;
  JSON-array columns parsed through `parseJsonArray`.
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

### Build Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Dev server on port 3000 (logs to `dev.log`) |
| `bun run lint` | ESLint (Next.js core-web-vitals + TS rules) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest unit/integration suite |
| `bun run db:push` | Apply schema to the database |
| `bun run db:seed` | Idempotent seed (12 properties, 5 advisors, 5 testimonials, demo user) |

## Testing Strategy

### Test Pyramid

- **Unit**: pure helpers (`src/lib/format.test.ts`) — formatting, JSON-array
  parsing, canonical constants.
- **Integration**: Server Actions (`src/actions/inquiry.test.ts`) run against
  the real SQLite DB — validation paths, rate limiting, not-found guards,
  happy path persistence.
- **E2E (manual/browser)**: hero search → filtered listings → property detail
  → inquiry form; login with demo credentials; newsletter subscription;
  mobile menu. Use a browser automation tool and confirm DB rows.

### Test Commands

```bash
bun run test                          # all
bunx vitest run src/lib/format.test.ts  # one file
```

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
- Forms render field-level errors from action `fieldErrors`; the inquiry
  success path surfaces a toast via `sonner`.

## Communication & Documentation

- Explain *why* in comments and commit messages.
- Document assumptions and constraints where they're made.
- Architecture rationale lives in `Project_Architecture_Document.md`;
  agent-facing commands live in `AGENTS.md`; don't duplicate between them.

## Project-Specific Standards

### Architecture

Single Next.js app: `src/app/**` pages, `src/components/site/**` UI,
`src/lib/**` data + helpers, `src/actions/**` mutations, `prisma/**` schema
and seed. Public assets under `public/media/`.

### API Design

No REST for UI mutations. NextAuth route handler under
`/api/auth/[...nextauth]` is the only API surface.

### Database / Data Layer

Models: `Property`, `Agent`, `Testimonial`, `Inquiry`, `User`. Reads via
`src/lib/queries.ts` (typed DTOs); writes via Server Actions. Enums are
string columns validated by constants/Zod (SQLite-friendly, PG-portable).

### Environment Variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLite file or Postgres URL | `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | Session signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App canonical origin | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth | (empty = hidden) |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | Show Google button on /login | `false` |
| `NEXT_PUBLIC_SITE_URL` | Metadata/OG origin | `http://localhost:3000` |

## Anti-Patterns to Avoid

- REST endpoints for UI mutations; client-side global data fetching.
- Float money; hard-coded filter lists; `JSON.parse` on DB columns inline.
- `new PrismaClient()` outside `@/lib/db`.
- framer-motion imported in Server Components.
- A `tailwind.config.js` (Tailwind v4 is CSS-first here).
- Weakening lint/type gates or skipping tests to ship.
