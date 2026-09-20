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
 * URL-driven filter bar on /properties. Select values derive from
 * searchParams (single source of truth — shareable, back/forward works);
 * only the free-text search keeps local draft state until commit.
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

  const reset = () => {
    setSearchDraft("");
    router.push("/properties", { scroll: false });
  };

  const isFiltered =
    filters.search !== "" ||
    filters.type !== "All Types" ||
    filters.location !== "All Locations" ||
    filters.price !== "Any Price" ||
    filters.beds !== "Any Beds";

  const selectClasses =
    "bg-transparent border-border/50 font-body text-sm h-10 md:h-12 rounded-full";

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
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
            aria-label="Search properties"
            className="bg-transparent border-border/50 font-body text-sm h-10 md:h-12 rounded-full pl-11"
          />
        </div>

        <Select
          value={filters.location}
          onValueChange={(value) => pushFilters({ location: value })}
        >
          <SelectTrigger
            className={`${selectClasses} md:w-44`}
            aria-label="Location filter"
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
            className={`${selectClasses} md:w-40`}
            aria-label="Type filter"
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
            className={`${selectClasses} md:w-40`}
            aria-label="Price filter"
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
            className={`${selectClasses} md:w-32`}
            aria-label="Bedrooms filter"
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

        {isFiltered && (
          <button
            type="button"
            onClick={reset}
            className="ghost-btn h-10 md:h-12 !py-0 flex items-center justify-center gap-2 font-body text-xs"
            aria-label="Clear all filters"
          >
            <X size={14} aria-hidden /> Clear
          </button>
        )}
      </div>

      <p className="font-body text-sm text-muted-foreground mt-4">
        {total} {total === 1 ? "property" : "properties"} found
      </p>
    </div>
  );
}
