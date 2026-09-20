"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeroDropdown } from "@/components/site/hero-dropdown";
import {
  HERO_DEFAULTS,
  HERO_TYPE_OPTIONS,
  HERO_LOCATION_OPTIONS,
  HERO_PRICE_OPTIONS,
} from "@/lib/constants";

/**
 * Sentence-style hero search: "I am looking for a [Type] in [Location] at
 * the price of [Price]" — glassmorphic pill over the video hero, with the
 * original's custom popover dropdowns (serif italic underlined labels).
 */
export function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState<string>(HERO_DEFAULTS.type);
  const [location, setLocation] = useState<string>(HERO_DEFAULTS.location);
  const [price, setPrice] = useState<string>(HERO_DEFAULTS.price);

  const onSearch = () => {
    const params = new URLSearchParams();
    if (type !== HERO_DEFAULTS.type) params.set("type", type);
    if (location !== HERO_DEFAULTS.location) params.set("location", location);
    if (price !== HERO_DEFAULTS.price) params.set("price", price);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden
      >
        <source src="/media/hero/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      <div className="relative z-10 h-full flex flex-col justify-center md:justify-start md:pt-[35vh] px-[4%] md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="font-display text-display-xl text-white font-light mb-8 max-w-4xl leading-[0.9]">
            Welcome to Your
            <br />
            <span className="italic">
              Next <span className="not-italic font-normal">Home</span>
            </span>
          </h1>

          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col md:inline-flex md:flex-row md:flex-wrap items-start md:items-center gap-2 md:gap-3 text-white font-body text-sm bg-black/20 backdrop-blur-md px-6 py-4 md:py-3 rounded-2xl md:rounded-full">
              <div className="flex items-center gap-2">
                <span className="text-white">I am looking for a</span>
                <HeroDropdown
                  label="Property type"
                  options={HERO_TYPE_OPTIONS}
                  value={type}
                  onChange={setType}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white">in</span>
                <HeroDropdown
                  label="Location"
                  options={HERO_LOCATION_OPTIONS}
                  value={location}
                  onChange={setLocation}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white">at the price of</span>
                <HeroDropdown
                  label="Price range"
                  options={HERO_PRICE_OPTIONS}
                  value={price}
                  onChange={setPrice}
                />
              </div>
            </div>

            <button type="button" onClick={onSearch} className="ghost-btn-light">
              Search Properties
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
