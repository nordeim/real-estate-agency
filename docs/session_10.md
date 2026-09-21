# Session 7 — Infra Hardening: Repo-Root DB Resolution & Test Determinism

Continuing the iteration cycle from `docs/session_8.md` (narrative) and
`docs/session_9.md` (raw log). This session's mandate: refresh the
workspace, re-validate the documented state against the codebase, drive
the repo to full visual/functional parity with the live original
(mobile navigation in particular), fix the database-path setup, wire the
Vitest/Playwright suites, and deliver a remediated, committed, pushed
codebase.

## 1. Workspace refresh & document review

- Fresh clone at `c372e45` (main); `AGENTS.md`, `CLAUDE.md`, `README.md`,
  PAD v1.5, `docs/session_8.md`, `docs/session_9.md` re-read in full and
  re-validated against the tree (skills/ excluded from lint/tsc/vitest/
  Playwright; e2e 75 + vitest 54 baseline claim spot-checked).
- Two upstream commits since the parity work: `ab13061` (session_9 raw
  log) and `b6f50eb`/`c372e45` — the latter updated `.env.example` to
  document `DATABASE_URL="file:../db/custom.db"` AND to reference
  `src/lib/db-path.ts`, `tests/db-path.test.ts`, and
  `docs/DEPLOYMENT.md §4` — **none of which existed**. That gap set this
  session's agenda.

## 2. Findings (all verified empirically before fixing)

- **F1 CRITICAL — the SQLite db lands OUTSIDE the repo on a fresh clone.**
  With a clean environment and `.env` carrying the documented
  `DATABASE_URL="file:../db/custom.db"`, `bun run db:push` created the
  database at `<repo-parent>/db/custom.db` (Prisma 6.19.2 anchors
  env-provided relative `file:` URLs at the package/.env root — the CLI —
  and at `process.cwd()` — the client runtime). Neither anchor is
  `prisma/schema.prisma`, so the documented semantics were fiction:
  a fresh `cp .env.example .env && bun run db:push && bun run db:seed`
  pollutes the parent directory and violates the repo-root `db/`
  contract. The `.env.example`'s promised `src/lib/db-path.ts` resolver
  had never been shipped.
- **F2 HIGH — `.env.example` references three non-existent artifacts**
  (`src/lib/db-path.ts`, `tests/db-path.test.ts`, `docs/DEPLOYMENT.md`).
  Also: `tests/` is git-ignored, so the documented test location was
  wrong for this repo's conventions (tests live beside source in `src/`).
- **F3 MEDIUM — the e2e webServer's db symlink staging was a workaround**
  for F1 (staging `db/custom.db` into the standalone tree), and the e2e
  runner's raw `PrismaClient` DB assertions depended on ambient env
  (in sandboxes, an injected absolute `DATABASE_URL`).
