/**
 * CLI wrapper for every command that touches the database.
 *
 * Loads .env (when DATABASE_URL is not already set), resolves the
 * repo-root SQLite location via src/lib/db-path.ts (schema-dir
 * semantics — `file:../db/custom.db` → <repo>/db/custom.db), then
 * spawns the wrapped command with the resolved absolute URL in its
 * environment. This makes the prisma CLI and the seed script
 * deterministic regardless of which anchor Prisma's internal
 * resolution would otherwise pick (see AGENTS.md).
 *
 * Usage (package.json scripts):
 *   tsx scripts/with-db.ts prisma db push --accept-data-loss
 *   tsx scripts/with-db.ts tsx prisma/seed.ts
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  describeDatabaseTarget,
  findRepoRoot,
} from "../src/lib/db-path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = findRepoRoot(__dirname);
if (!REPO_ROOT) {
  console.error(
    "with-db: could not locate the repo root (no prisma/schema.prisma found upward)."
  );
  process.exit(1);
}

/** Minimal .env parser — KEY="value" / KEY=value lines, # comments. */
function readDotEnvDatabaseUrl(envPath: string): string | undefined {
  let raw: string;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return undefined;
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
    if (!match) continue;
    return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return undefined;
}

const rawUrl =
  process.env.DATABASE_URL ??
  readDotEnvDatabaseUrl(path.join(REPO_ROOT, ".env"));

if (!rawUrl) {
  console.error(
    "with-db: DATABASE_URL is not set and .env defines no value — see .env.example."
  );
  process.exit(1);
}

const target = describeDatabaseTarget(rawUrl, REPO_ROOT);
if (target.warning) {
  // Surface env-injected misdirection (e.g. a stale exported absolute
  // DATABASE_URL that shadows the repo .env) instead of silently
  // writing outside the repo. Non-blocking by design.
  console.error(target.warning);
}
const resolved = target.url!;

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("with-db: no command given (e.g. `tsx scripts/with-db.ts prisma db push`).");
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  cwd: REPO_ROOT,
  env: { ...process.env, DATABASE_URL: resolved },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
