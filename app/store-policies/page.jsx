import { buildMetadata } from "../../lib/seo";
import { PolicyBulletList, PolicyFooterNote, PolicyHero, PolicySection } from "../components/store/PolicyPage";

export const metadata = buildMetadata({
  title: "Store Policies",
  path: "/store-policies",
  description:
    "Read the TrustTrove store policies covering accounts, orders, delivery support, and payment guidance.",
  keywords: ["TrustTrove store policies", "store FAQ", "account and order policy"],
});

export default function StorePoliciesPage() {
  return (
    <div className="bg-[var(--surface-soft)] ">
      <PolicyHero
        eyebrow="TrustTrove FAQ"
        title="Store policies and customer guidance."
        description="These quick answers explain how shopping, account access, order tracking, security, payments, and support work across TrustTrove."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20 py-5">
        <PolicySection title="Accounts and orders">
          <PolicyBulletList
            items={[
              "You do not need to create an account just to browse the TrustTrove store.",
              "For order help and order-linked access, login verification may be required.",
              "You can view your purchases from the My Orders section on the storefront once you are signed in.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Security and privacy">
          <PolicyBulletList
            items={[
              "Ordering on TrustTrove is designed to be secure.",
              "Transactions are processed through reputable payment gateways and secure payment paths.",
              "Customer information is access controlled and handled with a strong privacy-first approach.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Shipping support">
          <PolicyBulletList
            items={[
              "TrustTrove serves a broad delivery network across India, subject to serviceable pin codes.",
              "Customers can track orders from the website and may also receive logistics updates by email or WhatsApp where available.",
              "Shipping charges are calculated and shown during checkout before payment is completed.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Payments">
          <PolicyBulletList
            items={[
              "TrustTrove accepts Cards, UPI, Net Banking, and Wallets.",
              "Cash on Delivery is available where applicable.",
              "Failed online payments are automatically refunded to the original payment source within the standard bank processing window.",
            ]}
          />
        </PolicySection>

        <PolicyFooterNote />
      </div>
    </div>
  );
}
