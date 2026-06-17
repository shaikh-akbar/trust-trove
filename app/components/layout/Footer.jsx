import React from "react";
import Link from "next/link";

const footerHighlights = [
  "Shop curated lifestyle products across home, kitchen, fashion, beauty, and everyday essentials.",
  "Cash on Delivery and prepaid checkout options with shipping details shown before payment.",
  "Use category, blog, and new-arrival pages to discover products faster with less clutter.",
];

const footerCollections = [
  { href: "/shop", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/blogs", label: "Blogs" },
  { href: "/brand-resources", label: "Brand Resources" },
];

const footerSeoLinks = [
  { href: "/categories/health-and-beauty", label: "Health And Beauty" },
  { href: "/categories/home-decor", label: "Home Decor" },
  { href: "/categories/automotive", label: "Automotive" },
  { href: "/categories/travel", label: "Travel" },
  { href: "/blogs/best-health-and-beauty-products-online-india-self-care-guide", label: "Self-Care Buying Guide" },
  { href: "/blogs/best-automotive-products-online-india-car-utility-guide", label: "Automotive Buying Guide" },
];

const footerSupport = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/cancellation-refund-policy", label: "Cancellation & Refund" },
  { href: "/store-policies", label: "Store Policies" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/about-us", label: "About Us" },
  { href: "/brand-resources", label: "Brand Resources" },
];

const Footer = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[linear-gradient(180deg,#fbf6ee_0%,#f3ebde_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-[var(--brand-navy)]/55">GoModexa</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--brand-navy)] sm:text-[3.5rem]">
              Better shopping links, policies, and support without the filler.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Browse collections, check delivery policies, and reach support from one calmer footer designed to help customers move forward faster.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-full bg-[var(--brand-navy)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-[#0f164b]"
              >
                Shop now
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center rounded-full border border-[var(--brand-navy)]/14 bg-white/80 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)] transition hover:bg-white"
              >
                Contact support
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {footerHighlights.map((item, index) => (
                <div key={item} className="border-t border-[var(--brand-navy)]/10 pt-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--brand-navy)]/48">
                    {index === 0 ? "Collections" : index === 1 ? "Payments" : "Discovery"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--brand-navy)]/10 bg-white/55 p-6 shadow-[0_24px_70px_-56px_rgba(20,29,96,0.22)] backdrop-blur sm:p-7">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">Shop</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {footerCollections.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="transition hover:text-[var(--brand-navy)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">Policies</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {footerSupport.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="transition hover:text-[var(--brand-navy)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">SEO Paths</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {footerSeoLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="transition hover:text-[var(--brand-navy)]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-[var(--brand-navy)]/10 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">Need help?</p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                    Delivery questions, payment clarification, or order-related help can be handled from our support and policy pages.
                  </p>
                </div>
                <div className="shrink-0">
                  <Link
                    href="/contact-us"
                    className="inline-flex rounded-full border border-[var(--brand-navy)]/12 bg-[var(--surface-soft)] px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)] transition hover:bg-white"
                  >
                    Get support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--brand-navy)]/10 pb-8 pt-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-xs text-slate-500">&copy; 2026 GoModexa. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 md:justify-end">
            <Link href="/shipping-policy" className="hover:text-[var(--brand-navy)]">Shipping Policy</Link>
            <Link href="/cancellation-refund-policy" className="hover:text-[var(--brand-navy)]">Refund Policy</Link>
            <Link href="/contact-us" className="hover:text-[var(--brand-navy)]">Contact</Link>
            <Link href="/brand-resources" className="hover:text-[var(--brand-navy)]">Brand Resources</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

