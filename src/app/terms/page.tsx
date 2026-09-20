import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms governing your use of the Maison Estate website and services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="The agreement between you and Maison Estate."
      lastUpdated="September 2026"
      sections={[
        {
          heading: "Acceptance of Terms",
          body: [
            "By accessing maisonestate.com you agree to these Terms & Conditions and to our Privacy Policy. If you do not agree, please discontinue use of the website.",
          ],
        },
        {
          heading: "Listing Information",
          body: [
            "Property listings, including prices, dimensions, availability, and descriptions, are provided for informational purposes and may change without notice. While we work to keep listings accurate, we make no warranty as to completeness and recommend independent verification of any material fact before acting.",
            "All measurements are approximate. Renderings, where present, are artistic representations.",
          ],
        },
        {
          heading: "Use of the Website",
          body: [
            "You may use this website for lawful, personal, non-commercial purposes only. You agree not to scrape, resell, or republish listing content; attempt to gain unauthorized access to our systems; or use the inquiry forms for spam or automated solicitation.",
            "We may limit inquiry frequency to protect the service for all visitors.",
          ],
        },
        {
          heading: "Intellectual Property",
          body: [
            "The Maison Estate name, logo, photography, and site content are the property of Maison Estate or its licensors and may not be reproduced without written permission.",
          ],
        },
        {
          heading: "Limitation of Liability",
          body: [
            "To the fullest extent permitted by law, Maison Estate shall not be liable for indirect, incidental, or consequential damages arising from your use of this website or reliance on its content.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about these terms can be directed to Maison Estate, 500 Terry Francine St., San Francisco, CA 94158, or info@mysite.com.",
          ],
        },
      ]}
    />
  );
}
