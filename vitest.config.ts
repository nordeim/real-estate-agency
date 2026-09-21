import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30_000,
    // Coverage gate: run `bun run test:coverage`. Thresholds sit just
    // below the measured baseline (88.29% stmts / 82.31% branches /
    // 77.77% funcs / 87.75% lines at wiring time) so the floor bites
    // on regressions without failing on noise. Scope is the mutation
    // seam + read engine the unit/integration suites own
    // (src/lib + src/actions) — e2e covers the browser surface.
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**", "src/actions/**"],
      // Test files themselves, plus the NextAuth options module: its
      // authorize() path is browser-surface (demo login, unverified
      // rejection) pinned by e2e/auth.spec.ts, not unit-testable
      // without booting the Next server machinery.
      exclude: ["src/**/*.test.ts", "src/lib/auth.ts"],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 75,
        lines: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
