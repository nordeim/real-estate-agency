"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { TestimonialDto } from "@/lib/queries";

/** Auto-rotating success stories — 4s interval, manual prev/next. */
export function TestimonialCarousel({ testimonials }: { testimonials: TestimonialDto[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;
    const interval = setInterval(
      () => setIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1)),
      4000
    );
    return () => clearInterval(interval);
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  const previous = () =>
    setIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  const next = () =>
    setIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));

  const current = testimonials[index];

  return (
    <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-display text-display-lg font-light mt-3">
          Success <span className="italic">Stories</span>
        </h2>
      </div>

      <div className="max-w-3xl mx-auto relative">
        <Quote size={48} className="text-border mx-auto mb-8" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
            aria-live="polite"
          >
            <blockquote className="font-display text-xl md:text-2xl font-light leading-relaxed italic mb-8">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div>
              <p className="font-body text-sm font-medium">{current.clientName}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {current.propertyType && `${current.propertyType} · `}
                {current.location}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous testimonial"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-body text-xs text-muted-foreground">
              {index + 1} / {testimonials.length}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
