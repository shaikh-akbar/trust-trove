import Link from "next/link";
import { ArrowRight, Compass, Gem, Sparkles, TrendingUp } from "lucide-react";
import HeroCarousel from "./HeroCarousel";
import FeaturedProducts from "./FeaturedProducts";
import HomeProductGrid from "./HomeProductGrid";
import HomeCustomerReviews from "./HomeCustomerReviews";
import { buildCategorySummary } from "../../../lib/storefront";

const CATEGORY_IMAGE_MAP = {
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  skincare: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
  fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  women: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  men: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
  swim: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=900&q=80",
  home: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  bathroom: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80",
  kitchen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
  garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  electronics: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  gadgets: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=900&q=80",
  accessories: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
  default: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
};

function SectionHeading({ eyebrow, title, href, actionLabel }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--brand-navy)] sm:text-4xl">{title}</h2>
      </div>
      {href && actionLabel ? (
        <Link
          href={href}
          className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
        >
          {actionLabel} <ArrowRight size={16} className="ml-2" />
        </Link>
      ) : null}
    </div>
  );
}

function getCategoryParts(title) {
  return String(title || "")
    .split(">")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getCategoryPrimaryLabel(title) {
  const parts = getCategoryParts(title);
  return parts[0] || "Category";
}

function getCategoryDisplayTitle(title) {
  const parts = getCategoryParts(title);

  if (parts.length === 0) {
    return "Featured Category";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return parts.slice(-2).join(" • ");
}

function getCategoryImage(title) {
  const normalized = String(title || "").toLowerCase();
  const match = Object.entries(CATEGORY_IMAGE_MAP).find(([key]) => key !== "default" && normalized.includes(key));
  return match?.[1] || CATEGORY_IMAGE_MAP.default;
}

function CategoryTiles({ categories }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {categories.map((category, index) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-[0.95rem] border border-slate-200 bg-white shadow-[0_14px_40px_-34px_rgba(8,15,43,0.22)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_-28px_rgba(8,15,43,0.28)]"
        >
          <div className="relative bg-slate-100">
            {getCategoryImage(category.title) ? (
              <img
                src={getCategoryImage(category.title)}
                alt={getCategoryPrimaryLabel(category.title)}
                className="aspect-[4/4.6] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex aspect-[4/4.6] items-center justify-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {getCategoryPrimaryLabel(category.title)}
              </div>
            )}
          </div>

          <div className="min-h-[108px] bg-[linear-gradient(180deg,#424879_0%,#353a66_100%)] px-3 py-3 text-center text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-90">
              {getCategoryPrimaryLabel(category.title)}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
              {getCategoryDisplayTitle(category.title)}
            </p>
            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.08em]">
              {index % 2 === 0 ? "50-80% OFF" : index % 3 === 0 ? "30-70% OFF" : "40-80% OFF"}
            </p>
            <p className="mt-1 text-sm font-medium">Shop Now</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function HomeExperience({ products, customerReviews = [] }) {
  const featuredProducts = products.slice(0, 10);
  const gridProducts = products.slice(0, 30);
  const categories = buildCategorySummary(products).slice(0, 4);
  const heroSlides = featuredProducts.slice(0, 4).map((product, index) => ({
    id: product.id,
    image: product.image_url,
    title: product.title,
    category: product.category || product.product_type || "Featured Collection",
    href: `/product/${product.id}`,
    eyebrow: index === 0 ? "Flat Rs. 300 Off" : index === 1 ? "Fresh launch deals" : index === 2 ? "Trending picks" : "Style spotlight",
    headline: index === 0 ? "FLAT Rs. 300 OFF" : index === 1 ? "UP TO 60% OFF" : index === 2 ? "BEST PICKS THIS WEEK" : "CURATED STYLE DROPS",
    code: index === 0 ? "TRUST300" : index === 1 ? "DROP60" : index === 2 ? "TREND25" : "STYLE10",
    subtext:
      index === 0
        ? "Big offers on featured collections, wardrobe staples, and elevated everyday picks."
        : index === 1
          ? "Fresh arrivals and standout products lined up in a homepage banner flow."
          : index === 2
            ? "Discover high-intent categories and products with a stronger retail mood."
            : "Move from inspiration to product detail in a more marketplace-style shopping flow.",
    offer:
      product.price_compare > product.price_selling
        ? `${product.discount_percent || Math.round(((product.price_compare - product.price_selling) / product.price_compare) * 100)}% off`
        : `Starting at Rs. ${product.price_selling}`,
  }));

  return (
    <div className="bg-white">
      <HeroCarousel slides={heroSlides} />

      <FeaturedProducts products={featuredProducts} />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trending now"
          title="Shop by spotlighted products"
          href="/shop"
          actionLabel="View all products"
        />

        <HomeProductGrid products={gridProducts} />
      </section>

      

      <section className="bg-slate-50/70 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Shop by category"
            title="Shop By Category"
            href="/categories"
            actionLabel="Browse categories"
          />
          <CategoryTiles categories={categories} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,#424879_0%,#353a66_100%)] p-7 text-white shadow-[0_30px_90px_-58px_rgba(66,72,121,0.46)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-200">Why TrustTrove</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Curated products, cleaner shopping, and a store built for confidence.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-100/90">
              We keep the browsing experience simple: standout picks, clear pricing, fast discovery, and practical support
              across every step from product search to delivery.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { value: "COD", label: "Available" },
                { value: "24-48h", label: "Dispatch" },
                { value: "Easy", label: "Discovery" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-black tracking-tight text-white">{item.value}</p>
                  <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-200">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)] shadow-[0_16px_36px_-24px_rgba(255,255,255,0.65)]"
            >
              Start browsing
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { icon: Sparkles, title: "Curated Picks", text: "Products are surfaced in a cleaner, easier-to-scan format so customers notice the right things faster." },
              { icon: Gem, title: "Better Value", text: "Offer-led sections, savings badges, and compact cards make deals feel visible without cluttering the page." },
              { icon: Compass, title: "Easy Navigation", text: "Category jumps, load more browsing, and clear product layouts help users move through the store quickly." },
              { icon: TrendingUp, title: "Trust Signals", text: "Strong visuals, payment clarity, and order-focused pages give the storefront a more dependable feel." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-6 shadow-[0_20px_60px_-46px_rgba(66,72,121,0.18)]">
                <span className="inline-flex rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--brand-navy)]">
                  <Icon size={18} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HomeCustomerReviews reviews={customerReviews} />
    </div>
  );
}
