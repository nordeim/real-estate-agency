# AGENTS.md — MAISON ESTATE (Real Estate Agency)

Instructions for coding agents working in this repository. Every line answers
"would an agent likely miss this without help?" — anything else lives in the
README or the Project Architecture Document (PAD).

## Commands

| Task | Command |
| --- | --- |
| Install | `bun install` |
| Dev server | `bun run dev` (port 3000, logs to `dev.log`) |
| Lint | `bun run lint` |
| Typecheck | `bun run typecheck` |
| Unit tests | `bun run test` (Vitest, real SQLite DB required) |
| Single test file | `bunx vitest run src/lib/format.test.ts` |
| DB push schema | `bun run db:push` |
| DB seed | `bun run db:seed` (idempotent — upserts by natural keys) |
| Full reset | delete `db/custom.db` → `bun run db:push && bun run db:seed` |

Gate order before considering work done: **lint → typecheck → test**, then
browser-verify the affected flow (see Verification below).

## Stack facts agents get wrong

- **Next.js 16 App Router.** `params` / `searchParams` are **Promises** — always
  `await` them in pages. Never read them synchronously.
- **Prisma + SQLite.** Array columns are stored as JSON strings
  (`Property.images`, `Property.features`) — parse with
  `parseJsonArray()` from `src/lib/format.ts`; never `JSON.parse` inline.
- **DB client** comes from `@/lib/db` (a globalThis singleton). Never
  instantiate `new PrismaClient()` elsewhere.
- **Tailwind v4, CSS-first.** There is no `tailwind.config.js` and there must
  never be one. Tokens live in `src/app/globals.css` under `@theme inline` /
  `:root`. The brand classes `.ghost-btn`, `.ghost-btn-light`, `.hairline`,
  `.tracking-label`, `.tracking-editorial`, `.text-display-{xl,lg,md,sm}` are
  plain CSS defined in `globals.css` — use them instead of re-deriving values.
- **Fonts** load via `next/font/google` (Instrument Serif + Inter) and are
  exposed as `--font-display-src` / `--font-body`. Do not import Google Fonts
  by `<link>`.
- **Server-only mutations.** All writes go through Server Actions in
  `src/actions/` returning `ActionResult<T>` — never add REST route handlers
  for UI mutations. Read paths are RSC query functions in `src/lib/queries.ts`.
- **framer-motion needs a client boundary.** In Server Components use the
  `<Reveal>` wrapper (`src/components/site/reveal.tsx`); only `"use client"`
  components may import `motion` directly.

## Domain conventions

- Money is integer USD (`Property.price`); format with `formatPrice()`
  (and `compactPrice` on cards).
- Filter option lists (types, locations, price bands, beds, inquiry types)
  are canonical in `src/lib/constants.ts` — never hard-code them in
  components. The properties filter bar is URL-driven: filters derive from
  `searchParams`, commits push new URLs (shareable, back/forward-safe).
- Newsletter subscriptions persist as `Inquiry` rows with the sentinel fields
  `fullName: "Newsletter Subscriber"`, `inquiryType: "General"` — this mirrors
  the original app and is intentional.
- The demo login user (`sepnetflix2023@outlook.com` / `$Abcd1234`) is seeded
  in `prisma/seed.ts` with a bcrypt hash; it exists so the /login flow can be
  exercised locally. Do not remove it, and never commit a real password.

## Verification

- After any change, run the gate (`bun run lint && bun run typecheck && bun run test`).
- For UI changes, verify in a browser: home hero search → `/properties`
  filters → property detail → inquiry form (row lands in `Inquiry` table);
  `/login` with the demo credentials; footer newsletter.
- `bun run build` is available for production builds but the local dev
  workflow is `bun run dev`; check `dev.log` for runtime errors after
  browser sessions.

## Repo hygiene

- Never commit `.env` (only `.env.example`), `db/*.db`, `dev.log`, or
  `reference-ui/` (recon scratch material).
- Atomic conventional commits (`feat:`, `fix:`, `docs:` …), `main` branch only.
- Media under `public/media/` is part of the design — treat image paths in
  seed data as load-bearing.
