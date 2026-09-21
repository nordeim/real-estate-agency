import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  findRepoRoot,
  resolveDatabaseUrl,
} from "./db-path";

/**
 * Contract for the repo-root SQLite database (see .env.example):
 *
 * A RELATIVE `file:` URL is resolved against prisma/schema.prisma —
 * exactly like the documented Prisma semantics — so
 * `file:../db/custom.db` points at <repo>/db/custom.db for the running
 * server regardless of the process working directory. Absolute file
 * URLs and non-file URLs (e.g. postgresql://) pass through unchanged.
 *
 * Why this module exists: Prisma 6.19 resolves env-provided relative
 * `file:` URLs against the .env/package root (CLI) or process.cwd()
 * (client runtime) — both point OUTSIDE the repo when the process runs
 * from the repo root, silently placing the SQLite file in the parent
 * directory. These tests pin the intended semantics.
 */

// The directory containing prisma/schema.prisma, from this test file:
// <repo>/src/lib/db-path.test.ts → <repo>
const REPO_ROOT = path.resolve(__dirname, "../..");

describe("findRepoRoot", () => {
  it("finds the repo root from a nested working directory", () => {
    expect(findRepoRoot(path.join(REPO_ROOT, "src", "lib"))).toBe(REPO_ROOT);
  });

  it("finds the repo root from the repo root itself", () => {
    expect(findRepoRoot(REPO_ROOT)).toBe(REPO_ROOT);
  });

  it("returns undefined when no prisma/schema.prisma exists upward", () => {
    // /tmp has no prisma/schema.prisma above it on a normal filesystem.
    expect(findRepoRoot("/tmp")).toBeUndefined();
  });
});

describe("resolveDatabaseUrl", () => {
  it("resolves file:../db/custom.db against the schema dir (prisma/) — the repo-root db", () => {
    expect(resolveDatabaseUrl("file:../db/custom.db", REPO_ROOT)).toBe(
      `file:${path.join(REPO_ROOT, "db", "custom.db")}`
    );
  });

  it("resolves file:./db/custom.db against the schema dir — prisma/db, per documented semantics", () => {
    expect(resolveDatabaseUrl("file:./db/custom.db", REPO_ROOT)).toBe(
      `file:${path.join(REPO_ROOT, "prisma", "db", "custom.db")}`
    );
  });

  it("treats a bare file:db/custom.db (no ./) as relative to the schema dir", () => {
    expect(resolveDatabaseUrl("file:db/custom.db", REPO_ROOT)).toBe(
      `file:${path.join(REPO_ROOT, "prisma", "db", "custom.db")}`
    );
  });

  it("passes absolute file: URLs through unchanged", () => {
    const absolute = "file:/srv/maison/custom.db";
    expect(resolveDatabaseUrl(absolute, REPO_ROOT)).toBe(absolute);
  });

  it("passes non-file URLs (postgresql) through unchanged", () => {
    const pg = "postgresql://maison:secret@localhost:5432/maison_dev";
    expect(resolveDatabaseUrl(pg, REPO_ROOT)).toBe(pg);
  });

  it("passes undefined through unchanged (Prisma raises its own clear error)", () => {
    expect(resolveDatabaseUrl(undefined, REPO_ROOT)).toBeUndefined();
  });

  it("passes an empty string through unchanged", () => {
    expect(resolveDatabaseUrl("", REPO_ROOT)).toBe("");
  });

  it("resolves from process.cwd() when no anchor is given", () => {
    // vitest runs from the repo root, so the default anchor must find it.
    expect(resolveDatabaseUrl("file:../db/custom.db")).toBe(
      `file:${path.join(REPO_ROOT, "db", "custom.db")}`
    );
  });

  it("falls back to a passthrough when no repo root is discoverable", () => {
    // Outside a repo (e.g. a stripped standalone deployment) the URL is
    // left exactly as configured — absolute paths are the documented
    // production form there.
    expect(resolveDatabaseUrl("file:../db/custom.db", "/tmp")).toBe(
      "file:../db/custom.db"
    );
  });
});
