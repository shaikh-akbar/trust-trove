import { Mail, MapPin, Phone } from "lucide-react";
import { buildMetadata } from "../../lib/seo";
import { PolicyHero, PolicySection } from "../components/store/PolicyPage";

export const metadata = buildMetadata({
  title: "Contact Us",
  path: "/contact-us",
  description: "Contact GoModexa for support, order help, shipping questions, or brand-related inquiries.",
  keywords: ["GoModexa contact", "customer support", "contact ecommerce store"],
});

export default function ContactUsPage() {
  const contactCards = [
    {
      icon: Mail,
      title: "Email support",
      value: "supporttrustrove@gmail.com",
      detail: "Best for order help, return questions, shipping follow-ups, and general support.",
    },
    {
      icon: Phone,
      title: "Phone line",
      value: "+91 9082670335",
      detail: "Use for urgent support during business hours when a faster response matters.",
    },
    {
      icon: MapPin,
      title: "Service region",
      value: "India",
      detail: "We currently serve customers across India through the GoModexa shopping experience.",
    },
  ];

  const supportTopics = [
    "Order status and delivery updates",
    "Product questions before purchase",
    "Cancellation and refund support",
    "Brand, partnership, or collaboration inquiries",
  ];

  const faqs = [
    {
      question: "What should I include when contacting GoModexa about an order?",
      answer:
        "Include your order number, the email or phone used at checkout, and a short summary of the issue so the support team can respond faster.",
    },
    {
      question: "How quickly does GoModexa usually reply?",
      answer:
        "Most support requests are reviewed within one business day. Timelines may vary during high-volume sale periods or holidays.",
    },
    {
      question: "Can I contact GoModexa before placing an order?",
      answer:
        "Yes. The contact page can also be used for product clarification, delivery questions, policy guidance, and pre-purchase confidence checks.",
    },
  ];

  return (
    <div className="bg-[var(--surface-soft)]">
      <PolicyHero
        eyebrow="Contact GoModexa"
        title="Reach the team behind your GoModexa experience."
        description="For order assistance, shipping questions, collaboration requests, or general support, this is the fastest place to start."
      />

      <div className="mx-auto max-w-6xl px-4 py-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {contactCards.map(({ icon: Icon, title, value, detail }) => (
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

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.26)] sm:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Support guide
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--brand-navy)]">
              What this page helps customers do
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Contact pages often get ignored by search engines when they look too thin or too generic. This page is
              designed to make the support path clearer for customers while also giving Google more useful context
              about the kinds of help available on GoModexa.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {supportTopics.map((topic) => (
                <div
                  key={topic}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-semibold text-slate-700"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#141d60_0%,#2a367f_100%)] p-6 text-white shadow-[0_28px_82px_-58px_rgba(20,29,96,0.45)] sm:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/62">
              Contact checklist
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Send one better message, get one faster answer.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <li>Share your order number for delivery or support requests.</li>
              <li>Explain the issue in one short sentence first, then add details.</li>
              <li>Use the same contact details you used during checkout when possible.</li>
              <li>For policy questions, mention whether it relates to shipping, cancellation, or returns.</li>
            </ul>
          </div>
        </section>

        <div className="mt-6">
          <PolicySection title="Response expectations">
            <p className="max-w-2xl">
              We usually respond within one business day. If your message is about an active order, include your order
              number to help us assist faster.
            </p>
          </PolicySection>
        </div>

        <section className="mt-6 rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.24)] sm:p-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Contact FAQs
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--brand-navy)]">
            Questions customers usually ask before reaching out
          </h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4"
              >
                <h3 className="text-base font-semibold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