- **F4 MEDIUM — stray tracked scaffold** `download/README.md` ("Here are
  all the generated files.").
- **F5 (race) — two e2e regressions**: `filter select triggers are 48px`
  and `properties search input carries the original's base` failed
  intermittently (both failed in the first full run; one reproduced in
  isolation). Root cause: the /properties filter bar renders inside a
  `<Suspense>` boundary (`PropertiesFilters` uses `useSearchParams`,
  which deopts to client rendering), so a bare `page.evaluate` right
  after `page.goto` races the hydration window — reproduced at will
  (1-in-5 with a probe script: `readyState: complete`, comboboxes
  present, `main input` still null).
- **F9 (parity) — hero dropdowns carried aria attributes the original
  lacks.** Measured live on the target: triggers have ONLY `class` (no
  `aria-haspopup`/`aria-expanded`/`aria-label`, not even `type`), the
  popover is a plain div (no `role="listbox"`), options are plain
  buttons (no `role="option"`/`aria-selected`). The clone had all of
  them — the session-6 S7-6 aria strip had missed this component.
- **Mobile navigation re-verified against the live target**: toggle
  geometry identical on both sides (top 8, bottom 48, 40×40; center
  covered by the empty global toast layer; menu opens only from the
  lower part — reproduced by tap on both), overlay structure identical
  (Properties/Sell/About + VIEW LISTINGS + the four uppercase
  categories). Pinned by `e2e/toast-layer.spec.ts` and captured as
  `docs/screenshots/17-mobile-menu-open.png`.

## 3. TDD remediation (RED → GREEN per slice)

- **RED 1**: `src/lib/db-path.test.ts` (12 tests — schema-anchored
  relative `file:` resolution, bare-relative handling, absolute/Postgres
  passthrough, missing-env passthrough, nested-CWD root discovery,
  no-repo fallback) → failed (module absent), as expected.
- **GREEN 1**: `src/lib/db-path.ts` — pure node-builtin resolver
  (`findRepoRoot` walks up for `prisma/schema.prisma`;
  `resolveDatabaseUrl` anchors relative `file:` URLs at `<repo>/prisma`
  and passes everything else through). Env is read at the caller, never
  inside, so tests never depend on ambient state. Wired into
  `src/lib/db.ts` (`datasourceUrl`).
- **CLI wrapper**: `scripts/with-db.ts` loads `.env` when needed,
  resolves, and spawns the wrapped command with the absolute URL;
  `db:push`/`db:seed`/`db:migrate`/`db:reset` in `package.json` now run
  through it (`.gitignore` adjusted: `scripts/*` ignored except
  `with-db.ts`). Verified end-to-end: `rm -rf db && bun run db:push &&
  bun run db:seed` → `<repo>/db/custom.db` (12 properties / 5 agents /
  5 testimonials / demo user), nothing outside the repo. The 20
  previously-failing vitest DB tests went green (66/66).
- **Playwright config**: resolves `DATABASE_URL` (env or `.env`) through
  the resolver before anything spawns — the DB-asserting specs and the
  webServer share the repo-root file; the standalone-tree symlink
  staging was REMOVED (the app resolves its own path now).
- **RED 2 → GREEN 2 (race)**: the two failing specs plus two vulnerable
  siblings now `waitForSelector` the filter-bar elements before
  measuring; full e2e green twice (75/75, production build).
- **RED 3 → GREEN 3 (hero aria)**: byte-exact target-DOM assertions
  added to `e2e/primitives.spec.ts` (trigger carries ONLY class), then
  `hero-dropdown.tsx` stripped of `aria-haspopup`/`aria-expanded`/
  `aria-label`/`role`/`aria-selected`/`type` — the rendered DOM now
  matches the original attribute-for-attribute. All hero/primitives
  specs green (locators were already text-based, so nothing else broke).
- **Cleanup**: `download/README.md` removed from git (F4).

## 4. Verification ledger

- lint ✓ · typecheck ✓ · **vitest 66/66** (54 prior + 12 db-path) ·
  **e2e 75/75 against the production standalone build** (run twice —
  before and after the hero strip).
- Fresh-clone setup flow re-verified from scratch: `db:push` →
  `db:seed` → dev server renders data-driven content (12 property
  cards; featured rail; neighborhood counts) from `<repo>/db/custom.db`.
- Live-target parity spot-check with agent-browser: login redirect,
  homepage structure, filter bar order (Search → All Locations → All
  Types → Any Price → Any Beds), empty-state copy ("0 properties
  found" / "No properties match your criteria" / "Try adjusting your
  filters"), hero dropdown DOM attributes, and the mobile toggle/menu
  geometry — all matching.
- 10 screenshots captured against the dev server (01–08, 13, and the new
  17-mobile-menu-open) — the mobile-menu and hero captures VLM-verified
  (overlay links + VIEW LISTINGS + categories visible; hero heading and
  sentence search correct).
- Docs aligned: README (counts, quick-start db note, screenshot table,
  project-status rows), AGENTS.md (wrapper command facts, db-path
  contract, the hydration-race rule), CLAUDE.md (setup, test pyramid,
  e2e section), PAD v1.6 (revision row, §4.3 database location, §7/§8
  test/env tables, key files), `.env.example` (accurate references),
  new `docs/DEPLOYMENT.md`.

## 5. Delivered

Four atomic conventional commits on `main`, pushed via the SSH wrapper
(`docs/ssh_git_wrapper_v3.py` per
`docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — key fingerprint
verified, explicit `--remote git@github.com:nordeim/real-estate-agency.git`,
dry-run → push → wrapper self-verification → independent HTTPS
verification, operator key shredded).

**Suggested next steps**: a GitHub Actions CI workflow running the four
gates on every push (the local gate is still the only gate), a coverage
threshold wired into Vitest (PAD §7.3), or another parity pass whenever
the base44 app gains real content (its DB is still empty).
