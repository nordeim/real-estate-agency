"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PropertyDto } from "@/lib/queries";
import { NewStamp, OpenHouseStamp } from "@/components/site/stamps";

function compactPrice(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export interface PropertyCardProps {
  property: PropertyDto;
  size?: "default" | "large";
  showBadge?: boolean;
  badgeType?: "new" | "openhouse";
}

/** Listing card used across the home page and /properties grid. */
export function PropertyCard({
  property,
  size = "default",
  showBadge = false,
  badgeType = "new",
}: PropertyCardProps) {
  const isLarge = size === "large";
  const image =
    property.featuredImage ?? property.images[0] ?? "/media/properties/mansion-1.jpg";

  return (
    <Link href={`/property/${property.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div
          className={`relative overflow-hidden ${
            isLarge ? "aspect-[16/9]" : "aspect-[5/4]"
          }`}
        >
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            loading="lazy"
          />
          {showBadge &&
            (badgeType === "openhouse" ? <OpenHouseStamp /> : <NewStamp />)}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-out"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-700 ease-out">
            <div className="flex items-end justify-between text-white">
              <span className="font-display text-2xl font-light">
                {compactPrice(property.price)}
              </span>
              <span className="font-body text-xs tracking-label uppercase">
                {property.sqft?.toLocaleString("en-US")} sqft
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 px-[2%]">
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-1">
            {property.neighborhood ?? property.city} · {property.propertyType}
          </p>
          <h3 className="font-display font-light text-display-sm">
            {property.title}
          </h3>
          <div className="flex items-center gap-4 mt-2 font-body text-sm text-muted-foreground">
            <span>
              {property.bedrooms} Bed
            </span>
            <span className="w-1 h-1 rounded-full bg-border" aria-hidden />
            <span>
              {property.bathrooms} Bath
            </span>
            {property.garage > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" aria-hidden />
                <span>
                  {property.garage} Garage
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
