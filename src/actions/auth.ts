"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * Auth-flow Server Actions backing the original app's five-view login
 * card (sign-in · reset-password · check-email · create-account ·
 * verify-email). Mirrors the original's observable behavior:
 *
 * - Password reset always succeeds for a well-formed email — the
 *   original shows "Check your email" even for unregistered addresses
 *   (no user-existence oracle). Mail transport is a deployment concern;
 *   this action only validates.
 * - Sign-up creates a PENDING user (verified = false) with a
 *   bcrypt-hashed 6-digit code, a 15-minute expiry, and a 5-attempt
 *   budget. Outside production the action returns the code itself
 *   (`devCode`) so local dev and the test suites can complete the
 *   flow without a mail provider.
 * - Verification failure decrements the attempt budget and quotes the
 *   remaining count exactly as the original does.
 *
 * Error copy is literal on purpose: these strings were read off the
 * live original application.
 */

export type AuthActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: "VALIDATION" | "NOT_FOUND" | "RATE_LIMITED" | "INTERNAL";
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 15;
const CODE_MAX_ATTEMPTS = 5;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(200, "Email is too long");

const signUpSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

const verifySchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

function generateCode(): string {
  // 000000–999999, uniform, zero-padded.
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

async function issueCode(email: string): Promise<string> {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await db.user.update({
    where: { email },
    data: {
      verificationCodeHash: codeHash,
      verificationCodeExpiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000),
      verificationAttemptsLeft: CODE_MAX_ATTEMPTS,
    },
  });
  return code;
}

export async function signUpWithEmailAndPassword(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<
  AuthActionResult<{ email: string; devCode?: string }>
> {
  try {
    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        // The refine() mismatch has no field path — surface it as the
        // top-level message, exactly as the original renders it.
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
        }
        if (issue.message === "Passwords do not match") {
          return {
            ok: false,
            error: { code: "VALIDATION", message: issue.message },
          };
        }
      }
      const short = parsed.error.issues.find(
        (issue) => issue.message === "Password must be at least 8 characters long"
      );
      if (short) {
        return {
          ok: false,
          error: { code: "VALIDATION", message: short.message },
        };
      }
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "Please check your input",
          fieldErrors,
        },
      };
    }

    const { email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "A user with this email already exists",
        },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        email,
        passwordHash,
        name: null,
      },
    });
    const code = await issueCode(email);

    return {
      ok: true,
      data: {
        email,
        ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
      },
    };
  } catch {
    return {
      ok: false,
      error: { code: "INTERNAL", message: "Something went wrong. Please try again." },
    };
  }
}

export async function verifyEmailWithCode(input: {
  email: string;
  code: string;
}): Promise<AuthActionResult<{ verified: true }>> {
  try {
    const parsed = verifySchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: parsed.error.issues[0]?.message ?? "Invalid verification code.",
        },
      };
    }
    const { email, code } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.verificationCodeHash) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "No pending verification for this email.",
        },
      };
    }
    if (
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt.getTime() < Date.now()
    ) {
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "Verification code expired. Please request a new one.",
        },
      };
    }

    const valid = await bcrypt.compare(code, user.verificationCodeHash);
    if (!valid) {
      const attemptsLeft = Math.max((user.verificationAttemptsLeft ?? 1) - 1, 0);
      if (attemptsLeft === 0) {
        await db.user.update({
          where: { email },
          data: { verificationAttemptsLeft: 0 },
        });
        return {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many attempts. Please request a new code.",
          },
        };
      }
      await db.user.update({
        where: { email },
        data: { verificationAttemptsLeft: attemptsLeft },
      });
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: `Invalid verification code. ${attemptsLeft} attempts remaining.`,
        },
      };
    }

    await db.user.update({
      where: { email },
      data: {
        verified: true,
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
        verificationAttemptsLeft: null,
      },
    });
    return { ok: true, data: { verified: true as const } };
  } catch {
    return {
      ok: false,
      error: { code: "INTERNAL", message: "Something went wrong. Please try again." },
    };
  }
}

export async function resendVerificationCode(input: {
  email: string;
}): Promise<AuthActionResult<{ email: string; devCode?: string }>> {
  try {
    const parsed = emailSchema.safeParse(input.email);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "Please enter a valid email address",
          fieldErrors: { email: ["Please enter a valid email address"] },
        },
      };
    }
    const email = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.verified || !user.verificationCodeHash) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "No pending verification for this email.",
        },
      };
    }

    const code = await issueCode(email);
    return {
      ok: true,
      data: {
        email,
        ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
      },
    };
  } catch {
    return {
      ok: false,
      error: { code: "INTERNAL", message: "Something went wrong. Please try again." },
    };
  }
}

export async function requestPasswordReset(input: {
  email: string;
}): Promise<AuthActionResult<{ accepted: true }>> {
  const parsed = emailSchema.safeParse(input.email);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION",
        message: "Please enter a valid email address",
        fieldErrors: { email: ["Please enter a valid email address"] },
      },
    };
  }
  // Always accepted: the original shows "Check your email" for any
  // well-formed address — revealing registered emails would be an
  // account-enumeration oracle. Mail delivery is the deployment's
  // concern (no transport is bundled with the clone).
  return { ok: true, data: { accepted: true as const } };
}
