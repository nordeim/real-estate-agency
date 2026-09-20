import type { Metadata } from "next";
import { Award, Heart, Landmark, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { InquiryFormWithToast } from "@/components/site/inquiry-form-with-toast";
import { listAllAgents } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "About",
  path: "/about",
});

const CREDENTIALS = [
  { label: "Luxury Collection Specialist", year: "Since 2008" },
  { label: "Top 1% Nationwide", year: "2019 – Present" },
  { label: "Best Real Estate Agency", year: "City Awards 2023" },
  { label: "Diamond Circle of Excellence", year: "2020 – Present" },
];

const COMMUNITY = [
  {
    icon: Heart,
    title: "Habitat for Humanity",
    description:
      "Annual partnership building homes for families in need across the metropolitan area.",
  },
  {
    icon: GraduationCap,
    title: "Youth Mentorship",
    description:
      "Sponsoring internship programs for underrepresented students pursuing real estate careers.",
  },
  {
    icon: Landmark,
    title: "Historic Preservation",
    description:
      "Active stewardship of the city's architectural heritage through restoration advocacy.",
  },
];

export default async function AboutPage() {
  const agents = await listAllAgents();

  return (
    <div>
      <SiteHeader />
      <main className="pt-24">
        {/* Legacy hero — original: text left, office image right */}
        <section className="px-[4%] md:px-[2%] max-w-[1400px] mx-auto mb-24 md:mb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal delay={0.0} duration={0.8}>
              <h1 className="font-display text-display-xl font-light mt-4 mb-8">
                A Legacy of
                <br />
                <span className="italic">Distinction</span>
              </h1>
              <p className="font-body text-muted-foreground leading-[1.8] mb-6">
                For over two decades, Maison Estate has been the definitive
                authority in luxury real estate. We don&apos;t simply list
                properties—we curate collections. Our philosophy is rooted in
                the belief that finding the right home is an act of
                self-expression, one that deserves the same care and
                sophistication as acquiring a masterwork of art.
              </p>
              <p className="font-body text-muted-foreground leading-[1.8]">
                Every client relationship begins with deep listening and
                culminates in life-changing results. Our team of advisors
                brings an unmatched combination of market intelligence,
                negotiation expertise, and an intimate understanding of the
                city&apos;s most coveted neighborhoods.
              </p>
            </Reveal>
            <Reveal delay={0.2} duration={0.8}>
              <div className="overflow-hidden">
                <img
                  src="/media/pages/about-office.png"
                  alt="Modern architecture office"
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Advisors — original: centered heading, no kicker */}
        <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-display text-display-lg font-light mt-3">
              Meet the <span className="italic">Advisors</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
              Each advisor brings a unique perspective shaped by years of
              experience and a genuine passion for architecture and community.
            </p>
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
                <div className="mt-4 space-y-1 font-body text-xs text-muted-foreground">
                  {agent.email && <p>{agent.email}</p>}
                  {agent.phone && <p>{agent.phone}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Credentials & Awards — original: left heading, right icon list */}
        <section className="py-24 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <div>
              <h2 className="font-display text-display-lg font-light mt-3">
                Credentials &amp;
                <br />
                <span className="italic">Awards</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-6 leading-relaxed max-w-md">
                Our commitment to excellence has been recognized by the
                industry&apos;s most prestigious organizations.
              </p>
            </div>
            <div className="space-y-0">
              {CREDENTIALS.map((credential, index) => (
                <Reveal key={credential.label} delay={index * 0.1} duration={0.6} fromX>
                  <div className="py-6 border-b border-border/50 first:border-t flex items-center gap-5">
                    <Award
                      size={20}
                      className="text-accent flex-shrink-0"
                      aria-hidden
                    />
                    <div className="flex-1">
                      <p className="font-display text-lg font-light">
                        {credential.label}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {credential.year}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Community Impact — original: tinted band, centered icons */}
        <section className="py-24 md:py-40 bg-secondary/30">
          <div className="px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-display-lg font-light mt-3">
                Community <span className="italic">Impact</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {COMMUNITY.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.1} duration={0.6}>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <item.icon
                        size={28}
                        className="text-accent"
                        aria-hidden
                      />
                    </div>
                    <h3 className="font-display text-2xl font-light">
                      {item.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA — original: bordered form card */}
        <section
          id="contact"
          className="py-12 md:py-40 px-[4%] md:px-[2%] max-w-[1400px] mx-auto scroll-mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <Reveal delay={0.0} duration={0.8}>
              <h2 className="font-display text-display-lg font-light mt-3 mb-6">
                Begin Your
                <br />
                <span className="italic">Journey</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
                Whether you&apos;re seeking your next residence or considering
                listing your property, we&apos;re here to guide you with the
                expertise and discretion you deserve.
              </p>
            </Reveal>

            <Reveal delay={0.15} duration={0.8}>
              <div className="md:border md:border-border/50 md:p-8">
                <InquiryFormWithToast />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
