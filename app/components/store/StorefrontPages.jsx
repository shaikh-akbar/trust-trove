import Link from "next/link";
import { ArrowRight, Compass, Gem, Layers3, Sparkles, TrendingUp } from "lucide-react";
import CatalogExperienceClient from "./CatalogExperienceClient";
import ProductCard from "../home/ProductCard";
import { buildCategorySummary, formatCategoryLabel, slugifyCategory } from "../../../lib/storefront";

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

export function ShopExperience({ products, initialQuery = "" }) {
  const categories = buildCategorySummary(products);

  return (
    <>
      <CatalogExperienceClient
        products={products}
        initialQuery={initialQuery}
        eyebrow="Shop"
        title="A more magnetic storefront for thoughtful browsing."
        description="Search products instantly, slide through price ranges, and refine by category, color, and size in a cleaner shopping experience built to convert."
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

export function CategoriesExperience({ products }) {
  const categories = buildCategorySummary(products);

  return (
    <div className="bg-[var(--surface-soft)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(222,184,106,0.3),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">Categories</p>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-5xl">
            Distinct collection pages that feel editorial, not crowded.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
            Move from broad discovery into focused product lanes with stronger collection storytelling and cleaner visual depth.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group overflow-hidden rounded-[1.4rem] border border-[var(--line)] p-4 shadow-[0_24px_60px_-46px_rgba(8,15,43,0.34)] transition hover:-translate-y-1 ${
                index % 3 === 0 ? "bg-[var(--brand-navy)] text-white" : "bg-white text-[var(--brand-navy)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-extrabold uppercase tracking-[0.18em] ${index % 3 === 0 ? "text-slate-200" : "text-slate-400"}`}>
                  Category
                </p>
                <Compass size={16} className={index % 3 === 0 ? "text-slate-200" : "text-slate-400"} />
              </div>
              <h2 className="mt-4 line-clamp-2 min-h-[3.25rem] font-display text-xl leading-tight sm:text-2xl">{category.title}</h2>
              <p className={`mt-3 text-xs leading-5 sm:text-sm sm:leading-6 ${index % 3 === 0 ? "text-slate-200" : "text-slate-600"}`}>
                {category.count} products arranged into a more attractive collection experience with stronger visual separation.
              </p>
              <span className={`mt-5 inline-flex items-center text-[10px] font-extrabold uppercase tracking-[0.16em] sm:text-[11px] ${index % 3 === 0 ? "text-white" : "text-[var(--brand-navy)]"}`}>
                Open collection <ArrowRight size={15} className="ml-2 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function NewArrivalsExperience({ products, initialQuery = "" }) {
  const arrivals = products.slice(0, 12);
  const spotlightProduct = arrivals[0];
  const launchLane = arrivals.slice(1, 5);

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#eef1fb_0%,#ffffff_28%)] pb-16">
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_38%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-slate-200">New Arrivals</p>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <h1 className="font-display text-3xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-4xl">
                  Fresh drops deserve a launch page, not just another shop grid.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Explore the newest additions through a more campaign-like layout with featured launches, quick discovery,
                  and a tighter first impression.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-300">Drop notes</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    { value: `${arrivals.length}`, label: "Fresh picks" },
                    { value: "Launch", label: "Mood" },
                    { value: "Fast", label: "Discovery" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-2xl font-black tracking-tight text-white">{item.value}</p>
                      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {spotlightProduct ? (
          <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <Link
                href={`/product/${spotlightProduct.id}`}
                className="group overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-white p-5 shadow-[0_28px_80px_-56px_rgba(8,15,43,0.34)] sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">
                      Just landed
                    </p>
                    <h2 className="mt-3 max-w-xl font-display text-2xl font-semibold leading-tight text-[var(--brand-navy)] sm:text-3xl">
                      {spotlightProduct.name || spotlightProduct.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                      {spotlightProduct.short_description ||
                        spotlightProduct.description ||
                        "Freshly added to the latest collection with a cleaner launch-first presentation."}
                    </p>
                  </div>
                  <span className="hidden rounded-full bg-[var(--brand-navy)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white sm:inline-flex">
                    View launch
                  </span>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-4">
                {launchLane.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.26em] text-slate-400">Launch lane</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">More recent arrivals</h2>
            </div>
            <Link
              href={initialQuery ? `/shop?q=${encodeURIComponent(initialQuery)}` : "/shop"}
              className="inline-flex items-center text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
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
            <div className="rounded-[2rem] border border-[var(--line)] bg-white px-6 py-16 text-center shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--surface-cream)]">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-6 font-display text-3xl font-semibold text-[var(--brand-navy)]">No recent arrivals found</h3>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
                As soon as new products are added to the catalog, this page will surface them automatically with a more launch-focused presentation.
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
      </div>

      <EditorialStrip
        items={[
          { icon: Sparkles, title: "Launch energy", text: "Recent products now live in a page that feels fresher, more current, and more intentional at first glance." },
          { icon: TrendingUp, title: "Better promotion", text: "This layout is easier to use for featured launches, seasonal drops, and attention-driving hero moments." },
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
        spotlight={{
          title: `${products.length} products in focus`,
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

export { buildCategorySummary, slugifyCategory };
