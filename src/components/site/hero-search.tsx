"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PROPERTY_TYPES, LOCATIONS, PRICE_BANDS } from "@/lib/constants";

/**
 * Sentence-style hero search: "I am looking for a [Type] in [Location] at
 * the price of [Price]" — glassmorphic pill over the video hero.
 */
export function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState("Any Type");
  const [location, setLocation] = useState("All Locations");
  const [price, setPrice] = useState("Any Price");

  const onSearch = () => {
    const params = new URLSearchParams();
    if (type !== "Any Type") params.set("type", type);
    if (location !== "All Locations") params.set("location", location);
    if (price !== "Any Price") params.set("price", price);
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
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSearch();
              }}
              className="flex flex-col md:inline-flex md:flex-row md:flex-wrap items-start md:items-center gap-2 md:gap-3 text-white font-body text-sm bg-black/20 backdrop-blur-md px-6 py-4 md:py-3 rounded-2xl md:rounded-full"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor="hero-type" className="text-white">
                  I am looking for a
                </label>
                <select
                  id="hero-type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="bg-transparent border-none outline-none text-white cursor-pointer font-body text-sm underline decoration-white/40 underline-offset-4 hover:decoration-white transition-colors"
                >
                  {PROPERTY_TYPES.map((option) => (
                    <option key={option} value={option} className="text-foreground">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor="hero-location" className="text-white">
                  in
                </label>
                <select
                  id="hero-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="bg-transparent border-none outline-none text-white cursor-pointer font-body text-sm underline decoration-white/40 underline-offset-4 hover:decoration-white transition-colors"
                >
                  {LOCATIONS.map((option) => (
                    <option key={option} value={option} className="text-foreground">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor="hero-price" className="text-white">
                  at the price of
                </label>
                <select
                  id="hero-price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="bg-transparent border-none outline-none text-white cursor-pointer font-body text-sm underline decoration-white/40 underline-offset-4 hover:decoration-white transition-colors"
                >
                  {PRICE_BANDS.map((band) => (
                    <option key={band.label} value={band.label} className="text-foreground">
                      {band.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>

            <button type="button" onClick={onSearch} className="ghost-btn-light">
              Search Properties
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
