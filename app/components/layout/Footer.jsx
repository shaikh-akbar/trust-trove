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

const socialProfileLinks = [
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, label: "Instagram" },
  { href: process.env.NEXT_PUBLIC_FACEBOOK_URL, label: "Facebook" },
  { href: process.env.NEXT_PUBLIC_LINKEDIN_URL, label: "LinkedIn" },
  { href: process.env.NEXT_PUBLIC_YOUTUBE_URL, label: "YouTube" },
  { href: process.env.NEXT_PUBLIC_PINTEREST_URL, label: "Pinterest" },
  { href: process.env.NEXT_PUBLIC_X_URL, label: "X" },
].filter((item) => item.href);

function SocialIcon({ label }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };

  switch (label) {
    case "Instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case "Facebook":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M13.5 21v-7h2.2l.3-2.6h-2.5V9.7c0-.75.2-1.26 1.28-1.26H16V6.1c-.22-.03-.98-.1-1.87-.1-1.85 0-3.13 1.13-3.13 3.2v1.98H9v2.6h2v7"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="8.5" r="1.1" fill="currentColor" />
          <path d="M8 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M12 13.8c0-1.55 1-2.3 2-2.3s2 .75 2 2.3V17"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Pinterest":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M10 18c.6-2.4 1.2-5 1.7-7.3M11.3 13.2c.4.9 1.3 1.4 2.3 1.2 1.6-.3 2.6-1.9 2.3-3.6-.3-1.8-2-3-3.9-2.6-2 .4-3.2 2.3-2.8 4.2"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "YouTube":
      return (
        <svg {...common}>
          <rect x="2.5" y="6" width="19" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" />
        </svg>
      );
    case "X":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

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

        {socialProfileLinks.length > 0 ? (
          <div className="flex flex-col items-center gap-3 border-t border-[var(--brand-navy)]/10 pt-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--brand-navy)]/55">Follow GoModexa</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:gap-5">
              {socialProfileLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  className="flex items-center gap-2 hover:text-[var(--brand-navy)]"
                >
                  <SocialIcon label={item.label} />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}

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

