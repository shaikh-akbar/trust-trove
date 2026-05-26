import Link from "next/link";
import { BadgeCheck, Link2, Megaphone, Send, Store } from "lucide-react";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Brand Resources",
  path: "/brand-resources",
  description:
    "Official GoModexa brand resources for directories, collaborations, media references, and business profile citations.",
  keywords: [
    "GoModexa brand resources",
    "GoModexa media kit",
    "GoModexa business information",
    "GoModexa press page",
  ],
});

const resourceCards = [
  {
    icon: Store,
    title: "Brand Summary",
    text: "GoModexa is an India-focused ecommerce storefront built around curated lifestyle, home, kitchen, beauty, fashion, and everyday utility products.",
  },
  {
    icon: BadgeCheck,
    title: "Citation Ready",
    text: "Use this page as the source URL when submitting business listings, partner references, creator outreach, and brand mentions.",
  },
  {
    icon: Megaphone,
    title: "Collaboration Friendly",
    text: "Affiliates, bloggers, directories, and media partners can reference the brand, support email, and category coverage from one stable page.",
  },
];

const listingTargets = [
  "Google Business Profile",
  "Bing Places",
  "Indian business directories",
  "Shopping and ecommerce listings",
  "Creator and affiliate outreach pages",
  "Social bios and link hubs",
];

export default function BrandResourcesPage() {
  return (
    <div className="bg-[var(--surface-soft)]">
      <section className="border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">
            Official Brand Page
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--surface-cream)] sm:text-5xl">
            GoModexa brand resources for citations, links, partnerships, and public references.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
            If you are listing, mentioning, reviewing, or collaborating with GoModexa, this page gives you the clean brand summary and reference details you can cite.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {resourceCards.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.18)]"
            >
              <span className="inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-navy)]">
                <Icon size={18} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--brand-navy)]">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.18)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Business Reference
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--brand-navy)] sm:text-4xl">
              Suggested brand description
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-8 text-slate-600">
              <p>
                GoModexa is an online shopping store in India focused on curated lifestyle products across categories such as home and kitchen, fashion, beauty, electronics, office accessories, travel utility, and everyday essentials.
              </p>
              <p>
                The storefront is designed around cleaner browsing, stronger search structure, category discovery, and editorial buying guides that help shoppers make better product decisions online.
              </p>
              <p>
                Official website: <span className="font-semibold text-slate-900">https://www.gomodexa.com</span>
              </p>
              <p>
                Support email: <span className="font-semibold text-slate-900">supporttrustrove@gmail.com</span>
              </p>
              <p>
                Support phone: <span className="font-semibold text-slate-900">+91 9082670335</span>
              </p>
              <p>
                Service area: <span className="font-semibold text-slate-900">India</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.18)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Where To Use
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--brand-navy)]">
                Off-page SEO targets
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                {listingTargets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Link2 size={16} className="mt-1 shrink-0 text-[var(--brand-navy)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-soft)] p-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Contact For Features
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--brand-navy)]">
                Need brand details or a collaboration contact?
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Use the official contact page for business questions, listing corrections, collaborations, or media references.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white"
                >
                  Contact GoModexa
                </Link>
                <Link
                  href="/about-us"
                  className="inline-flex items-center rounded-full border border-[var(--brand-navy)]/14 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
                >
                  About The Brand
                </Link>
              </div>
              <p className="mt-5 inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Send size={14} className="mr-2" />
                Official brand reference URL
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
