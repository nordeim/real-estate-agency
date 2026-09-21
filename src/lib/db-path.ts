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
