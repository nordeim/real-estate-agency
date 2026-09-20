import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export interface LegalIntro {
  /** Plain lead paragraph of the intro block. */
  lead: string;
  /** Italic *Note paragraph (the accessibility template's editing note). */
  note?: string;
  /** Closing intro paragraphs rendered after the note. */
  trailing?: string[];
}

export interface LegalSection {
  /** Section heading; the first accessibility section carries none. */
  heading?: string;
  /** Rendered as an italic muted span inside the h2 — the original's
   *  bracketed "[only add if relevant]" suffixes. */
  headingSuffix?: string;
  paragraphs: string[];
  /** Dash-prefixed list rendered after the paragraphs. */
  list?: string[];
  /** Bottom margin on the paragraph preceding the list — "mb-4" default;
   *  the original's Requests section uses "mb-6". */
  listLeadMargin?: string;
}

/**
 * Shared layout for the legal pages (privacy/terms/accessibility).
 *
 * Mirrors the original app's structure exactly: a single max-w-[760px]
 * editorial column inside section.pt-40, the "LEGAL" label, then
 * space-y-14 sections each opened by a hairline. The original ships
 * Wix-template placeholder copy — the pages pass it verbatim.
 */
export function LegalPage({
  title,
  titleMargin,
  intro,
  sections,
}: {
  title: string;
  /** h1 bottom margin — the original uses mb-16 (privacy/terms) and
   *  mb-12 (accessibility, which adds the intro block after the h1). */
  titleMargin: string;
  intro?: LegalIntro;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="min-h-screen">
          <section className="pt-40 pb-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
            <Reveal duration={0.6} yOffset={16} className="max-w-[760px]">
              <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
                Legal
              </p>
              <h1
                className={`font-display text-display-lg font-light ${titleMargin}`}
              >
                {title}
              </h1>

              {intro && (
                <div className="mb-16 space-y-3">
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {intro.lead}
                  </p>
                  {intro.note && (
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      <em>{intro.note}</em>
                    </p>
                  )}
                  {intro.trailing?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-body text-sm text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-14">
                {sections.map((section) => (
                  <Reveal
                    key={section.heading ?? section.paragraphs[0]}
                    duration={0.6}
                    yOffset={16}
                  >
                    <div className="hairline mb-8" />
                    {section.heading && (
                      <h2 className="font-display text-display-sm font-light mb-4">
                        {section.heading}
                        {section.headingSuffix && (
                          <>
                            {" "}
                            <span className="text-muted-foreground italic text-base">
                              {section.headingSuffix}
                            </span>
                          </>
                        )}
                      </h2>
                    )}
                    {section.paragraphs.map((paragraph, index) => {
                      const isLast =
                        index === section.paragraphs.length - 1;
                      // Non-last paragraphs carry mb-4; the last one only
                      // keeps a margin when a list follows (the original's
                      // pre-list lead-ins), using the section's lead margin.
                      const margin = !isLast
                        ? "mb-4"
                        : section.list
                          ? (section.listLeadMargin ?? "mb-4")
                          : "";
                      return (
                        <p
                          key={paragraph}
                          className={`font-body text-sm text-muted-foreground leading-relaxed ${margin}`}
                        >
                          {paragraph}
                        </p>
                      );
                    })}
                    {section.list && (
                      <ul className="space-y-2">
                        {section.list.map((item) => (
                          <li
                            key={item}
                            className="font-body text-sm text-muted-foreground leading-relaxed flex gap-3"
                          >
                            <span className="text-accent mt-1">—</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
