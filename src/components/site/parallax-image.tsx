"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Full-bleed parallax image band — closes the home page (section,
 * h-[280px] md:h-[600px]) and divides the about page's community and
 * contact sections (div, h-[500px] md:h-[650px]), as on the original.
 */
export function ParallaxImage({
  src,
  alt,
  heightClassName = "h-[280px] md:h-[600px]",
  wrapperAs = "section",
}: {
  src: string;
  alt: string;
  /** Band height classes — the two variants the original ships. */
  heightClassName?: string;
  /** The original's home band is a <section>, its about band a <div>. */
  wrapperAs?: "section" | "div";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  const Wrapper = wrapperAs;

  return (
    <Wrapper
      ref={ref}
      className={`w-full ${heightClassName} overflow-hidden relative`}
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
    </Wrapper>
  );
}
