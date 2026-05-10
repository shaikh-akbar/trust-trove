import Link from "next/link";
import { ArrowRight, Gem, Layers3, Sparkles, TrendingUp } from "lucide-react";
import CatalogExperienceClient from "./CatalogExperienceClient";
import ProductCard from "../home/ProductCard";
import {
  buildCategorySummary,
  formatBrandLabel,
  formatCategoryLabel,
  slugifyBrand,
  slugifyCategory,
} from "../../../lib/storefront";

const SHOP_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80";
const BRANDS_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80";
const CATEGORIES_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80";
const NEW_ARRIVALS_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80";
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
            <h2 className="mt-5 font-display text-2xl font-semibold text-[var(--brand-navy)]">{title}</h2>
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
            <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--brand-navy)] sm:text-[2rem]">Explore distinctive category worlds</h2>
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
              <h3 className="mt-5 font-display text-3xl font-semibold sm:text-[2rem]">{category.title}</h3>
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

export function ShopExperience({ products, categories = [], initialQuery = "" }) {
  return (
    <>
      <CatalogExperienceClient
        products={products}
        initialQuery={initialQuery}
        eyebrow="Shop"
        title="A more magnetic storefront for thoughtful browsing."
        description="Search products instantly, slide through price ranges, and refine by category, color, and size in a cleaner shopping experience built to convert."
        heroBackgroundImage={SHOP_BANNER_IMAGE}
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
                  <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">
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
                  <p className="mt-1 font-display text-xl font-semibold text-[var(--brand-navy)]">
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
                    <p className="line-clamp-2 text-balance font-display text-lg font-semibold leading-[1.08] text-[var(--brand-navy)]">
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
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">
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
                      <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
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
  const featuredCategories = categories.filter((category) => Array.isArray(category.products) && category.products.length > 0);
  const leadingCategories = [...categories].sort((left, right) => Number(right.count || 0) - Number(left.count || 0)).slice(0, 6);

  return (
    <div className="bg-[var(--surface-soft)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <img src={CATEGORIES_BANNER_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,29,96,0.88)_0%,rgba(20,29,96,0.76)_42%,rgba(20,29,96,0.62)_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">Categories</p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-5xl">
            Every category in one place, with real products ready to browse.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
            Jump into health care, fashion, accessories, home-kitchen, and more, then preview available products before opening the full category page.
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
                    Category index
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">
                    Browse all categories
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-500">
                  Open any category directly, then scroll below to preview a faster edit of the most product-rich categories.
                </p>
              </div>

              {leadingCategories.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {leadingCategories.map((category, index) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] transition ${
                        index === 0
                          ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                          : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--brand-navy)] hover:border-[var(--brand-navy)]/30 hover:bg-white"
                      }`}
                    >
                      {category.title}
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
                  <p className="mt-1 font-display text-xl font-semibold text-[var(--brand-navy)]">
                    Open from dropdown
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)] shadow-[0_12px_28px_-22px_rgba(8,15,43,0.35)] transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pr-1">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="flex items-center justify-between rounded-[1rem] border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)]/25 hover:bg-[var(--surface-soft)]"
                  >
                    <span className="truncate pr-3 font-medium">{category.title}</span>
                    <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      {category.count}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group flex min-h-[6.75rem] items-center justify-between rounded-[1.35rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f2e8_100%)] px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[var(--brand-navy)]/24 hover:bg-white"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 text-balance font-display text-lg font-semibold leading-[1.08] text-[var(--brand-navy)]">
                    {category.title}
                  </p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {category.count} products
                  </p>
                </div>
                <span className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--brand-navy)]/10 bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-20px_rgba(8,15,43,0.35)] transition group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredCategories.length > 0 ? (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-slate-400">Preview lane</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">
              Popular categories with a quick product preview
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-500">
            Faster initial load, with the full product depth available after opening each category page.
          </p>
        </div>

        <div className="space-y-8">
          {featuredCategories.map((category) => (
            <div
              key={category.slug}
              className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_70px_-52px_rgba(8,15,43,0.24)]"
            >
              <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,#141d60_0%,#2b377f_100%)] px-5 py-5 text-white sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/68">
                      Shop By Category
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-200">
                      {category.count} products available in this category
                    </p>
                  </div>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]"
                  >
                    Open Category
                    <ArrowRight size={14} className="ml-2" />
                  </Link>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {category.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {category.products.map((product) => (
                      <ProductCard key={product.id} product={product} compact />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-5 py-10 text-center">
                    <p className="font-medium text-slate-500">No products available in this category right now.</p>
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

export function NewArrivalsExperience({ products, initialQuery = "" }) {
  const arrivals = products.slice(0, 12);
  const spotlightProduct = arrivals[0];
  const arrivalLane = arrivals.slice(1, 5);
  const editorialLane = arrivals.slice(5, 8);

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#e9edf9_0%,#f8f9ff_32%,#ffffff_100%)] pb-16">
        <section className="relative overflow-hidden border-b border-[#141d60]/12 bg-[#141d60] text-white">
          <img src={NEW_ARRIVALS_BANNER_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,29,96,0.88)_0%,rgba(20,29,96,0.72)_42%,rgba(20,29,96,0.58)_100%)]" />
          <div className="absolute left-[-10%] top-[58%] h-56 w-56 rounded-full border border-white/10 bg-white/5 blur-2xl" />
          <div className="absolute right-[-6%] top-[8%] h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.32em] text-white/88">
                  New Arrivals
                </span>
                <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.8rem]">
                  Fresh drops, staged like a feature instead of a leftover grid.
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 sm:text-base sm:leading-8">
                  This page now pushes the newest products forward with stronger storytelling, a cleaner hierarchy,
                  and a more premium first scroll while staying rooted in the TrustTrove navy.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={spotlightProduct ? `/product/${spotlightProduct.id}` : "/shop"}
                    className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[#141d60]"
                  >
                    View featured drop <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <Link
                    href={initialQuery ? `/shop?q=${encodeURIComponent(initialQuery)}` : "/shop"}
                    className="inline-flex items-center rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white"
                  >
                    Browse all arrivals
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { value: `${arrivals.length}`, label: "Fresh picks" },
                  { value: "Curated", label: "Arrival edit" },
                  { value: "Premium", label: "First look" },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`rounded-[1.7rem] border px-5 py-5 backdrop-blur ${
                      index === 1 ? "border-white/20 bg-white/14" : "border-white/10 bg-white/8"
                    }`}
                  >
                    <p className="text-3xl font-black tracking-tight text-white">{item.value}</p>
                    <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/68">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {spotlightProduct ? (
          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
              <Link
                href={`/product/${spotlightProduct.id}`}
                className="group overflow-hidden rounded-[2rem] border border-[#141d60]/10 bg-white shadow-[0_32px_90px_-58px_rgba(20,29,96,0.4)]"
              >
                <div className="grid h-full gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[18rem] overflow-hidden bg-[linear-gradient(135deg,rgba(20,29,96,0.08),rgba(20,29,96,0.18))]">
                    <img
                      src={FRESH_DROP_PANEL_IMAGE}
                      alt="Fresh new arrivals banner"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,29,96,0.12)_0%,rgba(20,29,96,0.58)_100%)]" />
                    <div className="absolute left-5 top-5 inline-flex rounded-full bg-white/90 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#141d60]">
                      Fresh drop
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#141d60]/60">
                        Just landed
                      </p>
                      <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#141d60] sm:text-[2.35rem]">
                        {spotlightProduct.name || spotlightProduct.title}
                      </h2>
                      <p className="mt-4 text-lg font-black tracking-tight text-slate-950">
                        {formatPrice(spotlightProduct.price_selling)}
                      </p>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                        {spotlightProduct.short_description ||
                          spotlightProduct.description ||
                          "Freshly added to the latest collection with a more deliberate feature-first presentation and stronger visual focus."}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {[
                        "New in catalog",
                        "Fresh arrival",
                        "Ready to discover",
                      ].map((point) => (
                        <span
                          key={point}
                          className="inline-flex rounded-full border border-[#141d60]/10 bg-[#141d60]/[0.04] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#141d60]"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {arrivalLane.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className={`group rounded-[1.7rem] border p-5 shadow-[0_24px_72px_-56px_rgba(20,29,96,0.35)] transition hover:-translate-y-1 ${
                      index === 0
                        ? "border-[#141d60]/12 bg-[#141d60] text-white"
                        : "border-[#141d60]/10 bg-white text-[#141d60]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`text-[10px] font-extrabold uppercase tracking-[0.22em] ${index === 0 ? "text-white/65" : "text-[#141d60]/48"}`}>
                          Drop {String(index + 2).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 line-clamp-2 font-display text-xl font-semibold leading-tight">
                          {product.name || product.title}
                        </h3>
                      </div>
                      <ArrowRight
                        size={18}
                        className={`shrink-0 transition group-hover:translate-x-1 ${index === 0 ? "text-white/78" : "text-[#141d60]"}`}
                      />
                    </div>
                    <p className={`mt-4 text-sm font-black tracking-tight ${index === 0 ? "text-white" : "text-slate-950"}`}>
                      {formatPrice(product.price_selling)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {editorialLane.length > 0 ? (
          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-[#141d60]/10 bg-white p-6 shadow-[0_30px_90px_-58px_rgba(20,29,96,0.35)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#141d60]/40">Arrival lane</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-[#141d60] sm:text-3xl">
                    A tighter edit of what just arrived
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-500">
                  These picks create a faster second scroll before the full catalog grid takes over.
                </p>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {editorialLane.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group overflow-hidden rounded-[1.7rem] border border-[#141d60]/10 bg-[linear-gradient(180deg,#ffffff_0%,#f5f7ff_100%)]"
                  >
                    <div className="aspect-[1.2/1] overflow-hidden bg-[#141d60]/[0.04]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || product.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#141d60]/45">
                          <Sparkles size={26} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#141d60]/45">
                        Recent pick
                      </p>
                      <h3 className="mt-3 line-clamp-2 font-display text-xl font-semibold leading-tight text-[#141d60]">
                        {product.name || product.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-black tracking-tight text-slate-950">
                          {formatPrice(product.price_selling)}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#141d60]">
                          Open <ArrowRight size={14} className="ml-1.5 transition group-hover:translate-x-1" />
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
              <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-[#141d60]/40">Fresh grid</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#141d60] sm:text-3xl">More recent arrivals</h2>
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
              <h3 className="mt-6 font-display text-3xl font-semibold text-[#141d60]">No recent arrivals found</h3>
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
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">Keep exploring adjacent collections</h2>
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
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">Keep exploring adjacent brands</h2>
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
