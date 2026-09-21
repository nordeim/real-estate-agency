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
| Unit/integration tests | `bun run test` (Vitest, real SQLite DB required) |
| E2E tests | `bun run test:e2e` (Playwright — builds a standalone server on :3003; set `E2E_BASE_URL` to reuse a running one) |
| Single test file | `bunx vitest run src/lib/format.test.ts` |
| DB push schema | `bun run db:push` |
| DB seed | `bun run db:seed` (idempotent — upserts by natural keys) |
| Full reset | delete `db/custom.db` → `bun run db:push && bun run db:seed` |

All `db:*` commands except `db:generate` run through `scripts/with-db.ts`, which
loads `.env`, resolves the SQLite location to an absolute repo-root path via
`src/lib/db-path.ts`, and only then spawns the wrapped command. The Prisma
CLI/client would otherwise anchor relative `file:` URLs against the package
root or CWD — placing `file:../db/custom.db` OUTSIDE the repo on a fresh
clone.

Gate order before considering work done: **lint → typecheck → test →
test:e2e**, then browser-verify the affected flow (see Verification below).

## Stack facts agents get wrong

- **Next.js 16 App Router.** `params` / `searchParams` are **Promises** — always
  `await` them in pages. Never read them synchronously.
- **next/font variables must live on `<html>`, not `<body>`.** The `:root`
  tokens in `globals.css` (`--font-display-src` / `--font-body`) reference the
  next/font variables; custom-property substitution happens at the `html`
  level, so attaching them to `<body>` silently collapses the whole site to
  the system sans-serif fallback. Guarded by `e2e/fonts.spec.ts`.
- **Custom distDir mirrors its name inside standalone output.** With
  `PROD_DIST_DIR=.next-e2e`, the standalone server expects its files at
  `standalone/.next-e2e/` (not `standalone/.next/`) — static assets must be
  staged there (see `playwright.config.ts` webServer command).
- **Prisma + SQLite.** The db file lives at `<repo>/db/custom.db`.
  `DATABASE_URL="file:../db/custom.db"` (relative, Prisma-schema-anchored)
  is resolved deterministically by `src/lib/db-path.ts` — the app's Prisma
  client (`src/lib/db.ts`) and the `scripts/with-db.ts` CLI wrapper both
  call `resolveDatabaseUrl()`, and `playwright.config.ts` exports the
  resolved absolute URL for the e2e runner and webServer. Contract pinned
  by `src/lib/db-path.test.ts`. Never bypass the wrapper with a bare
  `prisma db push` — it will write outside the repo. Array columns are
  stored as JSON strings (`Property.images`, `Property.features`) — parse
  with `parseJsonArray()` from `src/lib/format.ts`; never `JSON.parse`
  inline.
- **DB client** comes from `@/lib/db` (a globalThis singleton). Never
  instantiate `new PrismaClient()` elsewhere (the e2e DB-assertions in
  `e2e/flows.spec.ts` are the one sanctioned exception — they must read the
  exact file the server writes).
- **Tailwind v4, CSS-first.** There is no `tailwind.config.ts` and there
  must never be one (it was deleted as inert scaffold weight). Tokens live
  in `src/app/globals.css` under `@theme inline` /
  `:root`. The brand classes `.ghost-btn`, `.ghost-btn-light`, `.hairline`,
  `.tracking-label`, `.tracking-editorial`, `.text-display-{xl,lg,md,sm}` are
  plain CSS defined in `globals.css` — use them instead of re-deriving values.
  They are declared inside `@layer components`, so Tailwind utilities WIN over
  them (e.g. the hero H1's `leading-[0.9]` beats `.text-display-xl`'s
  1.05 — the original's hero H1 is 184px on desktop precisely because of
  that cascade; do NOT move these classes back out of the layer). The
  `3xl` breakpoint (120rem) is declared in `@theme`.
- **Fonts** load via `next/font/google` (Instrument Serif + Inter) and are
  exposed as `--font-display-src` / `--font-body`. Do not import Google Fonts
  by `<link>`.
- **Server-only mutations.** All writes go through Server Actions in
  `src/actions/` returning `ActionResult<T>` — never add REST route handlers
  for UI mutations. The only route handler is NextAuth under
  `/api/auth/[...nextauth]` (a stray scaffold `/api` JSON route was removed —
  keep it that way). Read paths are RSC query functions in `src/lib/queries.ts`.
