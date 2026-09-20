# Session 6 — Cascade & Primitive Parity Iteration

Continuing the iteration cycle from `docs/session_6.md` + `docs/session_7.md`.

## 1. Workspace refresh & document review

- Pulled upstream `12e892b` (adds `docs/session_7.md` — the session-5 raw execution log; HTTPS fetch + fast-forward as usual). Local == remote, tree clean at `5354930`'s successor.
- Meticulously re-read `AGENTS.md`, `CLAUDE.md`, `README.md`, PAD v1.4, `docs/session_6.md`, `docs/session_7.md`; re-validated the documented facts against the codebase (skills/ still excluded from tsconfig/eslint/vitest/playwright; baseline gates: lint ✓ tsc ✓ vitest 54/54 ✓ e2e layout+legal 15/15 ✓ on the dev server).
- Applied the user-mandated `.env` change: `DATABASE_URL="file:../db/custom.db"` — verified empirically: `prisma db push` resolves to `<repo-root>/db/custom.db` ✓, the running dev server reads the same file from any CWD (12 properties / 16 users render) ✓, `db/` sits at the repository root ✓, no hardcoded DB paths anywhere in `src/` ✓. Audit catch: `.env.example` + README + CLAUDE + PAD all documented the WRONG form (`file:./db` → would point at `prisma/db/`) — remediation item R9.

## 2. Live-target audit (fresh angles: mobile viewport, primitive internals, computed styles, a11y tree)

Logged in with the provided credentials; the target DB is still empty (0 PROPERTIES), no console errors anywhere. The audit went after the dimensions prior sessions covered least:

