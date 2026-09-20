import { db } from "@/lib/db";
import { parseJsonArray } from "@/lib/format";
import { PRICE_BANDS } from "@/lib/constants";
import type { Property, Agent, Testimonial } from "@prisma/client";

const PRICE_BAND_LABELS = new Map(
  PRICE_BANDS.map((b) => [b.label, b] as const)
);

/** Serialized DTOs crossing the RSC boundary. */
export interface PropertyDto {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  garage: number;
  yearBuilt: number | null;
  address: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  neighborhood: string | null;
  location: string | null;
  propertyType: string;
  images: string[];
  featuredImage: string | null;
  features: string[];
  videoUrl: string | null;
  isFeatured: boolean;
  isHighPriority: boolean;
  status: string;
  createdAt: string;
}

export interface AgentDto {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photo: string | null;
  yearsExperience: number | null;
  totalSalesVolume: string | null;
  email: string | null;
  phone: string | null;
}

export interface TestimonialDto {
  id: string;
  quote: string;
  clientName: string;
  propertyType: string | null;
  location: string | null;
}


function toPropertyDto(p: Property): PropertyDto {
  return {
    id: p.id,
    title: p.title,
    shortDescription: p.shortDescription,
    description: p.description,
    price: p.price,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    sqft: p.sqft,
    garage: p.garage,
    yearBuilt: p.yearBuilt,
    address: p.address,
    city: p.city,
    state: p.state,
    zipCode: p.zipCode,
    neighborhood: p.neighborhood,
    location: p.location,
    propertyType: p.propertyType,
    images: parseJsonArray(p.images),
    featuredImage: p.featuredImage,
    features: parseJsonArray(p.features),
    videoUrl: p.videoUrl,
    isFeatured: p.isFeatured,
    isHighPriority: p.isHighPriority,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

function toAgentDto(a: Agent): AgentDto {
  return {
    id: a.id,
    name: a.name,
    title: a.title,
    bio: a.bio,
    photo: a.photo,
    yearsExperience: a.yearsExperience,
    totalSalesVolume: a.totalSalesVolume,
    email: a.email,
    phone: a.phone,
  };
}

function toTestimonialDto(t: Testimonial): TestimonialDto {
  return {
    id: t.id,
    quote: t.quote,
    clientName: t.clientName,
    propertyType: t.propertyType,
    location: t.location,
  };
}

export async function listFeaturedProperties(limit = 6): Promise<PropertyDto[]> {
  const rows = await db.property.findMany({
    where: { isFeatured: true, status: "Active" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toPropertyDto);
}

export async function listAllProperties(): Promise<PropertyDto[]> {
  const rows = await db.property.findMany({
    where: { status: "Active" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPropertyDto);
}

export async function getPropertyById(id: string): Promise<PropertyDto | null> {
  const row = await db.property.findUnique({ where: { id } });
  return row ? toPropertyDto(row) : null;
}

export async function listFeaturedAgents(limit = 3): Promise<AgentDto[]> {
  const rows = await db.agent.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toAgentDto);
}

export async function listAllAgents(): Promise<AgentDto[]> {
  const rows = await db.agent.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toAgentDto);
}

export async function listTestimonials(limit = 5): Promise<TestimonialDto[]> {
  const rows = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toTestimonialDto);
}

export async function countPropertiesByLocation(): Promise<Map<string, number>> {
  const grouped = await db.property.groupBy({
    by: ["location"],
    where: { status: "Active" },
    _count: { id: true },
  });
  const counts = new Map<string, number>();
  for (const g of grouped) {
    if (g.location) counts.set(g.location, g._count.id);
  }
  return counts;
}

export interface PropertyFilters {
  search?: string;
  type?: string;
  location?: string;
  price?: string;
  beds?: string;
}

export async function listPropertiesFiltered(
  filters: PropertyFilters
): Promise<PropertyDto[]> {
  const rows = await listAllProperties();
  const search = filters.search?.trim().toLowerCase();

  return rows.filter((p) => {
    if (filters.type && filters.type !== "All Types" && p.propertyType !== filters.type) {
      return false;
    }
    if (
      filters.location &&
      filters.location !== "All Locations" &&
      p.location !== filters.location
    ) {
      return false;
    }
    if (filters.price && filters.price !== "Any Price") {
      const band = PRICE_BAND_LABELS.get(filters.price);
      if (band && (p.price < band.min || p.price >= band.max)) {
        return false;
      }
    }
    if (filters.beds && filters.beds !== "Any Beds") {
      const minBeds = Number.parseInt(filters.beds.replace("+", ""), 10);
      if (!Number.isNaN(minBeds) && p.bedrooms < minBeds) {
        return false;
      }
    }
    if (search) {
      const haystack =
        `${p.title} ${p.city} ${p.neighborhood ?? ""} ${p.address ?? ""} ${p.propertyType}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }
    return true;
  });
}
