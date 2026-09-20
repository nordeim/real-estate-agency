"use client";

import { motion } from "framer-motion";

/**
 * Rotating circular stamps — the original app's signature listing badges.
 * A 20-second linear rotation; honors prefers-reduced-motion via globals.
 */
function RotatingStamp({
  fill,
  label,
  pathId,
}: {
  fill: string;
  label: string;
  pathId: string;
}) {
  return (
    <div className="absolute top-2 right-2 md:top-3 md:right-3 w-[75px] h-[75px] md:w-[95px] md:h-[95px] pointer-events-none z-10">
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <circle cx="50" cy="50" r="50" fill={fill} />
        <defs>
          <path
            id={pathId}
            d="M 50,50 m -33,0 a 33,33 0 1,1 66,0 a 33,33 0 1,1 -66,0"
          />
        </defs>
        <text
          style={{
            fontSize: "9px",
            fontFamily: "var(--font-body)",
            fill: "hsl(0, 0%, 10%)",
            fontWeight: 500,
            letterSpacing: "2.8px",
          }}
        >
          <textPath href={`#${pathId}`}>{label}</textPath>
        </text>
      </motion.svg>
    </div>
  );
}

export function NewStamp() {
  return <RotatingStamp fill="#FFFFA3" label="NEW  ·  NEW  ·  " pathId="circlePathNew" />;
}

export function OpenHouseStamp() {
  return (
    <RotatingStamp
      fill="#F2CC65"
      label="OPEN HOUSE  ·  OPEN HOUSE  ·  "
      pathId="circlePathOH"
    />
  );
}
