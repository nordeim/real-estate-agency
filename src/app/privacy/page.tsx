import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Your privacy, protected with the same discretion as your property."
      lastUpdated="September 2026"
      sections={[
        {
          heading: "Overview",
          body: [
            "Maison Estate (\u201cwe\u201d, \u201cus\u201d) respects your privacy and is committed to protecting your personal information. This policy explains what information we collect when you use maisonestate.com, how we use it, and the choices you have.",
            "By using this website, submitting an inquiry, or subscribing to our market insights, you agree to the practices described below.",
          ],
        },
        {
          heading: "Information We Collect",
          body: [
            "Inquiry details: when you submit an inquiry or schedule a viewing we store your name, email address, phone number (optional), preferred date, message, and the property the inquiry relates to.",
            "Newsletter subscriptions: we store your email address to send curated market intelligence. Every email includes a way to unsubscribe.",
            "Usage information: we collect basic, non-identifying analytics about pages visited and interactions to improve the experience.",
          ],
        },
        {
          heading: "How We Use Information",
          body: [
            "We use your information solely to respond to inquiries, schedule property viewings, deliver requested communications, and operate the website. We do not sell your personal information to third parties.",
            "Inquiry records are retained for as long as needed to serve your request and satisfy our record-keeping obligations, after which they are deleted.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            "You may request access to, correction of, or deletion of your personal information at any time by emailing info@mysite.com. We respond to verified requests within 30 days.",
            "California residents may exercise additional rights under the CCPA/CPRA, including the right to know what personal information is collected and the right to opt out of any sale — note that we do not sell personal information.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about this policy can be directed to Maison Estate, 500 Terry Francine St., San Francisco, CA 94158, or info@mysite.com.",
          ],
        },
      ]}
    />
  );
}
