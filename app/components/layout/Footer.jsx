import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 text-slate-900 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 pt-16 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <img
              src="/assets/trust-1.png"
              alt="TrustTrove Logo"
              className="-ml-3 mb-4 h-20 w-auto max-w-none object-contain object-left sm:h-24"
            />
            <p className="text-sm leading-relaxed text-slate-600">
              Premium lifestyle products, curated visuals, and a calmer shopping experience built around trust.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--brand-navy)]">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/shop" className="transition hover:text-[var(--brand-navy)]">All Products</Link></li>
              <li><Link href="/categories" className="transition hover:text-[var(--brand-navy)]">Categories</Link></li>
              <li><Link href="/new-arrivals" className="transition hover:text-[var(--brand-navy)]">New Arrivals</Link></li>
              <li><Link href="/blogs" className="transition hover:text-[var(--brand-navy)]">Blogs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--brand-navy)]">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/track-order" className="transition hover:text-[var(--brand-navy)]">Track Order</Link></li>
              <li><Link href="/shipping-policy" className="transition hover:text-[var(--brand-navy)]">Shipping Policy</Link></li>
              <li><Link href="/cancellation-refund-policy" className="transition hover:text-[var(--brand-navy)]">Cancellation & Refund</Link></li>
              <li><Link href="/store-policies" className="transition hover:text-[var(--brand-navy)]">Store Policies</Link></li>
              <li><Link href="/terms-of-service" className="transition hover:text-[var(--brand-navy)]">Terms of Service</Link></li>
              <li><Link href="/contact-us" className="transition hover:text-[var(--brand-navy)]">Contact Us</Link></li>
              <li><Link href="/about-us" className="transition hover:text-[var(--brand-navy)]">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--brand-navy)]">Trust</h4>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-[12px] italic text-slate-600">
                &ldquo;Cash on Delivery available on all orders for a worry-free experience.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between space-y-4 border-t border-slate-200 pb-8 pt-8 md:flex-row md:space-y-0">
          <p className="text-xs text-slate-500">&copy; 2026 TrustTrove. All rights reserved.</p>
          <div className="flex space-x-6 text-xs text-slate-500">
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
