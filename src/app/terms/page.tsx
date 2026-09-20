import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  path: "/terms",
});

/**
 * The original app ships the Wix "Terms & Conditions" template
 * placeholder copy verbatim — reproduced here bug-for-bug.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      titleMargin="mb-16"
      sections={[
        {
          heading: "A legal disclaimer",
          paragraphs: [
            "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of Terms & Conditions. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific terms you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Terms & Conditions.",
          ],
        },
        {
          heading: "Terms & Conditions - the basics",
          paragraphs: [
            'Having said that, Terms and Conditions ("T&C") are a set of legally binding terms defined by you, as the owner of this website. The T&C set forth the legal boundaries governing the activities of the website visitors, or your customers, while they visit or engage with this website. The T&C are meant to establish the legal relationship between the site visitors and you as the website owner.',
            "T&C should be defined according to the specific needs and nature of each website. For example, a website offering products to customers in e-commerce transactions requires T&C that are different from the T&C of a website only providing information (like a blog, a landing page, and so on).",
            "T&C provide you as the website owner the ability to protect yourself from potential legal exposure, but this may differ from jurisdiction to jurisdiction, so make sure to receive local legal advice if you are trying to protect yourself from legal exposure.",
          ],
        },
        {
          heading: "What to include in the T&C document",
          paragraphs: [
            "Generally speaking, T&C often address these types of issues: Who is allowed to use the website; the possible payment methods; a declaration that the website owner may change his or her offering in the future; the types of warranties the website owner gives his or her customers; a reference to issues of intellectual property or copyrights, where relevant; the website owner's right to suspend or cancel a member's account; and much, much more.",
          ],
        },
      ]}
    />
  );
}
