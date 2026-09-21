import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveDatabaseUrl } from "./src/lib/db-path";

/**
 * E2E config for the MAISON ESTATE (Real Estate Agency) clone.
 *
 * Runs against a production build by default (validates the shipped
 * artifact): `output: "standalone"` in next.config.ts lets the webServer
 * boot the standalone server directly on E2E_PORT.
 *
 * Env:
 *   E2E_PORT     — port for the webServer (default 3003; never 3000 — the
 *                  dev server owns that port in local sandboxes)
 *   E2E_BASE_URL — full base URL to reuse an already-running server
 *                  (e.g. the dev server) instead of building
 *
 * DATABASE_URL: before tests run, the value (from the environment or the
 * repo .env) is resolved to the repo-root SQLite file via
 * src/lib/db-path.ts and exported on process.env. The DB-asserting specs
 * (flows.spec.ts) instantiate a raw PrismaClient that anchors relative
 * file: URLs at the CWD — the resolved absolute URL makes them read the
 * same <repo>/db/custom.db the server under test writes to. The webServer
 * (and the standalone build inside it) inherits the same value.
 *
 * Chromium only: the design depends on video/serif rendering verified in
 * Chromium; WebKit/Chrome channels can be added in CI.
 */
const PORT = Number(process.env.E2E_PORT ?? 3003);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/** Minimal .env reader — DATABASE_URL only (comments and quotes handled). */
function databaseUrlFromRepoEnv(): string | undefined {
  try {
    const raw = readFileSync(path.join(__dirname, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env — fall through to the raw environment below
  }
  return undefined;
}

// Resolve the database URL BEFORE anything spawns: the specs' raw
// PrismaClient instances and the webServer (build + standalone server)
// must all read/write the same repo-root SQLite file.
const rawDatabaseUrl = process.env.DATABASE_URL ?? databaseUrlFromRepoEnv();
if (rawDatabaseUrl) {
  const resolved = resolveDatabaseUrl(rawDatabaseUrl);
  if (resolved) process.env.DATABASE_URL = resolved;
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // Build to an isolated dist dir (the dev server owns .next in
        // sandboxes), stage static assets next to the standalone server,
        // then boot it on E2E_PORT.
        // NOTE: with a custom distDir, Next 16's standalone output mirrors
        // the distDir NAME (standalone/.next-e2e/server/…), so static
        // assets must be staged at standalone/.next-e2e/static — NOT
        // standalone/.next/static. No db staging is needed: the server
        // resolves DATABASE_URL through src/lib/db-path.ts (repo-root
        // anchoring), and the webServer inherits the resolved absolute
        // URL resolved above. In CI, real env vars come from the
        // environment.
        command:
          "PROD_DIST_DIR=.next-e2e bunx next build && " +
          "cp -r .next-e2e/static .next-e2e/standalone/.next-e2e/ && " +
          "cp -r public .next-e2e/standalone/ && " +
          `PORT=${PORT} HOSTNAME=127.0.0.1 bun .next-e2e/standalone/server.js`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 240_000,
      },
});
