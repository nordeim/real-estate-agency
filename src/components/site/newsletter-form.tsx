"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter } from "@/actions/inquiry";

/** Footer newsletter island — persists subscriptions as Inquiry records. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await subscribeNewsletter(email.trim());
      if (result.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        setError(result.error.message);
      }
    });
  };

  return (
    <div>
      {subscribed ? (
        <p
          className="flex items-center gap-2 font-body text-sm text-background/80"
          role="status"
        >
          <Check size={16} className="text-[#facca3]" aria-hidden />
          Thank you for subscribing.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex items-center border-b border-background/20 pb-2 max-w-md"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Your email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            className="flex-1 bg-transparent font-body text-sm text-background placeholder:text-background/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="Subscribe"
            className="ml-4 text-background/60 hover:text-background transition-colors disabled:opacity-50"
          >
            <ArrowRight size={18} aria-hidden />
          </button>
        </form>
      )}
      {error && (
        <p className="font-body text-xs text-background/60 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
