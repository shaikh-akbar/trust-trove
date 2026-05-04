import { buildMetadata } from "../../lib/seo";
import { PolicyBulletList, PolicyFooterNote, PolicyHero, PolicySection } from "../components/store/PolicyPage";

export const metadata = buildMetadata({
  title: "Shipping Policy",
  path: "/shipping-policy",
  description: "Read the TrustTrove shipping policy, dispatch expectations, delivery timelines, and order support guidance.",
  keywords: ["shipping policy", "delivery information", "TrustTrove shipping"],
});

export default function ShippingPolicyPage() {
  return (
    <div className="bg-[var(--surface-soft)]">
      <PolicyHero
        eyebrow="TrustTrove Policy"
        title="Shipping and delivery policy."
        description="This page explains how TrustTrove processes, ships, and delivers orders across India, including shipping timelines, serviceability, and tracking expectations."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <PolicySection title="Processing and dispatch timelines">
          <PolicyBulletList
            items={[
              "TrustTrove generally processes and ships orders on the next business day.",
              "Orders are dispatched within 48 hours at the latest in standard cases.",
              "In some cases, order processing and shipping may take up to 3 business days.",
              "Orders are shipped Monday to Saturday, excluding Sundays and public holidays.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Delivery timelines">
          <PolicyBulletList
            items={[
              "Delivery usually takes a minimum of 3 days and may take up to 7 days depending on location and logistics conditions.",
              "Short courier delays of 0 to 2 days may occur during heavy load periods.",
              "TrustTrove guarantees dispatch within the stated internal processing timeline, but courier transit is handled by third-party delivery partners.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Serviceability and shipment handling">
          <PolicyBulletList
            items={[
              "Product delivery is limited to serviceable pin codes and supported locations.",
              "Customers should use the Check Delivery option on the product page to verify availability in their area.",
              "To ensure fast and safe delivery, TrustTrove ships through reputed courier agencies only.",
              "Where necessary, items from the same order may be shipped separately due to product characteristics or stock availability.",
              "All shipments include an invoice showing the order value in line with Indian tax regulations.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Shipment status updates">
          <PolicyBulletList
            items={[
              "Order Placed: the order has been received and is awaiting processing.",
              "Processing: product availability is being confirmed and items are being prepared for shipment.",
              "Ready to Ship: the order has been packed and completed final quality checks.",
              "Dispatched: the shipment is in transit and tracking information is active.",
              "Out for Delivery: the package is with the final delivery partner and is expected shortly.",
              "Delivered: the order has been delivered successfully to the destination address.",
            ]}
          />
        </PolicySection>

        <PolicyFooterNote />
      </div>
    </div>
  );
}
