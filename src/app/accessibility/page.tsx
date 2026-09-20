import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Maison Estate's commitment to an accessible web experience.",
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility Statement"
      subtitle="Our commitment to an experience open to everyone."
      lastUpdated="September 2026"
      sections={[
        {
          heading: "Our Commitment",
          body: [
            "Maison Estate is committed to ensuring digital accessibility for people of all abilities. We continually improve the user experience for everyone and apply the relevant accessibility standards — targeting conformance with WCAG 2.2 Level AA.",
          ],
        },
        {
          heading: "Measures We Take",
          body: [
            "This site is built with semantic HTML landmarks, keyboard-navigable interactive elements, visible focus states, and sufficient color contrast between text and background.",
            "Images carry descriptive alternative text; decorative elements are hidden from assistive technology; motion respects the prefers-reduced-motion setting; and forms label every field with programmatic labels and error messaging.",
          ],
        },
        {
          heading: "Feedback",
          body: [
            "We welcome your feedback on the accessibility of this site. If you encounter barriers, please email info@mysite.com or call 123-456-7890 so we can assist you directly and address the issue.",
            "We aim to respond to accessibility feedback within two business days.",
          ],
        },
      ]}
    />
  );
}