- **S7-1 HIGH — hero H1 line-height cascade bug.** The clone's `.text-display-xl` is UNLAYERED custom CSS (line-height 1.05), which BEATS Tailwind's utilities-layer `leading-[0.9]` on the home H1. On the target the utility wins → H1 184px desktop / 86px mobile; the clone rendered 215px / 101px → every hero element below drifted +31px desktop (+15px mobile). Missed by five sessions because only H1 TOPS were ever verified (both 280 = 35vh). Found by measuring mobile H1 heights (86 vs 101) and tracing the font-metric cause.
- **S7-2 HIGH — shadcn primitive bases diverge.** The clone shipped 2025-v4 defaults; the target renders old v1-style classes. Observable: `SelectTrigger`'s `data-[size]:h-9` beat the usage `h-12` → 36px filters instead of 48px (mobile filter row pitch 52 vs 64); `focus-visible:ring-[3px] ring-ring/50` vs `ring-1`; `data-slot` attrs; scroll-up/down buttons on SelectContent; v4 item indicator markup. All usage tails were already correct — only the bases needed the rewrite.
- **S7-3 MEDIUM — sell H1**: the clone wrapped "sell?" in an italic span; the target renders plain text (home/about H1s DO have the italic/not-italic nesting — sell does not).
- **S7-4 MEDIUM — global empty toast container.** The target mounts two nested empty `div.fixed.top-0.z-[100]…` divs on EVERY page (not just /login — a session-4 belief). On mobile it covers the top 32px full-width, blocking the top 24px of the hamburger toggle (the menu opens only from the lower part of the button — verified by tap-testing the target); on desktop it repositions to a bottom-right 420px slot and blocks nothing.
- **S7-5 MEDIUM — inquiry form validation**: the target has NO `noValidate` → native browser bubbles; the clone had custom Zod field errors client-side.
- **S7-6 LOW — clone-only aria-labels** on logo/nav/toggle/search/filters/form fields/newsletter (the target exposes none; its a11y tree resolves from placeholders/labels).
- **S7-7 LOW — newsletter button** extra `disabled:opacity-50`; **S7-8 LOW — toggle `text-foreground`** (reclassified no-action: the target's `text-foreground` is an invalid-hsl no-op that inherits white — rendered parity in all three states).
- **S7-9 DOCS —** the four db-path references (above). **S7-10 INFO —** class-string differences that render identically (legal paragraph margins, inquiry-form error-slot wrappers, the target's extra classless root div) — measured and closed.

## 3. TDD remediation (RED → GREEN per slice)

- **RED**: `e2e/primitives.spec.ts` (14 tests — hero line-height + sentence offset, 48px triggers, mobile filter pitch, byte-exact v1-style class strings for input/textarea/trigger/content/item, no data-slot attrs, plain sell H1, no noValidate, aria absence, newsletter structure) + `e2e/toast-layer.spec.ts` (5 tests — page coverage, /login exclusion, mobile blocking geometry, desktop repositioning, lower-part menu opening) → 14 failed as expected.
- **R1** `globals.css`: brand classes moved into `@layer components` → utilities win → the hero H1's `leading-[0.9]` beats `.text-display-xl` (the ONLY conflicting pairing — verified safe before applying; about/sell/legal H1s carry no leading utility and stay at 1.05 like the target).
- **R2** `input.tsx` / `select.tsx` / `textarea.tsx` rewritten to the target's exact v1-style base strings (audited live via rendered class-string extraction): `focus-visible:ring-1`, `shadow-sm`, no `data-slot`, no `data-[size]:h-9` on the trigger, `max-h-96` content with no scroll buttons, v1 `py-1.5 pl-2 pr-8` item + `span[aria-hidden]` indicator wrapper.
- **R3** sell H1 plain text; **R4** `GlobalToastLayer` in the root layout (empty container on every page except /login — the mobile top-32px blocking included, faithfully reproducing the original's actual UX); **R5** `noValidate` dropped (server-side Zod + rate-limit alerts stay); **R6** aria attrs stripped + 8 e2e locators migrated to placeholder/CSS+text (one needed `exact: true` — "Email" would substring-match the newsletter's "Your email address"); **R7** newsletter button class tail matches byte-for-byte.
- Test-debugging along the way: byte-exact class constants (a wrongly-merged `rounded-md`), `w-full` tail position from the explicit prop, Playwright's accname not resolving from combobox subtrees (switched to CSS+text filters), DOM-across-evaluate boundary errors, and a hydration-timing retry loop for the mobile-menu eval (the SSR button exists before React binds the handler).
- Three older tests were updated from the clone's previous behavior to the target-faithful interactions.

## 4. Verification ledger

lint ✓ · typecheck ✓ · **vitest 54/54** · **e2e 75/75 against the production standalone build** (58 prior + 17 new) · `.env` relative path re-verified end-to-end (CLI + runtime, repo-root `db/custom.db`) · 7 screenshots recaptured (01/02/03/04/05/06/08) and VLM-QA'd — hero tight leading visible, tall 48px filters visible, sell H1 plain, mobile chrome intact; one VLM false alarm ("missing card prices") resolved by proving the prices are `md:opacity-0 group-hover:opacity-100` BY DESIGN (matching the target) — DOM-verified plus an atomic Playwright hover-capture that reads "$11.5M" · docs aligned (PAD v1.5, README badge 54+75 + "Cascade & primitive parity" phase row, AGENTS/CLAUDE cascade + toast-layer + primitives-pin + no-aria facts) · `.env.example` corrected to `file:../db/custom.db` with the Prisma-relative resolution note.

## 5. Delivered

Amended the session's work into a single conventional commit on `main` and pushed via the SSH wrapper (`docs/ssh_git_wrapper_v3.py` per `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — key fingerprint verified, explicit `--remote git@github.com:nordeim/real-estate-agency.git`, dry-run → push → wrapper self-verification → independent HTTPS verification, key shredded).

**Suggested next steps**: a GitHub Actions CI workflow running the same four gates on every push, another parity pass whenever the base44 app gains real content (its DB is still empty), or wiring a real mail transport at the `devCode` seam.
