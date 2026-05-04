"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import ProductCard from "../home/ProductCard";
import { buildFilterOptions, filterProducts } from "../../../lib/storefront";

const INITIAL_VISIBLE_PRODUCTS = 12;
const LOAD_MORE_STEP = 8;

function FilterSection({ title, children }) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[0_24px_80px_-48px_rgba(8,15,43,0.45)]">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function FilterOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-700 transition hover:border-[var(--line)]">
      <span className="font-medium">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--brand-gold)]" />
    </label>
  );
}

export default function CatalogExperienceClient({
  products,
  initialQuery = "",
  eyebrow,
  title,
  description,
  spotlight,
  emptyTitle,
  emptyText,
}) {
  const filterOptions = useMemo(() => buildFilterOptions(products), [products]);
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [minPrice, setMinPrice] = useState(filterOptions.minPrice);
  const [maxPrice, setMaxPrice] = useState(filterOptions.maxPrice);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PRODUCTS);
  const loadMoreRef = useRef(null);

  function resetVisibleProducts() {
    setVisibleCount(INITIAL_VISIBLE_PRODUCTS);
  }

  function toggleValue(setter, value) {
    resetVisibleProducts();
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  const filteredProducts = useMemo(() => {
    const nextProducts = filterProducts(products, {
      query: deferredQuery,
      minPrice,
      maxPrice,
      categories: selectedCategories,
      colors: selectedColors,
      sizes: selectedSizes,
    });

    if (sortBy === "price-low") {
      return [...nextProducts].sort((left, right) => Number(left.price_selling || 0) - Number(right.price_selling || 0));
    }

    if (sortBy === "price-high") {
      return [...nextProducts].sort((left, right) => Number(right.price_selling || 0) - Number(left.price_selling || 0));
    }

    if (sortBy === "name") {
      return [...nextProducts].sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));
    }

    return nextProducts;
  }, [deferredQuery, maxPrice, minPrice, products, selectedCategories, selectedColors, selectedSizes, sortBy]);

  const activeFilterCount =
    selectedCategories.length + selectedColors.length + selectedSizes.length + (deferredQuery ? 1 : 0);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMoreProducts || !loadMoreRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, filteredProducts.length));
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [filteredProducts.length, hasMoreProducts]);

  return (
    <div className="bg-[var(--surface-soft)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.08))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-slate-200">{eyebrow}</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-4xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{description}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-300">Spotlight</p>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">{spotlight.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-200">{spotlight.text}</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {spotlight.points.map((point) => (
                  <span
                    key={point}
                    className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.08] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-100"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className={`space-y-5 ${showFilters ? "block" : "hidden"} lg:block`}>
            <FilterSection title="Search">
              <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    resetVisibleProducts();
                    setQuery(event.target.value);
                  }}
                  placeholder="Search products, materials, styles..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </FilterSection>

            <FilterSection title="Price Range">
              <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Rs. {minPrice}</span>
                  <span>Rs. {maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={filterOptions.minPrice}
                  max={filterOptions.maxPrice}
                  value={minPrice}
                  onChange={(event) => {
                    resetVisibleProducts();
                    setMinPrice(Math.min(Number(event.target.value), maxPrice));
                  }}
                  className="mt-4 w-full accent-[var(--brand-navy)]"
                />
                <input
                  type="range"
                  min={filterOptions.minPrice}
                  max={filterOptions.maxPrice}
                  value={maxPrice}
                  onChange={(event) => {
                    resetVisibleProducts();
                    setMaxPrice(Math.max(Number(event.target.value), minPrice));
                  }}
                  className="mt-3 w-full accent-[var(--brand-navy)]"
                />
              </div>
            </FilterSection>

            {filterOptions.categories.length > 0 ? (
              <FilterSection title="Categories">
                {filterOptions.categories.map((category) => (
                  <FilterOption
                    key={category}
                    label={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleValue(setSelectedCategories, category)}
                  />
                ))}
              </FilterSection>
            ) : null}

            {filterOptions.colors.length > 0 ? (
              <FilterSection title="Colors">
                {filterOptions.colors.map((color) => (
                  <FilterOption
                    key={color}
                    label={color}
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleValue(setSelectedColors, color)}
                  />
                ))}
              </FilterSection>
            ) : null}

            {filterOptions.sizes.length > 0 ? (
              <FilterSection title="Sizes">
                {filterOptions.sizes.map((size) => (
                  <FilterOption
                    key={size}
                    label={size}
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleValue(setSelectedSizes, size)}
                  />
                ))}
              </FilterSection>
            ) : null}
          </aside>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-400">Live catalog</p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-[var(--brand-navy)] sm:text-2xl">
                    {filteredProducts.length} refined result{filteredProducts.length === 1 ? "" : "s"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Search, sort, and filter by category, color, size, and price without leaving the page.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setShowFilters((current) => !current)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold text-[var(--brand-navy)] lg:hidden"
                  >
                    <SlidersHorizontal size={16} className="mr-2" />
                    Filters
                  </button>

                  <select
                    value={sortBy}
                    onChange={(event) => {
                      resetVisibleProducts();
                      setSortBy(event.target.value);
                    }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetVisibleProducts();
                      setQuery("");
                      setSelectedCategories([]);
                      setSelectedColors([]);
                      setSelectedSizes([]);
                      setMinPrice(filterOptions.minPrice);
                      setMaxPrice(filterOptions.maxPrice);
                    }}
                    className="inline-flex items-center rounded-full bg-[var(--brand-navy)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white"
                  >
                    Reset all <X size={14} className="ml-2" />
                  </button>
                ) : null}

                {deferredQuery ? (
                  <span className="inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-600">
                    Search: {deferredQuery}
                  </span>
                ) : null}

                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-600"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} compact />
                  ))}
                </div>

                {hasMoreProducts ? (
                  <div ref={loadMoreRef} className="flex items-center justify-center py-6">
                    <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--brand-navy)] shadow-[0_12px_36px_-28px_rgba(8,15,43,0.35)]">
                      Loading more products
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-[2rem] border border-[var(--line)] bg-white px-6 py-16 text-center shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--surface-cream)]">
                  <Sparkles size={20} />
                </div>
                <h3 className="mt-6 font-display text-3xl font-semibold text-[var(--brand-navy)]">{emptyTitle}</h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">{emptyText}</p>
                <Link
                  href="/shop"
                  className="mt-8 inline-flex rounded-full bg-[var(--brand-gold)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
                >
                  Explore full catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
