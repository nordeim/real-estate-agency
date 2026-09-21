import { describe, expect, it } from "vitest";

import { cn } from "./utils";

/**
 * The shadcn `cn` helper — clsx (conditional classes) + tailwind-merge
 * (conflict resolution). Guarded because the whole UI passes class lists
 * through it; a regression in merge semantics silently changes rendered
 * geometry (e.g. two competing `h-*` utilities surviving together).
 */
describe("cn", () => {
  it("joins plain class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy inputs", () => {
    expect(cn("a", undefined, null, false, "b")).toBe("a b");
  });

  it("flattens nested arrays and objects (clsx semantics)", () => {
    expect(cn(["a", { b: true, c: false }], "d")).toBe("a b d");
  });

  it("resolves tailwind conflicts — last conflicting utility wins", () => {
    // The load-bearing property: e.g. usage `h-12` must beat a base `h-9`.
    expect(cn("h-9", "h-12")).toBe("h-12");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("keeps non-conflicting utilities from the same pass", () => {
    expect(cn("px-3", "py-1")).toBe("px-3 py-1");
  });
});
