import { defineConfig, devices } from "@playwright/test";

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
 * Chromium only: the design depends on video/serif rendering verified in
 * Chromium; WebKit/Chrome channels can be added in CI.
 */
const PORT = Number(process.env.E2E_PORT ?? 3003);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

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
        // standalone/.next/static. The db directory is SYMLINKED (not
        // copied) so the server and the test's PrismaClient read/write the
        // same SQLite file — the DB assertions in flows.spec.ts depend on
        // it. In CI, real env vars come from the environment.
        command:
          "PROD_DIST_DIR=.next-e2e bunx next build && " +
          "cp -r .next-e2e/static .next-e2e/standalone/.next-e2e/ && " +
          "cp -r public .next-e2e/standalone/ && " +
          "(mkdir -p .next-e2e/standalone/db && " +
          "ln -sfn \"$(pwd)/db/custom.db\" " +
          ".next-e2e/standalone/db/custom.db) && " +
          `PORT=${PORT} HOSTNAME=127.0.0.1 bun .next-e2e/standalone/server.js`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 240_000,
      },
});
