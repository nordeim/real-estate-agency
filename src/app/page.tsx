import Link from "next/link";
import { FileText, House, Key, TrendingUp } from "lucide-react";
import { HeroSearch } from "@/components/site/hero-search";
import { PropertyCard } from "@/components/site/property-card";
import { ParallaxImage } from "@/components/site/parallax-image";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import {
  listFeaturedProperties,
  listFeaturedAgents,
  listTestimonials,
  countPropertiesByLocation,
} from "@/lib/queries";
import { NEIGHBORHOODS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SERVICES = [
  {
    icon: House,
    title: "Buyer Representation",
    description:
      "From discovery to closing, our agents provide end-to-end guidance with access to pre-market and exclusive listings.",
  },
  {
    icon: TrendingUp,
    title: "Seller Strategy",
    description:
      "Maximize your property's value with our data-driven pricing, architectural staging, and targeted marketing.",
  },
  {
    icon: Key,
    title: "Property Management",
    description:
      "Preserve and grow your investment with our concierge-level management services for luxury properties.",
  },
  {
    icon: FileText,
    title: "Market Advisory",
    description:
      "Leverage our deep market intelligence for informed investment decisions and portfolio optimization.",
  },
];

export default async function HomePage() {
  const [properties, agents, testimonials, counts] = await Promise.all([
    listFeaturedProperties(6),
    listFeaturedAgents(3),
    listTestimonials(5),
    countPropertiesByLocation(),
  ]);

  const countFor = (name: string) => {
    const count = counts.get(name) ?? 0;
    return `${count} ${count === 1 ? "Property" : "Properties"}`;
  };

  return (
    <div>
      <SiteHeader />
      <main>
        <HeroSearch />

        {/* Featured Properties */}
        <section
          id="listings"
          className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto"
        >
          <div className="flex items-end justify-between mb-16 px-[2%]">
            <div>
              <h2 className="font-display text-display-lg font-light mt-3">
                Featured <span className="italic">Properties</span>
              </h2>
            </div>
            <Link
              href="/properties"
              className="hidden md:block font-body text-xs tracking-label uppercase text-muted-foreground hover:text-accent transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 px-[2%]">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showBadge={property.isHighPriority}
                badgeType="new"
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/properties" className="ghost-btn inline-block">
              View All Properties
            </Link>
          </div>
        </section>

        {/* Neighborhoods — original: tinted band, full-height cards */}
        <section className="py-24 md:py-40 bg-secondary/30">
          <div className="px-[2%] max-w-[1400px] mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-display-lg font-light mt-3">
                Neighborhood <span className="italic">Expertise</span>
              </h2>
              <p className="font-body text-muted-foreground text-base mt-4 max-w-lg mx-auto leading-relaxed">
                Decades of local knowledge distilled into unparalleled
                guidance for the city&apos;s most coveted addresses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {NEIGHBORHOODS.map((neighborhood, index) => (
                <Reveal key={neighborhood.name} delay={index * 0.1} duration={0.6}>
                  <Link
                    href={`/properties?location=${encodeURIComponent(neighborhood.name)}`}
                    className="group block"
                  >
                    <div className="relative h-[450px] md:aspect-auto md:min-h-[480px] overflow-hidden">
                      <img
                        src={neighborhood.image}
                        alt={`${neighborhood.name} neighborhood`}
                        className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-foreground to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <p className="font-body text-xs tracking-label uppercase text-white/60 mb-2">
                          {countFor(neighborhood.name)}
                        </p>
                        <h3 className="font-display text-2xl md:text-3xl text-white font-light">
                          {neighborhood.name}
                        </h3>
                        <p className="font-body text-sm text-white/70 mt-1">
                          {neighborhood.tagline}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Services — original: light two-column with icon list rows */}
        <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <div>
              <h2 className="font-display text-display-lg font-light mt-3">
                Buyer &amp; Seller
                <br />
                <span className="italic">Services</span>
              </h2>
              <p className="font-body text-muted-foreground text-base mt-6 leading-snug max-w-md">
                Whether acquiring your legacy residence or positioning your
                property for the discerning market, our approach is both
                artful and analytical.
              </p>
              <Link href="/sell#contact" className="ghost-btn inline-block mt-8 text-sm">
                Learn More
              </Link>
            </div>
            <div className="space-y-0">
              {SERVICES.map((service, index) => (
                <Reveal
                  key={service.title}
                  delay={index * 0.1}
                  duration={0.6}
                  fromX
                >
                  <div className="py-8 border-b border-border/90 first:border-t">
                    <div className="flex items-start gap-5">
                      <div>
                        <service.icon
                          size={20}
                          className="text-accent mt-1 flex-shrink-0"
                          aria-hidden
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-light mb-2">
                          {service.title}
                        </h3>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Advisors */}
        {agents.length > 0 && (
          <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-display-lg font-light mt-3">
                Featured <span className="italic">Advisors</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
              {agents.map((agent, index) => (
                <Reveal key={agent.id} delay={index * 0.1} duration={0.6}>
                  <div className="aspect-[3/4] overflow-hidden mb-6">
                    <img
                      src={agent.photo ?? ""}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-display text-2xl font-light">{agent.name}</h3>
                  <p className="font-body text-xs tracking-label uppercase text-accent mt-1 mb-4">
                    {agent.title}
                  </p>
                  {agent.bio && (
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                      {agent.bio}
                    </p>
                  )}
                  <div className="space-y-2 text-sm font-body">
                    {agent.yearsExperience != null && (
                      <p className="text-muted-foreground">
                        {agent.yearsExperience} Years Experience
                      </p>
                    )}
                    {agent.totalSalesVolume && (
                      <p className="text-muted-foreground">
                        {agent.totalSalesVolume} in Sales
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <TestimonialCarousel testimonials={testimonials} />

        <ParallaxImage
          src="/media/pages/parallax-home.jpg"
          alt="Luxury brutalist modern home"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
