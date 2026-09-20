import { describe, it, expect } from "vitest";
import {
  PROPERTY_TYPES,
  LOCATIONS,
  BEDS_OPTIONS,
  PRICE_BANDS,
  INQUIRY_TYPES,
  INQUIRY_TYPE_LABELS,
  HERO_DEFAULTS,
  HERO_TYPE_OPTIONS,
  HERO_LOCATION_OPTIONS,
  HERO_PRICE_OPTIONS,
  NEIGHBORHOODS,
} from "@/lib/constants";
import { listPropertiesFiltered, countPropertiesByLocation } from "@/lib/queries";
import { db } from "@/lib/db";

describe("canonical constants", () => {
  it("keeps the filter sentinels first in each list", () => {
    expect(PROPERTY_TYPES[0]).toBe("All Types");
    expect(LOCATIONS[0]).toBe("All Locations");
    expect(BEDS_OPTIONS[0]).toBe("Any Beds");
    expect(PRICE_BANDS[0].label).toBe("Any Price");
  });

  it("covers every inquiry type with a display label", () => {
    for (const type of INQUIRY_TYPES) {
      expect(INQUIRY_TYPE_LABELS[type]).toBeTruthy();
    }
    expect(INQUIRY_TYPE_LABELS["Tour Request"]).toBe("Schedule a Tour");
    expect(INQUIRY_TYPE_LABELS.General).toBe("General Question");
  });

  it("derives hero options from the filter lists with Any X sentinels", () => {
    expect(HERO_DEFAULTS.type).toBe("Any Type");
    expect(HERO_DEFAULTS.location).toBe("Any Location");
    expect(HERO_DEFAULTS.price).toBe("Any Price");

    // No "All X" wording leaks into the hero lists.
    expect(HERO_TYPE_OPTIONS).not.toContain("All Types");
    expect(HERO_LOCATION_OPTIONS).not.toContain("All Locations");

    // ...and every real filter value is reachable from the hero.
    for (const type of PROPERTY_TYPES) {
      if (type === "All Types") continue;
      expect(HERO_TYPE_OPTIONS).toContain(type);
    }
    for (const location of LOCATIONS) {
      if (location === "All Locations") continue;
      expect(HERO_LOCATION_OPTIONS).toContain(location);
    }
    expect(HERO_PRICE_OPTIONS).toEqual(PRICE_BANDS.map((b) => b.label));
  });

  it("keeps price bands contiguous and non-overlapping", () => {
    const real = PRICE_BANDS.slice(1);
    for (let i = 1; i < real.length; i++) {
      expect(real[i].min).toBe(real[i - 1].max);
    }
    expect(real[0].min).toBe(0);
    expect(real[real.length - 1].max).toBe(Number.POSITIVE_INFINITY);
  });

  it("seeds exactly the three featured neighborhoods with imagery", () => {
    expect(NEIGHBORHOODS.map((n) => n.name)).toEqual([
      "Pacific Heights",
      "Marina District",
      "Nob Hill",
    ]);
    for (const neighborhood of NEIGHBORHOODS) {
      expect(neighborhood.image).toMatch(/^\/media\/neighborhoods\//);
      expect(neighborhood.tagline.length).toBeGreaterThan(5);
    }
  });
});

describe("listPropertiesFiltered (seeded database)", () => {
  it("returns only active properties with no filters", async () => {
    const all = await listPropertiesFiltered({});
    const active = await db.property.count({ where: { status: "Active" } });
    expect(all.length).toBe(active);
    expect(active).toBeGreaterThanOrEqual(10);
  });

  it("filters by exact property type", async () => {
    const results = await listPropertiesFiltered({ type: "Penthouse" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.propertyType === "Penthouse")).toBe(true);
  });

  it("ignores the All Types sentinel", async () => {
    const baseline = await listPropertiesFiltered({});
    const all = await listPropertiesFiltered({ type: "All Types" });
    expect(all.length).toBe(baseline.length);
  });

  it("filters by exact location", async () => {
    const results = await listPropertiesFiltered({ location: "Sea Cliff" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.location === "Sea Cliff")).toBe(true);
  });

  it("filters by price band boundaries (inclusive min, exclusive max)", async () => {
    const under2m = await listPropertiesFiltered({ price: "Under $2M" });
    expect(under2m.every((p) => p.price < 2_000_000)).toBe(true);

    const between = await listPropertiesFiltered({ price: "$2M – $5M" });
    expect(
      between.every((p) => p.price >= 2_000_000 && p.price < 5_000_000)
    ).toBe(true);

    const any = await listPropertiesFiltered({ price: "Any Price" });
    const baseline = await listPropertiesFiltered({});
    expect(any.length).toBe(baseline.length);
  });

  it("filters by minimum bedrooms", async () => {
    const results = await listPropertiesFiltered({ beds: "4+" });
    expect(results.every((p) => p.bedrooms >= 4)).toBe(true);
    const two = await listPropertiesFiltered({ beds: "2+" });
    expect(two.length).toBeGreaterThanOrEqual(results.length);
  });

  it("matches free-text search across title, city, neighborhood, address and type", async () => {
    const all = await listPropertiesFiltered({});
    const probe = all[0];
    const word = probe.title.split(" ")[0];
    const results = await listPropertiesFiltered({ search: word.toLowerCase() });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((p) => p.id === probe.id)).toBe(true);
  });

  it("combines filters conjunctively", async () => {
    const penthouses = await listPropertiesFiltered({ type: "Penthouse" });
    if (penthouses.length === 0) return; // seeded data must include one
    const location = penthouses[0].location ?? "";
    const results = await listPropertiesFiltered({
      type: "Penthouse",
      location,
    });
    expect(
      results.every(
        (p) => p.propertyType === "Penthouse" && p.location === location
      )
    ).toBe(true);
  });

  it("returns an empty array for impossible combinations", async () => {
    const results = await listPropertiesFiltered({
      search: "zzz-no-such-property-xyz",
    });
    expect(results).toEqual([]);
  });
});

describe("countPropertiesByLocation", () => {
  it("produces counts that match filtered queries", async () => {
    const counts = await countPropertiesByLocation();
    const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
    const active = await db.property.count({ where: { status: "Active" } });
    expect(total).toBe(active);

    for (const [location, count] of counts) {
      const results = await listPropertiesFiltered({ location });
      expect(results.length).toBe(count);
    }
  });
});
