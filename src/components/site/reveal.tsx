"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-reveal wrapper for Server Components — framer-motion requires a
 * client boundary, so pages compose this instead of motion.div directly.
 * `fromX` slides in from the right (the original's icon-list rows).
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  className,
  fromX = false,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  fromX?: boolean;
}) {
  return (
    <motion.div
      initial={fromX ? { opacity: 0, x: 20 } : { opacity: 0, y: 20 }}
      whileInView={fromX ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
