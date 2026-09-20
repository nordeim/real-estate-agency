"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { INQUIRY_TYPES } from "@/lib/constants";

/**
 * Server Actions are the only mutation seam in this app (no REST endpoints
 * for UI mutations). Actions return a typed ActionResult instead of throwing
 * across the boundary.
 */

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> } };

export type ErrorCode =
  | "VALIDATION"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "INTERNAL";

const inquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Please tell us your name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(200, "Email is too long"),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(2000, "Message is too long")
    .optional()
    .or(z.literal("")),
  inquiryType: z.enum(INQUIRY_TYPES),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .optional()
    .or(z.literal("")),
  propertyId: z.string().max(64).optional(),
  propertyTitle: z.string().max(200).optional(),
});

export interface InquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  inquiryType: (typeof INQUIRY_TYPES)[number];
  preferredDate?: string;
  propertyId?: string;
  propertyTitle?: string;
}

/** Naive per-process rate limit for unauthenticated form submissions. */
const submissionTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (submissionTimestamps.get(key) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  submissionTimestamps.set(key, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export async function submitInquiry(
  input: InquiryInput
): Promise<ActionResult<{ id: string }>> {
  try {
    if (isRateLimited(input.email.toLowerCase())) {
      return {
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many inquiries sent. Please try again in a minute.",
        },
      };
    }

    const parsed = inquirySchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
      }
      return {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "Please review the highlighted fields.",
          fieldErrors,
        },
      };
    }

    // Verify the referenced property exists (when provided) so the record
    // never points at a stale id.
    let propertyTitle = input.propertyTitle;
    if (input.propertyId) {
      const property = await db.property.findUnique({
        where: { id: input.propertyId },
        select: { title: true },
      });
      if (!property) {
        return {
          ok: false,
          error: { code: "NOT_FOUND", message: "This property is no longer available." },
        };
      }
      propertyTitle = property.title;
    }

    const inquiry = await db.inquiry.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message || null,
        inquiryType: parsed.data.inquiryType,
        preferredDate: parsed.data.preferredDate || null,
        propertyId: input.propertyId ?? null,
        propertyTitle: propertyTitle ?? null,
        status: "New",
      },
      select: { id: true },
    });

    return { ok: true, data: { id: inquiry.id } };
  } catch (error) {
    console.error("[action] submitInquiry failed", {
      inquiryType: input.inquiryType,
      hasPropertyId: Boolean(input.propertyId),
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error: {
        code: "INTERNAL",
        message: "We could not send your inquiry. Please try again shortly.",
      },
    };
  }
}

export async function subscribeNewsletter(
  email: string
): Promise<ActionResult<{ id: string }>> {
  return submitInquiry({
    fullName: "Newsletter Subscriber",
    email,
    inquiryType: "General",
    message: "Newsletter subscription",
  });
}
