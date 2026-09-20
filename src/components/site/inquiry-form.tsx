"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry, type ActionResult } from "@/actions/inquiry";
import {
  INQUIRY_TYPES,
  INQUIRY_TYPE_LABELS,
} from "@/lib/constants";

export interface InquiryFormProps {
  propertyId?: string;
  propertyTitle?: string;
  onSent?: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  inquiryType: (typeof INQUIRY_TYPES)[number];
  preferredDate: string;
}

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  inquiryType: "Tour Request",
  preferredDate: "",
};

/**
 * Lead capture — mirrored from the original app's contact form.
 * Uses a Server Action; shows inline toasts via the parent's toaster.
 */
export function InquiryForm({ propertyId, propertyTitle, onSent }: InquiryFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const actionResult = await submitInquiry({
        ...form,
        propertyId,
        propertyTitle,
      });
      setResult(actionResult);
      if (actionResult.ok) {
        setForm(INITIAL);
        onSent?.();
      }
    });
  };

  const fieldError = (field: string) =>
    result && !result.ok && result.error.fieldErrors?.[field]?.[0];

  const inputClasses =
    "bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {propertyTitle && (
        <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-2">
          Inquiring about: {propertyTitle}
        </p>
      )}

      <div>
        <Input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          required
          aria-label="Full name"
          className={inputClasses}
        />
        {fieldError("fullName") && (
          <p className="text-xs text-destructive mt-1 font-body" role="alert">
            {fieldError("fullName")}
          </p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
          aria-label="Email"
          className={inputClasses}
        />
        {fieldError("email") && (
          <p className="text-xs text-destructive mt-1 font-body" role="alert">
            {fieldError("email")}
          </p>
        )}
      </div>

      <Input
        placeholder="Phone"
        value={form.phone}
        onChange={(event) => setForm({ ...form, phone: event.target.value })}
        aria-label="Phone"
        className={inputClasses}
      />

      <Select
        value={form.inquiryType}
        onValueChange={(value) =>
          setForm({ ...form, inquiryType: value as FormState["inquiryType"] })
        }
      >
        <SelectTrigger
          className={`w-full ${inputClasses}`}
          aria-label="Inquiry type"
        >
          <SelectValue placeholder="Select inquiry type" />
        </SelectTrigger>
        <SelectContent>
          {INQUIRY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {INQUIRY_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={form.preferredDate}
        onChange={(event) =>
          setForm({ ...form, preferredDate: event.target.value })
        }
        aria-label="Preferred date"
        className={inputClasses}
      />

      <Textarea
        placeholder="Your message..."
        value={form.message}
        onChange={(event) => setForm({ ...form, message: event.target.value })}
        rows={4}
        aria-label="Message"
        className="bg-transparent border-border/50 font-body text-sm resize-none rounded-[6px]"
      />

      {result && !result.ok && !result.error.fieldErrors && (
        <p className="text-sm text-destructive font-body" role="alert">
          {result.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="ghost-btn w-full text-center disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
