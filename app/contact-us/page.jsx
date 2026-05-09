import { Mail, MapPin, Phone } from "lucide-react";
import { buildMetadata } from "../../lib/seo";
import { PolicyHero, PolicySection } from "../components/store/PolicyPage";

export const metadata = buildMetadata({
  title: "Contact Us",
  path: "/contact-us",
  description: "Contact TrustTrove for support, order help, shipping questions, or brand-related inquiries.",
  keywords: ["TrustTrove contact", "customer support", "contact ecommerce store"],
});

export default function ContactUsPage() {
  return (
    <div className="bg-[var(--surface-soft)]">
      <PolicyHero
        eyebrow="Contact TrustTrove"
        title="Reach the team behind your TrustTrove experience."
        description="For order assistance, shipping questions, collaboration requests, or general support, this is the fastest place to start."
      />

      <div className="mx-auto max-w-6xl px-4 py-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            { icon: Mail, title: "Email support", value: "supporttrustrove@gmail.com", detail: "Best for order help and general questions." },
            { icon: Phone, title: "Phone line", value: "+91 9082670335", detail: "Use for urgent support during business hours." },
            { icon: MapPin, title: "Service region", value: "India", detail: "We currently serve customers across India." },
          ].map(({ icon: Icon, title, value, detail }) => (
            <div key={title} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.36)]">
              <span className="inline-flex rounded-2xl bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] p-3 text-[var(--brand-navy)]">
                <Icon size={18} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">{title}</h2>
              <p className="mt-4 text-lg font-semibold text-slate-950">{value}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{detail}</p>
            </div>
          ))}
        </section>

        <div className="mt-6">
          <PolicySection title="Response expectations">
            <p className="max-w-2xl">
            We usually respond within one business day. If your message is about an active order, include your order number to help us assist faster.
            </p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
