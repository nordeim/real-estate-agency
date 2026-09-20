"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Full-bleed parallax image band that closes the home page (as the original).
 */
export function ParallaxImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <section
      ref={ref}
      className="w-full h-[280px] md:h-[600px] overflow-hidden relative"
      aria-label={alt}
    >
      <motion.div
        className="absolute inset-0 w-full h-[140%] top-[-20%]"
        style={{ y }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
    </section>
  );
}
