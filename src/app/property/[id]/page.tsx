import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  Car,
  MapPin,
  Ruler,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PropertyGallery } from "@/components/site/property-gallery";
import { InquiryFormWithToast } from "@/components/site/inquiry-form-with-toast";
import { getPropertyById } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

// The original app keeps a single generic title for every property page.
export const metadata: Metadata = pageMetadata({
  title: "Property Detail",
  path: "/property/[id]",
});

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  // Inline editorial not-found state (matches the original app) — the
  // global 404 page stays reserved for truly unknown routes.
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 pt-32 px-6 md:px-12 max-w-[1400px] mx-auto text-center py-24">
          <p className="font-display text-display-md">Property not found</p>
          <Link href="/properties" className="ghost-btn inline-block mt-8">
            Back to Collection
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const images =
    property.images.length > 0
      ? property.images
      : property.featuredImage
        ? [property.featuredImage]
        : [];

  const stats = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    {
      icon: Ruler,
      label: "Sq Ft",
      value: property.sqft?.toLocaleString("en-US"),
    },
    { icon: Car, label: "Garage", value: property.garage },
    { icon: Calendar, label: "Year Built", value: property.yearBuilt },
  ].filter((stat) => stat.value != null && stat.value !== "");

  const addressLine = [
    property.address && `${property.address}, `,
    property.neighborhood && `${property.neighborhood}, `,
    property.city,
    property.state && `, ${property.state}`,
  ]
    .filter(Boolean)
    .join("");

  const mapsQuery = encodeURIComponent(
    `${property.address ?? ""}, ${property.city}, ${property.state} ${property.zipCode ?? ""}`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      {/* The original's found-state detail layout is unobservable (its DB
          is empty); pt-24 preserves the recon-derived layout. */}
      <main className="flex-1 pt-24">
        <div className="px-[2%] max-w-[1600px] mx-auto mb-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 font-body text-xs tracking-label uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} aria-hidden /> Back to Collection
          </Link>
        </div>

        <div className="px-[2%] max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left column — gallery and details */}
            <div className="lg:col-span-2">
              <PropertyGallery
                images={images}
                alt={property.title}
                showBadge={property.isHighPriority}
                badgeType="new"
              />

              <div className="mt-10 mb-8">
                <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
                  {property.neighborhood ?? property.city} ·{" "}
                  {property.propertyType}
                </p>
                <h1 className="font-display text-display-md font-light mt-2">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                  <MapPin size={14} aria-hidden />
                  <span className="font-body text-sm">{addressLine}</span>
                </div>
                <p className="font-display text-display-sm text-accent mt-4">
                  {formatPrice(property.price)}
                </p>
              </div>

              <div className="hairline mb-8" />

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center py-4 border border-border/50"
                  >
                    <stat.icon
                      size={18}
                      className="mx-auto text-accent mb-2"
                      aria-hidden
                    />
                    <p className="font-display text-lg">{stat.value}</p>
                    <p className="font-body text-xs text-muted-foreground tracking-label uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {property.description && (
                <div className="mb-10">
                  <h2 className="font-display text-display-sm font-light mb-4">
                    About This Property
                  </h2>
                  <p className="font-body text-sm text-muted-foreground leading-[1.8] whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              <div className="hairline mb-10" />

              {property.features.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-display text-display-sm font-light mb-6">
                    Features
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 py-3 border-b border-border/30"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                          aria-hidden
                        />
                        <span className="font-body text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.videoUrl && (
                <div className="mb-10">
                  <h2 className="font-display text-display-sm font-light mb-6">
                    Virtual Tour
                  </h2>
                  <div className="aspect-video">
                    <iframe
                      src={property.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title="Virtual tour"
                    />
                  </div>
                </div>
              )}

              {property.address && (
                <div className="mb-10">
                  <h2 className="font-display text-display-sm font-light mb-6">
                    Location &amp; Amenities
                  </h2>
                  <div className="aspect-[16/9] overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      title="Property location map"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${mapsQuery}&z=15&output=embed`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right column — sticky inquiry card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <div className="border border-border/50 p-8">
                  <h3 className="font-display text-2xl font-light mb-2">
                    Schedule a Viewing
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mb-6">
                    Our advisors respond within 24 hours
                  </p>
                  <InquiryFormWithToast
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-24" />
      </main>
      <SiteFooter />
    </div>
  );
}
