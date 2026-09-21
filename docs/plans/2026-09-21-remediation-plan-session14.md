# Remediation Plan — 2026-09-21 (Session 14)

Continuation of the iteration cycle after `docs/session_12.md` (narrative)
and `docs/session_13.md` (operator log). This plan was drafted from a full
re-audit and every finding below was validated against the codebase before
inclusion. The `skills/` folder is excluded from checking, testing, and
compilation per the operator contract.

## 1. Audit results (validated against the codebase)

### 1.1 Workspace & baseline

- Fresh clone at `77dd2bb` (main). `.env` created per the documented
  contract (`DATABASE_URL="file:../db/custom.db"`), `db/custom.db` pushed
  + seeded at the repo root (12 properties / 5 advisors / 5 testimonials /
  demo user).
- Gates at baseline: **lint ✓ · typecheck ✓ · vitest 71/71 ✓ ·
  e2e 75/75 ✓** (production standalone build). The sandbox shell exports
  a stale absolute `DATABASE_URL` that shadows the repo `.env` (the
  documented per-command normalization is applied); NOTE: the very first
  `db:push`/`db:seed` run of this session hit exactly that shadowing and
  created the db OUTSIDE the repo — cleaned up and re-run normalized.
  That incident is finding F3 below.

### 1.2 Parity vs the live target (`real-estate-agency.base44.app`)

Audited live with agent-browser (login, desktop 1280×800 + mobile 375×667):

| Surface | Target behavior | Clone status |
| --- | --- | --- |
| Login → redirect | sign-in → homepage | ✅ matches (pinned by e2e/auth.spec.ts) |
| Hero dropdown DOM | triggers carry ONLY `class` — no aria/role/type | ✅ matches (pinned in e2e/primitives.spec.ts) |
| Hero H1 nesting | "Welcome to Your / Next Home" italic/not-italic | ✅ matches |
| /properties | title "Property Search", H1 "Our Listings", filter order Search → All Locations → All Types → Any Price → Any Beds, "N properties found" count element | ✅ matches |
| Footer CATEGORIES | links `Penthouses→?type=Penthouse`, `Waterfront`, `Modernist`, `Estates→?type=Estate` (class `font-body text-sm text-background/70 hover:text-background transition-colors`) | ✅ matches byte-for-byte (incl. singular hrefs) |
| Desktop "View Listings" | carries BOTH `text-xs` and `text-sm` (original quirk) | ✅ matches byte-for-byte — do not "fix" |
| Mobile toggle geometry | top 8 / bottom 48 / 40×40; center blocked by the empty toast layer | ✅ matches (pinned in e2e/toast-layer.spec.ts) |
| Mobile menu overlay | `div.fixed.inset-0.z-40.bg-background…` > nav > serif links + `ghost-btn` View Listings + category `<span>`s (Penthouses/Waterfront/Modernist Retreats/Estates) | ✅ matches **byte-for-byte** (DOM outerHTML compared this session) |
| Target DB | still empty ("0 properties found") | clone keeps its seeded demo data (documented by-design deviation) |

**Zero parity drift detected — no visual/functional remediation needed.**
(Note: an initial "Modernist vs Modernist Retreats" suspicion was resolved
— the FOOTER label is "Modernist", the MOBILE MENU span is "Modernist
Retreats"; the clone renders both correctly. The mobile-menu-open
screenshot 17 was re-captured from the clone this session.)

### 1.3 Findings (each verified in the tree)

| # | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| F1 | High | **~50 unused scaffold dependencies** — installed, locked, and shipped but never imported: 26 unused `@radix-ui/*` (only `react-select` is imported), `@dnd-kit/*` (3), `@mdxeditor/editor`, `@tanstack/react-query` + `react-table`, `@reactuses/core`, `@hookform/resolvers`, `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-intl`, `react-day-picker`, `react-hook-form`, `react-markdown`, `react-resizable-panels`, `react-syntax-highlighter`, `recharts`, `sharp` (no `next/image` usage), `uuid`, `vaul`, `zustand`, `z-ai-web-dev-sdk`, and the v3-era `tailwindcss-animate` (`tw-animate-css` is the one globals.css imports) | import-grep over `src/ e2e/ scripts/ prisma/` — all 0 matches; `src/components/ui/*` imports only `@radix-ui/react-select`, `lucide-react`, `next-themes`, `sonner`, `@/lib/utils`; `src/lib/utils.ts` uses `clsx` + `tailwind-merge` |
| F2 | Medium | `next.config.ts` ships `typescript.ignoreBuildErrors: true` — a scaffold escape hatch that masks type drift at the artifact boundary (the `typecheck` gate covers CI, but raw `next build` runs — e.g. a host building directly — skip type safety) | verified this session: production build passes cleanly with the flag flipped to `false` |
| F3 | Medium | `scripts/with-db.ts` silently honors an environment-exported absolute `DATABASE_URL` that points OUTSIDE the repo — this session's first `db:push`/`db:seed` created `db/custom.db` in the parent workspace before normalization. The wrapper's contract is "deterministic repo-root SQLite"; the misdirection is invisible (no log line, no warning) | reproduced live this session; wrapper code prefers `process.env.DATABASE_URL` over the repo `.env` |
| F4 | Low (follows) | Docs drift once F1–F3 land (README dependency notes, AGENTS.md wrapper note, PAD revision row, SKILL.md stack list, session-14 narrative) | — |

