import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Briefcase,
  CarFront,
  Gem,
  Headset,
  Heart,
  Layers3,
  LampDesk,
  MonitorSmartphone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  TrendingUp,
  Truck,
  Utensils,
  Wrench,
} from "lucide-react";
import CatalogExperienceClient from "./CatalogExperienceClient";
import CategoryPopularProductsExplorer from "./CategoryPopularProductsExplorer";
import CategoryInlineProductCard from "./CategoryInlineProductCard";
import ProductCard from "../home/ProductCard";
import { getProductHref } from "../../../lib/product-route";
import {
  buildCategorySummary,
  formatBrandLabel,
  formatCategoryLabel,
  slugifyBrand,
  slugifyCategory,
} from "../../../lib/storefront";

const SHOP_BANNER_IMAGE = "/shop/shop-desktop.png";
const SHOP_BANNER_MOBILE_IMAGE = "/shop/shop-mobile.png";
const BRANDS_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80";
const CATEGORIES_BANNER_IMAGE = "/shop/category-dekstop.png";
const CATEGORIES_BANNER_MOBILE_IMAGE = "/shop/category-mobile.png";
const NEW_ARRIVALS_BANNER_IMAGE = "/shop/new-arrival-desktop.png";
const NEW_ARRIVALS_BANNER_MOBILE_IMAGE = "/shop/new-arrival-mobile.png";
const FRESH_DROP_PANEL_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80";

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

function getCategoryBannerImage(title) {
  const normalized = String(title || "").toLowerCase();

  if (normalized.includes("elect")) {
    return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80";
  }

  if (
    normalized.includes("kitchen") ||
    normalized.includes("home") ||
    normalized.includes("dining") ||
    normalized.includes("bath")
  ) {
    return "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80";
  }

  if (
    normalized.includes("fashion") ||
    normalized.includes("cloth") ||
    normalized.includes("apparel") ||
    normalized.includes("wear") ||
    normalized.includes("shoe")
  ) {
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80";
  }

  if (normalized.includes("beauty") || normalized.includes("cosmetic") || normalized.includes("personal care")) {
    return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80";
  }

  if (normalized.includes("toy") || normalized.includes("baby") || normalized.includes("kid")) {
    return "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80";
  }

  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";
}

function getBrandBannerImage(title) {
  const normalized = String(title || "").toLowerCase();

  if (normalized.includes("vikas") || normalized.includes("kitchen") || normalized.includes("steel")) {
    return "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80";
  }

  if (normalized.includes("beauty") || normalized.includes("care")) {
    return "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80";
  }

  if (normalized.includes("fashion") || normalized.includes("wear")) {
    return "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80";
  }

  return "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80";
}

function getCategoryWireframeIcon(title) {
  const normalized = String(title || "").toLowerCase();

  if (normalized.includes("beauty") || normalized.includes("care")) {
    return Heart;
  }

  if (normalized.includes("elect") || normalized.includes("mobile")) {
    return MonitorSmartphone;
  }

  if (normalized.includes("auto")) {
    return CarFront;
  }

  if (normalized.includes("travel") || normalized.includes("bags")) {
    return Briefcase;
  }

  if (normalized.includes("kitchen") || normalized.includes("home")) {
    return Utensils;
  }

  if (normalized.includes("garden")) {
    return Sprout;
  }

  if (normalized.includes("decor")) {
    return LampDesk;
  }

  if (normalized.includes("improvement") || normalized.includes("tool") || normalized.includes("hardware")) {
    return Wrench;
  }

  return ShoppingBag;
}

function getCategoryWireframeTint(index) {
  const tints = [
    "from-[#ffe3ec] to-[#fff4f8]",
    "from-[#e4efff] to-[#f5f9ff]",
    "from-[#fff1e1] to-[#fff9f2]",
    "from-[#e8f7e8] to-[#f7fff7]",
  ];

  return tints[index % tints.length];
}