- **Metadata/SEO lives in `src/lib/seo.ts`** — pages call
  `pageMetadata({ title, path })` which emits the FULL openGraph/twitter
  objects (Next replaces a segment's objects wholesale, so a partial
  override would drop the root fields). `/sitemap.xml` and `/robots.txt`
  come from `src/app/sitemap.ts` / `src/app/robots.ts` (no static files —
  they would conflict). Note: Next 16's `MetadataRoute.Sitemap` key is
  `changeFrequency` (a `changefreq` key is silently dropped), and the
  serializer renders priority `1.0` as `1`.
- **The login card is a five-view state machine** (sign-in · reset ·
  check-email · create-account · verify-email) that mirrors the
  original app. The backing actions live in `src/actions/auth.ts`:
  sign-up creates an UNVERIFIED `User` (bcrypt-hashed 6-digit code,
  15-minute expiry, 5-attempt budget); `verifyEmailWithCode` verifies
  and clears the challenge; sign-in (`src/lib/auth.ts` authorize)
  rejects unverified users. Outside production the sign-up/resend
  actions return `devCode` so local flows (and the test suites) can
  complete verification without a mail provider — production NEVER
  returns it. Mail transport is deliberately out of scope: the
  original's reset flow terminates at the "Check your email" view
  and no completion route is observable.
- **The sonner Toaster is mounted ONLY on `/login`** (matching the
  original — verified route-by-route). `inquiry-form-with-toast.tsx`
  still calls `toast()` on success; without a mounted Toaster that is
  a silent no-op and the form just resets, exactly like the original.
  Do not move the Toaster back into `layout.tsx`. What the root layout DOES
  mount is `<GlobalToastLayer />` — the original's EMPTY global toast
  container, present on every page except `/login`
  (`src/components/site/global-toast-layer.tsx`): two nested
  `div.fixed.top-0.z-[100]…` divs with no content. On mobile it covers the
  top 32px full-width (blocking the top of the hamburger toggle — the menu
  opens only from the lower part of the button, like the original); on
  desktop it repositions to the bottom-right 420px slot where it blocks
  nothing. This is fidelity, not a bug — pinned by `e2e/toast-layer.spec.ts`.
- **framer-motion needs a client boundary.** In Server Components use the
  `<Reveal>` wrapper (`src/components/site/reveal.tsx`); only `"use client"`
  components may import `motion` directly. `<Reveal>` takes `yOffset`
  (default 24; the legal pages pass 16 to match the original's gentler
  entrance).
- **Page chrome is a flex column on every content page:**
  `div.min-h-screen.flex.flex-col > (fixed header · main.flex-1 · footer)`
  so the footer pins to the viewport bottom on short pages. There is NO
  universal `main.pt-24` — each page owns its own top padding
  (properties/legal wrap content in `pt-32`/`pt-40` containers, the hero is
  `h-screen` with `md:pt-[35vh]`). Guarded by `e2e/layout.spec.ts`, which
  also pins the measured H1 viewport-tops (properties 140 · sell 172 ·
  about 162 · legal 192 at 1280×576; the hero assertion is
  viewport-relative because 35vh scales with height).
- **Legal pages ship the original's Wix-template placeholder copy verbatim**
  (`src/components/site/legal-page.tsx` + the three page files) — including
  the "A legal disclaimer" boilerplate, "[only add if relevant]" italic
  suffixes (preceded by a space), dash-prefixed `ul.space-y-2` lists, and
  the exact template typos ("make sure you are", not "make sure that you
  are"). Fidelity over polish: do not "improve" this copy. Pinned
  byte-level by `e2e/legal.spec.ts`.
- **The about page structure is load-bearing:** `main > div.pt-32.pb-24`
  wrapping 8 children — hero · hairline · advisors · hairline · credentials
  · community · parallax band · contact. The band is a
  `div.h-[500px].md:h-[650px].overflow-hidden.relative` with a
  `h-[140%] top-[-20%]` parallax inner (`<ParallaxImage height>` override,
  image `public/media/pages/about-parallax.jpg`, alt "Luxury property").
- **The sell page's contact anchor is an empty `div#contact`** with inline
  `scroll-margin-top: 80px` rendered BEFORE the contact section (the
  section itself carries no id) — `/sell#contact` links land exactly like
  the original's. The sell H1 is PLAIN text ("Ready to sell?" — no italic
  span; the original's home/about H1s have the italic/not-italic nesting,
  sell does not).
