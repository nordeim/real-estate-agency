import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export interface LegalSection {
  heading: string;
  body: string[];
}

/**
 * Shared layout for the legal pages (privacy/terms/accessibility) —
 * matches the original's "LEGAL" label + editorial prose structure.
 */
export function LegalPage({
  title,
  subtitle,
  sections,
  lastUpdated,
}: {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  lastUpdated: string;
}) {
  return (
    <div>
      <SiteHeader />
      <main className="pt-24">
        <article className="px-[2%] max-w-[1400px] mx-auto">
          <div className="pt-16 md:pt-24 pb-24 px-[2%] max-w-3xl">
            <p className="font-body text-xs tracking-label uppercase text-muted-foreground">
              Legal
            </p>
            <h1 className="font-display text-display-lg font-light mt-3 mb-2">
              {title}
            </h1>
            <p className="font-body text-sm text-muted-foreground italic">
              {subtitle}
            </p>
            <div className="hairline my-10" />

            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-2xl font-light mb-4">
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph, index) => (
                    <p
                      key={index}
                      className="font-body text-sm text-muted-foreground leading-[1.8] mb-4 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <p className="font-body text-xs text-muted-foreground mt-12">
              Last updated: {lastUpdated}
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
