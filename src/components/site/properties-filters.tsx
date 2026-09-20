"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  PROPERTY_TYPES,
  LOCATIONS,
  BEDS_OPTIONS,
  PRICE_BANDS,
} from "@/lib/constants";

/**
 * Filter bar on /properties. The URL is the source of truth (shareable,
 * back/forward-correct — an intentional improvement over the original's
 * state-only filters; the hero search and neighborhood links land here
 * with URL params either way). Only the free-text search keeps a local
 * draft until commit.
 */
export function PropertiesFilters({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(
    () => searchParams.get("search") ?? ""
  );

  const filters = {
    search: searchParams.get("search") ?? "",
    type: searchParams.get("type") ?? "All Types",
    location: searchParams.get("location") ?? "All Locations",
    price: searchParams.get("price") ?? "Any Price",
    beds: searchParams.get("beds") ?? "Any Beds",
  };

  const pushFilters = (overrides: Partial<typeof filters>) => {
    const next = { ...filters, ...overrides };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.type !== "All Types") params.set("type", next.type);
    if (next.location !== "All Locations") params.set("location", next.location);
    if (next.price !== "Any Price") params.set("price", next.price);
    if (next.beds !== "Any Beds") params.set("beds", next.beds);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties", {
      scroll: false,
    });
  };

  const commitSearch = () => {
    if (searchDraft.trim() !== filters.search) {
      pushFilters({ search: searchDraft });
    }
  };

  // "Clear Filters" appears only when a filter deviates from its
  // sentinel default (as on the original). Resetting pushes the bare
  // /properties URL — the clone's shareable-state improvement over the
  // original's client-only reset.
  const filtersActive = Boolean(
    filters.search.trim() ||
      filters.type !== "All Types" ||
      filters.location !== "All Locations" ||
      filters.price !== "Any Price" ||
      filters.beds !== "Any Beds"
  );

  const clearFilters = () => {
    setSearchDraft("");
    router.push("/properties", { scroll: false });
  };

  // Per-filter widths as measured on the original app's filter bar.
  const locationClasses = "w-[180px] bg-transparent border-border font-body text-sm h-12";
  const filterClasses = "w-[160px] bg-transparent border-border font-body text-sm h-12";
  const bedsClasses = "w-[120px] bg-transparent border-border font-body text-sm h-12";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitSearch();
            }}
            onBlur={commitSearch}
            placeholder="Search properties..."
            className="pl-10 bg-transparent border-border font-body text-sm h-12"
          />
        </div>

        <Select
          value={filters.location}
          onValueChange={(value) => pushFilters({ location: value })}
        >
          <SelectTrigger
            className={locationClasses}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) => pushFilters({ type: value })}
        >
          <SelectTrigger
            className={filterClasses}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.price}
          onValueChange={(value) => pushFilters({ price: value })}
        >
          <SelectTrigger
            className={filterClasses}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_BANDS.map((band) => (
              <SelectItem key={band.label} value={band.label}>
                {band.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.beds}
          onValueChange={(value) => pushFilters({ beds: value })}
        >
          <SelectTrigger
            className={bedsClasses}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BEDS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-muted-foreground">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} aria-hidden />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
