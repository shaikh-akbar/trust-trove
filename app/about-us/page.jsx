import Link from "next/link";
import { Compass, Gem, ShieldCheck } from "lucide-react";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "About Us",
  path: "/about-us",
  description: "Learn about TrustTrove, our premium retail direction, and the trust-first philosophy behind the storefront.",
  keywords: ["about TrustTrove", "TrustTrove brand", "premium ecommerce India"],
});

export default function AboutUsPage() {
  return (
    <div className="bg-[var(--brand-navy)] text-white">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">About TrustTrove</p>
        <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--surface-cream)] sm:text-5xl">
          Built to make online shopping feel more polished, trustworthy, and inspiring.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200">
          TrustTrove brings together curated lifestyle products, cleaner design, and better route-level structure so customers can browse with more confidence and less friction.
        </p>
      </section>

      <section className="border-y border-white/10 bg-white/[0.06]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            { icon: Compass, title: "Curated direction", text: "We focus on products and categories that feel giftable, practical, and visually premium." },
            { icon: ShieldCheck, title: "Trust first", text: "Clear policies, transparent flows, and dependable product presentation matter as much as aesthetics." },
            { icon: Gem, title: "Elevated experience", text: "We believe ecommerce should look refined while still staying fast, useful, and easy to understand." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur">
              <span className="inline-flex rounded-2xl bg-[var(--brand-gold)] p-3 text-[var(--brand-navy)]">
                <Icon size={18} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--surface-cream)] sm:text-3xl">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 backdrop-blur">
          <h2 className="font-display text-3xl font-semibold text-[var(--surface-cream)] sm:text-4xl">The next step</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
            We’re shaping TrustTrove into a store that combines sharper merchandising, better search discovery, and modern content structure without disrupting the core shopping flow.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="inline-flex rounded-full bg-[var(--brand-gold)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]">
              Shop now
            </Link>
            <Link href="/contact-us" className="inline-flex rounded-full border border-white/[0.12] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
