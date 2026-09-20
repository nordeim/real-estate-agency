"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NewStamp, OpenHouseStamp } from "@/components/site/stamps";

export interface PropertyGalleryProps {
  images: string[];
  alt: string;
  showBadge?: boolean;
  badgeType?: "new" | "openhouse";
}

/** Main 16:10 image with thumbnail rail, as the original detail page. */
export function PropertyGallery({
  images,
  alt,
  showBadge = false,
  badgeType = "new",
}: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="aspect-[16/10] overflow-hidden relative">
            <img
              src={current}
              alt={alt}
              className="w-full h-full object-cover"
            />
            {showBadge &&
              (badgeType === "openhouse" ? <OpenHouseStamp /> : <NewStamp />)}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-current={index === selected}
                  className={`flex-shrink-0 w-20 h-20 overflow-hidden transition-opacity ${
                    index === selected
                      ? "opacity-100 ring-1 ring-accent"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
