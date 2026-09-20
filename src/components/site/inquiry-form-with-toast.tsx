"use client";

import { toast } from "sonner";
import { InquiryForm } from "@/components/site/inquiry-form";

/**
 * Client wrapper that pairs the inquiry form with the success toast —
 * callbacks cannot cross the server/client boundary directly.
 */
export function InquiryFormWithToast(props: {
  propertyId?: string;
  propertyTitle?: string;
}) {
  return (
    <InquiryForm
      {...props}
      onSent={() =>
        toast("Inquiry Sent", {
          description: "We'll be in touch within 24 hours.",
        })
      }
    />
  );
}