function EditorialStrip({ items }) {
  return (
    <section className="border-t border-[var(--line)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {items.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-soft)] p-6 shadow-[0_24px_80px_-56px_rgba(8,15,43,0.45)]"
          >
            <span className="inline-flex rounded-2xl bg-[var(--brand-navy)] p-3 text-[var(--surface-cream)]">
              <Icon size={18} />
            </span>
            <h2 className="mt-5 text-2xl font-normal text-[var(--brand-navy)]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryShowcase({ categories }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[var(--line)] bg-[var(--surface-cream)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-400">Collection jump</p>
            <h2 className="mt-3 text-3xl font-normal text-[var(--brand-navy)] sm:text-[2rem]">Explore distinctive category worlds</h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
          >
            View all categories <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {categories.slice(0, 3).map((category, index) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group overflow-hidden rounded-[2rem] border border-[var(--line)] p-7 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)] transition hover:-translate-y-1 ${
                index === 0
                  ? "bg-[var(--brand-navy)] text-white"
                  : "bg-white text-[var(--brand-navy)]"
              }`}
            >
              <p className={`text-xs font-extrabold uppercase tracking-[0.22em] ${index === 0 ? "text-[var(--brand-gold)]" : "text-slate-400"}`}>
                {String(category.count).padStart(2, "0")} products
              </p>
              <h3 className="mt-5 text-3xl font-normal sm:text-[2rem]">{category.title}</h3>
              <p className={`mt-4 text-sm leading-7 ${index === 0 ? "text-slate-200" : "text-slate-600"}`}>
                {category.description || "A curated collection designed for faster browsing and better discovery."}
              </p>
              <span className={`mt-8 inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] ${index === 0 ? "text-[var(--brand-gold)]" : "text-[var(--brand-navy)]"}`}>
                Explore collection <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShopExperience({
  products,
  categories = [],
  initialQuery = "",
  activeCategorySlug = "",
  activeCategoryTitle = "",
  currentPage = 1,
  totalPages = 1,
}) {
  return (
    <>
      <CatalogExperienceClient
        products={products}
        categories={categories}
        initialQuery={initialQuery}
        activeCategorySlug={activeCategorySlug}
        activeCategoryTitle={activeCategoryTitle}
        eyebrow="Shop"
        title="A more magnetic storefront for thoughtful browsing."
        description="Search products instantly, slide through price ranges, and refine by category, color, and size in a cleaner shopping experience built to convert."
        heroBackgroundImage={SHOP_BANNER_IMAGE}
        heroMobileBackgroundImage={SHOP_BANNER_MOBILE_IMAGE}
        currentPage={currentPage}
        totalPages={totalPages}
        spotlight={{
          title: "Designed for discovery",
          text: "The catalog now behaves like a modern retail experience, with faster scanning, richer merchandising, and better route-level structure for SEO.",
          points: ["Smart search", "Filter by size", "Color sorting"],
        }}
        emptyTitle="No products matched this edit"
        emptyText="Try widening your price range, clearing a few filters, or searching with shorter terms to uncover more products."
      />
      <EditorialStrip
        items={[
          { icon: TrendingUp, title: "Sharper merchandising", text: "The store now gives products more room to breathe, with hierarchy that helps premium items feel premium." },
          { icon: Layers3, title: "Better structure", text: "Clear content zones improve scanability for shoppers while also strengthening search engine understanding." },
          { icon: Sparkles, title: "Higher intent browsing", text: "Search and sidebar filters reduce friction for visitors who already know the style, size, or price they want." },
        ]}
      />
      <CategoryShowcase categories={categories} />
    </>
  );
}

export function BrandsExperience({ brands = [] }) {
  const featuredBrands = brands.filter((brand) => Array.isArray(brand.products) && brand.products.length > 0);
  const leadingBrands = [...brands].sort((left, right) => Number(right.count || 0) - Number(left.count || 0)).slice(0, 6);

  return (
    <div className="bg-[var(--surface-soft)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <img src={BRANDS_BANNER_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,29,96,0.9)_0%,rgba(20,29,96,0.8)_42%,rgba(20,29,96,0.64)_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">Brands</p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-5xl">
            Browse every brand, then open a focused product page for that label.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
            Searchable brand discovery on the first step, followed by dedicated paginated brand pages for cleaner browsing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_24px_70px_-52px_rgba(8,15,43,0.28)] sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Brand index
                  </p>
                  <h2 className="mt-2 text-2xl font-normal text-[var(--brand-navy)] sm:text-3xl">
                    Browse all brands
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-500">
                  Open any brand directly, then scroll below to preview a fast edit of the most product-rich labels.
                </p>
              </div>

              {leadingBrands.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {leadingBrands.map((brand, index) => (
                    <Link
                      key={brand.slug}
                      href={`/brands/${brand.slug}`}
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] transition ${
                        index === 0
                          ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                          : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--brand-navy)] hover:border-[var(--brand-navy)]/30 hover:bg-white"
                      }`}
                    >
                      {brand.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <details className="group rounded-[1.6rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)] p-4 shadow-[0_20px_50px_-42px_rgba(8,15,43,0.28)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Quick jump
                  </p>
                  <p className="mt-1 text-xl font-normal text-[var(--brand-navy)]">
                    Open brand list
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)] shadow-[0_12px_28px_-22px_rgba(8,15,43,0.35)] transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pr-1">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    className="flex items-center justify-between rounded-[1rem] border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)]/25 hover:bg-[var(--surface-soft)]"
                  >
                    <span className="truncate pr-3 font-medium">{brand.title}</span>
                    <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      {brand.count}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group flex min-h-[6.75rem] items-center justify-between rounded-[1.35rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f2e8_100%)] px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[var(--brand-navy)]/24 hover:bg-white"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--brand-navy)]/10 bg-white shadow-[0_10px_24px_-20px_rgba(8,15,43,0.35)]">
                    {brand.image ? (
                      <img src={brand.image} alt={brand.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-1 text-center text-[9px] font-black uppercase tracking-[0.12em] text-[var(--brand-navy)]">
                        {brand.title.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-balance text-lg font-normal leading-[1.2] text-[var(--brand-navy)]">
                      {brand.title}
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {brand.count} products
                    </p>
                  </div>
                </div>
                <span className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--brand-navy)]/10 bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-20px_rgba(8,15,43,0.35)] transition group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredBrands.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-slate-400">Preview lane</p>
              <h2 className="mt-2 text-2xl font-normal text-[var(--brand-navy)] sm:text-3xl">
                Popular brands with a quick product preview
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              Faster initial load, with the full product depth available after opening each brand page.
            </p>
          </div>

          <div className="space-y-8">
            {featuredBrands.map((brand) => (
              <div
                key={brand.slug}
                className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_70px_-52px_rgba(8,15,43,0.24)]"
              >
                <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,#141d60_0%,#2b377f_100%)] px-5 py-5 text-white sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/68">
                        Shop By Brand
                      </p>
                      <h2 className="mt-2 text-2xl font-normal sm:text-3xl">
                        {brand.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-200">
                        {brand.count} products available in this brand
                      </p>
                    </div>
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]"
                    >
                      Open Brand
                      <ArrowRight size={14} className="ml-2" />
                    </Link>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {brand.products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {brand.products.map((product) => (
                        <ProductCard key={product.id} product={product} compact />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-5 py-10 text-center">
                      <p className="font-medium text-slate-500">No products available in this brand right now.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function CategoriesExperience({ categories = [] }) {
  const popularCategoryPriority = [
    "health-and-beauty",
    "electronics",
    "automotive",
    "travel",
    "home-and-kitchen",
    "mobile-accessories",
    "office",
    "foods",
    "sports",
  ];
  const featuredCategories = [...categories]
    .filter((category) => Array.isArray(category.products) && category.products.length > 0)
    .sort((left, right) => Number(right.count || 0) - Number(left.count || 0));
  const leadingCategories = [
    ...popularCategoryPriority
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter(Boolean),
    ...categories
      .filter(
        (category) =>
          !popularCategoryPriority.includes(category.slug) &&
          category.slug !== "bracelets"
      )
      .sort((left, right) => Number(right.count || 0) - Number(left.count || 0)),
  ].slice(0, 8);
  const topCategoryNewArrivals = featuredCategories
    .slice(0, 8)
    .flatMap((category) =>
      (category.products || [])
        .filter((product) => Boolean(product?.new_arrivals))
        .slice(0, 1)
        .map((product) => ({
          ...product,
          categoryLabel: category.title,
        }))
    )
    .slice(0, 5);
  const topPopularCategoryProducts = featuredCategories
    .slice(0, 6)
    .flatMap((category) =>
      (category.products || []).slice(0, 12).map((product) => ({
        ...product,
        categoryLabel: category.title,
      }))
    );

  return (
    <div className="bg-[var(--surface-soft)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)]">
        <img
          src={CATEGORIES_BANNER_MOBILE_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center sm:hidden"
        />
        <img
          src={CATEGORIES_BANNER_IMAGE}
          alt=""
          className="absolute inset-0 hidden h-full w-full object-cover object-center sm:block"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,29,96,0.16)_0%,rgba(20,29,96,0.1)_42%,rgba(20,29,96,0.08)_100%)]" />
        <div className="relative h-[180px] sm:h-[250px] lg:h-[320px]" />
      </section>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-4 shadow-[0_24px_70px_-52px_rgba(8,15,43,0.28)] sm:rounded-[2rem] sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <details className="rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-4 shadow-[0_24px_56px_-46px_rgba(8,15,43,0.28)] xl:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Quick jump
                  </p>
                  <h2 className="mt-2 text-[1.4rem] font-semibold leading-tight text-[var(--brand-navy)]">
                    Open from dropdown
                  </h2>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--brand-navy)] transition details-open:rotate-90">
                  <ArrowRight size={16} />
                </span>
              </summary>

              <div className="mt-4 max-h-[26rem] space-y-1 overflow-y-auto pr-1">
                {categories.map((category, index) => {
                  const Icon = getCategoryWireframeIcon(category.title);
                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className={`flex items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm transition ${
                        index === 0
                          ? "bg-[#edf4ff] text-[var(--brand-navy)]"
                          : "text-slate-700 hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-navy)] shadow-[0_10px_20px_-16px_rgba(8,15,43,0.32)]">
                          <Icon size={16} />
                        </span>
                        <span className="truncate font-medium">{category.title}</span>
                      </span>
                      <span className="ml-3 inline-flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          {category.count}
                        </span>
                        <ArrowRight size={14} className={index === 0 ? "text-[var(--brand-navy)]" : "text-slate-400"} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </details>

            <aside className="hidden rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-4 shadow-[0_24px_56px_-46px_rgba(8,15,43,0.28)] xl:block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Quick jump
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)]">
                    Open from dropdown
                  </h2>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--brand-navy)]">
                  <ArrowRight size={16} />
                </span>
              </div>

              <div className="mt-4 max-h-[54rem] space-y-1 overflow-y-auto pr-1">
                {categories.map((category, index) => {
                  const Icon = getCategoryWireframeIcon(category.title);
                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className={`flex items-center justify-between rounded-[1rem] px-3 py-2.5 text-sm transition ${
                        index === 0
                          ? "bg-[#edf4ff] text-[var(--brand-navy)]"
                          : "text-slate-700 hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-navy)] shadow-[0_10px_20px_-16px_rgba(8,15,43,0.32)]">
                          <Icon size={16} />
                        </span>
                        <span className="truncate font-medium">{category.title}</span>
                      </span>
                      <span className="ml-3 inline-flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          {category.count}
                        </span>
                        <ArrowRight size={14} className={index === 0 ? "text-[var(--brand-navy)]" : "text-slate-400"} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-[1.45rem] font-semibold text-[var(--brand-navy)] sm:text-3xl">
                  Popular Categories
                </h2>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-5 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
                  {leadingCategories.slice(0, 8).map((category, index) => {
                    const Icon = getCategoryWireframeIcon(category.title);
                    return (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        className="group min-w-[154px] shrink-0 rounded-[1.2rem] border border-[var(--line)] bg-white px-3.5 py-3.5 text-left shadow-[0_18px_42px_-36px_rgba(8,15,43,0.22)] transition hover:-translate-y-1 sm:min-w-0 sm:rounded-[1.3rem] sm:p-5 sm:text-center sm:shadow-[0_22px_54px_-44px_rgba(8,15,43,0.24)]"
                      >
                        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${getCategoryWireframeTint(index)} text-[var(--brand-navy)] sm:mx-auto sm:h-20 sm:w-20`}>
                          <Icon size={22} className="sm:hidden" />
                          <Icon size={32} className="hidden sm:block" />
                        </span>
                        <h3 className="mt-3 text-[0.95rem] font-semibold leading-5 text-[var(--brand-navy)] sm:mt-5 sm:text-xl">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-[11px] font-medium text-slate-500 sm:mt-2 sm:text-sm">
                          {category.count} products
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {topPopularCategoryProducts.length > 0 ? (
                <CategoryPopularProductsExplorer products={topPopularCategoryProducts} />
              ) : null}

              {topCategoryNewArrivals.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-[1.45rem] font-semibold text-[var(--brand-navy)] sm:text-3xl">
                      New Arrivals in Top Categories
                    </h2>
                    <Link
                      href="/new-arrivals"
                      className="text-sm font-extrabold text-[#2563eb]"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {topCategoryNewArrivals.map((product) => (
                      <CategoryInlineProductCard
                        key={product.id}
                        product={product}
                        showNewBadge
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[
            {
              icon: Layers3,
              title: "Wide Range",
              text: "Thousands of products across categories",
            },
            {
              icon: ShieldCheck,
              title: "Best Quality",
              text: "Quality products you can trust",
            },
            {
              icon: BadgePercent,
              title: "Great Prices",
              text: "Competitive prices everyday",
            },
            {
              icon: ShoppingBag,
              title: "Easy Shopping",
              text: "Smooth and secure shopping experience",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 shadow-[0_20px_48px_-40px_rgba(8,15,43,0.18)] sm:rounded-[1.5rem] sm:px-5 sm:py-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand-navy)] sm:h-12 sm:w-12">
                <Icon size={22} />
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900 sm:mt-4 sm:text-lg">{title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 pt-5 sm:px-6 sm:pt-6 lg:px-8">
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-[linear-gradient(90deg,#eef4ff_0%,#f8fbff_38%,#eef4ff_100%)] px-4 py-5 shadow-[0_22px_48px_-40px_rgba(8,15,43,0.18)] sm:rounded-[1.75rem] sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white sm:h-16 sm:w-16">
                <Sparkles size={26} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                  Can&apos;t find what you&apos;re looking for?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  Explore more categories or contact us for help.
                </p>
              </div>
            </div>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function NewArrivalsReferenceLayout({
  arrivals,
  initialQuery = "",
  spotlightProduct = null,
  currentPage = 1,
  totalPages = 1,
}) {
  const trustNotes = [
    {
      icon: Truck,
      title: "Fast Delivery",
      text: "Quick delivery at your doorstep",
    },
    {
      icon: ArrowRight,
      title: "Easy Returns",
      text: "7 days easy return policy",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      text: "100% secure payment options",
    },
    {
      icon: Headset,
      title: "24/7 Support",
      text: "We're here to help you anytime",
    },
  ];

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#f6f8ff_0%,#ffffff_26%,#ffffff_100%)] pb-16">
        <section className="relative overflow-hidden border-b border-[#dfe7ff]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f5f8ff_0%,#edf4ff_100%)]" />
          <div className="relative py-0">
            <div className="overflow-hidden border-y border-[#dce5ff] bg-white shadow-[0_26px_60px_-44px_rgba(20,29,96,0.2)]">
              <picture>
                <source media="(max-width: 639px)" srcSet={NEW_ARRIVALS_BANNER_MOBILE_IMAGE} />
                <img
                  src={NEW_ARRIVALS_BANNER_IMAGE}
                  alt="New arrivals banner"
                  className="h-[280px] w-full object-cover sm:h-[400px] lg:h-[500px]"
                />
              </picture>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#141d60]/40">New arrivals</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--brand-navy)] sm:text-[2.2rem]">
                Fresh products worth seeing first
              </h2>
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center gap-3">
                {currentPage > 1 ? (
                  <Link
                    href={`/new-arrivals?page=${currentPage - 1}`}
                    className="rounded-full border border-[#dce5ff] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]"
                  >
                    Prev
                  </Link>
                ) : (
                  <span className="pointer-events-none rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">
                    Prev
                  </span>
                )}
                <p className="text-sm font-semibold text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
                {currentPage < totalPages ? (
                  <Link
                    href={`/new-arrivals?page=${currentPage + 1}`}
                    className="rounded-full border border-[#dce5ff] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-navy)]"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="pointer-events-none rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">
                    Next
                  </span>
                )}
              </div>
            ) : (
              <Link
                href={initialQuery ? `/shop?q=${encodeURIComponent(initialQuery)}` : "/shop"}
                className="inline-flex items-center rounded-full border border-[#dce5ff] bg-white px-5 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)] shadow-[0_22px_44px_-34px_rgba(20,29,96,0.24)]"
              >
                View All <ArrowRight size={16} className="ml-2" />
              </Link>
            )}
          </div>

          {arrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
              {arrivals.map((product) => (
                <Link
                  key={product.id}
                  href={getProductHref(product)}
                  className="group overflow-hidden rounded-[1.6rem] border border-[#dce5ff] bg-white p-3 shadow-[0_26px_54px_-42px_rgba(20,29,96,0.28)] transition hover:-translate-y-1 hover:shadow-[0_32px_66px_-42px_rgba(20,29,96,0.34)]"
                >
                  <div className="relative overflow-hidden rounded-[1.15rem] bg-[var(--surface-soft)]">
                    <span className="absolute left-3 top-3 z-10 inline-flex rounded-md bg-[#ff4d6d] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white">
                      New
                    </span>
                    <img
                      src={product?.main_image || product?.image_url || FRESH_DROP_PANEL_IMAGE}
                      alt={product?.title || product?.name || "New arrival product"}
                      className="aspect-[1/1.02] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="px-2 pb-2 pt-4">
                    <h3 className="line-clamp-3 min-h-[4.9rem] text-lg font-semibold leading-[1.18] text-slate-900 sm:min-h-[5.3rem] sm:text-[1.38rem]">
                      {product?.name || product?.title}
                    </h3>
                    <p className="mt-4 text-[1.35rem] font-black tracking-tight text-[#ff4d4f] sm:text-[1.55rem]">
                      {formatPrice(product?.price_selling)}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700 sm:text-sm">
                      {Number(product?.inventory_quantity || 0) > 0
                        ? `${Number(product?.inventory_quantity || 0)} pcs left`
                        : "Out of stock"}
                    </p>
                    <div className="mt-4">
                      <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-navy)] px-3 py-3 text-xs font-extrabold text-white transition group-hover:bg-[#0f174b] sm:px-4 sm:text-sm">
                        Shop Now <ShoppingBag size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#141d60]/10 bg-white px-6 py-16 text-center shadow-[0_30px_90px_-58px_rgba(20,29,96,0.35)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--surface-cream)]">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-6 text-3xl font-normal text-[var(--brand-navy)]">No recent arrivals found</h3>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
                As soon as new products are added to the catalog, this page will surface them here in the same cleaner layout.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white"
              >
                Explore full catalog
              </Link>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustNotes.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-[#e4ebff] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-5 shadow-[0_20px_48px_-40px_rgba(20,29,96,0.2)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--brand-navy)]">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#dce5ff] bg-[linear-gradient(90deg,#eef4ff_0%,#f8fbff_38%,#eef4ff_100%)] px-6 py-6 shadow-[0_24px_58px_-44px_rgba(20,29,96,0.24)] sm:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white shadow-[0_24px_48px_-30px_rgba(20,29,96,0.5)]">
                  <Gem size={26} />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-[2rem]">
                    New Products. New Choices. Better Living.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Stay tuned for more useful, trend-aware, and everyday-friendly products added to the GoModexa catalog.
                  </p>
                </div>
              </div>
              <Link
                href={spotlightProduct ? getProductHref(spotlightProduct) : "/shop"}
                className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_22px_44px_-30px_rgba(37,99,235,0.55)] transition hover:bg-[#1f56d8]"
              >
                Explore More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function NewArrivalsExperience({
  products,
  initialQuery = "",
  currentPage = 1,
  totalPages = 1,
}) {
  const arrivals = products.slice(0, 12);
  const spotlightProduct = arrivals[0];
  return (
    <NewArrivalsReferenceLayout
      arrivals={arrivals}
      initialQuery={initialQuery}
      spotlightProduct={spotlightProduct}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );

  const arrivalLane = arrivals.slice(1, 5);
  const editorialLane = arrivals.slice(5, 8);
  const categoryHighlights = [...new Set(
    arrivals
      .map((product) => formatCategoryLabel(product?.category || product?.product_type))
      .filter(Boolean)
  )].slice(0, 4);
  const inStockCount = arrivals.filter(
    (product) => Number(product?.inventory_quantity || 0) > 0
  ).length;
  const entryPrice = arrivals.reduce((lowest, product) => {
    const price = Number(product?.price_selling || 0);
    if (price <= 0) {
      return lowest;
    }

    if (lowest <= 0) {
      return price;
    }

    return Math.min(lowest, price);
  }, 0);
  const heroCards = [...arrivalLane.slice(0, 2), ...editorialLane.slice(0, 1)];
  const launchDeck = arrivals.slice(1, 7);

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#f2eee7_0%,#eef2ff_24%,#ffffff_70%)] pb-16">
        <section className="relative overflow-hidden border-b border-[#141d60]/10 bg-[#101950] text-white">
          <picture className="absolute inset-0">
            <source media="(max-width: 639px)" srcSet={NEW_ARRIVALS_BANNER_MOBILE_IMAGE} />
            <img src={NEW_ARRIVALS_BANNER_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,25,80,0.96)_0%,rgba(20,29,96,0.88)_38%,rgba(20,29,96,0.7)_68%,rgba(16,25,80,0.82)_100%)]" />
          <div className="absolute left-[-8%] top-[16%] h-56 w-56 rounded-full border border-[#d5b26f]/20 bg-[#d5b26f]/10 blur-3xl" />
          <div className="absolute right-[-9%] top-[52%] h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(16,25,80,0)_0%,rgba(16,25,80,0.72)_100%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.32em] text-white/88">
                  New Arrivals
                </span>
                <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.93] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4.2rem]">
                  A first-look arrival page that feels launched, not listed.
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 sm:text-base sm:leading-8">
                  Recent additions deserve more atmosphere than a leftover feed. This edit turns the route into a
                  feature-led landing page with richer hierarchy, cleaner merchandising, and a stronger first impression.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={spotlightProduct ? getProductHref(spotlightProduct) : "/shop"}
                    className="inline-flex items-center rounded-full bg-[#f3ebdd] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[#141d60] shadow-[0_26px_60px_-34px_rgba(0,0,0,0.45)]"
                  >
                    View featured drop <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <Link
                    href={initialQuery ? `/shop?q=${encodeURIComponent(initialQuery)}` : "/shop"}
                    className="inline-flex items-center rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur"
                  >
                    Browse all arrivals
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: `${arrivals.length}`, label: "Fresh picks" },
                    { value: `${inStockCount}`, label: "Ready now" },
                    { value: entryPrice > 0 ? formatPrice(entryPrice) : "Curated", label: "Entry price" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.45rem] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur"
                    >
                      <p className="text-3xl font-black tracking-tight text-white">{item.value}</p>
                      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/68">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[2.35rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_100%)] p-4 shadow-[0_36px_100px_-64px_rgba(0,0,0,0.58)] backdrop-blur md:p-5">
                  <div className="grid gap-4">
                    {heroCards.map((product, index) => (
                      <Link
                        key={product.id}
                        href={getProductHref(product)}
                        className={`group rounded-[1.8rem] border p-5 transition hover:-translate-y-1 ${
                          index === 0
                            ? "border-[#d5b26f]/26 bg-[linear-gradient(135deg,rgba(212,178,111,0.18)_0%,rgba(255,255,255,0.08)_100%)]"
                            : "border-white/10 bg-white/7"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/58">
                              Arrival card {String(index + 1).padStart(2, "0")}
                            </p>
                            <h2 className="mt-3 line-clamp-2 font-display text-2xl font-semibold leading-[1] tracking-[-0.025em] text-white">
                              {product.name || product.title}
                            </h2>
                          </div>
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white/84 transition group-hover:translate-x-1">
                            <ArrowRight size={16} />
                          </span>
                        </div>
                        <div className="mt-5 flex items-end justify-between gap-3">
                          <p className="text-base font-black tracking-tight text-[#f4ede2]">
                            {formatPrice(product.price_selling)}
                          </p>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/52">
                            {formatCategoryLabel(product?.category || product?.product_type)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {spotlightProduct ? (
          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <Link
                href={getProductHref(spotlightProduct)}
                className="group overflow-hidden rounded-[2.25rem] border border-[#141d60]/10 bg-white shadow-[0_38px_100px_-62px_rgba(20,29,96,0.34)]"
              >
                <div className="grid h-full gap-0 lg:grid-cols-[1fr_1fr]">
                  <div className="relative min-h-[19rem] overflow-hidden bg-[linear-gradient(135deg,rgba(20,29,96,0.08),rgba(20,29,96,0.18))]">
                    <img
                      src={FRESH_DROP_PANEL_IMAGE}
                      alt="Fresh new arrivals banner"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,29,96,0.12)_0%,rgba(20,29,96,0.58)_100%)]" />
                    <div className="absolute left-5 top-5 inline-flex rounded-full bg-[#f3ebdd] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#141d60]">
                      Fresh drop
                    </div>
                    <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 text-white backdrop-blur">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/64">
                        Arrival category
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {formatCategoryLabel(spotlightProduct?.category || spotlightProduct?.product_type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#141d60]/60">
                        Lead arrival
                      </p>
                      <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#141d60] sm:text-[2.35rem]">
                        {spotlightProduct.name || spotlightProduct.title}
                      </h2>
                      <p className="mt-4 text-xl font-black tracking-tight text-slate-950">
                        {formatPrice(spotlightProduct.price_selling)}
                      </p>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                        {spotlightProduct.short_description ||
                          spotlightProduct.description ||
                          "Freshly added to the latest collection with a more deliberate feature-first presentation and stronger visual focus."}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Catalog status", value: "New in rotation" },
                        { label: "Price posture", value: entryPrice > 0 ? "Fresh-value edit" : "Curated arrival" },
                        { label: "Use case", value: "Built for discovery" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1.25rem] border border-[#141d60]/10 bg-[#141d60]/[0.035] px-4 py-4"
                        >
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#141d60]/52">
                            {item.label}
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#141d60]">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {launchDeck.slice(0, 3).map((product, index) => (
                  <Link
                    key={product.id}
                    href={getProductHref(product)}
                    className={`group rounded-[1.75rem] border p-5 shadow-[0_24px_72px_-56px_rgba(20,29,96,0.3)] transition hover:-translate-y-1 ${
                      index === 1
                        ? "border-[#d5b26f]/26 bg-[linear-gradient(135deg,#1a2366_0%,#2c387d_100%)] text-white"
                        : "border-[#141d60]/10 bg-white text-[#141d60]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${index === 1 ? "text-white/62" : "text-[#141d60]/48"}`}>
                          Launch tile {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 line-clamp-2 font-display text-xl font-semibold leading-tight">
                          {product.name || product.title}
                        </h3>
                        <p className={`mt-3 line-clamp-2 text-sm leading-6 ${index === 1 ? "text-white/76" : "text-slate-600"}`}>
                          {product.short_description ||
                            "Freshly surfaced in the latest arrival rotation for faster shopper discovery."}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        className={`shrink-0 transition group-hover:translate-x-1 ${index === 1 ? "text-white/78" : "text-[#141d60]"}`}
                      />
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className={`text-sm font-black tracking-tight ${index === 1 ? "text-white" : "text-slate-950"}`}>
                        {formatPrice(product.price_selling)}
                      </p>
                      <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${index === 1 ? "text-white/58" : "text-slate-400"}`}>
                        {formatCategoryLabel(product?.category || product?.product_type)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {editorialLane.length > 0 ? (
          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-[#141d60]/10 bg-[linear-gradient(145deg,#ffffff_0%,#eef1ff_100%)] p-6 shadow-[0_32px_90px_-58px_rgba(20,29,96,0.38)] sm:p-8">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#141d60]/50">
                  Arrival brief
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-[#141d60] sm:text-[2.3rem]">
                  The page now behaves more like an arrival editorial than a utility listing.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                  New arrivals works best when it gives recent products atmosphere, structure, and visual momentum.
                  This route now helps shoppers understand what just landed, which categories are moving, and where to
                  click next without feeling dropped into a generic archive.
                </p>

                {categoryHighlights.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {categoryHighlights.map((category) => (
                      <span
                        key={category}
                        className="inline-flex rounded-full border border-[#141d60]/10 bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#141d60]"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                ) : null}

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        title: "Stronger hierarchy",
                        text: "Lead products and supporting tiles now feel intentionally staged.",
                      },
                      {
                        title: "Better context",
                        text: "Category cues and price anchors make the page easier to read at a glance.",
                      },
                      {
                        title: "More indexable",
                        text: "The route now feels more destination-like for both shoppers and Google.",
                      },
                    ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.4rem] border border-[#141d60]/10 bg-white p-4"
                    >
                      <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#141d60]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {editorialLane.map((product, index) => (
                  <Link
                    key={product.id}
                    href={getProductHref(product)}
                    className={`group overflow-hidden rounded-[1.8rem] border shadow-[0_28px_84px_-60px_rgba(20,29,96,0.38)] transition hover:-translate-y-1 ${
                      index === 1
                        ? "border-[#141d60] bg-[linear-gradient(180deg,#141d60_0%,#263374_100%)] text-white"
                        : "border-[#141d60]/10 bg-white text-[#141d60]"
                    }`}
                  >
                    <div className="flex h-full flex-col justify-between p-5">
                      <div>
                        <p className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${
                          index === 1 ? "text-white/65" : "text-[#141d60]/48"
                        }`}>
                          Arrival note {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-4 line-clamp-3 font-display text-2xl font-semibold leading-[1.02] tracking-[-0.02em]">
                          {product.name || product.title}
                        </h3>
                        <p className={`mt-4 text-sm leading-7 ${
                          index === 1 ? "text-white/78" : "text-slate-600"
                        }`}>
                          {product.short_description ||
                            "Freshly added to the catalog and positioned for quick discovery through a more editorial layout."}
                        </p>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-3">
                        <div>
                          <p className={`text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                            index === 1 ? "text-white/55" : "text-slate-400"
                          }`}>
                            New arrival price
                          </p>
                          <p className={`mt-2 text-lg font-black tracking-tight ${
                            index === 1 ? "text-white" : "text-slate-950"
                          }`}>
                            {formatPrice(product.price_selling)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition group-hover:translate-x-1 ${
                            index === 1
                              ? "border-white/14 bg-white/10 text-white"
                              : "border-[#141d60]/10 bg-[#141d60]/[0.04] text-[#141d60]"
                          }`}
                        >
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#141d60]/40">Arrival catalog</p>
              <h2 className="mt-2 text-2xl font-normal text-[#141d60] sm:text-3xl">Keep scanning the latest additions</h2>
            </div>
            <Link
              href={initialQuery ? `/shop?q=${encodeURIComponent(initialQuery)}` : "/shop"}
              className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[#141d60]"
            >
              Open full catalog <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          {arrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {arrivals.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#141d60]/10 bg-white px-6 py-16 text-center shadow-[0_30px_90px_-58px_rgba(20,29,96,0.35)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#141d60] text-[var(--surface-cream)]">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-6 text-3xl font-normal text-[#141d60]">No recent arrivals found</h3>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
                As soon as new products are added to the catalog, this page will surface them with the same feature-led presentation.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex rounded-full bg-[#141d60] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white"
              >
                Explore full catalog
              </Link>
            </div>
          )}
        </section>
      </div>

      <EditorialStrip
        items={[
          { icon: Sparkles, title: "Launch energy", text: "Recent products now live in a page that feels fresher, more current, and more intentional at first glance." },
          { icon: TrendingUp, title: "Better promotion", text: "This layout is easier to use for featured edits, seasonal drops, and attention-driving hero moments." },
          { icon: Gem, title: "Premium tone", text: "The typography, spacing, and contrast push the page closer to a refined brand-led shopping experience." },
        ]}
      />
    </>
  );
}

export function CategoryDetailExperience({ products, category, initialQuery = "" }) {
  const title = formatCategoryLabel(category?.title);

  return (
    <>
      <CatalogExperienceClient
        products={products}
        initialQuery={initialQuery}
        eyebrow={title}
        title={`${title} edited into a cleaner collection page.`}
        description="This category route now works like a focused boutique page, helping visitors browse one product family with less noise and better momentum."
        heroBackgroundImage={getCategoryBannerImage(title)}
        spotlight={{
          title: `${category?.count || products.length} products in focus`,
          text: "Every category can now feel like its own destination, which helps both user experience and topical relevance for search engines.",
          points: ["Focused catalog", "Category SEO", "Cleaner discovery"],
        }}
        emptyTitle={`No ${title.toLowerCase()} products matched`}
        emptyText="Try adjusting the active filters or explore the full catalog to discover nearby products from other collections."
      />
      <section className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">Related route</p>
            <h2 className="mt-2 text-2xl font-normal text-[var(--brand-navy)] sm:text-3xl">Keep exploring adjacent collections</h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
          >
            Back to all categories
          </Link>
        </div>
      </section>
    </>
  );
}

export function BrandDetailExperience({ products, brand, initialQuery = "" }) {
  const title = formatBrandLabel(brand?.title);

  return (
    <>
      <CatalogExperienceClient
        products={products}
        initialQuery={initialQuery}
        eyebrow={title}
        title={`${title} products in a dedicated brand page.`}
        description="This brand route now behaves like a focused label page, so visitors can browse one brand story with less noise and clearer product scanning."
        heroBackgroundImage={getBrandBannerImage(title)}
        spotlight={{
          title: `${brand?.count || products.length} products in focus`,
          text: "Brand-led browsing gives visitors a cleaner way to stay inside one label while keeping pagination and filtering intact.",
          points: ["Brand discovery", "Paginated route", "Cleaner browsing"],
        }}
        emptyTitle={`No ${title.toLowerCase()} products matched`}
        emptyText="Try adjusting the active filters or browse the full brands index to move into another label."
      />
      <section className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">Related route</p>
            <h2 className="mt-2 text-2xl font-normal text-[var(--brand-navy)] sm:text-3xl">Keep exploring adjacent brands</h2>
          </div>
          <Link
            href="/brands"
            className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
          >
            Back to all brands
          </Link>
        </div>
      </section>
    </>
  );
}

export { buildCategorySummary, slugifyBrand, slugifyCategory };
