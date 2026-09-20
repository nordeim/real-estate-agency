import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PropertyCard } from "@/components/site/property-card";
import { PropertiesFilters } from "@/components/site/properties-filters";
import { Reveal } from "@/components/site/reveal";
import { listPropertiesFiltered } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Property Search",
  path: "/properties",
});

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
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* The original's single container: pt-32 pb-24, listing
            heading, filter bar, and grid/empty state as siblings. */}
        <div className="pt-32 pb-24 px-[2%] max-w-[1400px] mx-auto">
          <Reveal duration={0.6}>
            <h1 className="font-display text-display-lg font-light mt-3 mb-12">
              Our Listings
            </h1>
          </Reveal>

          <Suspense
            fallback={
              <div className="h-12 rounded-md border border-border/50 animate-pulse" />
            }
          >
            <PropertiesFilters total={properties.length} />
          </Suspense>

          {properties.length > 0 ? (
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
          ) : (
            <div className="text-center py-24">
              <p className="font-display text-display-sm font-light text-muted-foreground">
                No properties match your criteria
              </p>
              <p className="font-body text-sm text-muted-foreground mt-3">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
