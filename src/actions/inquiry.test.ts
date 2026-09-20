import { describe, it, expect } from "vitest";
import { submitInquiry, subscribeNewsletter } from "@/actions/inquiry";

/**
 * Server-action contract tests against the real (local) SQLite database —
 * validation paths, rate limiting, and the happy path.
 */

const validBase = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "415-555-0100",
  message: "Interested in a private viewing.",
  inquiryType: "Tour Request" as const,
  preferredDate: "",
};

describe("submitInquiry", () => {
  it("accepts a valid inquiry and persists it", async () => {
    const result = await submitInquiry({ ...validBase, email: "ok-action@example.com" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBeTruthy();
    }
  });

  it("rejects an invalid email with field errors", async () => {
    const result = await submitInquiry({ ...validBase, email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
      expect(result.error.fieldErrors?.email).toBeDefined();
    }
  });

  it("rejects an unknown inquiry type", async () => {
    const result = await submitInquiry({
      ...validBase,
      email: "type-check@example.com",
      inquiryType: "Unknown" as "Tour Request",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
    }
  });

  it("rejects an inquiry referencing a missing property", async () => {
    const result = await submitInquiry({
      ...validBase,
      email: "missing-prop@example.com",
      propertyId: "does-not-exist",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("rate-limits repeated submissions from one email", async () => {
    const email = "flood@example.com";
    type InquiryResult = Awaited<ReturnType<typeof submitInquiry>>;
    const results: InquiryResult[] = [];
    for (let i = 0; i < 7; i += 1) {
      results.push(await submitInquiry({ ...validBase, email }));
    }
    const limited = results.filter(
      (r) => !r.ok && r.error.code === "RATE_LIMITED"
    );
    expect(limited.length).toBeGreaterThan(0);
  });
});

describe("subscribeNewsletter", () => {
  it("subscribes with the newsletter sentinel fields", async () => {
    const result = await subscribeNewsletter("news@example.com");
    expect(result.ok).toBe(true);
  });

  it("rejects an empty email", async () => {
    const result = await subscribeNewsletter("");
    expect(result.ok).toBe(false);
  });
});
