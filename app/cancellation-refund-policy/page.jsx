import { buildMetadata } from "../../lib/seo";
import { PolicyBulletList, PolicyFooterNote, PolicyHero, PolicySection } from "../components/store/PolicyPage";

export const metadata = buildMetadata({
  title: "Cancellation, Return & Refund Policy",
  path: "/cancellation-refund-policy",
  description:
    "Read the GoModexa cancellation, return, replacement, and refund rules for confirmed orders and post-delivery issues.",
  keywords: ["GoModexa cancellation policy", "return policy", "refund policy", "replacement policy"],
});

export default function CancellationRefundPolicyPage() {
  return (
    <div className="bg-[var(--surface-soft)]">
      <PolicyHero
        eyebrow="GoModexa Policy"
        title="Order cancellation, return, and refund policy."
        description="Please review these rules carefully before placing an order with GoModexa. Orders move into fulfillment immediately after confirmation, so cancellation and modification options are very limited."
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20 py-5">
        <PolicySection title="Order cancellation policy">
          <PolicyBulletList
            items={[
              "No cancellations are allowed after an order is confirmed.",
              "We process all confirmed orders immediately to support prompt delivery, so cancellations are not permitted after confirmation.",
              "Please ensure all order details are accurate before confirming your purchase.",
            ]}
          />
        </PolicySection>

        <PolicySection title="No modifications after confirmation">
          <PolicyBulletList
            items={[
              "No changes or modifications are allowed after an order is confirmed.",
              "This includes product additions, product swaps, address changes, contact detail updates, or any other order edits.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Exceptional order cancellations by GoModexa">
          <PolicyBulletList
            items={[
              "In rare circumstances, GoModexa may cancel an order if the item is out of stock.",
              "GoModexa may also cancel an order if a pricing error is identified.",
              "Orders may be canceled if the delivery pincode provided is not serviceable.",
              "If GoModexa cancels the order for any of the above reasons, the full paid amount will be refunded.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Return and replacement policy">
          <PolicyBulletList
            items={[
              "Once a product has been delivered, returns are not accepted under normal circumstances.",
              "Any dispute related to an order must be raised within 48 hours after receipt of the shipment.",
              "A parcel opening video is mandatory for damaged goods, missing goods, or any complaint related to the goods received.",
              "One single continuous and unedited video is required for claim review.",
              "The video must clearly show the sealed package being opened, the product condition, and the visible damage, defect, or missing item.",
              "Close images of damaged products are mandatory to process the claim.",
              "Damage, defect, or missing-item claims reported after 48 hours of delivery cannot be accepted.",
              "If a return is approved, the customer must send the item back through a reliable courier with tracking.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Refund eligibility">
          <PolicyBulletList
            items={[
              "Refunds or replacements are processed only after GoModexa confirms the reported issue.",
              "For damaged or defective products, a full or partial refund may be issued depending on the case review.",
              "If a replacement is approved instead of a refund, GoModexa will communicate that during approval.",
              "If any item is missing and cannot be fulfilled, a refund will be issued for the missing item.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Non-returnable items">
          <PolicyBulletList
            items={[
              "Products that have been used, opened, or damaged by the customer are not eligible.",
              "Products marked as non-returnable in the product description are not eligible.",
              "Electric products are not covered under the refund, return, or exchange policy.",
            ]}
          />
        </PolicySection>

        <PolicySection title="Refund timeline">
          <PolicyBulletList
            items={[
              "All refund requests are subject to review and approval by the GoModexa support team.",
              "Customers will be notified by email once the refund request is approved.",
              "Approved refunds are processed within 7 working days.",
              "Refunds are credited back to the original payment source used for the purchase.",
              "If extra verification is needed, processing may take longer and the customer will be informed.",
              "For failed online payments, automated refunds are typically completed within 7 to 10 working days.",
            ]}
          />
        </PolicySection>

        <PolicyFooterNote />
      </div>
    </div>
  );
}

