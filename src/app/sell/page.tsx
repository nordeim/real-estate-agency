import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { InquiryFormWithToast } from "@/components/site/inquiry-form-with-toast";

export const metadata: Metadata = {
  title: "Sell",
  description:
    "Sell your property with Maison Estate — expert market analysis, professional photography, targeted marketing, and seamless transaction management.",
};

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
        {/* Hero */}
        <section className="px-[2%] max-w-[1400px] mx-auto">
          <div className="pt-16 md:pt-24 pb-16 md:pb-24 px-[2%] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal delay={0.0} duration={0.8}>
              <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
                Sell
              </p>
              <h1 className="font-display text-display-lg font-light mt-3">
                Ready to <span className="italic">sell?</span>
              </h1>
              <p className="font-body text-sm text-muted-foreground leading-[1.8] mt-6 max-w-lg">
                We understand that selling your property is one of the most
                important decisions you&apos;ll make. Our team of luxury real
                estate experts is here to guide you through every step of the
                process, ensuring maximum value and a seamless experience.
              </p>
            </Reveal>
            <Reveal delay={0.2} duration={0.8}>
              <img
                src="/media/pages/sell-hero.jpeg"
                alt="Modern luxury home at dusk"
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </Reveal>
          </div>
        </section>

        {/* Coverage checklist */}
        <section className="bg-foreground text-background py-24 md:py-40">
          <div className="max-w-[1400px] mx-auto px-[2%]">
            <div className="px-[2%]">
              <p className="font-body text-xs tracking-label uppercase text-background/60">
                Coverage
              </p>
              <h2 className="font-display text-display-lg font-light mt-3 mb-12 md:mb-16">
                We got you <span className="italic">covered</span>
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
                {COVERAGE.map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-full border border-background/30 flex-shrink-0 mt-0.5"
                      aria-hidden
                    >
                      <Check size={14} className="text-[#facca3]" />
                    </span>
                    <span className="font-body text-sm text-background/80 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="py-24 md:py-40 px-[2%] max-w-[1400px] mx-auto scroll-mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 px-[2%]">
            <Reveal delay={0.0} duration={0.8}>
              <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
                Contact
              </p>
              <h2 className="font-display text-display-lg font-light mt-3">
                Begin Your <span className="italic">Journey</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-[1.8] mt-6 max-w-md">
                Whether you&apos;re seeking your next residence or considering
                listing your property, we&apos;re here to guide you with the
                expertise and discretion you deserve.
              </p>
            </Reveal>

            <Reveal delay={0.15} duration={0.8}>
              <InquiryFormWithToast />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
