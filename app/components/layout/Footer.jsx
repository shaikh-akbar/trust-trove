import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[linear-gradient(180deg,#faf4ea_0%,#f4ebdf_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 pt-16 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]">
          <div className="rounded-[2.3rem] border border-[var(--line)] bg-[var(--brand-navy)] p-7 text-white shadow-[0_30px_90px_-58px_rgba(20,29,96,0.5)] sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-[var(--brand-gold)]">TrustTrove</p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold text-white sm:text-[3.2rem]">
              A calmer storefront with more style, less clutter, and better product focus.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Premium lifestyle products, curated visuals, and a shopping experience designed to feel considered from the first scroll to checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Curated edits", "Cash on delivery", "Faster discovery"].map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-full rounded-[1.8rem] border border-[var(--line)] bg-white/75 p-5 shadow-[0_24px_60px_-48px_rgba(20,29,96,0.22)]">
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">Explore</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link href="/shop" className="font-display text-lg text-slate-900 transition hover:text-[var(--brand-navy)]">All Products</Link></li>
                <li><Link href="/categories" className="font-display text-lg text-slate-900 transition hover:text-[var(--brand-navy)]">Categories</Link></li>
                <li><Link href="/new-arrivals" className="font-display text-lg text-slate-900 transition hover:text-[var(--brand-navy)]">New Arrivals</Link></li>
                <li><Link href="/blogs" className="font-display text-lg text-slate-900 transition hover:text-[var(--brand-navy)]">Blogs</Link></li>
              </ul>
            </div>

            <div className="h-full rounded-[1.8rem] border border-[var(--line)] bg-white/75 p-5 shadow-[0_24px_60px_-48px_rgba(20,29,96,0.22)]">
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">Support</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link href="/track-order" className="transition hover:text-[var(--brand-navy)]">Track Order</Link></li>
                <li><Link href="/shipping-policy" className="transition hover:text-[var(--brand-navy)]">Shipping Policy</Link></li>
                <li><Link href="/cancellation-refund-policy" className="transition hover:text-[var(--brand-navy)]">Cancellation & Refund</Link></li>
                <li><Link href="/store-policies" className="transition hover:text-[var(--brand-navy)]">Store Policies</Link></li>
                <li><Link href="/terms-of-service" className="transition hover:text-[var(--brand-navy)]">Terms of Service</Link></li>
                <li><Link href="/contact-us" className="transition hover:text-[var(--brand-navy)]">Contact Us</Link></li>
                <li><Link href="/about-us" className="transition hover:text-[var(--brand-navy)]">About Us</Link></li>
              </ul>
            </div>

            <div className="h-full rounded-[1.8rem] border border-[var(--line)] bg-white/75 p-5 shadow-[0_24px_60px_-48px_rgba(20,29,96,0.22)] sm:col-span-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">Trust</h4>
              <div className="mt-4 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] p-5">
                <p className="max-w-[20rem] font-display text-[1.85rem] leading-[0.95] text-[var(--brand-navy)] sm:text-[2.15rem]">
                  Cash on Delivery available on all orders for a worry-free experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--line)] pb-8 pt-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-xs text-slate-500">&copy; 2026 TrustTrove. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 md:justify-end">
            <Link href="/shipping-policy" className="hover:text-[var(--brand-navy)]">Shipping Policy</Link>
            <Link href="/cancellation-refund-policy" className="hover:text-[var(--brand-navy)]">Refund Policy</Link>
            <Link href="/contact-us" className="hover:text-[var(--brand-navy)]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
