import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { InquiryFormWithToast } from "@/components/site/inquiry-form-with-toast";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sell",
  path: "/sell",
});

const COVERAGE = [
  "Expert market analysis and competitive pricing",
  "Professional photography and virtual tours",
  "Targeted marketing to qualified buyers",
  "Seamless negotiation and transaction management",
  "24/7 dedicated agent support",
  "Strategic staging and presentation",
];

export default function SellPage() {
  return (
    <div>
      <SiteHeader />
      <main className="pt-24">
        {/* Hero — original: text-only statement, no imagery */}
        <section className="pt-40 pb-24 md:pb-32 px-[2%] max-w-[1400px] mx-auto">
          <Reveal delay={0} duration={0.8}>
            <h1 className="font-display text-display-lg font-light mt-3 mb-6">
              Ready to <span className="italic">sell?</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-[600px] leading-relaxed text-base">
              We understand that selling your property is one of the most
              important decisions you&apos;ll make. Our team of luxury real
              estate experts is here to guide you through every step of the
              process, ensuring maximum value and a seamless experience.
            </p>
          </Reveal>
        </section>

        {/* Coverage checklist — original: light section, check-circle icons */}
        <section className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto">
          <div className="mb-12">
            <Reveal delay={0} duration={0.8}>
              <h2 className="font-display text-display-md font-light">
                We got you <span className="italic">covered</span>
              </h2>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {COVERAGE.map((item, index) => (
              <Reveal key={item} delay={index * 0.08} duration={0.6} fromX>
                <div className="flex gap-4">
                  <CircleCheck
                    size={24}
                    className="text-accent flex-shrink-0 mt-1"
                    aria-hidden
                  />
                  <p className="font-body text-base text-foreground leading-relaxed">
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Full-bleed image band */}
        <section className="w-full h-[500px] md:h-[700px] overflow-hidden">
          <img
            src="/media/pages/sell-hero.jpeg"
            alt="Luxury property"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </section>

        {/* Contact — original: bordered form card */}
        <section
          id="contact"
          className="py-12 md:py-16 px-[4%] md:px-[2%] max-w-[1400px] mx-auto scroll-mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <Reveal delay={0} duration={0.8}>
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
