import { describe, it, expect } from "vitest";
import { formatPrice, formatSqft, parseJsonArray } from "@/lib/format";
import {
  PROPERTY_TYPES,
  LOCATIONS,
  BEDS_OPTIONS,
  PRICE_BANDS,
  INQUIRY_TYPES,
} from "@/lib/constants";

describe("formatPrice", () => {
  it("formats whole-dollar USD amounts without cents", () => {
    expect(formatPrice(6_950_000)).toBe("$6,950,000");
    expect(formatPrice(1_234)).toBe("$1,234");
  });

  it("rounds fractional dollars to the nearest whole dollar", () => {
    expect(formatPrice(1_999_999.99)).toBe("$2,000,000");
    expect(formatPrice(1_999.5)).toBe("$2,000");
  });
});

describe("formatSqft", () => {
  it("formats with thousands separators", () => {
    expect(formatSqft(7_200)).toBe("7,200");
  });

  it("returns undefined for missing values", () => {
    expect(formatSqft(null)).toBeUndefined();
    expect(formatSqft(undefined)).toBeUndefined();
  });
});

describe("parseJsonArray", () => {
  it("parses valid JSON arrays", () => {
    expect(parseJsonArray('["a","b"]')).toEqual(["a", "b"]);
    expect(parseJsonArray("[]")).toEqual([]);
  });

  it("returns an empty array for invalid input", () => {
    expect(parseJsonArray("not json")).toEqual([]);
    expect(parseJsonArray('{"a":1}')).toEqual([]);
    expect(parseJsonArray(null)).toEqual([]);
    expect(parseJsonArray(undefined)).toEqual([]);
  });
});

describe("domain constants", () => {
  it("keeps the canonical filter option lists", () => {
    expect(PROPERTY_TYPES[0]).toBe("All Types");
    expect(LOCATIONS).toContain("Pacific Heights");
    expect(LOCATIONS[0]).toBe("All Locations");
    expect(BEDS_OPTIONS).toEqual(["Any Beds", "1+", "2+", "3+", "4+", "5+"]);
  });

  it("defines ordered, non-overlapping price bands", () => {
    expect(PRICE_BANDS[0].label).toBe("Any Price");
    // "Any Price" is a catch-all; the concrete bands that follow are contiguous.
    for (let i = 2; i < PRICE_BANDS.length; i += 1) {
      expect(PRICE_BANDS[i].min).toBe(PRICE_BANDS[i - 1].max);
    }
    expect(PRICE_BANDS.at(-1)?.max).toBe(Number.POSITIVE_INFINITY);
  });

  it("keeps inquiry types aligned with the form options", () => {
    expect(INQUIRY_TYPES).toEqual([
      "Tour Request",
      "Virtual Tour",
      "Price Inquiry",
      "General",
    ]);
  });
});
