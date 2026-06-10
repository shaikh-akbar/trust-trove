import Link from "next/link";
import { BadgePercent, ChevronRight, RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react";
import ProductCard from "../home/ProductCard";

const TRUST_POINTS = [
  {
    icon: Wallet,
    title: "Best Value Deals",
    text: "Get the best products at the best prices",
  },
  {
    icon: ShieldCheck,
    title: "100% Genuine Products",
    text: "Quality you can trust",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    text: "Hassle-free return support when eligible",
  },
  {
    icon: Truck,
    title: "Secure Payments",
    text: "Multiple secure payment options",
  },
];

const CATEGORY_SHORTCUTS = [
  { label: "Home & Kitchen", href: "/categories/home-and-kitchen" },
  { label: "Beauty", href: "/categories/health-and-beauty" },
  { label: "Electronics", href: "/categories/electronics" },
  { label: "Accessories", href: "/categories/accessories" },
  { label: "Travel", href: "/categories/travel" },
];

export default function BestDealsExperience({ definition, tabs = [], products = [] }) {
  return (
    <div className="bg-[linear-gradient(180deg,#fffdf8_0%,#fff8ef_40%,#ffffff_100%)]">
      <section className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full flex-nowrap gap-3">
            {tabs.map((tab) => {
              const isActive = tab.path === definition.path;

              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`inline-flex shrink-0 items-center rounded-full border px-5 py-3 text-sm font-bold transition ${
                    isActive
                      ? "border-[#ef7d00] bg-[#ef7d00] text-white shadow-[0_14px_30px_-20px_rgba(239,125,0,0.8)]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#ef7d00]/40 hover:text-slate-950"
                  }`}
                >
                  {tab.tabLabel}
                </Link>
              );
            })}
            {CATEGORY_SHORTCUTS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#ef7d00]/40 hover:text-slate-950"
              >
                {tab.label}
              </Link>
            ))}
            <button
              type="button"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
              aria-label="Browse more deal lanes"
            >
              <ChevronRight size={18} />
            </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">
              {definition.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
              {definition.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{definition.subtitle}</p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 text-sm font-bold text-slate-700 sm:inline-flex"
          >
            View All Deals <ChevronRight size={16} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ef7d00] text-white">
              <BadgePercent size={20} />
            </div>
            <h3 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-950">
              No deal products assigned yet
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              This tab shows products only when the admin assigns them to this Best Deals bucket and the item is in stock with an image.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-[var(--line)] bg-[linear-gradient(180deg,#fffdfa_0%,#fff6ea_100%)]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_40px_-36px_rgba(20,29,96,0.18)]"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand-navy)]">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
