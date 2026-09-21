# Remediation Plan — 2026-09-21 (Session 12)

Continuation of the iteration cycle after `docs/session_10.md` /
`docs/session_11.md`. This plan was drafted from a full re-audit and
every finding below was validated against the codebase before inclusion.

## 1. Audit results (validated against the codebase)

### 1.1 Parity vs the live target (`real-estate-agency.base44.app`)

Audited live with agent-browser (login, desktop + mobile):

| Surface | Target behavior | Clone status |
| --- | --- | --- |
| Login → redirect | sign-in → homepage | ✅ matches (pinned by e2e/auth.spec.ts) |
| Hero dropdown DOM | triggers carry ONLY `class` — no aria/role/type | ✅ matches (pinned in e2e/primitives.spec.ts) |
| /properties filter order | Search → All Locations → All Types → Any Price → Any Beds | ✅ matches |
| Empty state | "0 properties found" + serif no-match statement | ✅ matches |
| Mobile toggle geometry | top 8 / bottom 48 / 40×40, center blocked by empty toast layer | ✅ matches (pinned in e2e/toast-layer.spec.ts) |
| Mobile menu | opens from the lower part; Properties/Sell/About/View Listings + Penthouses/Waterfront/Modernist Retreats/Estates | ✅ matches |
| Target DB | still empty (0 properties) | clone keeps its seeded demo data (documented by-design deviation) |

**Zero parity drift detected — no visual/functional remediation needed.**

### 1.2 Gates at baseline (this session, before changes)

lint ✓ · typecheck ✓ · vitest 66/66 ✓ · e2e 75/75 ✓ (production standalone
build). The only environment caveat: the sandbox shell carries a stale
absolute `DATABASE_URL` that shadows the repo `.env` (documented in
session_11); every gate command in this session normalizes it per block.

### 1.3 Findings (each verified in the tree)

| # | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| F1 | Medium | No CI workflow — the four-gate release check relies on local runs only | `.github/` absent; PAD §8.4 + §10 row 1 |
| F2 | Medium | No coverage thresholds wired into Vitest — coverage unenforced | `vitest.config.ts` has no `coverage` block; `@vitest/coverage-v8` not installed; PAD §7.3 + §10 row 2 |
| F3 | High (new requirement) | No `real-estate-agency_SKILL.md` distilled project skill | absent at repo root; required this session via `skills/to-distill-project-into-skill` + `skills/distill-codebase-skill` |
| F4 | Low (follows) | Docs drift once F1/F2 land (README testing section, AGENTS commands, CLAUDE.md pyramid, PAD revision row) | documented counts/commands change |

Non-findings (checked, no action): hydration-race guards present at all 4
vulnerable primitives spots + locator-based queries elsewhere; tsconfig
`next build` side-effect reverted; no stray tracked files; `.env` /
`.env.example` / `db/custom.db` all correct.

## 2. Remediation ToDo (TDD where testable)

- **R1 — Coverage thresholds (fixes F2)** — TDD
  1. Install `@vitest/coverage-v8` (done: 5.0.1).
  2. RED: `vitest run --coverage` to measure the actual per-file coverage
     of `src/lib/**` + `src/actions/**` (no enforcement exists yet).
  3. GREEN: add `test.coverage` to `vitest.config.ts` (v8 provider,
     include `src/lib/**` + `src/actions/**`, exclude test files) with
     thresholds set AT the measured floors (lines/functions/statements/
     branches); add a `test:coverage` script.
  4. VERIFY: `bun run test:coverage` passes with all 66 tests; the
     threshold table prints; a deliberately raised threshold fails
     (spot-check that the gate bites).
- **R2 — GitHub Actions CI (fixes F1)**
  1. `.github/workflows/ci.yml`: `push`/`pull_request` on `main`;
     `oven-sh/setup-bun@3`; `bun install` (frozen lockfile); create
     `.env` from `.env.example` + generate `NEXTAUTH_SECRET` inline;
     `bun run db:push && bun run db:seed`; `bunx playwright install
     --with-deps chromium`; then the four gates in order — lint →
     typecheck → test → test:e2e.
  2. Validate: YAML parses; every command byte-matches the locally
     verified gate commands; `skills/` stays outside the gates
     (it already is — eslint/tsconfig/vitest excludes).
- **R3 — `real-estate-agency_SKILL.md` (fixes F3)** — six-phase
  distillation per `skills/to-distill-project-into-skill`:
  ANALYZE (codebase archaeology incl. globals.css tokens, constants,
  queries, actions, component inventory, z-index usage) → PLAN (20
  sections mapped to files) → VALIDATE (every section has real content)
  → IMPLEMENT (section by section) → VERIFY (versions, counts, paths,
  hexes, no placeholders) → DELIVER (file at repo root).
- **R4 — Screenshots refresh**: boot the dev server, re-capture the
  documented pages into `docs/screenshots/` (01–08, 13, 17 incl. the
  mobile-menu capture), VLM-verify the hero + mobile-menu shots.
- **R5 — Docs alignment (fixes F4)**: README (testing section + CI
  mention), AGENTS.md (`test:coverage` command), CLAUDE.md (pyramid +
  CI), PAD v1.7 (revision row, §7.3 thresholds, §8.4 CI), and the
  session-12 narrative `docs/session_12.md`.
- **R6 — Commit + push**: atomic conventional commits on `main` only;
  push via `docs/ssh_git_wrapper_v3.py` per
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.

## 3. Execution order

R1 → R2 → R3 → R4 → R5 → R6 (R1/R2 are independent code changes; R3 is
the large documentation deliverable; R4/R5 depend on all code changes
landing first; R6 last).
