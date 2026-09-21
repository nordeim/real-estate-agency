# Session 14 — Dependency & Build Hardening: Pruning the Scaffold, Enforcing Types, Surfacing DB Misdirection

Continuing the iteration cycle from `docs/session_12.md` (narrative) and
`docs/session_13.md` (operator log). This session's mandate: refresh the
workspace, re-validate the documented state, re-audit parity against the
live original (mobile navigation in particular), then remediate the
codebase's genuine gaps — validated first against the tree — and deliver.

## 1. Workspace refresh & re-validation

- Fresh `git clone` (the sandbox workspace had been reset). `.env` created
  per the documented contract, `db:push` + `db:seed` re-run — the very
  first run silently created the db OUTSIDE the repo (the sandbox exports
  a stale absolute `DATABASE_URL` that shadows the repo `.env` — the
  documented per-command normalization applies). That incident became
  finding F3 and is now warned about by the wrapper.
- `AGENTS.md`, `CLAUDE.md`, `README.md`, PAD v1.7, and
  `real-estate-agency_SKILL.md` re-read in full; `session_12.md` /
  `session_13.md` cross-checked against the tree.
- Baseline gates: **lint ✓ · typecheck ✓ · vitest 71/71 ✓ · e2e 75/75 ✓**
  (production standalone build). The `next build` tsconfig side-effect
  was reverted per the established convention.

## 2. Parity re-audit vs the live original (agent-browser)

Logged in with the demo credentials (redirects to the homepage —
unchanged). Desktop (1280×800) + mobile (375×667) probes, with the
mobile-menu overlay compared as **outerHTML, byte for byte** this time:

| Surface | Result |
| --- | --- |
| Login → redirect | homepage (unchanged) |
| Hero dropdown triggers | ONLY `class` attribute — byte-parity holds |
| /properties | title "Property Search", H1 "Our Listings", filter order + count element identical |
| Footer CATEGORIES | `Penthouses → /properties?type=Penthouse`, `Waterfront`, `Modernist`, `Estates → ?type=Estate` — labels, hrefs, and class strings all identical |
| Desktop "View Listings" | carries the original's own `text-xs … text-sm` quirk — matched byte-for-byte |
| Mobile toggle geometry | top 8 / bottom 48 / 40×40 — identical to the pinned e2e values |
| Mobile menu overlay | `outerHTML` **byte-identical** (nav links, ghost-btn View Listings, category `<span>`s incl. "Modernist Retreats") |
| Target DB | still empty ("0 properties found") — clone keeps its seeded demo data (documented by-design deviation) |

An early "Modernist vs Modernist Retreats" suspicion was resolved as a
misread: the FOOTER link label is "Modernist" while the MOBILE MENU span
is "Modernist Retreats" — the clone renders both correctly. Also
disproved an apparent CI-workflow "corruption" (`branches: ain]`) as a
terminal display artifact — `yaml.safe_load` + a byte scan confirmed the
file is correct (`[main]` triggers, no ESC bytes).

**Zero parity drift — no visual/functional remediation required.**

## 3. Findings → fixes (validated against the codebase first)

| # | Finding | Fix delivered |
| --- | --- | --- |
| F1 | ~50 unused scaffold dependencies installed, locked, and shipped (26 unused `@radix-ui/*` — only `react-select` is imported; dnd-kit, `@mdxeditor/editor`, `@tanstack/*`, recharts, zustand, vaul, cmdk, uuid, date-fns, `z-ai-web-dev-sdk`, v3-era `tailwindcss-animate`, `sharp` (no `next/image` usage), …) | `bun remove` the verified-unused set → package.json now 15 runtime + 14 dev packages; `bun install --frozen-lockfile` clean; all gates re-verified green |
| F2 | `next.config.ts` shipped `typescript.ignoreBuildErrors: true` — a scaffold escape hatch masking type drift at the build boundary | flipped to `false` (verified: the production build type-checks clean — the e2e webServer build now enforces it on every run) |
| F3 | `scripts/with-db.ts` silently honored an env-injected absolute `DATABASE_URL` outside the repo (reproduced live this session) | `describeDatabaseTarget()` added to `src/lib/db-path.ts` (pure) + wired into the wrapper — prints a stderr warning with the resolved path and the repo-anchored hint; non-blocking (absolute paths stay the documented production form) |
| F4 | Docs drift after F1–F3 | README / AGENTS / CLAUDE / PAD v1.8 / SKILL.md aligned; this session doc |

A distillation error in `real-estate-agency_SKILL.md` was also fixed:
it claimed `embla-carousel-react` was "used by the property gallery" —
the gallery is a hand-rolled `useState` thumbnail rail; the package was
never imported and is now removed.

## 4. TDD execution

- **R3 (with-db warning, RED → GREEN):** 6 new `describeDatabaseTarget()`
  tests appended to `src/lib/db-path.test.ts` first — RED confirmed
  (6 failures: function absent) — then implemented in `src/lib/db-path.ts`
  (pure, no new imports) and consumed by `scripts/with-db.ts`. GREEN:
  18/18 in the file. Live verification: the exact stale-env reproduction
  from §1 now prints the warning; the normalized env stays silent.
- **R1 (dependency prune):** the import-grep over
  `src/ e2e/ scripts/ prisma/` was the inventory (every removed package
  had zero imports); the four gates + `bun install --frozen-lockfile`
  are the verification — 77/77 vitest and 75/75 e2e against the
  production standalone build of the pruned tree.
- **R2 (build type-checking):** validated directly by the build — a
  `PROD_DIST_DIR` build with the flag flipped passed cleanly before the
  change was kept, and every subsequent e2e run re-proves it.

## 5. Verification ledger

- lint ✓ (0 errors, 0 warnings) · typecheck ✓ · **vitest 77/77** (71 + 6
  db-path) · coverage gate unchanged (85/80/75/85 floors) · **e2e 75/75**
  (production build, type-checking enforced).
- 10 fresh dev-server screenshots captured (01–08, 13 empty-state,
  17 mobile-menu-open via the lower-part tap — toggle geometry verified
  in-browser before the shot). VLM-verified: hero (serif heading +
  sentence search + MAISON ESTATE header) and mobile menu (links + View
  Listings pill + all four category labels).
- Docs aligned: README (77 badge/counts, dependency-hygiene status row),
  AGENTS.md (wrapper warning behavior), CLAUDE.md (77 + infra-test
  description), PAD v1.8 (revision row, §7.1 distribution), SKILL.md
  (§2 stack + dependency-hygiene note, §3 build flag, Appendix B session
  row, QRC test count).
- Plan: `docs/plans/2026-09-21-remediation-plan-session14.md` (validated
  against the tree before execution).

## 6. Delivered

Atomic conventional commits on `main`, pushed via the SSH wrapper
(`docs/ssh_git_wrapper_v3.py` per
`docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — fingerprint verified,
dry-run → push → wrapper self-verification → independent ls-remote,
operator key shredded). No new branches.

**Suggested next steps**: watch the CI run on GitHub (the pruned tree
installs ~40% fewer packages — the runner should be faster), re-run the
parity audit whenever the base44 app gains real content, and consider a
`bun audit` gate if the deployment target hardens further.
