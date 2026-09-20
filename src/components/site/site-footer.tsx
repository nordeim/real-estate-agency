import Link from "next/link";
import { SITE } from "@/lib/constants";
import { NewsletterForm } from "@/components/site/newsletter-form";

const NAVIGATE_LINKS = [
  { label: "Home", path: "/" },
  { label: "Properties", path: "/properties" },
  { label: "Sell", path: "/sell" },
  { label: "About", path: "/about" },
];

const CATEGORIES = [
  { label: "Penthouses", path: "/properties?type=Penthouse" },
  { label: "Waterfront", path: "/properties?type=Waterfront" },
  { label: "Modernist", path: "/properties?type=Modernist" },
  { label: "Estates", path: "/properties?type=Estate" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Pinterest"];

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background w-full">
      <div className="px-[2%] w-full">
        <div className="py-24 md:py-40 pb-16 md:pb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 px-[2%] mx-auto max-w-[1400px]">
            <div>
              <h2 className="font-display text-display-lg font-light mb-6">
                Market Insights,
                <br />
                <span className="italic">Delivered</span>
              </h2>
              <p className="font-body text-background/60 text-sm leading-relaxed max-w-md mb-8">
                Curated intelligence on luxury real estate trends,
                neighborhood analyses, and exclusive pre-market opportunities.
              </p>
              <NewsletterForm />
            </div>

            <div className="grid grid-cols-2 gap-x-4 md:gap-x-12 gap-y-12">
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">
                  Navigate
                </h3>
                <nav className="flex flex-col gap-2" aria-label="Footer navigation">
                  {NAVIGATE_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="font-body text-sm text-background/70 hover:text-background transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">
                  Categories
                </h3>
                <nav className="flex flex-col gap-2" aria-label="Property categories">
                  {CATEGORIES.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="font-body text-sm text-background/70 hover:text-background transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">
                  Contact
                </h3>
                <address className="not-italic flex flex-col gap-2 font-body text-sm text-background/70">
                  <span>{SITE.address}</span>
                  <span>{SITE.city}</span>
                  <a
                    href={SITE.phoneHref}
                    className="hover:text-background transition-colors mt-1"
                  >
                    {SITE.phone}
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="hover:text-background transition-colors"
                  >
                    {SITE.email}
                  </a>
                </address>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-4">
                  Follow
                </h3>
                <nav className="flex flex-col gap-2" aria-label="Social links">
                  {SOCIAL_LINKS.map((label) => (
                    <a
                      key={label}
                      href="#"
                      className="font-body text-sm text-background/70 hover:text-background transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 py-6 pb-10 md:pb-8 bg-foreground w-full">
          <div className="px-[2%]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start gap-4">
              <Link
                href="/"
                className="font-display text-xl font-light tracking-editorial order-first text-white"
              >
                MAISON{" "}
                <span style={{ color: "rgb(255, 203, 164)" }}>ESTATE</span>
              </Link>
              <span className="font-body text-xs text-background/40 mx-auto">
                © 2035 Maison Estate. Built on Base44.
              </span>
              <div className="flex gap-4 lg:ml-0 self-center lg:self-auto">
                <Link
                  href="/privacy"
                  className="font-body text-xs text-background/40 hover:text-background/70 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="font-body text-xs text-background/40 hover:text-background/70 transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
                <Link
                  href="/accessibility"
                  className="font-body text-xs text-background/40 hover:text-background/70 transition-colors"
                >
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