- **The shadcn primitives in `src/components/ui/` are pinned to the
  ORIGINAL's old v1-style base classes** (audited live via rendered
  class-string extraction): `Input`/`Textarea` use `focus-visible:ring-1`
  focus rings (not v4's `ring-[3px] ring-ring/50`), `shadow-sm` (not
  `shadow-xs`), and NO `data-slot` attributes anywhere; `SelectTrigger` has
  no `data-[size]:h-9` (usage `h-12` must render 48px, not 36px);
  `SelectContent` uses `max-h-96` with NO scroll-up/down buttons and the
  v1 `py-1.5 pl-2 pr-8` item with `span[aria-hidden]` indicator wrapper.
  Do NOT "upgrade" them to current shadcn defaults — that divergence was
  the S7-2 remediation, pinned byte-level by `e2e/primitives.spec.ts`.
- **The original exposes NO aria-labels on chrome, filters, form fields,
  or the hero's sentence dropdowns** (logo, nav, mobile toggle, search
  input, filter selects, inquiry/newsletter fields, hero dropdown
  triggers/popover/options — none have them; the hero dropdown buttons
  carry ONLY their class, not even `type`). The clone matches: write
  e2e locators against placeholders/text/CSS, not aria-labels. The inquiry
  form also has NO `noValidate` — the original fronts the client with
  NATIVE browser validation (inputs are `required`, no custom error DOM
  pre-submit); server-side Zod validation and the rate-limit alert still
  guard the action seam.

## Domain conventions

- Money is integer USD (`Property.price`); format with `formatPrice()`
  (and `compactPrice` on cards).
- Filter option lists (types, locations, price bands, beds, inquiry types)
  are canonical in `src/lib/constants.ts` — never hard-code them in
  components. The properties filter bar is URL-driven: filters derive from
  `searchParams`, commits push new URLs (shareable, back/forward-safe).
  "Clear Filters" renders only when a filter deviates from its sentinel
  default and resets to bare `/properties`; a zero-match search renders
  the serif empty statement ("No properties match your criteria") —
  both mirror the original.
- The homepage hero search uses its own "Any X" sentinels (`HERO_DEFAULTS`,
  `HERO_*_OPTIONS`) and the custom popover dropdown
  (`src/components/site/hero-dropdown.tsx`) — the properties page uses the
  "All X" sentinels and Radix Selects. Same values, different labels —
  this mirrors the original app.
- Newsletter subscriptions persist as `Inquiry` rows with the sentinel fields
  `fullName: "Newsletter Subscriber"`, `inquiryType: "General"` — this mirrors
  the original app and is intentional.
- The demo login user (`sepnetflix2023@outlook.com` / `$Abcd1234`) is seeded
  VERIFIED in `prisma/seed.ts` with a bcrypt hash; it exists so the /login flow can be
  exercised locally. Do not remove it, and never commit a real password.

## Verification

- After any change, run the gate
  (`bun run lint && bun run typecheck && bun run test && bun run test:e2e`).
- E2E tests that measure DOM straight after `page.goto` MUST
  `waitForSelector` the element first when it lives inside the
  /properties filter bar — `PropertiesFilters` uses `useSearchParams`
  inside a Suspense boundary, so it streams/hydrates after the initial
  shell and a bare evaluate races that window (the primitives spec
  regressions from session 10 were exactly this race).
- For UI changes, verify in a browser: home hero search → `/properties`
  filters (incl. a zero-match search → empty state + Clear Filters) →
  property detail → inquiry form (row lands in `Inquiry` table, form
  resets silently — no toast outside /login); `/login` with the demo
  credentials; the forgot-password and sign-up → verify-email views;
  footer newsletter.
- `bun run build` is available for production builds but the local dev
  workflow is `bun run dev`; check `dev.log` for runtime errors after
  browser sessions.

## Repo hygiene

- Never commit `.env` (only `.env.example`), `db/*.db`, `dev.log`,
  `reference-ui/` (recon scratch material), `test-results/`, or
  `playwright-report/`.
- `src/components/ui/` intentionally contains ONLY the four primitives the
  app uses (input, select, sonner, textarea). Do not re-add the full shadcn
  catalog — 44 unused components were deleted as scaffold weight.
- Atomic conventional commits (`feat:`, `fix:`, `docs:` …), `main` branch only.
- Media under `public/media/` is part of the design — treat image paths in
  seed data as load-bearing.
