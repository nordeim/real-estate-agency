import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Repo-root SQLite resolution (see .env.example and AGENTS.md).
 *
 * A RELATIVE `file:` DATABASE_URL is resolved against prisma/schema.prisma
 * — the classic Prisma-documented semantics — so `file:../db/custom.db`
 * points at <repo>/db/custom.db no matter the process working directory.
 *
 * Why this exists: Prisma 6.19 resolves env-provided relative `file:` URLs
 * against the .env/package root (CLI) or process.cwd() (client runtime).
 * Both point OUTSIDE the repo when commands run from the repo root, which
 * silently placed the SQLite file in the parent directory and broke the
 * fresh-clone setup flow (`cp .env.example .env && bun run db:push`).
 *
 * Deliberately dependency-free (node builtins only) so it can be imported
 * from the Next.js server runtime, Vitest tests, Playwright config, and
 * the tsx CLI wrapper alike. Never import Prisma or anything server-bound
 * here.
 */

const SCHEMA_MARKER = path.join("prisma", "schema.prisma");

/**
 * Walk upward from `from` (default: process.cwd()) looking for the
 * directory that contains prisma/schema.prisma — the repo root.
 * Returns undefined when no such directory exists (e.g. a stripped
 * standalone deployment).
 */
export function findRepoRoot(
  from: string = process.cwd()
): string | undefined {
  let dir = path.resolve(from);
  for (;;) {
    if (existsSync(path.join(dir, SCHEMA_MARKER))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

/**
 * Resolve a DATABASE_URL value to a deterministic form:
 *
 * - relative `file:` URLs are anchored at <repo>/prisma (schema-dir
 *   semantics), producing an absolute `file:` URL;
 * - absolute `file:` URLs and non-file URLs (postgresql://…) pass
 *   through unchanged — absolute paths are the documented production
 *   form;
 * - missing/empty values pass through so Prisma raises its own clear
 *   "Environment variable not found" error;
 * - when no repo root is discoverable from the anchor, the value is
 *   returned exactly as configured (standalone deployments must use
 *   absolute paths or Postgres — see docs/DEPLOYMENT.md).
 *
 * Pure: the env var is read by the caller (db client, CLI wrapper,
 * Playwright config) so tests never depend on ambient environment state.
 */
export function resolveDatabaseUrl(
  rawUrl: string | undefined,
  anchor: string = process.cwd()
): string | undefined {
  if (!rawUrl || !rawUrl.startsWith("file:")) return rawUrl;

  const filePath = rawUrl.slice("file:".length);
  if (path.isAbsolute(filePath)) return rawUrl;

  const root = findRepoRoot(anchor);
  if (!root) return rawUrl;

  return `file:${path.resolve(path.join(root, "prisma"), filePath)}`;
}

/**
 * A resolved database target plus the repo-root verdict the CLI wrapper
 * (scripts/with-db.ts) surfaces. Exists because an environment-exported
 * absolute `file:` URL pointing OUTSIDE the repo once silently redirected
 * `db:push`/`db:seed` there (a stale exported DATABASE_URL shadows the
 * repo `.env`); the wrapper now prints `warning` on stderr so the
 * misdirection is immediately visible. Non-blocking: absolute paths
 * remain the documented production form (docs/DEPLOYMENT.md §4).
 */
export interface DatabaseTarget {
  /** The resolved URL (exactly what resolveDatabaseUrl returns). */
  url: string | undefined;
  /** True only for a SQLite file: URL that resolves outside the repo. */
  sqliteOutsideRepo: boolean;
  /** Human-readable warning for outside-repo SQLite targets. */
  warning: string | undefined;
}

export function describeDatabaseTarget(
  rawUrl: string | undefined,
  anchor: string = process.cwd()
): DatabaseTarget {
  const url = resolveDatabaseUrl(rawUrl, anchor);
  const root = findRepoRoot(anchor);

  // No repo, no verdict — standalone deployments use absolute paths or
  // Postgres by design, and there is no repo to be outside of.
  if (!url || !url.startsWith("file:") || !root) {
    return { url, sqliteOutsideRepo: false, warning: undefined };
  }

  const filePath = path.resolve(url.slice("file:".length));
  const insideRepo =
    filePath === root || filePath.startsWith(root + path.sep);

  if (insideRepo) {
    return { url, sqliteOutsideRepo: false, warning: undefined };
  }

  return {
    url,
    sqliteOutsideRepo: true,
    warning:
      `with-db: DATABASE_URL resolves OUTSIDE the repo — ${filePath}\n` +
      `  The repo db lives at ${path.join(root, "db")} ` +
      `(DATABASE_URL="file:../db/custom.db").\n` +
      `  Using the configured value as-is (absolute paths are the ` +
      `documented production form — docs/DEPLOYMENT.md §4).`,
  };
}
