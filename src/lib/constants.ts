/**
 * Canonical filter/domain constants — the single source of truth for
 * property types, price bands, locations, and inquiry types.
 */

export const PROPERTY_TYPES = [
  "All Types",
  "Penthouse",
  "Waterfront",
  "Modernist",
  "Estate",
  "Townhouse",
  "Condo",
] as const;

export const LOCATIONS = [
  "All Locations",
  "Pacific Heights",
  "Marina District",
  "Nob Hill",
  "Sea Cliff",
  "Russian Hill",
  "Presidio Heights",
] as const;

export const BEDS_OPTIONS = [
  "Any Beds",
  "1+",
  "2+",
  "3+",
  "4+",
  "5+",
] as const;

export interface PriceBand {
  label: string;
  min: number;
  max: number;
}

export const PRICE_BANDS: PriceBand[] = [
  { label: "Any Price", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under $2M", min: 0, max: 2_000_000 },
  { label: "$2M – $5M", min: 2_000_000, max: 5_000_000 },
  { label: "$5M – $10M", min: 5_000_000, max: 10_000_000 },
  { label: "$10M+", min: 10_000_000, max: Number.POSITIVE_INFINITY },
];

export const INQUIRY_TYPES = [
  "Tour Request",
  "Virtual Tour",
  "Price Inquiry",
  "General",
] as const;

export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  "Tour Request": "Schedule a Tour",
  "Virtual Tour": "Virtual Tour",
  "Price Inquiry": "Price Inquiry",
  General: "General Question",
};

export const NEIGHBORHOODS = [
  {
    name: "Pacific Heights",
    tagline: "Grand estates and panoramic bay views",
    image: "/media/neighborhoods/pacific-heights.png",
  },
  {
    name: "Marina District",
    tagline: "Waterfront living at its finest",
    image: "/media/neighborhoods/marina-district.png",
  },
  {
    name: "Nob Hill",
    tagline: "Historic elegance meets modern luxury",
    image: "/media/neighborhoods/nob-hill.png",
  },
] as const;

export const SITE = {
  name: "MAISON ESTATE",
  tagline: "Welcome to Your Next Home",
  address: "500 Terry Francine St.",
  city: "San Francisco, CA 94158",
  phone: "123-456-7890",
  phoneHref: "tel:1234567890",
  email: "info@mysite.com",
} as const;
