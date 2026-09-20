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
        <form onSubmit={onSubmit} className="flex items-center gap-4 max-w-md">
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
            className="flex-1 bg-transparent border-b border-background/30 focus:border-background py-2 font-body text-sm text-background placeholder:text-background/50 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="Subscribe"
            className="p-2 text-background/70 hover:text-background transition-colors disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </form>
      )}
      {error && (
        <p className="font-body text-xs text-destructive-foreground/80 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
