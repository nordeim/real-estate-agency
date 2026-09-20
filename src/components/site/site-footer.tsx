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
              <h2 className="font-display text-display-md font-light">
                Market Insights,{" "}
                <span className="italic">Delivered</span>
              </h2>
              <p className="font-body text-sm text-background/70 mt-4 max-w-md leading-relaxed">
                Curated intelligence on luxury real estate trends, neighborhood
                analyses, and exclusive pre-market opportunities.
              </p>
              <div className="mt-8">
                <NewsletterForm />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-2">
                  NAVIGATE
                </h3>
                <ul className="space-y-2">
                  {NAVIGATE_LINKS.map((link) => (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        className="font-body text-sm text-background/70 hover:text-background transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-2">
                  CATEGORIES
                </h3>
                <ul className="space-y-2">
                  {CATEGORIES.map((link) => (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        className="font-body text-sm text-background/70 hover:text-background transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-2">
                  CONTACT
                </h3>
                <address className="not-italic space-y-2 font-body text-sm text-background/70">
                  <p>{SITE.address}</p>
                  <p>{SITE.city}</p>
                  <p>
                    <a
                      href={SITE.phoneHref}
                      className="hover:text-background transition-colors"
                    >
                      {SITE.phone}
                    </a>
                  </p>
                  <p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="hover:text-background transition-colors"
                    >
                      {SITE.email}
                    </a>
                  </p>
                </address>
              </div>
              <div>
                <h3 className="font-body text-xs tracking-label uppercase text-background/60 mb-2">
                  FOLLOW
                </h3>
                <ul className="space-y-2">
                  {SOCIAL_LINKS.map((label) => (
                    <li key={label}>
                      <a
                        href="#"
                        className="font-body text-sm text-background/70 hover:text-background transition-colors"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="px-[2%] mx-auto max-w-[1400px]">
          <div className="border-t border-background/20 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="font-display text-xl font-light tracking-editorial">
              MAISON <span className="text-[#facca3]">ESTATE</span>
            </Link>
            <p className="font-body text-xs text-background/60 text-center">
              © 2035 Maison Estate. Built with Next.js.
            </p>
            <nav
              className="flex items-center gap-6"
              aria-label="Legal"
            >
              <Link
                href="/privacy"
                className="font-body text-xs text-background/60 hover:text-background transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="font-body text-xs text-background/60 hover:text-background transition-colors"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/accessibility"
                className="font-body text-xs text-background/60 hover:text-background transition-colors"
              >
                Accessibility
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
