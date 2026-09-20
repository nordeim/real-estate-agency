import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PropertyCard } from "@/components/site/property-card";
import { PropertiesFilters } from "@/components/site/properties-filters";
import { listPropertiesFiltered } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Listings",
  description:
    "Explore Maison Estate's curated collection of estates, penthouses, waterfront and modernist residences across San Francisco's most coveted neighborhoods.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const properties = await listPropertiesFiltered({
    search: first(params.search),
    type: first(params.type),
    location: first(params.location),
    price: first(params.price),
    beds: first(params.beds),
  });

  return (
    <div>
      <SiteHeader />
      <main className="pt-24">
        <section className="px-[2%] max-w-[1400px] mx-auto">
          <div className="pt-16 md:pt-24 mb-12 md:mb-16 px-[2%]">
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
              Collection
            </p>
            <h1 className="font-display text-display-lg font-light mt-3">
              Our <span className="italic">Listings</span>
            </h1>
          </div>

          <div className="px-[2%]">
            <Suspense
              fallback={
                <div className="h-12 rounded-full border border-border/50 animate-pulse" />
              }
            >
              <PropertiesFilters total={properties.length} />
            </Suspense>
          </div>

          <div className="mt-10 pb-24 md:pb-40 px-[2%]">
            {properties.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-display-md font-light">
                  No properties match your criteria
                </p>
                <p className="font-body text-sm text-muted-foreground mt-4">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    showBadge={property.isHighPriority}
                    badgeType="new"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
