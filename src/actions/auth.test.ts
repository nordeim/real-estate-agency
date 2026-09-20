import { describe, it, expect, afterAll } from "vitest";
import {
  signUpWithEmailAndPassword,
  verifyEmailWithCode,
  resendVerificationCode,
  requestPasswordReset,
} from "@/actions/auth";
import { db } from "@/lib/db";

/**
 * Auth-flow contract tests against the real (local) SQLite database —
 * the sign-up / verify / resend / reset-request server actions that back
 * the original app's five-view login card. Error copy assertions are
 * literal because they mirror strings observed on the live original.
 */

const TEST_RUN = Date.now();

async function cleanup(email: string) {
  await db.user.deleteMany({ where: { email } });
}

afterAll(async () => {
  await db.user.deleteMany({
    where: { email: { contains: `auth-test-${TEST_RUN}` } },
  });
  await db.$disconnect();
});

describe("signUpWithEmailAndPassword", () => {
  const email = `auth-test-${TEST_RUN}-a@example.com`;

  afterAll(async () => cleanup(email));

  it("rejects a malformed email with a field error", async () => {
    const result = await signUpWithEmailAndPassword({
      email: "not-an-email",
      password: "LongEnough1!",
      confirmPassword: "LongEnough1!",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
      expect(result.error.fieldErrors?.email).toBeDefined();
    }
  });

  it("rejects a password shorter than 8 characters with the original copy", async () => {
    const result = await signUpWithEmailAndPassword({
      email,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe(
        "Password must be at least 8 characters long"
      );
    }
  });

  it("rejects mismatched confirmation with the original copy", async () => {
    const result = await signUpWithEmailAndPassword({
      email,
      password: "LongEnough1!",
      confirmPassword: "Different99!",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("Passwords do not match");
    }
  });

  it("creates an unverified user with a hashed, expiring 6-digit code and 5 attempts", async () => {
    const result = await signUpWithEmailAndPassword({
      email,
      password: "LongEnough1!",
      confirmPassword: "LongEnough1!",
    });
    expect(result.ok).toBe(true);

    const user = await db.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user?.passwordHash).not.toBe("LongEnough1!");
    expect(user?.verified).toBe(false);
    expect(user?.verificationCodeHash).toBeTruthy();
    expect(user?.verificationCodeHash).not.toMatch(/^\d{6}$/);
    expect(user?.verificationAttemptsLeft).toBe(5);
    expect(user?.verificationCodeExpiresAt).toBeInstanceOf(Date);
    expect(user?.verificationCodeExpiresAt!.getTime()).toBeGreaterThan(
      Date.now()
    );

    // Outside production the action returns the code so dev/test flows
    // (and this suite) can complete the verification step.
    if (result.ok && result.data.devCode) {
      expect(result.data.devCode).toMatch(/^\d{6}$/);
    }
  });

  it("rejects a duplicate email with the original copy", async () => {
    const result = await signUpWithEmailAndPassword({
      email,
      password: "LongEnough1!",
      confirmPassword: "LongEnough1!",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe(
        "A user with this email already exists"
      );
    }
  });
});

describe("verifyEmailWithCode", () => {
  const email = `auth-test-${TEST_RUN}-b@example.com`;

  afterAll(async () => cleanup(email));

  it("decrements attempts on a wrong code and quotes the remaining count", async () => {
    const signup = await signUpWithEmailAndPassword({
      email,
      password: "LongEnough1!",
      confirmPassword: "LongEnough1!",
    });
    expect(signup.ok).toBe(true);

    const wrong = await verifyEmailWithCode({ email, code: "000000" });
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) {
      expect(wrong.error.message).toBe(
        "Invalid verification code. 4 attempts remaining."
      );
    }
  });

  it("verifies the user with the correct code and clears the challenge", async () => {
    // The previous test already created this user and burned one attempt;
    // resending issues a fresh code (and restores the budget).
    const resend = await resendVerificationCode({ email });
    expect(resend.ok).toBe(true);
    const code = resend.ok ? resend.data.devCode ?? "" : "";

    const result = await verifyEmailWithCode({ email, code });
    expect(result.ok).toBe(true);

    const user = await db.user.findUnique({ where: { email } });
    expect(user?.verified).toBe(true);
    expect(user?.verificationCodeHash).toBeNull();
    expect(user?.verificationAttemptsLeft).toBeNull();
    expect(user?.verificationCodeExpiresAt).toBeNull();
  });

  it("rejects verification for an email with no pending signup", async () => {
    const result = await verifyEmailWithCode({
      email: `auth-test-${TEST_RUN}-none@example.com`,
      code: "123456",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("resendVerificationCode", () => {
  const email = `auth-test-${TEST_RUN}-c@example.com`;

  afterAll(async () => cleanup(email));

  it("issues a fresh code and restores the attempt budget", async () => {
    await signUpWithEmailAndPassword({
      email,
      password: "LongEnough1!",
      confirmPassword: "LongEnough1!",
    });
    await verifyEmailWithCode({ email, code: "000000" });
    await verifyEmailWithCode({ email, code: "000000" });

    const before = await db.user.findUnique({ where: { email } });
    expect(before?.verificationAttemptsLeft).toBe(3);

    const result = await resendVerificationCode({ email });
    expect(result.ok).toBe(true);

    const after = await db.user.findUnique({ where: { email } });
    expect(after?.verificationAttemptsLeft).toBe(5);
    expect(after?.verificationCodeExpiresAt!.getTime()).toBeGreaterThan(
      Date.now()
    );
  });

  it("rejects resend for an email without a pending signup", async () => {
    const result = await resendVerificationCode({
      email: `auth-test-${TEST_RUN}-missing@example.com`,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("requestPasswordReset", () => {
  it("rejects a malformed email with a field error", async () => {
    const result = await requestPasswordReset({ email: "nope" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
      expect(result.error.fieldErrors?.email).toBeDefined();
    }
  });

  it("always succeeds for a well-formed email — no user-existence oracle", async () => {
    const result = await requestPasswordReset({
      email: `unregistered-${TEST_RUN}@example.com`,
    });
    expect(result.ok).toBe(true);
  });
});
