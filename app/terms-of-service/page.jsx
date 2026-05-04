import { buildMetadata } from "../../lib/seo";
import { PolicyBulletList, PolicyFooterNote, PolicyHero, PolicySection } from "../components/store/PolicyPage";

export const metadata = buildMetadata({
  title: "Terms of Service",
  path: "/terms-of-service",
  description:
    "Read the TrustTrove terms of service governing browsing, purchasing, account use, pricing, and customer responsibilities.",
  keywords: ["TrustTrove terms", "terms of service", "website terms India"],
});

export default function TermsOfServicePage() {
  return (
    <div className="bg-[var(--surface-soft)]">
      <PolicyHero
        eyebrow="TrustTrove Terms"
        title="Terms of service for using the TrustTrove website."
        description="By visiting the TrustTrove website, browsing products, or placing an order, you agree to these service terms, along with the related policy pages published on this website."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <PolicySection title="Use of the website">
          <PolicyBulletList
            items={[
              "You must be of legal age in your place of residence, or have proper consent, to use this website for purchases.",
              "You may not use TrustTrove products or services for unlawful or unauthorized purposes.",
              "You may not upload or transmit viruses, malicious code, or anything intended to harm the website or its users.",
            ]}
          />
        </PolicySection>

        <PolicySection title="General service conditions">
          <PolicyBulletList
            items={[
              "TrustTrove reserves the right to refuse service to anyone for any reason at any time.",
              "Prices, product descriptions, availability, and website content may change without prior notice.",
              "The website content is provided for general information and should not be relied upon as a sole decision-making source.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Products, pricing, and orders">
          <PolicyBulletList
            items={[
              "Some products may have limited quantities and may only be available online.",
              "TrustTrove aims to display product colors and images as accurately as possible, but screen variations may affect appearance.",
              "TrustTrove may limit, refuse, or cancel orders at its discretion, including for suspected reseller, duplicate, or high-risk orders.",
              "Customers are responsible for providing accurate billing, delivery, and contact information for all orders.",
            ]}
          />
        </PolicySection>

        <PolicySection title="User submissions and prohibited conduct">
          <PolicyBulletList
            items={[
              "If you send comments, feedback, suggestions, or similar submissions, TrustTrove may use them without obligation to compensate or respond.",
              "You may not use the site to harass, defame, discriminate, spam, scrape, phish, or violate intellectual property rights.",
              "You may not submit false, misleading, or unlawful information through the site.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Liability and legal scope">
          <PolicyBulletList
            items={[
              "TrustTrove does not guarantee uninterrupted, error-free, or always-available website service.",
              "All use of the website and services is at the customer’s own risk, subject to applicable law.",
              "These terms are governed by the laws of India.",
              "TrustTrove may update these terms from time to time, and continued website use after updates implies acceptance of the revised terms.",
            ]}
          />
        </PolicySection>

        <PolicyFooterNote />
      </div>
    </div>
  );
}