Non-findings (checked, no action): `.env.example` documents every env var
the code reads (grep-verified: DATABASE_URL, NEXTAUTH_*, GOOGLE_*,
NEXT_PUBLIC_GOOGLE_ENABLED, NEXT_PUBLIC_SITE_URL + test-only E2E_*);
tsconfig `next build` side-effect reverted; CI workflow YAML verified
byte-correct (`[main]` triggers — an early "corruption" suspicion was a
display artifact, disproven via `yaml.safe_load` + byte scan); seed
idempotent (upserts by natural keys); query engine, actions, filter bar,
property detail, and auth actions re-reviewed — no defects found;
`reactStrictMode: false` stays (documented decision — parity + framer-motion
dev double-effect risk); legal copy, toast layer, and primitive quirks are
pinned fidelity, untouched.

## 2. Remediation ToDo (TDD where testable)

- **R1 — Prune unused dependencies (fixes F1)**
  1. RED (inventory): the import-grep above IS the failing state — 50
     packages installed with zero imports (recorded in the plan table).
  2. GREEN: `bun remove` the verified-unused set (keep everything the
     app, gates, or CSS actually use: the 4 radix-select + prisma +
     auth/form/format stack, `tw-animate-css`, `sharp`'s removal is
     safe because no `next/image` usage exists, …full list in the
     commit message).
  3. VERIFY: `bun install` (lockfile consistency — CI runs
     `--frozen-lockfile`), then the full gate: lint → typecheck →
     test → test:e2e (the e2e suite builds the production standalone
     server — proving the pruned tree still builds and boots).
- **R2 — Enforce build type-checking (fixes F2)**
  1. GREEN directly (the flag flip is validated by the build itself):
     `ignoreBuildErrors: false` in `next.config.ts`.
  2. VERIFY: e2e run (its webServer runs `next build` with the flag
     active) + a direct `PROD_DIST_DIR` build already passed this
     session with the flag off.
- **R3 — Outside-repo DB warning (fixes F3)** — TDD
  1. RED: add `describeDatabaseTarget()` tests to
     `src/lib/db-path.test.ts` — outside-repo absolute `file:` URLs
     must produce a warning payload; repo-root URLs, relative URLs,
     and postgres URLs must not.
  2. GREEN: implement `describeDatabaseTarget()` in `src/lib/db-path.ts`
     (pure, no new imports) and consume it in `scripts/with-db.ts` to
     print the warning to stderr (non-blocking — absolute paths stay
     the documented production form).
  3. VERIFY: vitest suite green; a live reproduction (stale absolute
     env var) now prints the warning.
- **R4 — Screenshots refresh**: boot the dev server, re-capture the
  documented set into `docs/screenshots/` (01–08, 13, 17 — the mobile
  menu shot via the lower-part tap, geometry verified in-browser).
- **R5 — Docs alignment (fixes F4)**: README (dependency section note),
  AGENTS.md (wrapper warning behavior), PAD v1.8 (revision row, §2/§7
  notes), SKILL.md (§2 stack table note), `.env.example` re-verified
  (no change), and the session-14 narrative `docs/session_14.md`.
- **R6 — Commit + push**: atomic conventional commits on `main` only;
  push via `docs/ssh_git_wrapper_v3.py` per
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.

## 3. Execution order

R3 → R1 → R2 → R4 → R5 → R6 (R3 first — it touches the pinned
db-path contract tests while the tree is still pristine; R1/R2 are
independent code changes; R4/R5 after all code lands; R6 last).
